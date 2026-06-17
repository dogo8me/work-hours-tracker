import { Download, Settings, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import type { TimeTracker } from '../hooks/useTimeTracker'
import { downloadCsv, importFromCsv } from '../utils/csv'
import { formatCurrency } from '../utils/stats'
import { Button, Card, Input, Modal } from './ui'

interface SettingsPanelProps {
  tracker: TimeTracker
}

export function SettingsPanel({ tracker }: SettingsPanelProps) {
  const [open, setOpen] = useState(false)
  const [rate, setRate] = useState(String(tracker.settings.hourlyRate))
  const [name, setName] = useState(tracker.settings.workerName)
  const fileRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)

  const handleSave = () => {
    const parsed = parseFloat(rate)
    if (!Number.isNaN(parsed) && parsed >= 0) {
      tracker.updateSettings({ hourlyRate: parsed, workerName: name })
    }
    setOpen(false)
  }

  const handleExport = () => {
    downloadCsv(tracker.entries, tracker.settings)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const { entries, rate: importedRate, errors } = importFromCsv(text)

      if (entries.length === 0) {
        setImportError(errors.join(' ') || 'No valid entries found.')
        setImportSuccess(null)
        return
      }

      const mode = confirm(
        `Found ${entries.length} entries.${errors.length ? ` (${errors.length} rows skipped)` : ''}\n\nOK = Merge with existing\nCancel = Replace all existing entries`,
      )
        ? 'merge'
        : 'replace'

      tracker.importEntries(entries, importedRate, mode)
      setImportSuccess(`Imported ${entries.length} entries successfully.`)
      setImportError(errors.length ? `${errors.length} rows had errors and were skipped.` : null)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
            <Settings size={16} />
            Settings
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download size={16} />
            Export CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload size={16} />
            Import CSV
          </Button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleImport} />
        </div>

        {(importSuccess || importError) && (
          <div className="mt-3 text-sm">
            {importSuccess && <p className="text-[var(--color-accent)]">{importSuccess}</p>}
            {importError && <p className="text-[var(--color-warning)]">{importError}</p>}
          </div>
        )}

        <p className="mt-3 text-xs text-[var(--color-muted)]">
          Export opens in Excel, Google Sheets, or any spreadsheet app. Import expects the same CSV format.
        </p>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Settings">
        <div className="flex flex-col gap-4">
          <Input
            label="Your name (optional)"
            placeholder="Shows on exports"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Hourly rate ($)"
            type="number"
            min="0"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />

          <div className="rounded-xl bg-[var(--color-surface)] p-3 text-sm text-[var(--color-muted)]">
            Current rate: <span className="text-white">{formatCurrency(tracker.settings.hourlyRate)}/hr</span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (confirm('Delete ALL logged hours? This cannot be undone.')) {
                  tracker.clearAll()
                  setOpen(false)
                }
              }}
            >
              Clear All Data
            </Button>
            <div className="flex-1" />
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
