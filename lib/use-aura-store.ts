"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { type DayData, type Goals, emptyDay, presetForDay } from "./aura-data"
import { getGoals, saveGoals, getDay, saveDay, getCycleStats, type CycleStats } from "@/app/actions/journal"

function dayWithPreset(day: number, stored: DayData | null): DayData {
  if (!stored) {
    const base = emptyDay()
    base.exercises = presetForDay(day)
    return base
  }
  const merged: DayData = { ...emptyDay(), ...stored }
  if (!merged.exercises || merged.exercises.length === 0) {
    merged.exercises = presetForDay(day)
  }
  return merged
}

export function useAuraStore() {
  const [hydrated, setHydrated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedDay, setSelectedDay] = useState(1)
  const [goals, setGoals] = useState<Goals>({ g1: "", g2: "", g3: "" })
  const [day, setDay] = useState<DayData>(() => emptyDay())

  const goalsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Track the latest day being edited so a stale debounce doesn't write to the wrong day.
  const activeDay = useRef(1)

  // Initial load: goals + day 1
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [loadedGoals, loadedDay] = await Promise.all([getGoals(), getDay(1)])
        if (cancelled) return
        setGoals(loadedGoals)
        setDay(dayWithPreset(1, loadedDay))
      } catch {
        /* leave defaults */
      } finally {
        if (!cancelled) setHydrated(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const selectDay = useCallback(async (next: number) => {
    setSelectedDay(next)
    activeDay.current = next
    setHydrated(false)
    try {
      const loaded = await getDay(next)
      setDay(dayWithPreset(next, loaded))
    } catch {
      setDay(dayWithPreset(next, null))
    } finally {
      setHydrated(true)
    }
  }, [])

  const updateGoals = useCallback((partial: Partial<Goals>) => {
    setGoals((prev) => {
      const next = { ...prev, ...partial }
      if (goalsTimer.current) clearTimeout(goalsTimer.current)
      goalsTimer.current = setTimeout(() => {
        setSaving(true)
        saveGoals(next).finally(() => setSaving(false))
      }, 600)
      return next
    })
  }, [])

  const updateDay = useCallback((partial: Partial<DayData>) => {
    const targetDay = activeDay.current
    setDay((prev) => {
      const next = { ...prev, ...partial }
      if (dayTimer.current) clearTimeout(dayTimer.current)
      dayTimer.current = setTimeout(() => {
        setSaving(true)
        saveDay(targetDay, next).finally(() => setSaving(false))
      }, 600)
      return next
    })
  }, [])

  const cycleStats = useCallback((): Promise<CycleStats> => {
    return getCycleStats()
  }, [])

  return {
    hydrated,
    saving,
    selectedDay,
    selectDay,
    goals,
    updateGoals,
    day,
    updateDay,
    cycleStats,
  }
}
