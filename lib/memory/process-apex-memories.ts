import { randomUUID } from "crypto";
import { and, count, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  apexMemories,
  workoutExerciseResults,
  workoutSessions,
} from "@/lib/db/schema";

type MemoryCandidate = {
  key: string;
  category:
    | "first"
    | "workout"
    | "progress"
    | "consistency"
    | "genome"
    | "wellbeing"
    | "nutrition"
    | "community"
    | "anniversary";
  title: string;
  message: string;
  payload: Record<
    string,
    string | number | boolean | null
  >;
};

async function createMemoryIfMissing(
  userId: string,
  candidate: MemoryCandidate,
) {
  await db
    .insert(apexMemories)
    .values({
      id: randomUUID(),
      userId,
      key: candidate.key,
      category: candidate.category,
      title: candidate.title,
      message: candidate.message,
      payload: candidate.payload,
      occurredAt: new Date(),
    })
    .onConflictDoNothing({
      target: [
        apexMemories.userId,
        apexMemories.key,
      ],
    });
}

export async function processApexMemories(
  userId: string,
) {
  const [
    completedWorkoutCountResult,
    progressionReadyResult,
    totalVolumeResult,
  ] = await Promise.all([
    db
      .select({
        value: count(),
      })
      .from(workoutSessions)
      .where(
        and(
          eq(workoutSessions.userId, userId),
          eq(workoutSessions.status, "completed"),
        ),
      ),

    db
      .select({
        value: count(),
      })
      .from(workoutExerciseResults)
      .where(
        and(
          eq(workoutExerciseResults.userId, userId),
          eq(
            workoutExerciseResults.progressionDecision,
            "increase",
          ),
        ),
      ),

    db
      .select({
        value: sql<number>`
          coalesce(
            sum(
              ${workoutExerciseResults.loadKg} *
              (
                select coalesce(sum(value::numeric), 0)
                from jsonb_array_elements_text(
                  ${workoutExerciseResults.completedReps}
                )
              )
            ),
            0
          )
        `,
      })
      .from(workoutExerciseResults)
      .where(
        eq(workoutExerciseResults.userId, userId),
      ),
  ]);

  const completedWorkoutCount = Number(
    completedWorkoutCountResult[0]?.value ?? 0,
  );

  const progressionReadyCount = Number(
    progressionReadyResult[0]?.value ?? 0,
  );

  const totalVolumeKg = Math.round(
    Number(totalVolumeResult[0]?.value ?? 0),
  );

  const candidates: MemoryCandidate[] = [];

  if (completedWorkoutCount >= 1) {
    candidates.push({
      key: "first-workout-completed",
      category: "first",
      title: "First workout completed",
      message:
        "You completed your first full Apex workout. This is where your training history began.",
      payload: {
        completedWorkoutCount,
      },
    });
  }

  for (const milestone of [10, 25, 50, 100]) {
    if (completedWorkoutCount >= milestone) {
      candidates.push({
        key: `workouts-completed-${milestone}`,
        category: "workout",
        title: `${milestone} workouts completed`,
        message:
          `You have completed ${milestone} workouts with Apex. Consistency is becoming part of your story.`,
        payload: {
          completedWorkoutCount,
          milestone,
        },
      });
    }
  }

  if (progressionReadyCount >= 1) {
    candidates.push({
      key: "first-progression-ready-exercise",
      category: "progress",
      title: "First progression opportunity",
      message:
        "Apex identified your first exercise with enough evidence to consider increasing the challenge.",
      payload: {
        progressionReadyCount,
      },
    });
  }

  for (const milestone of [1000, 10000, 100000]) {
    if (totalVolumeKg >= milestone) {
      candidates.push({
        key: `training-volume-${milestone}`,
        category: "progress",
        title: `${milestone.toLocaleString("en-GB")} kg recorded`,
        message:
          `Your recorded training volume has passed ${milestone.toLocaleString(
            "en-GB",
          )} kilograms.`,
        payload: {
          totalVolumeKg,
          milestone,
        },
      });
    }
  }

  await Promise.all(
    candidates.map((candidate) =>
      createMemoryIfMissing(userId, candidate),
    ),
  );

  return {
    completedWorkoutCount,
    progressionReadyCount,
    totalVolumeKg,
    processedCandidates: candidates.length,
  };
}
