'use client'

import { useHeartRate } from '@/lib/use-heart-rate'
import { useAuraStore } from '@/lib/use-aura-store'
import { AuraHeader } from './aura-header'
import { ReadinessCard } from './readiness-card'
import { GoalsCard } from './goals-card'
import { DayTracker } from './day-tracker'
import { WorkoutLog } from './workout-log'
import { ToolsSection } from './tools-section'

export function AuraJournal({ userName }: { userName: string }) {
  const { bpm, status, connect } = useHeartRate()
  const {
    hydrated,
    saving,
    selectedDay,
    selectDay,
    goals,
    updateGoals,
    day,
    updateDay,
    cycleStats,
  } = useAuraStore()

  return (
    <div className="min-h-screen pb-16">
      <AuraHeader status={status} onConnect={connect} userName={userName} saving={saving} />

      <main className="mx-auto max-w-3xl space-y-6 p-4">
        <ReadinessCard
          bpm={bpm}
          energy={day.energy}
          onEnergyChange={(value) => updateDay({ energy: value })}
        />
        <GoalsCard goals={goals} onChange={updateGoals} />
        <DayTracker
          selectedDay={selectedDay}
          onSelectDay={selectDay}
          day={day}
          onUpdate={updateDay}
        />
        <WorkoutLog exercises={day.exercises} onUpdate={updateDay} />
        <ToolsSection getStats={cycleStats} />

        {!hydrated && (
          <p className="text-center text-[11px] text-muted-foreground" role="status">
            Syncing your journal…
          </p>
        )}
      </main>

      <footer className="mx-auto mt-8 max-w-3xl px-4 text-center text-[11px] text-muted-foreground">
        © 2026 James Whiteley. All Rights Reserved. AURA 22 Adaptive Journal.
      </footer>
    </div>
  )
}
