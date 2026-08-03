import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  workoutExerciseResults,
  workoutSessions,
} from "@/lib/db/schema";

export type LatestWorkoutSummary = {
  id: string;
  title: string;
  completedAt: Date | null;
  durationMinutes: number | null;
  sessionRpe: number | null;
  completedExercises: number;
  totalExercises: number;
  progressionReady: number;
  reviewCount: number;
  highestDiscomfort: number;
};

export async function getLatestWorkoutSummary(
  userId: string,
): Promise<LatestWorkoutSummary | null> {
  const session =
    await db.query.workoutSessions.findFirst({
      where: and(
        eq(workoutSessions.userId, userId),
        eq(workoutSessions.status, "completed"),
      ),
      orderBy: [desc(workoutSessions.completedAt)],
    });

  if (!session) {
    return null;
  }

  const exercises = await db
    .select({
      completionStatus:
        workoutExerciseResults.completionStatus,
      progressionDecision:
        workoutExerciseResults.progressionDecision,
      discomfortLevel:
        workoutExerciseResults.discomfortLevel,
    })
    .from(workoutExerciseResults)
    .where(
      and(
        eq(
          workoutExerciseResults.sessionId,
          session.id,
        ),
        eq(workoutExerciseResults.userId, userId),
      ),
    );

  return {
    id: session.id,
    title: session.title,
    completedAt: session.completedAt,
    durationMinutes: session.actualDurationMinutes,
    sessionRpe: session.sessionRpe,
    completedExercises: exercises.filter(
      (exercise) =>
        exercise.completionStatus === "completed",
    ).length,
    totalExercises: exercises.length,
    progressionReady: exercises.filter(
      (exercise) =>
        exercise.progressionDecision === "increase",
    ).length,
    reviewCount: exercises.filter(
      (exercise) =>
        exercise.progressionDecision === "review" ||
        exercise.progressionDecision === "reduce",
    ).length,
    highestDiscomfort: Math.max(
      0,
      ...exercises.map(
        (exercise) =>
          exercise.discomfortLevel ?? 0,
      ),
    ),
  };
}
