import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AppState, Settings, TimeEntry } from '../types'
import { createEntry, loadState, saveState } from '../utils/storage'
import { computeDashboardStats, getActiveEntry, getWeeklyChartData, sortEntries } from '../utils/stats'

export function useTimeTracker() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const activeEntry = useMemo(() => getActiveEntry(state.entries), [state.entries])
  const sortedEntries = useMemo(() => sortEntries(state.entries), [state.entries])
  const stats = useMemo(
    () => computeDashboardStats(state.entries, state.settings, now),
    [state.entries, state.settings, now],
  )
  const chartData = useMemo(
    () => getWeeklyChartData(state.entries, state.settings, now),
    [state.entries, state.settings, now],
  )

  const updateSettings = useCallback((settings: Partial<Settings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }))
  }, [])

  const clockIn = useCallback((notes = '') => {
    setState((prev) => {
      if (getActiveEntry(prev.entries)) return prev
      return {
        ...prev,
        entries: [createEntry({ notes }), ...prev.entries],
      }
    })
  }, [])

  const clockOut = useCallback(() => {
    setState((prev) => {
      const active = getActiveEntry(prev.entries)
      if (!active) return prev
      return {
        ...prev,
        entries: prev.entries.map((e) =>
          e.id === active.id ? { ...e, endTime: new Date().toISOString() } : e,
        ),
      }
    })
  }, [])

  const addManualEntry = useCallback((entry: Omit<TimeEntry, 'id'>) => {
    setState((prev) => ({
      ...prev,
      entries: [{ ...entry, id: crypto.randomUUID() }, ...prev.entries],
    }))
  }, [])

  const updateEntry = useCallback((id: string, updates: Partial<TimeEntry>) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }))
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.filter((e) => e.id !== id),
    }))
  }, [])

  const importEntries = useCallback(
    (entries: TimeEntry[], rate?: number, mode: 'merge' | 'replace' = 'merge') => {
      setState((prev) => ({
        settings: rate ? { ...prev.settings, hourlyRate: rate } : prev.settings,
        entries: mode === 'replace' ? entries : [...entries, ...prev.entries],
      }))
    },
    [],
  )

  const clearAll = useCallback(() => {
    setState((prev) => ({ ...prev, entries: [] }))
  }, [])

  return {
    settings: state.settings,
    entries: sortedEntries,
    activeEntry,
    stats,
    chartData,
    now,
    updateSettings,
    clockIn,
    clockOut,
    addManualEntry,
    updateEntry,
    deleteEntry,
    importEntries,
    clearAll,
  }
}

export type TimeTracker = ReturnType<typeof useTimeTracker>
