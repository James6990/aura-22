"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { goals as goalsTable, dayEntries } from "@/lib/db/schema"
import { and, eq } from "drizzle-orm"
import { headers } from "next/headers"
import type { DayData, Goals, Exercise } from "@/lib/aura-data"

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

// ---- Goals ----------------------------------------------------------------

export async function getGoals(): Promise<Goals> {
  const userId = await getUserId()
  const rows = await db.select().from(goalsTable).where(eq(goalsTable.userId, userId)).limit(1)
  const row = rows[0]
  return { g1: row?.g1 ?? "", g2: row?.g2 ?? "", g3: row?.g3 ?? "" }
}

export async function saveGoals(next: Goals): Promise<void> {
  const userId = await getUserId()
  await db
    .insert(goalsTable)
    .values({ userId, g1: next.g1, g2: next.g2, g3: next.g3, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: goalsTable.userId,
      set: { g1: next.g1, g2: next.g2, g3: next.g3, updatedAt: new Date() },
    })
}

// ---- Day entries ----------------------------------------------------------

function rowToDay(row: typeof dayEntries.$inferSelect): DayData {
  return {
    meals: row.meals,
    workout: row.workout,
    water: row.water,
    recovery: row.recovery,
    energy: row.energy,
    sleep: row.sleep,
    notes: row.notes,
    exercises: (row.exercises as Exercise[]) ?? [],
  }
}

/** Returns the stored entry for a day, or null if the user hasn't saved it yet. */
export async function getDay(day: number): Promise<DayData | null> {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(dayEntries)
    .where(and(eq(dayEntries.userId, userId), eq(dayEntries.day, day)))
    .limit(1)
  return rows[0] ? rowToDay(rows[0]) : null
}

export async function saveDay(day: number, data: DayData): Promise<void> {
  const userId = await getUserId()
  const values = {
    userId,
    day,
    meals: data.meals,
    workout: data.workout,
    water: data.water,
    recovery: data.recovery,
    energy: data.energy,
    sleep: data.sleep,
    notes: data.notes,
    exercises: data.exercises,
    updatedAt: new Date(),
  }
  await db
    .insert(dayEntries)
    .values(values)
    .onConflictDoUpdate({
      target: [dayEntries.userId, dayEntries.day],
      set: {
        meals: values.meals,
        workout: values.workout,
        water: values.water,
        recovery: values.recovery,
        energy: values.energy,
        sleep: values.sleep,
        notes: values.notes,
        exercises: values.exercises,
        updatedAt: values.updatedAt,
      },
    })
}

export type CycleStats = {
  workoutsDone: number
  mealsDone: number
  avgSleep: string
}

export async function getCycleStats(): Promise<CycleStats> {
  const userId = await getUserId()
  const rows = await db.select().from(dayEntries).where(eq(dayEntries.userId, userId))

  let workoutsDone = 0
  let mealsDone = 0
  let sleepTotal = 0
  let sleepCount = 0

  for (const row of rows) {
    if (row.workout) workoutsDone++
    if (row.meals) mealsDone++
    const s = Number(row.sleep)
    if (!Number.isNaN(s) && s > 0) {
      sleepTotal += s
      sleepCount++
    }
  }

  return {
    workoutsDone,
    mealsDone,
    avgSleep: sleepCount > 0 ? (sleepTotal / sleepCount).toFixed(1) : "0",
  }
}
