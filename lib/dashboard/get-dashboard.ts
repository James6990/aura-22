import { headers } from "next/headers";
import { and, desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  dailyCheckIns,
  performanceGenome,
  workoutExerciseResults,
  workoutSessions,
} from "@/lib/db/schema";
import { getRecentEvents } from "@/lib/events/get-recent-events";
import { getLatestWorkoutSummary } from "@/lib/workout/get-latest-workout-summary";
import { getExerciseProgressionHistory } from "@/lib/workout/get-exercise-progression-history";
import { getApexMemories } from "@/lib/memory/get-apex-memories";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function getDashboardData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const [
    genome,
    todayCheckIn,
    readinessHistory,
    checkInDates,
    recentEvents,
    latestWorkout,
    exerciseProgressionHistory,
    apexMemories,
    recentWorkouts,
    activeWorkoutSession,
  ] = await Promise.all([
    db.query.performanceGenome.findFirst({
      where: eq(
        performanceGenome.userId,
        session.user.id,
      ),
    }),

    db.query.dailyCheckIns.findFirst({
      where: and(
        eq(dailyCheckIns.userId, session.user.id),
        eq(dailyCheckIns.date, getTodayDate()),
      ),
    }),

    db
      .select({
        date: dailyCheckIns.date,
        energy: dailyCheckIns.energy,
        readinessScore: dailyCheckIns.readinessScore,
        readinessLevel: dailyCheckIns.readinessLevel,
        workoutCompleted: dailyCheckIns.workoutCompleted,
        recoveryCompleted: dailyCheckIns.recoveryCompleted,
        hydrationTargetReached:
          dailyCheckIns.hydrationTargetReached,
      })
      .from(dailyCheckIns)
      .where(eq(dailyCheckIns.userId, session.user.id))
      .orderBy(desc(dailyCheckIns.date))
      .limit(7),

    db
      .select({
        date: dailyCheckIns.date,
      })
      .from(dailyCheckIns)
      .where(eq(dailyCheckIns.userId, session.user.id))
      .orderBy(desc(dailyCheckIns.date))
      .limit(366),

    getRecentEvents(session.user.id, 100),

    getLatestWorkoutSummary(session.user.id),

    getExerciseProgressionHistory(session.user.id),

    getApexMemories(session.user.id, 10),

    db
      .select({
        date: workoutSessions.date,
        status: workoutSessions.status,
        intensity: workoutSessions.intensity,
        sessionRpe: workoutSessions.sessionRpe,
      })
      .from(workoutSessions)
      .where(
        eq(
          workoutSessions.userId,
          session.user.id,
        ),
      )
      .orderBy(desc(workoutSessions.date))
      .limit(21),

    db.query.workoutSessions.findFirst({
      where: and(
        eq(
          workoutSessions.userId,
          session.user.id,
        ),
        eq(
          workoutSessions.status,
          "in-progress",
        ),
      ),
      orderBy: [
        desc(workoutSessions.updatedAt),
      ],
    }),
  ]);

  const activeWorkoutExercises =
    activeWorkoutSession
      ? await db
          .select({
            completionStatus:
              workoutExerciseResults
                .completionStatus,
          })
          .from(workoutExerciseResults)
          .where(
            and(
              eq(
                workoutExerciseResults.sessionId,
                activeWorkoutSession.id,
              ),
              eq(
                workoutExerciseResults.userId,
                session.user.id,
              ),
            ),
          )
      : [];

  return {
    user: session.user,
    genome,
    todayCheckIn: todayCheckIn ?? null,
    readinessHistory,
    checkInDates: checkInDates.map((entry) => entry.date),
    recentEvents,
    latestWorkout,
    exerciseProgressionHistory,
    apexMemories,
    recentWorkouts,
    activeWorkout:
      activeWorkoutSession
        ? {
            id: activeWorkoutSession.id,
            title:
              activeWorkoutSession.title,
            intensity:
              activeWorkoutSession.intensity,
            startedAt:
              activeWorkoutSession.startedAt,
            plannedDurationMinutes:
              activeWorkoutSession
                .plannedDurationMinutes,
            completedExercises:
              activeWorkoutExercises.filter(
                (exercise) =>
                  exercise.completionStatus ===
                  "completed",
              ).length,
            totalExercises:
              activeWorkoutExercises.length,
          }
        : null,
  };
}
