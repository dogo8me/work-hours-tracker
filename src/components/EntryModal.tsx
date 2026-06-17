import { format, parseISO } from 'date-fns'
import { useEffect, useState } from 'react'
import type { Settings, TimeEntry } from '../types'
import { Button, Input, Modal, Textarea } from './ui'

interface EntryModalProps {
  open: boolean
  entry: TimeEntry | null
  settings: Settings
  onClose: () => void
  onSave: (entry: Omit<TimeEntry, 'id'>) => void
}

function toLocalDatetime(iso: string): string {
  const d = parseISO(iso)
  return format(d, "yyyy-MM-dd'T'HH:mm")
}

export function EntryModal({ open, entry, onClose, onSave }: EntryModalProps) {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (entry) {
      setStart(toLocalDatetime(entry.startTime))
      setEnd(entry.endTime ? toLocalDatetime(entry.endTime) : '')
      setNotes(entry.notes)
    } else {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 3600000)
      setStart(format(oneHourAgo, "yyyy-MM-dd'T'HH:mm"))
      setEnd(format(now, "yyyy-MM-dd'T'HH:mm"))
      setNotes('')
    }
    setError('')
  }, [entry, open])

  const handleSave = () => {
    const startTime = new Date(start)
    const endTime = new Date(end)

    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
      setError('Invalid date or time.')
      return
    }
    if (endTime <= startTime) {
      setError('End time must be after start time.')
      return
    }

    onSave({
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      notes,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={entry ? 'Edit Entry' : 'Add Manual Entry'}>
      <div className="flex flex-col gap-4">
        <Input
          label="Start"
          type="datetime-local"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <Input
          label="End"
          type="datetime-local"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <Textarea
          label="Notes"
          placeholder="Optional description"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />

        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

        <div className="flex gap-2 pt-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            {entry ? 'Save Changes' : 'Add Entry'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
