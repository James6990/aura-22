"use server";

import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { dailyCheckIns } from "@/lib/db/schema";

export async function saveDailyCheckIn({
  energy,
  workoutCompleted,
  recoveryCompleted,
  hydrationTargetReached,
  readinessScore,
  readinessLevel,
}: {
  energy: number;
  workoutCompleted: boolean;
  recoveryCompleted: boolean;
  hydrationTargetReached: boolean;
  readinessScore: number;
  readinessLevel: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const today = new Date().toISOString().slice(0, 10);

  await db
    .insert(dailyCheckIns)
    .values({
      userId: session.user.id,
      date: today,
      energy,
      workoutCompleted,
      recoveryCompleted,
      hydrationTargetReached,
      readinessScore,
      readinessLevel,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        dailyCheckIns.userId,
        dailyCheckIns.date,
      ],
      set: {
        energy,
        workoutCompleted,
        recoveryCompleted,
        hydrationTargetReached,
        readinessScore,
        readinessLevel,
        updatedAt: new Date(),
      },
    });
}
