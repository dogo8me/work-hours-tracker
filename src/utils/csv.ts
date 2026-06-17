import { format, parseISO } from 'date-fns'
import type { CsvRow, Settings, TimeEntry } from '../types'
import { formatHoursDecimal, getEntryDurationMs } from './stats'

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportToCsv(entries: TimeEntry[], settings: Settings): string {
  const header = ['Date', 'Start', 'End', 'Hours', 'Rate', 'Earnings', 'Notes']
  const rows = entries
    .filter((e) => e.endTime)
    .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime())
    .map((entry) => {
      const ms = getEntryDurationMs(entry)
      const hours = parseFloat(formatHoursDecimal(ms))
      const earnings = hours * settings.hourlyRate
      return [
        format(parseISO(entry.startTime), 'yyyy-MM-dd'),
        format(parseISO(entry.startTime), 'HH:mm'),
        format(parseISO(entry.endTime!), 'HH:mm'),
        formatHoursDecimal(ms),
        settings.hourlyRate.toFixed(2),
        earnings.toFixed(2),
        entry.notes,
      ].map(String)
    })

  return [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n')
}

export function downloadCsv(entries: TimeEntry[], settings: Settings, filename?: string): void {
  const csv = exportToCsv(entries, settings)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename ?? `work-hours-${format(new Date(), 'yyyy-MM-dd')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

export function importFromCsv(text: string): { entries: TimeEntry[]; rate?: number; errors: string[] } {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) {
    return { entries: [], errors: ['File is empty or has no data rows.'] }
  }

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim())
  const col = (name: string) => header.indexOf(name)

  const dateIdx = col('date')
  const startIdx = col('start')
  const endIdx = col('end')
  const notesIdx = col('notes')
  const rateIdx = col('rate')

  if (dateIdx === -1 || startIdx === -1 || endIdx === -1) {
    return { entries: [], errors: ['CSV must include Date, Start, and End columns.'] }
  }

  const entries: TimeEntry[] = []
  const errors: string[] = []
  let importedRate: number | undefined

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i])
    const date = cols[dateIdx]?.trim()
    const start = cols[startIdx]?.trim()
    const end = cols[endIdx]?.trim()
    const notes = notesIdx >= 0 ? cols[notesIdx]?.trim() ?? '' : ''

    if (!date || !start || !end) {
      errors.push(`Row ${i + 1}: missing date or time.`)
      continue
    }

    const startTime = new Date(`${date}T${start}`)
    const endTime = new Date(`${date}T${end}`)

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      errors.push(`Row ${i + 1}: invalid date/time.`)
      continue
    }

    if (endTime <= startTime) {
      errors.push(`Row ${i + 1}: end time must be after start time.`)
      continue
    }

    if (rateIdx >= 0 && !importedRate) {
      const rate = parseFloat(cols[rateIdx])
      if (!Number.isNaN(rate) && rate > 0) importedRate = rate
    }

    entries.push({
      id: crypto.randomUUID(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      notes,
    })
  }

  return { entries, rate: importedRate, errors }
}

export function parseCsvPreview(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []

  const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase().trim())
  const indices = ['date', 'start', 'end', 'hours', 'rate', 'earnings', 'notes'].map((h) =>
    header.indexOf(h),
  )

  return lines.slice(1, 6).map((line) => {
    const cols = parseCsvLine(line)
    const get = (idx: number) => (idx >= 0 ? cols[idx] ?? '' : '')
    return {
      date: get(indices[0]),
      start: get(indices[1]),
      end: get(indices[2]),
      hours: get(indices[3]),
      rate: get(indices[4]),
      earnings: get(indices[5]),
      notes: get(indices[6]),
    }
  })
}
