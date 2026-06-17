import { ClockWidget } from './components/ClockWidget'
import { EntryList } from './components/EntryList'
import { Header } from './components/Header'
import { SettingsPanel } from './components/SettingsPanel'
import { StatsDashboard } from './components/StatsDashboard'
import { WeeklyChart } from './components/WeeklyChart'
import { useTimeTracker } from './hooks/useTimeTracker'

export default function App() {
  const tracker = useTimeTracker()

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6">
      <Header tracker={tracker} />

      <div className="flex flex-col gap-6">
        <ClockWidget tracker={tracker} />
        <StatsDashboard tracker={tracker} />

        <div className="grid gap-6 lg:grid-cols-2">
          <WeeklyChart tracker={tracker} />
          <EntryList tracker={tracker} />
        </div>

        <SettingsPanel tracker={tracker} />

        <footer className="pb-4 text-center text-xs text-[var(--color-muted)]">
          Data saved locally in your browser · No account needed
        </footer>
      </div>
    </div>
  )
}
