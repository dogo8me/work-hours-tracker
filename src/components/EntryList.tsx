import { format, parseISO } from 'date-fns'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { TimeTracker } from '../hooks/useTimeTracker'
import type { TimeEntry } from '../types'
import {
  formatCurrency,
  formatDuration,
  getEntryStats,
} from '../utils/stats'
import { Button, Card } from './ui'
import { EntryModal } from './EntryModal'

interface EntryListProps {
  tracker: TimeTracker
}

export function EntryList({ tracker }: EntryListProps) {
  const { entries, settings, deleteEntry, now } = tracker
  const [editing, setEditing] = useState<TimeEntry | null>(null)
  const [adding, setAdding] = useState(false)

  const completed = entries.filter((e) => e.endTime)

  return (
    <>
      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Work Log</h3>
            <p className="text-sm text-[var(--color-muted)]">
              {completed.length} session{completed.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setAdding(true)}>
            <Plus size={16} />
            Add Entry
          </Button>
        </div>

        {completed.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--color-muted)]">
            No completed sessions yet. Clock in to get started!
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
            {completed.map((entry) => {
              const stats = getEntryStats(entry, settings, now)
              return (
                <div
                  key={entry.id}
                  className="group flex items-center gap-3 rounded-xl border border-transparent bg-[var(--color-surface)] p-3 transition hover:border-[var(--color-border)]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-medium">
                        {format(parseISO(entry.startTime), 'MMM d, yyyy')}
                      </span>
                      <span className="text-sm text-[var(--color-muted)]">
                        {format(parseISO(entry.startTime), 'h:mm a')} –{' '}
                        {format(parseISO(entry.endTime!), 'h:mm a')}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="mt-0.5 truncate text-sm text-[var(--color-muted)]">
                        {entry.notes}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono text-sm tabular-nums">
                      {formatDuration(stats.durationMs)}
                    </div>
                    <div className="text-xs text-[var(--color-accent)]">
                      {formatCurrency(stats.earnings)}
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button
                      onClick={() => setEditing(entry)}
                      className="rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-white/5 hover:text-white"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this entry?')) deleteEntry(entry.id)
                      }}
                      className="rounded-lg p-1.5 text-[var(--color-muted)] hover:bg-red-500/10 hover:text-[var(--color-danger)]"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <EntryModal
        open={adding || !!editing}
        entry={editing}
        settings={settings}
        onClose={() => {
          setAdding(false)
          setEditing(null)
        }}
        onSave={(data) => {
          if (editing) {
            tracker.updateEntry(editing.id, data)
          } else {
            tracker.addManualEntry(data)
          }
          setAdding(false)
          setEditing(null)
        }}
      />
    </>
  )
}