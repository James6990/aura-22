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
  ProgressionTrendEntry,
} from "@/lib/workout/analyse-progression-trend";

export async function getExerciseProgressionTrends({
  userId,
  exerciseIds,
}: {
  userId: string;
  exerciseIds: string[];
}): Promise<
  Record<string, ProgressionTrendEntry[]>
> {
  if (exerciseIds.length === 0) {
    return {};
  }

  const rows = await db
    .select({
      exerciseId:
        workoutExerciseResults.exerciseId,
      loadKg:
        workoutExerciseResults.loadKg,
      plannedSets:
        workoutExerciseResults.plannedSets,
      completedSets:
        workoutExerciseResults.completedSets,
      rpe: workoutExerciseResults.rpe,
      discomfortLevel:
        workoutExerciseResults.discomfortLevel,
      techniqueConfidence:
        workoutExerciseResults
          .techniqueConfidence,
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
    .limit(500);

  const requestedIds =
    new Set(exerciseIds);

  const trends: Record<
    string,
    ProgressionTrendEntry[]
  > = {};

  for (const row of rows) {
    if (
      !requestedIds.has(row.exerciseId) ||
      !row.completedAt
    ) {
      continue;
    }

    const existing =
      trends[row.exerciseId] ?? [];

    if (existing.length >= 5) {
      continue;
    }

    existing.push({
      loadKg: row.loadKg,
      plannedSets: row.plannedSets,
      completedSets: row.completedSets,
      rpe: row.rpe,
      discomfortLevel:
        row.discomfortLevel,
      techniqueConfidence:
        row.techniqueConfidence,
      completedAt: row.completedAt,
    });

    trends[row.exerciseId] = existing;
  }

  return trends;
}
