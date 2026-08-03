"use server";

import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { goals, dayEntries } from "@/lib/db/schema";
import type { DayData, Goals } from "@/lib/aura-data";

export type CycleStats = {
  completedDays: number;
  totalDays: number;
  completionPercent: number;
};

async function getCurrentUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("You must be signed in to access your journal.");
  }

  return session.user.id;
}

export async function getGoals(): Promise<Goals> {
  const userId = await getCurrentUserId();

  const result = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .limit(1);

  if (!result[0]) {
    return {
      g1: "",
      g2: "",
      g3: "",
    };
  }

  return {
    g1: result[0].g1,
    g2: result[0].g2,
    g3: result[0].g3,
  };
}

export async function saveGoals(next: Goals): Promise<void> {
  const userId = await getCurrentUserId();

  const existing = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
    .limit(1);

  if (existing[0]) {
    await db
      .update(goals)
      .set({
        g1: next.g1,
        g2: next.g2,
        g3: next.g3,
        updatedAt: new Date(),
      })
      .where(eq(goals.userId, userId));

    return;
  }

  await db.insert(goals).values({
    userId,
    g1: next.g1,
    g2: next.g2,
    g3: next.g3,
  });
}

export async function getDay(day: number): Promise<DayData | null> {
  const userId = await getCurrentUserId();

  const result = await db
    .select()
    .from(dayEntries)
    .where(
      and(
        eq(dayEntries.userId, userId),
        eq(dayEntries.day, day),
      ),
    )
    .limit(1);

  if (!result[0]) {
    return null;
  }

  return {
    meals: result[0].meals,
    workout: result[0].workout,
    water: result[0].water,
    recovery: result[0].recovery,
    energy: result[0].energy,
    sleep: result[0].sleep,
    notes: result[0].notes,
    exercises: result[0].exercises ?? [],
  };
}

export async function saveDay(
  day: number,
  data: DayData,
): Promise<void> {
  const userId = await getCurrentUserId();

  const existing = await db
    .select()
    .from(dayEntries)
    .where(
      and(
        eq(dayEntries.userId, userId),
        eq(dayEntries.day, day),
      ),
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(dayEntries)
      .set({
        meals: data.meals,
        workout: data.workout,
        water: data.water,
        recovery: data.recovery,
        energy: data.energy,
        sleep: data.sleep,
        notes: data.notes,
        exercises: data.exercises,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(dayEntries.userId, userId),
          eq(dayEntries.day, day),
        ),
      );

    return;
  }

  await db.insert(dayEntries).values({
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
  });
}

export async function getCycleStats(): Promise<CycleStats> {
  const userId = await getCurrentUserId();

  const result = await db
    .select()
    .from(dayEntries)
    .where(eq(dayEntries.userId, userId));

  const completedDays = result.filter(
    (entry) =>
      entry.meals &&
      entry.workout &&
      entry.water &&
      entry.recovery,
  ).length;

  const totalDays = 22;

  return {
    completedDays,
    totalDays,
    completionPercent: Math.round(
      (completedDays / totalDays) * 100,
    ),
  };
}
