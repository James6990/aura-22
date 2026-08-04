"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import { and, desc, eq, sql } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  apexEvents,
  workoutExerciseResults,
  workoutSessions,
} from "@/lib/db/schema";
import { processApexMemories } from "@/lib/memory/process-apex-memories";
import {
  calculateProgressionDecision,
  type ProgressionDecision,
} from "@/lib/workout/calculate-progression-decision";

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
      resumed: boolean;
    }
  | {
      success: false;
      error: string;
    };

export type SaveExerciseResultInput = {
  exerciseResultId: string;
  sessionId: string;
  loadKg: number | null;
  completedReps: number[];
  rpe: number | null;
  discomfortLevel: number | null;
  techniqueConfidence: number | null;
  notes: string;
};

export type SaveExerciseResultResult =
  | {
      success: true;
      completionStatus:
        | "not-started"
        | "partial"
        | "completed"
        | "skipped";
    }
  | {
      success: false;
      error: string;
    };

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

async function getCurrentUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

export async function startWorkoutSession(
  input: StartWorkoutSessionInput,
): Promise<StartWorkoutSessionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
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

  const now = new Date();

  try {
    const result = await db.transaction(
      async (tx) => {
        /*
         * Serialise workout starts for this user.
         * This prevents two tabs or rapid requests
         * from creating duplicate active sessions.
         */
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtext(${userId}))`,
        );

        const existingSession =
          await tx.query.workoutSessions.findFirst({
            where: and(
              eq(workoutSessions.userId, userId),
              eq(
                workoutSessions.status,
                "in-progress",
              ),
            ),
            orderBy: [
              desc(workoutSessions.updatedAt),
            ],
          });

        if (existingSession) {
          return {
            sessionId: existingSession.id,
            resumed: true,
          };
        }

        const workoutSessionId = randomUUID();

        await tx.insert(workoutSessions).values({
          id: workoutSessionId,
          userId,
          date: getTodayDate(),
          title: input.title.trim(),
          intensity: input.intensity.trim(),
          plannedDurationMinutes:
            input.plannedDurationMinutes,
          status: "in-progress",
          startedAt: now,
          updatedAt: now,
        });

        await tx
          .insert(workoutExerciseResults)
          .values(
            input.exercises.map(
              (exercise, index) => ({
                id: randomUUID(),
                sessionId: workoutSessionId,
                userId,
                exerciseId: exercise.id,
                exerciseName: exercise.name,
                orderIndex: index,
                plannedSets: exercise.sets,
                targetReps: exercise.reps,
                completionStatus:
                  "not-started" as const,
                updatedAt: now,
              }),
            ),
          );

        await tx.insert(apexEvents).values({
          id: randomUUID(),
          userId,
          type: "workout.session_started",
          category: "workout",
          source: "workout-session",
          payload: {
            sessionId: workoutSessionId,
            title: input.title.trim(),
            intensity:
              input.intensity.trim(),
            plannedDurationMinutes:
              input.plannedDurationMinutes,
            exerciseCount:
              input.exercises.length,
          },
          schemaVersion: 1,
          occurredAt: now,
        });

        return {
          sessionId: workoutSessionId,
          resumed: false,
        };
      },
    );

    return {
      success: true,
      sessionId: result.sessionId,
      resumed: result.resumed,
    };
  } catch (error) {
    console.error(
      "Failed to start or resume workout session:",
      error,
    );

    return {
      success: false,
      error:
        "Apex could not start or resume this workout session.",
    };
  }
}

export async function saveExerciseResult(
  input: SaveExerciseResultInput,
): Promise<SaveExerciseResultResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      error: "You must be signed in to log an exercise.",
    };
  }

  if (
    !input.exerciseResultId.trim() ||
    !input.sessionId.trim()
  ) {
    return {
      success: false,
      error: "The exercise record is invalid.",
    };
  }

  if (
    input.loadKg !== null &&
    (!Number.isFinite(input.loadKg) ||
      input.loadKg < 0 ||
      input.loadKg > 1500)
  ) {
    return {
      success: false,
      error: "Please enter a valid exercise load.",
    };
  }

  if (
    input.completedReps.length > 20 ||
    input.completedReps.some(
      (reps) =>
        !Number.isInteger(reps) ||
        reps < 0 ||
        reps > 1000,
    )
  ) {
    return {
      success: false,
      error: "Please enter valid repetitions.",
    };
  }

  if (
    input.rpe !== null &&
    (!Number.isInteger(input.rpe) ||
      input.rpe < 1 ||
      input.rpe > 10)
  ) {
    return {
      success: false,
      error: "RPE must be between 1 and 10.",
    };
  }

  if (
    input.discomfortLevel !== null &&
    (!Number.isInteger(input.discomfortLevel) ||
      input.discomfortLevel < 0 ||
      input.discomfortLevel > 10)
  ) {
    return {
      success: false,
      error: "Discomfort must be between 0 and 10.",
    };
  }

  if (
    input.techniqueConfidence !== null &&
    (!Number.isInteger(input.techniqueConfidence) ||
      input.techniqueConfidence < 0 ||
      input.techniqueConfidence > 100)
  ) {
    return {
      success: false,
      error:
        "Technique confidence must be between 0 and 100.",
    };
  }

  try {
    const existing =
      await db.query.workoutExerciseResults.findFirst({
        where: and(
          eq(
            workoutExerciseResults.id,
            input.exerciseResultId,
          ),
          eq(
            workoutExerciseResults.sessionId,
            input.sessionId,
          ),
          eq(workoutExerciseResults.userId, userId),
        ),
      });

    if (!existing) {
      return {
        success: false,
        error: "This exercise could not be found.",
      };
    }

    const completedSets = input.completedReps.filter(
      (reps) => reps > 0,
    ).length;

    const completionStatus =
      completedSets === 0
        ? "not-started"
        : completedSets >= existing.plannedSets
          ? "completed"
          : "partial";

    const now = new Date();

    await db.transaction(async (tx) => {
      await tx
        .update(workoutExerciseResults)
        .set({
          loadKg: input.loadKg,
          completedReps: input.completedReps,
          completedSets,
          rpe: input.rpe,
          discomfortLevel: input.discomfortLevel,
          techniqueConfidence:
            input.techniqueConfidence,
          completionStatus,
          notes: input.notes.trim().slice(0, 1000),
          updatedAt: now,
        })
        .where(
          and(
            eq(
              workoutExerciseResults.id,
              input.exerciseResultId,
            ),
            eq(workoutExerciseResults.userId, userId),
          ),
        );

      await tx.insert(apexEvents).values({
        id: randomUUID(),
        userId,
        type: "workout.exercise_logged",
        category: "workout",
        source: "live-coach",
        payload: {
          sessionId: input.sessionId,
          exerciseResultId: input.exerciseResultId,
          exerciseId: existing.exerciseId,
          exerciseName: existing.exerciseName,
          completedSets,
          plannedSets: existing.plannedSets,
          loadKg: input.loadKg,
          completedReps: input.completedReps,
          rpe: input.rpe,
          discomfortLevel: input.discomfortLevel,
          techniqueConfidence:
            input.techniqueConfidence,
          completionStatus,
        },
        schemaVersion: 1,
        occurredAt: now,
      });
    });

    return {
      success: true,
      completionStatus,
    };
  } catch (error) {
    console.error("Failed to save exercise result:", error);

    return {
      success: false,
      error: "Apex could not save this exercise.",
    };
  }
}

export type CompleteWorkoutSessionInput = {
  sessionId: string;
  sessionRpe: number | null;
  notes: string;
};

export type WorkoutDebrief = {
  durationMinutes: number;
  completedExercises: number;
  totalExercises: number;
  completedSets: number;
  totalTrainingVolumeKg: number;
  progressionReady: number;
  maintainCount: number;
  reviewCount: number;
};

export type CompleteWorkoutSessionResult =
  | {
      success: true;
      debrief: WorkoutDebrief;
    }
  | {
      success: false;
      error: string;
    };

export async function completeWorkoutSession(
  input: CompleteWorkoutSessionInput,
): Promise<CompleteWorkoutSessionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      error: "You must be signed in to complete a workout.",
    };
  }

  if (!input.sessionId.trim()) {
    return {
      success: false,
      error: "The workout session is invalid.",
    };
  }

  if (
    input.sessionRpe !== null &&
    (!Number.isInteger(input.sessionRpe) ||
      input.sessionRpe < 1 ||
      input.sessionRpe > 10)
  ) {
    return {
      success: false,
      error: "Session effort must be between 1 and 10.",
    };
  }

  try {
    const workoutSession =
      await db.query.workoutSessions.findFirst({
        where: and(
          eq(workoutSessions.id, input.sessionId),
          eq(workoutSessions.userId, userId),
        ),
      });

    if (!workoutSession) {
      return {
        success: false,
        error: "This workout session could not be found.",
      };
    }

    if (workoutSession.status === "completed") {
      return {
        success: false,
        error: "This workout has already been completed.",
      };
    }

    const exercises = await db
      .select()
      .from(workoutExerciseResults)
      .where(
        and(
          eq(
            workoutExerciseResults.sessionId,
            workoutSession.id,
          ),
          eq(workoutExerciseResults.userId, userId),
        ),
      );

    if (exercises.length === 0) {
      return {
        success: false,
        error: "This workout has no exercises to complete.",
      };
    }

    const completedExercises = exercises.filter(
      (exercise) =>
        exercise.completionStatus === "completed",
    ).length;

    const completedSets = exercises.reduce(
      (total, exercise) =>
        total + exercise.completedSets,
      0,
    );

    if (completedSets === 0) {
      return {
        success: false,
        error:
          "Log at least one completed set before finishing the workout.",
      };
    }

    const totalTrainingVolumeKg = Math.round(
      exercises.reduce((total, exercise) => {
        if (
          exercise.loadKg === null ||
          exercise.loadKg <= 0
        ) {
          return total;
        }

        const repetitions =
          exercise.completedReps.reduce(
            (sum, reps) => sum + reps,
            0,
          );

        return total + exercise.loadKg * repetitions;
      }, 0) * 100,
    ) / 100;

    const progressionResults = exercises.map(
      (exercise) => ({
        exercise,
        ...calculateProgressionDecision(exercise),
      }),
    );

    const progressionReady = progressionResults.filter(
      (result) => result.decision === "increase",
    ).length;

    const maintainCount = progressionResults.filter(
      (result) => result.decision === "maintain",
    ).length;

    const reviewCount = progressionResults.filter(
      (result) =>
        result.decision === "review" ||
        result.decision === "reduce",
    ).length;

    const now = new Date();

    const startedAt =
      workoutSession.startedAt ??
      workoutSession.createdAt;

    const durationMinutes = Math.max(
      1,
      Math.round(
        (now.getTime() - startedAt.getTime()) /
          60_000,
      ),
    );

    await db.transaction(async (tx) => {
      for (const result of progressionResults) {
        await tx
          .update(workoutExerciseResults)
          .set({
            progressionDecision: result.decision,
            recommendedNextLoadKg:
              result.recommendedNextLoadKg,
            updatedAt: now,
          })
          .where(
            and(
              eq(
                workoutExerciseResults.id,
                result.exercise.id,
              ),
              eq(
                workoutExerciseResults.userId,
                userId,
              ),
            ),
          );
      }

      await tx
        .update(workoutSessions)
        .set({
          status: "completed",
          actualDurationMinutes: durationMinutes,
          sessionRpe: input.sessionRpe,
          notes: input.notes.trim().slice(0, 2000),
          completedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(workoutSessions.id, input.sessionId),
            eq(workoutSessions.userId, userId),
          ),
        );

      await tx.insert(apexEvents).values({
        id: randomUUID(),
        userId,
        type: "workout.session_completed",
        category: "workout",
        source: "live-coach",
        payload: {
          sessionId: workoutSession.id,
          title: workoutSession.title,
          durationMinutes,
          completedExercises,
          totalExercises: exercises.length,
          completedSets,
          totalTrainingVolumeKg,
          sessionRpe: input.sessionRpe,
          progressionReady,
          maintainCount,
          reviewCount,
        },
        schemaVersion: 1,
        occurredAt: now,
      });
    });

    await processApexMemories(userId);

    return {
      success: true,
      debrief: {
        durationMinutes,
        completedExercises,
        totalExercises: exercises.length,
        completedSets,
        totalTrainingVolumeKg,
        progressionReady,
        maintainCount,
        reviewCount,
      },
    };
  } catch (error) {
    console.error(
      "Failed to complete workout session:",
      error,
    );

    return {
      success: false,
      error: "Apex could not complete this workout.",
    };
  }
}
