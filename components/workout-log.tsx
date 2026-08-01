'use client'

import { Dumbbell, Plus, Trash2 } from 'lucide-react'
import type { DayData, Exercise } from '@/lib/aura-data'

export function WorkoutLog({
  exercises,
  onUpdate,
}: {
  exercises: Exercise[]
  onUpdate: (partial: Partial<DayData>) => void
}) {
  const updateExercise = (index: number, patch: Partial<Exercise>) => {
    const next = exercises.map((ex, i) => (i === index ? { ...ex, ...patch } : ex))
    onUpdate({ exercises: next })
  }

  const addExercise = () => {
    onUpdate({
      exercises: [...exercises, { name: '', sets: '', reps: '', weight: '' }],
    })
  }

  const removeExercise = (index: number) => {
    onUpdate({ exercises: exercises.filter((_, i) => i !== index) })
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-card-foreground">
          <Dumbbell className="size-5 text-primary" aria-hidden="true" />
          Workout Log
        </h2>
        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-mono text-[11px] text-primary">
          Progressive Overload
        </span>
      </div>

      <div className="space-y-3">
        {exercises.map((ex, index) => (
          <div
            key={index}
            className="space-y-2 rounded-xl border border-border bg-background p-3 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={ex.name}
                placeholder="Exercise Name"
                onChange={(e) => updateExercise(index, { name: e.target.value })}
                aria-label="Exercise name"
                className="w-2/3 border-b border-border bg-transparent pb-1 font-semibold text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <span className="rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                  +2.5kg
                </span>
                <button
                  type="button"
                  onClick={() => removeExercise(index)}
                  aria-label={`Remove ${ex.name || 'exercise'}`}
                  className="text-muted-foreground transition hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={ex.sets}
                placeholder="Sets"
                onChange={(e) => updateExercise(index, { sets: e.target.value })}
                aria-label="Sets"
                className="rounded-lg border border-border bg-secondary p-2 text-center text-secondary-foreground focus:border-primary focus:outline-none"
              />
              <input
                type="text"
                value={ex.reps}
                placeholder="Reps"
                onChange={(e) => updateExercise(index, { reps: e.target.value })}
                aria-label="Reps"
                className="rounded-lg border border-border bg-secondary p-2 text-center text-secondary-foreground focus:border-primary focus:outline-none"
              />
              <input
                type="text"
                value={ex.weight}
                placeholder="Weight (kg)"
                onChange={(e) => updateExercise(index, { weight: e.target.value })}
                aria-label="Weight in kilograms"
                className="rounded-lg border border-border bg-secondary p-2 text-center text-secondary-foreground focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        ))}
        {exercises.length === 0 && (
          <p className="rounded-xl border border-dashed border-border bg-background p-4 text-center text-xs text-muted-foreground">
            No exercises logged for this day yet.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={addExercise}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-secondary py-2.5 text-xs font-semibold text-secondary-foreground transition hover:bg-muted"
      >
        <Plus className="size-4" aria-hidden="true" />
        Add Custom Exercise
      </button>
    </section>
  )
}
