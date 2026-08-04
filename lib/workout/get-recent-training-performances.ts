import {
  and,
  desc,
  eq,
  isNotNull,
} from "drizzle-orm";

import { db } from "@/lib/db";
import {
  workoutExerciseResults,
  workoutSessions,
} from "@/lib/db/schema";
import type {
  RecentExercisePerformance,
} from "@/lib/workout/analyse-recent-training-load";

export async function getRecentTrainingPerformances(
  userId: string,
): Promise<RecentExercisePerformance[]> {
  const rows = await db
    .select({
      exerciseId:
        workoutExerciseResults.exerciseId,
      completedSets:
        workoutExerciseResults.completedSets,
      rpe: workoutExerciseResults.rpe,
      discomfortLevel:
        workoutExerciseResults.discomfortLevel,
      completedAt:
        workoutSessions.completedAt,
    })
    .from(workoutExerciseResults)
    .innerJoin(
      workoutSessions,
      eq(
        workoutSessions.id,
        workoutExerciseResults.sessionId,
      ),
    )
    .where(
      and(
        eq(
          workoutExerciseResults.userId,
          userId,
        ),
        eq(
          workoutSessions.status,
          "completed",
        ),
        eq(
          workoutExerciseResults
            .completionStatus,
          "completed",
        ),
        isNotNull(
          workoutSessions.completedAt,
        ),
      ),
    )
    .orderBy(
      desc(workoutSessions.completedAt),
    )
    .limit(100);

  return rows.flatMap((row) =>
    row.completedAt
      ? [
          {
            exerciseId: row.exerciseId,
            completedSets: row.completedSets,
            rpe: row.rpe,
            discomfortLevel:
              row.discomfortLevel,
            completedAt: row.completedAt,
          },
        ]
      : [],
  );
}
