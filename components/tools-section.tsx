'use client'

import { useState } from 'react'
import { BarChart3, ShoppingCart } from 'lucide-react'
import { GROCERY_STAPLES, TOTAL_DAYS } from '@/lib/aura-data'

type Stats = { workoutsDone: number; mealsDone: number; avgSleep: string }

export function ToolsSection({
  getStats,
}: {
  getStats: () => Promise<Stats>
}) {
  const [showGrocery, setShowGrocery] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCalculate = async () => {
    setLoading(true)
    try {
      setStats(await getStats())
    } finally {
      setLoading(false)
    }
  }

  const workoutPct = stats ? Math.round((stats.workoutsDone / TOTAL_DAYS) * 100) : 0
  const mealPct = stats ? Math.round((stats.mealsDone / TOTAL_DAYS) * 100) : 0

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-card-foreground">
          <ShoppingCart className="size-4 text-primary" aria-hidden="true" />
          Cycle Grocery Generator
        </h3>
        <p className="text-xs text-muted-foreground">
          Generate a complete grocery checklist for your 22-day meal plan with one tap.
        </p>
        <button
          type="button"
          onClick={() => setShowGrocery((v) => !v)}
          className="w-full rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90"
        >
          {showGrocery ? 'Hide Shopping List' : 'Generate Shopping List'}
        </button>
        {showGrocery && (
          <ul className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-border bg-background p-3 text-xs text-foreground">
            <li className="mb-1 font-semibold text-primary">22-Day Staples Checklist</li>
            {GROCERY_STAPLES.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-card p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-card-foreground">
          <BarChart3 className="size-4 text-accent" aria-hidden="true" />
          22-Day Cycle Summary
        </h3>
        <p className="text-xs text-muted-foreground">
          Review total completed workouts, meal preps and average sleep across the cycle.
        </p>
        <button
          type="button"
          onClick={handleCalculate}
          disabled={loading}
          className="w-full rounded-xl bg-accent py-2 text-xs font-bold text-accent-foreground transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Calculating…" : "Calculate Stats"}
        </button>
        {stats && (
          <dl className="space-y-2 rounded-xl border border-border bg-background p-3 text-xs text-foreground">
            <StatRow
              label="Workouts Completed"
              value={`${stats.workoutsDone} / ${TOTAL_DAYS}`}
              pct={workoutPct}
              color="bg-primary"
            />
            <StatRow
              label="Meal Preps Completed"
              value={`${stats.mealsDone} / ${TOTAL_DAYS}`}
              pct={mealPct}
              color="bg-accent"
            />
            <div className="flex items-center justify-between pt-1">
              <dt className="text-muted-foreground">Average Sleep</dt>
              <dd className="font-semibold">{stats.avgSleep} hrs</dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  )
}

function StatRow({
  label,
  value,
  pct,
  color,
}: {
  label: string
  value: string
  pct: number
  color: string
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <dt className="text-muted-foreground">{label}</dt>
        <dd className="font-semibold">
          {value} · {pct}%
        </dd>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
