import {
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfDay,
  format,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfWeek,
  subDays,
} from 'date-fns'
import type { DailyChartPoint, DashboardStats, EntryStats, Settings, TimeEntry } from '../types'

export function getEntryDurationMs(entry: TimeEntry, now = Date.now()): number {
  const start = parseISO(entry.startTime).getTime()
  const end = entry.endTime ? parseISO(entry.endTime).getTime() : now
  return Math.max(0, end - start)
}

export function getEntryStats(entry: TimeEntry, settings: Settings, now = Date.now()): EntryStats {
  const durationMs = getEntryDurationMs(entry, now)
  const hours = durationMs / 3_600_000
  return {
    durationMs,
    earnings: hours * settings.hourlyRate,
  }
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((n) => String(n).padStart(2, '0')).join(':')
}

export function formatHoursDecimal(ms: number): string {
  return (ms / 3_600_000).toFixed(2)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function computeDashboardStats(
  entries: TimeEntry[],
  settings: Settings,
  now = Date.now(),
): DashboardStats {
  const completed = entries.filter((e) => e.endTime)
  const active = entries.find((e) => !e.endTime)

  const allForTotals = active ? [...completed, active] : completed
  const totalMs = allForTotals.reduce((sum, e) => sum + getEntryDurationMs(e, now), 0)
  const totalHours = totalMs / 3_600_000
  const totalEarnings = totalHours * settings.hourlyRate

  const daysWithWork = new Set<string>()
  for (const entry of allForTotals) {
    const start = parseISO(entry.startTime)
    const end = entry.endTime ? parseISO(entry.endTime) : new Date(now)
    for (const day of eachDayOfInterval({ start: startOfDay(start), end: startOfDay(end) })) {
      daysWithWork.add(format(day, 'yyyy-MM-dd'))
    }
  }

  const today = new Date(now)
  const todayEntries = allForTotals.filter((e) => {
    const start = parseISO(e.startTime)
    const end = e.endTime ? parseISO(e.endTime) : new Date(now)
    return isSameDay(start, today) || isSameDay(end, today) || (start < today && end > today)
  })
  const todayMs = todayEntries.reduce((sum, e) => sum + getEntryDurationMs(e, now), 0)

  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEntries = allForTotals.filter((e) => {
    const start = parseISO(e.startTime)
    const end = e.endTime ? parseISO(e.endTime) : new Date(now)
    return (
      isWithinInterval(start, { start: weekStart, end: endOfDay(today) }) ||
      isWithinInterval(end, { start: weekStart, end: endOfDay(today) })
    )
  })
  const weekMs = weekEntries.reduce((sum, e) => sum + getEntryDurationMs(e, now), 0)

  const longestSessionMs = completed.reduce(
    (max, e) => Math.max(max, getEntryDurationMs(e)),
    0,
  )

  let currentStreak = 0
  let cursor = startOfDay(today)
  while (true) {
    const key = format(cursor, 'yyyy-MM-dd')
    if (daysWithWork.has(key)) {
      currentStreak++
      cursor = subDays(cursor, 1)
    } else if (isSameDay(cursor, today)) {
      cursor = subDays(cursor, 1)
    } else {
      break
    }
  }

  return {
    totalHours,
    totalEarnings,
    avgHoursPerDay: daysWithWork.size > 0 ? totalHours / daysWithWork.size : 0,
    daysWorked: daysWithWork.size,
    todayHours: todayMs / 3_600_000,
    todayEarnings: (todayMs / 3_600_000) * settings.hourlyRate,
    weekHours: weekMs / 3_600_000,
    weekEarnings: (weekMs / 3_600_000) * settings.hourlyRate,
    longestSessionHours: longestSessionMs / 3_600_000,
    currentStreak,
  }
}

export function getWeeklyChartData(
  entries: TimeEntry[],
  settings: Settings,
  now = Date.now(),
): DailyChartPoint[] {
  const today = startOfDay(new Date(now))
  const days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i))

  return days.map((day) => {
    const dayStart = startOfDay(day)
    const dayEnd = endOfDay(day)
    let ms = 0

    for (const entry of entries) {
      const start = parseISO(entry.startTime)
      const end = entry.endTime ? parseISO(entry.endTime) : new Date(now)
      if (end < dayStart || start > dayEnd) continue

      const overlapStart = Math.max(start.getTime(), dayStart.getTime())
      const overlapEnd = Math.min(end.getTime(), dayEnd.getTime())
      ms += Math.max(0, overlapEnd - overlapStart)
    }

    const hours = ms / 3_600_000
    return {
      date: format(day, 'yyyy-MM-dd'),
      label: format(day, 'EEE'),
      hours,
      earnings: hours * settings.hourlyRate,
    }
  })
}

export function sortEntries(entries: TimeEntry[]): TimeEntry[] {
  return [...entries].sort(
    (a, b) => parseISO(b.startTime).getTime() - parseISO(a.startTime).getTime(),
  )
}

export function getActiveEntry(entries: TimeEntry[]): TimeEntry | undefined {
  return entries.find((e) => !e.endTime)
}

export function daysBetweenEntries(entries: TimeEntry[]): number {
  if (entries.length === 0) return 0
  const dates = entries.flatMap((e) => [parseISO(e.startTime), e.endTime ? parseISO(e.endTime) : new Date()])
  const min = dates.reduce((a, b) => (a < b ? a : b))
  const max = dates.reduce((a, b) => (a > b ? a : b))
  return differenceInCalendarDays(max, min) + 1
}
