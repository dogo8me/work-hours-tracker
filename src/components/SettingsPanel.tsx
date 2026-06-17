import { Clock, Download, FileSpreadsheet, Settings } from 'lucide-react'
import { useRef, useState } from 'react'
import type { TimeTracker } from '../hooks/useTimeTracker'
import { downloadCsv, importFromCsv } from '../utils/csv'
import { formatCurrency } from '../utils/stats'
import { Button, Card, Input, Modal } from './ui'
import { TimeEntryForm } from './TimeEntryForm'

interface SettingsPanelProps {
  tracker: TimeTracker
}

export function SettingsPanel({ tracker }: SettingsPanelProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [rate, setRate] = useState(String(tracker.settings.hourlyRate))
  const [name, setName] = useState(tracker.settings.workerName)
  const fileRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const [formKey, setFormKey] = useState(0)

  const handleSave = () => {
    const parsed = parseFloat(rate)
    if (!Number.isNaN(parsed) && parsed >= 0) {
      tracker.updateSettings({ hourlyRate: parsed, workerName: name })
    }
    setSettingsOpen(false)
  }

  const handleExport = () => {
    downloadCsv(tracker.entries, tracker.settings)
  }

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setImportSuccess(`Imported ${entries.length} entries from file.`)
      setImportError(errors.length ? `${errors.length} rows had errors and were skipped.` : null)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleLogTime = (data: Parameters<typeof tracker.addManualEntry>[0]) => {
    tracker.addManualEntry(data)
    setImportSuccess('Time logged successfully.')
    setImportError(null)
  }

  return (
    <>
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Clock size={18} className="text-[var(--color-accent)]" />
          <div>
            <h3 className="font-semibold">Log Past Time</h3>
            <p className="text-sm text-[var(--color-muted)]">
              Enter a date and start/end times — no spreadsheet needed
            </p>
          </div>
        </div>

        <TimeEntryForm
          key={formKey}
          settings={tracker.settings}
          onSave={handleLogTime}
          onSaveAndAnother={(data) => {
            handleLogTime(data)
            setFormKey((k) => k + 1)
          }}
        />

        {(importSuccess || importError) && (
          <div className="mt-4 text-sm">
            {importSuccess && <p className="text-[var(--color-accent)]">{importSuccess}</p>}
            {importError && <p className="text-[var(--color-warning)]">{importError}</p>}
          </div>
        )}
      </Card>

      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setSettingsOpen(true)}>
            <Settings size={16} />
            Settings
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download size={16} />
            Export CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
            <FileSpreadsheet size={16} />
            Import from file
          </Button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCsvImport} />
        </div>

        <p className="mt-3 text-xs text-[var(--color-muted)]">
          Export creates a spreadsheet for your uncle. File import is optional if you already have a CSV.
        </p>
      </Card>

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Settings">
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
                  setSettingsOpen(false)
                }
              }}
            >
              Clear All Data
            </Button>
            <div className="flex-1" />
            <Button variant="secondary" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
