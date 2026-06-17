import {
  Calendar,
  Clock,
  DollarSign,
  Flame,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react'
import type { TimeTracker } from '../hooks/useTimeTracker'
import { formatCurrency } from '../utils/stats'
import { StatCard } from './ui'

interface StatsDashboardProps {
  tracker: TimeTracker
}

function formatHours(h: number): string {
  const hrs = Math.floor(h)
  const mins = Math.round((h - hrs) * 60)
  if (hrs === 0) return `${mins}m`
  if (mins === 0) return `${hrs}h`
  return `${hrs}h ${mins}m`
}

export function StatsDashboard({ tracker }: StatsDashboardProps) {
  const { stats } = tracker

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Total Earnings"
        value={formatCurrency(stats.totalEarnings)}
        sub={`${formatHours(stats.totalHours)} logged`}
        icon={<DollarSign size={18} />}
        accent
      />
      <StatCard
        label="Total Hours"
        value={formatHours(stats.totalHours)}
        sub={`${stats.daysWorked} days worked`}
        icon={<Clock size={18} />}
      />
      <StatCard
        label="Avg Hours / Day"
        value={formatHours(stats.avgHoursPerDay)}
        sub="On days you worked"
        icon={<TrendingUp size={18} />}
      />
      <StatCard
        label="Today"
        value={formatCurrency(stats.todayEarnings)}
        sub={`${formatHours(stats.todayHours)} today`}
        icon={<Zap size={18} />}
        accent
      />
      <StatCard
        label="This Week"
        value={formatHours(stats.weekHours)}
        sub={formatCurrency(stats.weekEarnings)}
        icon={<Calendar size={18} />}
      />
      <StatCard
        label="Work Streak"
        value={`${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}`}
        sub="Consecutive days"
        icon={<Flame size={18} />}
      />
      <StatCard
        label="Longest Session"
        value={formatHours(stats.longestSessionHours)}
        sub="Single shift record"
        icon={<Trophy size={18} />}
      />
      <StatCard
        label="Effective Rate"
        value={formatCurrency(tracker.settings.hourlyRate)}
        sub="Per hour"
        icon={<DollarSign size={18} />}
      />
    </div>
  )
}
