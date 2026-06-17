import { useState } from 'react'
import type { Settings, TimeEntry } from '../types'
import { Modal } from './ui'
import { TimeEntryForm } from './TimeEntryForm'

interface EntryModalProps {
  open: boolean
  entry: TimeEntry | null
  settings: Settings
  onClose: () => void
  onSave: (entry: Omit<TimeEntry, 'id'>, keepOpen?: boolean) => void
}

export function EntryModal({ open, entry, settings, onClose, onSave }: EntryModalProps) {
  const [formKey, setFormKey] = useState(0)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={entry ? 'Edit Entry' : 'Log Past Time'}
    >
      <TimeEntryForm
        key={entry?.id ?? `new-${formKey}`}
        entry={entry}
        settings={settings}
        onCancel={onClose}
        onSave={(data) => onSave(data, false)}
        onSaveAndAnother={
          entry
            ? undefined
            : (data) => {
                onSave(data, true)
                setFormKey((k) => k + 1)
              }
        }
      />
    </Modal>
  )
}
