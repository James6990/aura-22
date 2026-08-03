"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { dailyCheckIns } from "@/lib/db/schema";
import { recordApexEvent } from "@/lib/events/record-apex-event";

export type SaveDailyCheckInInput = {
  energy: number;
  workoutCompleted: boolean;
  recoveryCompleted: boolean;
  hydrationTargetReached: boolean;
  readinessScore: number;
  readinessLevel: string;
};

export type SaveDailyCheckInResult =
  | { success: true }
  | { success: false; error: string };

export async function saveDailyCheckIn(
  input: SaveDailyCheckInInput,
): Promise<SaveDailyCheckInResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      success: false,
      error: "You must be signed in to save a daily check-in.",
    };
  }

  if (
    !Number.isFinite(input.energy) ||
    input.energy < 1 ||
    input.energy > 10 ||
    !Number.isFinite(input.readinessScore) ||
    input.readinessScore < 0 ||
    input.readinessScore > 100
  ) {
    return {
      success: false,
      error: "The daily check-in contains invalid values.",
    };
  }

  const today = new Date().toISOString().slice(0, 10);

  try {
    await db.transaction(async (tx) => {
      await tx
        .insert(dailyCheckIns)
        .values({
          userId: session.user.id,
          date: today,
          energy: input.energy,
          workoutCompleted: input.workoutCompleted,
          recoveryCompleted: input.recoveryCompleted,
          hydrationTargetReached:
            input.hydrationTargetReached,
          readinessScore: input.readinessScore,
          readinessLevel: input.readinessLevel,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [
            dailyCheckIns.userId,
            dailyCheckIns.date,
          ],
          set: {
            energy: input.energy,
            workoutCompleted: input.workoutCompleted,
            recoveryCompleted: input.recoveryCompleted,
            hydrationTargetReached:
              input.hydrationTargetReached,
            readinessScore: input.readinessScore,
            readinessLevel: input.readinessLevel,
            updatedAt: new Date(),
          },
        });

      await tx.insert(
        (await import("@/lib/db/schema")).apexEvents,
      ).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        type: "readiness.check_in_saved",
        category: "readiness",
        source: "daily-check-in",
        payload: {
          date: today,
          energy: input.energy,
          workoutCompleted: input.workoutCompleted,
          recoveryCompleted: input.recoveryCompleted,
          hydrationTargetReached:
            input.hydrationTargetReached,
          readinessScore: input.readinessScore,
          readinessLevel: input.readinessLevel,
        },
        schemaVersion: 1,
        occurredAt: new Date(),
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to save daily check-in:", error);

    return {
      success: false,
      error: "Apex could not save today's check-in.",
    };
  }
}
