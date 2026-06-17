import { useEffect, useMemo, useState } from 'react'
import type { Settings, TimeEntry } from '../types'
import { formatCurrency, formatDuration, getEntryDurationMs } from '../utils/stats'
import {
  defaultTimeFields,
  entryToTimeFields,
  resetTimeFieldsForAnother,
  timeFieldsToEntry,
  type TimeFields,
} from '../utils/timeInput'
import { Button, Input, Textarea } from './ui'

interface TimeEntryFormProps {
  entry?: TimeEntry | null
  settings: Settings
  onSave: (data: Omit<TimeEntry, 'id'>) => void
  onSaveAndAnother?: (data: Omit<TimeEntry, 'id'>) => void
  onCancel?: () => void
  showPreview?: boolean
}

export function TimeEntryForm({
  entry,
  settings,
  onSave,
  onSaveAndAnother,
  onCancel,
  showPreview = true,
}: TimeEntryFormProps) {
  const [fields, setFields] = useState<TimeFields>(defaultTimeFields)
  const [error, setError] = useState('')

  useEffect(() => {
    setFields(entry ? entryToTimeFields(entry) : defaultTimeFields())
    setError('')
  }, [entry])

  const preview = useMemo(() => {
    const result = timeFieldsToEntry(fields)
    if (result.error || !result.entry) return null
    const ms = getEntryDurationMs({ id: '', ...result.entry })
    return {
      duration: formatDuration(ms),
      earnings: formatCurrency((ms / 3_600_000) * settings.hourlyRate),
    }
  }, [fields, settings.hourlyRate])

  const update = (patch: Partial<TimeFields>) => setFields((prev) => ({ ...prev, ...patch }))

  const handleSave = (andAnother = false) => {
    const result = timeFieldsToEntry(fields)
    if (result.error || !result.entry) {
      setError(result.error ?? 'Invalid entry.')
      return
    }

    if (andAnother && onSaveAndAnother) {
      onSaveAndAnother(result.entry)
      setFields(resetTimeFieldsForAnother(fields))
      setError('')
    } else {
      onSave(result.entry)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Date"
        type="date"
        value={fields.date}
        onChange={(e) => update({ date: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Start time"
          type="time"
          value={fields.startTime}
          onChange={(e) => update({ startTime: e.target.value })}
        />
        <Input
          label="End time"
          type="time"
          value={fields.endTime}
          onChange={(e) => update({ endTime: e.target.value })}
        />
      </div>

      <Textarea
        label="Notes (optional)"
        placeholder="What did you work on?"
        value={fields.notes}
        onChange={(e) => update({ notes: e.target.value })}
        rows={2}
      />

      {showPreview && preview && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm">
          <span className="text-[var(--color-muted)]">Preview: </span>
          <span className="font-mono">{preview.duration}</span>
          <span className="text-[var(--color-muted)]"> · </span>
          <span className="text-[var(--color-accent)]">{preview.earnings}</span>
        </div>
      )}

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      <div className="flex flex-wrap gap-2 pt-1">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {!entry && onSaveAndAnother && (
          <Button variant="secondary" onClick={() => handleSave(true)}>
            Save & Add Another
          </Button>
        )}
        <Button className={onCancel ? '' : 'flex-1'} onClick={() => handleSave(false)}>
          {entry ? 'Save Changes' : 'Log Time'}
        </Button>
      </div>
    </div>
  )
}
