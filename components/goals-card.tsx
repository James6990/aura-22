'use client'

import { Target } from 'lucide-react'
import type { Goals } from '@/lib/aura-data'

const FIELDS: { key: keyof Goals; placeholder: string }[] = [
  { key: 'g1', placeholder: 'Goal 1 (e.g. Bench 80kg)' },
  { key: 'g2', placeholder: 'Goal 2 (e.g. 10k steps daily)' },
  { key: 'g3', placeholder: 'Goal 3 (e.g. Sleep 8 hours)' },
]

export function GoalsCard({
  goals,
  onChange,
}: {
  goals: Goals
  onChange: (partial: Partial<Goals>) => void
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-card-foreground">
        <Target className="size-4 text-primary" aria-hidden="true" />
        22-Day Goals
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {FIELDS.map((field) => (
          <input
            key={field.key}
            type="text"
            value={goals[field.key]}
            placeholder={field.placeholder}
            onChange={(e) => onChange({ [field.key]: e.target.value })}
            aria-label={field.placeholder}
            className="rounded-xl border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        ))}
      </div>
    </section>
  )
}
