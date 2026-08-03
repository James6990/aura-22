import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { workoutExerciseResults } from "@/lib/db/schema";

export type ExerciseProgressionHistory = {
  exerciseId: string;
  exerciseName: string;
  previousLoadKg: number | null;
  recommendedNextLoadKg: number | null;
  progressionDecision:
    | "increase"
    | "maintain"
    | "reduce"
    | "review"
    | null;
  previousRpe: number | null;
  previousDiscomfortLevel: number | null;
  previousTechniqueConfidence: number | null;
  updatedAt: Date;
};

export async function getExerciseProgressionHistory(
  userId: string,
): Promise<Record<string, ExerciseProgressionHistory>> {
  const results = await db
    .select({
      exerciseId: workoutExerciseResults.exerciseId,
      exerciseName: workoutExerciseResults.exerciseName,
      previousLoadKg: workoutExerciseResults.loadKg,
      recommendedNextLoadKg:
        workoutExerciseResults.recommendedNextLoadKg,
      progressionDecision:
        workoutExerciseResults.progressionDecision,
      previousRpe: workoutExerciseResults.rpe,
      previousDiscomfortLevel:
        workoutExerciseResults.discomfortLevel,
      previousTechniqueConfidence:
        workoutExerciseResults.techniqueConfidence,
      updatedAt: workoutExerciseResults.updatedAt,
    })
    .from(workoutExerciseResults)
    .where(eq(workoutExerciseResults.userId, userId))
    .orderBy(desc(workoutExerciseResults.updatedAt))
    .limit(500);

  const latestByExercise: Record<
    string,
    ExerciseProgressionHistory
  > = {};

  for (const result of results) {
    if (!latestByExercise[result.exerciseId]) {
      latestByExercise[result.exerciseId] = result;
    }
  }

  return latestByExercise;
}
