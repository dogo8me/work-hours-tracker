import { Briefcase } from 'lucide-react'
import type { TimeTracker } from '../hooks/useTimeTracker'
import { formatCurrency } from '../utils/stats'

interface HeaderProps {
  tracker: TimeTracker
}

export function Header({ tracker }: HeaderProps) {
  const { settings, stats } = tracker
  const greeting = settings.workerName ? `Hey, ${settings.workerName}` : 'Work Hours Tracker'

  return (
    <header className="mb-8">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-[var(--color-accent)]/15 p-2.5 text-[var(--color-accent)]">
          <Briefcase size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{greeting}</h1>
          <p className="text-sm text-[var(--color-muted)]">
            {formatCurrency(stats.totalEarnings)} earned · {stats.totalHours.toFixed(1)} hrs total
          </p>
        </div>
      </div>
    </header>
  )
}
