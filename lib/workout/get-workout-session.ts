import { headers } from "next/headers";
import { and, asc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  workoutExerciseResults,
  workoutSessions,
} from "@/lib/db/schema";

export async function getWorkoutSession(sessionId: string) {
  const authSession = await auth.api.getSession({
    headers: await headers(),
  });

  if (!authSession?.user) {
    return {
      status: "unauthenticated" as const,
      session: null,
      exercises: [],
    };
  }

  const workoutSession =
    await db.query.workoutSessions.findFirst({
      where: and(
        eq(workoutSessions.id, sessionId),
        eq(workoutSessions.userId, authSession.user.id),
      ),
    });

  if (!workoutSession) {
    return {
      status: "not-found" as const,
      session: null,
      exercises: [],
    };
  }

  const exercises = await db
    .select({
      id: workoutExerciseResults.id,
      exerciseId: workoutExerciseResults.exerciseId,
      exerciseName: workoutExerciseResults.exerciseName,
      orderIndex: workoutExerciseResults.orderIndex,
      plannedSets: workoutExerciseResults.plannedSets,
      completedSets: workoutExerciseResults.completedSets,
      targetReps: workoutExerciseResults.targetReps,
      loadKg: workoutExerciseResults.loadKg,
      completedReps: workoutExerciseResults.completedReps,
      rpe: workoutExerciseResults.rpe,
      discomfortLevel:
        workoutExerciseResults.discomfortLevel,
      techniqueConfidence:
        workoutExerciseResults.techniqueConfidence,
      completionStatus:
        workoutExerciseResults.completionStatus,
      notes: workoutExerciseResults.notes,
    })
    .from(workoutExerciseResults)
    .where(
      and(
        eq(
          workoutExerciseResults.sessionId,
          workoutSession.id,
        ),
        eq(
          workoutExerciseResults.userId,
          authSession.user.id,
        ),
      ),
    )
    .orderBy(asc(workoutExerciseResults.orderIndex));

  return {
    status: "success" as const,
    session: workoutSession,
    exercises,
  };
}
