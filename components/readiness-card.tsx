'use client'

import { HeartPulse } from 'lucide-react'
import { ENERGY_OPTIONS, type HeartZone, zoneForBpm } from '@/lib/aura-data'

const ZONE_STYLES: Record<HeartZone['key'], { ring: string; text: string; bg: string }> = {
  idle: {
    ring: 'border-border',
    text: 'text-muted-foreground',
    bg: 'bg-card',
  },
  warmup: {
    ring: 'border-primary/50',
    text: 'text-primary',
    bg: 'bg-primary/10',
  },
  hypertrophy: {
    ring: 'border-warn/50',
    text: 'text-warn',
    bg: 'bg-warn/10',
  },
  peak: {
    ring: 'border-destructive/50',
    text: 'text-destructive',
    bg: 'bg-destructive/10',
  },
}

export function ReadinessCard({
  bpm,
  energy,
  onEnergyChange,
}: {
  bpm: number | null
  energy: string
  onEnergyChange: (value: string) => void
}) {
  const zone = zoneForBpm(bpm)
  const styles = ZONE_STYLES[zone.key]

  return (
    <section
      className={`flex flex-col gap-5 rounded-2xl border p-5 transition-colors duration-300 sm:flex-row sm:items-center sm:justify-between ${styles.ring} ${styles.bg}`}
    >
      <div>
        <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <HeartPulse className="size-3.5" aria-hidden="true" />
          Heart Rate Zone
        </span>
        <div className="mt-1 flex items-baseline gap-2">
          <span className={`text-4xl font-extrabold tracking-tight ${styles.text}`}>
            {bpm ?? '--'}
          </span>
          <span className="text-xs font-medium text-muted-foreground">BPM</span>
        </div>
        <span className={`mt-1 block text-xs font-semibold ${styles.text}`}>
          {zone.label}
        </span>
      </div>

      <div className="sm:text-right">
        <label
          htmlFor="energy-rating"
          className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
        >
          Today&apos;s Readiness
        </label>
        <select
          id="energy-rating"
          value={energy}
          onChange={(e) => onEnergyChange(e.target.value)}
          className="mt-2 block w-full rounded-lg border border-border bg-secondary p-2 text-xs font-semibold text-secondary-foreground focus:border-primary focus:outline-none sm:w-auto"
        >
          {ENERGY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  )
}
