import { format, parseISO } from 'date-fns'
import type { TimeEntry } from '../types'

export interface TimeFields {
  date: string
  startTime: string
  endTime: string
  notes: string
}

export function defaultTimeFields(): TimeFields {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 3_600_000)
  return {
    date: format(now, 'yyyy-MM-dd'),
    startTime: format(oneHourAgo, 'HH:mm'),
    endTime: format(now, 'HH:mm'),
    notes: '',
  }
}

export function entryToTimeFields(entry: TimeEntry): TimeFields {
  return {
    date: format(parseISO(entry.startTime), 'yyyy-MM-dd'),
    startTime: format(parseISO(entry.startTime), 'HH:mm'),
    endTime: entry.endTime ? format(parseISO(entry.endTime), 'HH:mm') : '',
    notes: entry.notes,
  }
}

export function timeFieldsToEntry(
  fields: TimeFields,
): { entry: Omit<TimeEntry, 'id'>; error?: undefined } | { entry?: undefined; error: string } {
  const { date, startTime, endTime, notes } = fields

  if (!date || !startTime || !endTime) {
    return { error: 'Date, start time, and end time are required.' }
  }

  const start = new Date(`${date}T${startTime}`)
  let end = new Date(`${date}T${endTime}`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { error: 'Invalid date or time.' }
  }

  if (end <= start) {
    end = new Date(end.getTime() + 86_400_000)
  }

  return {
    entry: {
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      notes: notes.trim(),
    },
  }
}

export function resetTimeFieldsForAnother(current: TimeFields): TimeFields {
  return {
    ...defaultTimeFields(),
    date: current.date,
    notes: '',
  }
}
