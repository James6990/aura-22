'use client'

import { CalendarDays, Lightbulb } from 'lucide-react'
import {
  type DayData,
  TOTAL_DAYS,
  coachingForEnergy,
} from '@/lib/aura-data'

const CHECKLIST: { key: keyof Pick<DayData, 'meals' | 'workout' | 'water' | 'recovery'>; label: string }[] = [
  { key: 'meals', label: 'Meals Prepped' },
  { key: 'workout', label: 'Workout Done' },
  { key: 'water', label: 'Water Hydrated' },
  { key: 'recovery', label: 'Recovery Met' },
]

const COACH_TONE: Record<string, string> = {
  rest: 'border-accent/30 bg-accent/10 text-accent',
  low: 'border-warn/30 bg-warn/10 text-warn',
  peak: 'border-primary/30 bg-primary/10 text-primary',
}

export function DayTracker({
  selectedDay,
  onSelectDay,
  day,
  onUpdate,
}: {
  selectedDay: number
  onSelectDay: (day: number) => void
  day: DayData
  onUpdate: (partial: Partial<DayData>) => void
}) {
  const coaching = coachingForEnergy(day.energy)

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-card-foreground">
          <CalendarDays className="size-5 text-primary" aria-hidden="true" />
          Day Tracker
        </h2>
        <label htmlFor="day-select" className="sr-only">
          Select day
        </label>
        <select
          id="day-select"
          value={selectedDay}
          onChange={(e) => onSelectDay(Number(e.target.value))}
          className="rounded-lg border border-border bg-secondary p-2 text-sm font-bold text-primary focus:outline-none"
        >
          {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              Day {d}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`flex gap-2 rounded-xl border p-3 text-xs leading-relaxed ${COACH_TONE[coaching.tone]}`}
        role="status"
      >
        <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          <strong className="font-semibold">Adaptive Coach — {coaching.title}:</strong>{' '}
          {coaching.body}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CHECKLIST.map((item) => (
          <label
            key={item.key}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background p-2.5 text-xs text-foreground"
          >
            <input
              type="checkbox"
              checked={day[item.key]}
              onChange={(e) => onUpdate({ [item.key]: e.target.checked })}
              className="size-4 accent-primary"
            />
            {item.label}
          </label>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor="sleep-input"
            className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground"
          >
            Sleep Quality (Hours)
          </label>
          <input
            id="sleep-input"
            type="number"
            step="0.5"
            min="0"
            value={day.sleep}
            placeholder="e.g. 7.5"
            onChange={(e) => onUpdate({ sleep: e.target.value })}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="notes-input"
            className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground"
          >
            Journal / Shift Notes
          </label>
          <input
            id="notes-input"
            type="text"
            value={day.notes}
            placeholder="e.g. Felt great during bench press"
            onChange={(e) => onUpdate({ notes: e.target.value })}
            className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
      </div>
    </section>
  )
}
