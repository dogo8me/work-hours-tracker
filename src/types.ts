export interface Settings {
  hourlyRate: number
  workerName: string
}

export interface TimeEntry {
  id: string
  startTime: string
  endTime: string | null
  notes: string
}

export interface AppState {
  settings: Settings
  entries: TimeEntry[]
}

export interface EntryStats {
  durationMs: number
  earnings: number
}

export interface DashboardStats {
  totalHours: number
  totalEarnings: number
  avgHoursPerDay: number
  daysWorked: number
  todayHours: number
  todayEarnings: number
  weekHours: number
  weekEarnings: number
  longestSessionHours: number
  currentStreak: number
}

export interface DailyChartPoint {
  date: string
  label: string
  hours: number
  earnings: number
}

export interface CsvRow {
  date: string
  start: string
  end: string
  hours: string
  rate: string
  earnings: string
  notes: string
}
