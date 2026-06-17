import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TimeTracker } from '../hooks/useTimeTracker'
import { formatCurrency } from '../utils/stats'
import { Card } from './ui'

interface WeeklyChartProps {
  tracker: TimeTracker
}

export function WeeklyChart({ tracker }: WeeklyChartProps) {
  const { chartData, settings } = tracker
  const hasData = chartData.some((d) => d.hours > 0)

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Last 7 Days</h3>
          <p className="text-sm text-[var(--color-muted)]">Hours worked per day</p>
        </div>
      </div>

      {!hasData ? (
        <div className="flex h-48 items-center justify-center text-sm text-[var(--color-muted)]">
          No data yet — clock in to start tracking!
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#8b8b9e', fontSize: 12 }}
              axisLine={{ stroke: '#2a2a35' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#8b8b9e', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}h`}
            />
            <Tooltip
              contentStyle={{
                background: '#141419',
                border: '1px solid #2a2a35',
                borderRadius: '12px',
                fontSize: '13px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'hours') return [`${value.toFixed(2)} hrs`, 'Hours']
                return [formatCurrency(value), 'Earnings']
              }}
              labelFormatter={(_, payload) => {
                const item = payload?.[0]?.payload
                return item ? `${item.label} — ${formatCurrency(item.earnings)}` : ''
              }}
            />
            <Bar dataKey="hours" fill="#22d3a5" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}

      <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
        At {formatCurrency(settings.hourlyRate)}/hr
      </p>
    </Card>
  )
}
