"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  apexEvents,
  workoutExerciseResults,
  workoutSessions,
} from "@/lib/db/schema";

export type StartWorkoutExerciseInput = {
  id: string;
  name: string;
  sets: number;
  reps: string;
};

export type StartWorkoutSessionInput = {
  title: string;
  intensity: string;
  plannedDurationMinutes: number;
  exercises: StartWorkoutExerciseInput[];
};

export type StartWorkoutSessionResult =
  | {
      success: true;
      sessionId: string;
    }
  | {
      success: false;
      error: string;
    };

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function startWorkoutSession(
  input: StartWorkoutSessionInput,
): Promise<StartWorkoutSessionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      success: false,
      error: "You must be signed in to start a workout.",
    };
  }

  if (
    !input.title.trim() ||
    !input.intensity.trim() ||
    !Number.isInteger(input.plannedDurationMinutes) ||
    input.plannedDurationMinutes < 1 ||
    input.plannedDurationMinutes > 300
  ) {
    return {
      success: false,
      error: "The workout session contains invalid details.",
    };
  }

  if (
    input.exercises.length === 0 ||
    input.exercises.length > 20
  ) {
    return {
      success: false,
      error: "The workout must contain between 1 and 20 exercises.",
    };
  }

  const invalidExercise = input.exercises.some(
    (exercise) =>
      !exercise.id.trim() ||
      !exercise.name.trim() ||
      !exercise.reps.trim() ||
      !Number.isInteger(exercise.sets) ||
      exercise.sets < 1 ||
      exercise.sets > 20,
  );

  if (invalidExercise) {
    return {
      success: false,
      error: "One or more planned exercises are invalid.",
    };
  }

  const workoutSessionId = randomUUID();
  const now = new Date();

  try {
    await db.transaction(async (tx) => {
      await tx.insert(workoutSessions).values({
        id: workoutSessionId,
        userId: session.user.id,
        date: getTodayDate(),
        title: input.title.trim(),
        intensity: input.intensity.trim(),
        plannedDurationMinutes:
          input.plannedDurationMinutes,
        status: "in-progress",
        startedAt: now,
        updatedAt: now,
      });

      await tx.insert(workoutExerciseResults).values(
        input.exercises.map((exercise, index) => ({
          id: randomUUID(),
          sessionId: workoutSessionId,
          userId: session.user.id,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          orderIndex: index,
          plannedSets: exercise.sets,
          targetReps: exercise.reps,
          completionStatus: "not-started" as const,
          updatedAt: now,
        })),
      );

      await tx.insert(apexEvents).values({
        id: randomUUID(),
        userId: session.user.id,
        type: "workout.session_started",
        category: "workout",
        source: "workout-session",
        payload: {
          sessionId: workoutSessionId,
          title: input.title.trim(),
          intensity: input.intensity.trim(),
          plannedDurationMinutes:
            input.plannedDurationMinutes,
          exerciseCount: input.exercises.length,
        },
        schemaVersion: 1,
        occurredAt: now,
      });
    });

    return {
      success: true,
      sessionId: workoutSessionId,
    };
  } catch (error) {
    console.error("Failed to start workout session:", error);

    return {
      success: false,
      error: "Apex could not start this workout session.",
    };
  }
}
