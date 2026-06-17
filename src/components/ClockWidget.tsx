import { Clock, DollarSign, Play, Square } from 'lucide-react'
import { useState } from 'react'
import type { TimeTracker } from '../hooks/useTimeTracker'
import { formatCurrency, formatDuration, getEntryStats } from '../utils/stats'
import { Button, Card, Textarea } from './ui'

interface ClockWidgetProps {
  tracker: TimeTracker
}

export function ClockWidget({ tracker }: ClockWidgetProps) {
  const { activeEntry, settings, clockIn, clockOut, now } = tracker
  const [notes, setNotes] = useState('')
  const isActive = !!activeEntry

  const liveMs = activeEntry ? getEntryStats(activeEntry, settings, now).durationMs : 0
  const liveEarnings = activeEntry ? getEntryStats(activeEntry, settings, now).earnings : 0

  const handleToggle = () => {
    if (isActive) {
      clockOut()
      setNotes('')
    } else {
      clockIn(notes)
    }
  }

  return (
    <Card glow={isActive} className="relative overflow-hidden">
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 to-transparent pointer-events-none" />
      )}

      <div className="relative flex flex-col items-center gap-6 py-4">
        <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <Clock size={16} />
          <span>{isActive ? 'Currently working' : 'Ready to clock in'}</span>
          {isActive && (
            <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-[var(--color-accent)] animate-pulse-ring" />
          )}
        </div>

        <div className="text-center">
          <div className="font-mono text-5xl font-bold tracking-wider tabular-nums sm:text-6xl">
            {formatDuration(liveMs)}
          </div>
          {isActive && (
            <div className="mt-2 flex items-center justify-center gap-1.5 text-[var(--color-accent)]">
              <DollarSign size={16} />
              <span className="text-lg font-medium">{formatCurrency(liveEarnings)}</span>
              <span className="text-sm text-[var(--color-muted)]">earned this session</span>
            </div>
          )}
        </div>

        {!isActive && (
          <Textarea
            label="Session notes (optional)"
            placeholder="What are you working on?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full max-w-sm"
          />
        )}

        {isActive && activeEntry.notes && (
          <p className="max-w-sm text-center text-sm text-[var(--color-muted)] italic">
            &ldquo;{activeEntry.notes}&rdquo;
          </p>
        )}

        <Button
          size="lg"
          variant={isActive ? 'danger' : 'primary'}
          onClick={handleToggle}
          className={`min-w-[180px] ${!isActive ? 'animate-pulse-ring' : ''}`}
        >
          {isActive ? (
            <>
              <Square size={18} fill="currentColor" />
              Clock Out
            </>
          ) : (
            <>
              <Play size={18} fill="currentColor" />
              Clock In
            </>
          )}
        </Button>

        <p className="text-xs text-[var(--color-muted)]">
          Rate: {formatCurrency(settings.hourlyRate)}/hr
        </p>
      </div>
    </Card>
  )
}
