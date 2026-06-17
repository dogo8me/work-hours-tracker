import type { AppState, Settings, TimeEntry } from './types'

const STORAGE_KEY = 'work-hours-tracker-v1'

const defaultSettings: Settings = {
  hourlyRate: 15,
  workerName: '',
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { settings: defaultSettings, entries: [] }
    }
    const parsed = JSON.parse(raw) as AppState
    return {
      settings: { ...defaultSettings, ...parsed.settings },
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
    }
  } catch {
    return { settings: defaultSettings, entries: [] }
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function createEntry(partial?: Partial<TimeEntry>): TimeEntry {
  return {
    id: crypto.randomUUID(),
    startTime: new Date().toISOString(),
    endTime: null,
    notes: '',
    ...partial,
  }
}
