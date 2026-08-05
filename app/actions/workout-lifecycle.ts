"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import {
  and,
  asc,
  eq,
  isNull,
  sql,
} from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  apexEvents,
  workoutExerciseResults,
  workoutSessionPauses,
  workoutSessions,
} from "@/lib/db/schema";
import {
  isWorkoutPauseReason,
  isWorkoutSkipReason,
  pauseWorkoutTiming,
  resolveWorkoutTiming,
  resumeWorkoutTiming,
  startWorkoutTiming,
  summariseWorkoutResolution,
  type WorkoutExerciseResolutionStatus,
  type WorkoutPauseReason,
  type WorkoutSkipReason,
  type WorkoutTimingState,
} from "@/lib/workout/workout-session-lifecycle";

type LifecycleActionResult =
  | {
      success: true;
      status:
        | "in-progress"
        | "paused"
        | "ready-to-complete";
      accumulatedActiveSeconds: number;
      totalPausedSeconds: number;
      pauseCount: number;
      longestPauseSeconds: number;
    }
  | {
      success: false;
      error: string;
    };

export type PauseWorkoutSessionInput = {
  sessionId: string;
  reason?: WorkoutPauseReason | null;
  note?: string;
};

export type ResumeWorkoutSessionInput = {
  sessionId: string;
};

export type SkipWorkoutExerciseInput = {
  sessionId: string;
  exerciseResultId: string;
  reason: WorkoutSkipReason;
  note?: string;
};

export type SkipWorkoutExerciseResult =
  | {
      success: true;
      completionStatus: "skipped";
      sessionStatus:
        | "in-progress"
        | "paused"
        | "ready-to-complete";
      allExercisesResolved: boolean;
      completedExercises: number;
      skippedExercises: number;
      totalExercises: number;
    }
  | {
      success: false;
      error: string;
    };

async function getCurrentUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

function normaliseIdentifier(
  value: string,
  label: string,
) {
  const normalised = value.trim();

  if (!normalised) {
    throw new Error(
      `${label} is required.`,
    );
  }

  return normalised;
}

function toTimingState(
  session:
    typeof workoutSessions.$inferSelect,
): WorkoutTimingState {
  return {
    status: session.status,
    startedAt: session.startedAt,
    activeStartedAt:
      session.activeStartedAt,
    pausedAt: session.pausedAt,
    accumulatedActiveSeconds:
      session.accumulatedActiveSeconds,
    totalPausedSeconds:
      session.totalPausedSeconds,
    pauseCount: session.pauseCount,
    longestPauseSeconds:
      session.longestPauseSeconds,
  };
}

function toLifecycleSuccess(
  timing: WorkoutTimingState,
): LifecycleActionResult {
  if (
    timing.status !== "in-progress" &&
    timing.status !== "paused" &&
    timing.status !== "ready-to-complete"
  ) {
    throw new Error(
      "Workout lifecycle action produced an invalid status.",
    );
  }

  return {
    success: true,
    status: timing.status,
    accumulatedActiveSeconds:
      timing.accumulatedActiveSeconds,
    totalPausedSeconds:
      timing.totalPausedSeconds,
    pauseCount: timing.pauseCount,
    longestPauseSeconds:
      timing.longestPauseSeconds,
  };
}

export async function beginPreparedWorkoutSession(
  sessionId: string,
): Promise<LifecycleActionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      error:
        "You must be signed in to start a workout.",
    };
  }

  let resolvedSessionId: string;

  try {
    resolvedSessionId = normaliseIdentifier(
      sessionId,
      "Workout session id",
    );
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "The workout session is invalid.",
    };
  }

  const now = new Date();

  try {
    const timing = await db.transaction(
      async (tx) => {
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtext(${resolvedSessionId}))`,
        );

        const session =
          await tx.query.workoutSessions.findFirst({
            where: and(
              eq(
                workoutSessions.id,
                resolvedSessionId,
              ),
              eq(
                workoutSessions.userId,
                userId,
              ),
            ),
          });

        if (!session) {
          throw new Error(
            "This workout session could not be found.",
          );
        }

        if (session.status === "in-progress") {
          return toTimingState(session);
        }

        const next = startWorkoutTiming({
          timing: toTimingState(session),
          now,
        });

        await tx
          .update(workoutSessions)
          .set({
            status: next.status,
            startedAt: next.startedAt,
            activeStartedAt:
              next.activeStartedAt,
            pausedAt: next.pausedAt,
            accumulatedActiveSeconds:
              next.accumulatedActiveSeconds,
            totalPausedSeconds:
              next.totalPausedSeconds,
            pauseCount: next.pauseCount,
            longestPauseSeconds:
              next.longestPauseSeconds,
            updatedAt: now,
          })
          .where(
            and(
              eq(
                workoutSessions.id,
                resolvedSessionId,
              ),
              eq(
                workoutSessions.userId,
                userId,
              ),
            ),
          );

        await tx.insert(apexEvents).values({
          id: randomUUID(),
          userId,
          type: "workout.session_started",
          category: "workout",
          source: "workout-lifecycle",
          payload: {
            sessionId:
              resolvedSessionId,
            status:
              next.status,
            accumulatedActiveSeconds:
              next.accumulatedActiveSeconds,
          },
          schemaVersion: 1,
          occurredAt: now,
        });

        return next;
      },
    );

    return toLifecycleSuccess(timing);
  } catch (error) {
    console.error(
      "Failed to begin prepared workout:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Apex could not start this workout.",
    };
  }
}

export async function pauseWorkoutSession(
  input: PauseWorkoutSessionInput,
): Promise<LifecycleActionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      error:
        "You must be signed in to pause a workout.",
    };
  }

  const sessionId = input.sessionId.trim();

  if (!sessionId) {
    return {
      success: false,
      error:
        "The workout session is invalid.",
    };
  }

  const reason =
    input.reason ?? null;

  if (
    reason !== null &&
    !isWorkoutPauseReason(reason)
  ) {
    return {
      success: false,
      error:
        "The workout pause reason is invalid.",
    };
  }

  const note =
    input.note?.trim().slice(0, 500) ||
    null;

  const now = new Date();

  try {
    const timing = await db.transaction(
      async (tx) => {
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtext(${sessionId}))`,
        );

        const session =
          await tx.query.workoutSessions.findFirst({
            where: and(
              eq(
                workoutSessions.id,
                sessionId,
              ),
              eq(
                workoutSessions.userId,
                userId,
              ),
            ),
          });

        if (!session) {
          throw new Error(
            "This workout session could not be found.",
          );
        }

        const next = pauseWorkoutTiming({
          timing: toTimingState(session),
          now,
        });

        const pauseId = randomUUID();

        await tx
          .update(workoutSessions)
          .set({
            status: next.status,
            activeStartedAt:
              next.activeStartedAt,
            pausedAt: next.pausedAt,
            accumulatedActiveSeconds:
              next.accumulatedActiveSeconds,
            updatedAt: now,
          })
          .where(
            and(
              eq(
                workoutSessions.id,
                sessionId,
              ),
              eq(
                workoutSessions.userId,
                userId,
              ),
            ),
          );

        await tx
          .insert(workoutSessionPauses)
          .values({
            id: pauseId,
            sessionId,
            userId,
            reason,
            note,
            startedAt: now,
            updatedAt: now,
          });

        await tx.insert(apexEvents).values({
          id: randomUUID(),
          userId,
          type: "workout.session_paused",
          category: "workout",
          source: "workout-lifecycle",
          payload: {
            sessionId,
            pauseId,
            reason,
            note,
            accumulatedActiveSeconds:
              next.accumulatedActiveSeconds,
          },
          schemaVersion: 1,
          occurredAt: now,
        });

        return next;
      },
    );

    return toLifecycleSuccess(timing);
  } catch (error) {
    console.error(
      "Failed to pause workout:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Apex could not pause this workout.",
    };
  }
}

export async function resumeWorkoutSession(
  input: ResumeWorkoutSessionInput,
): Promise<LifecycleActionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      error:
        "You must be signed in to resume a workout.",
    };
  }

  const sessionId = input.sessionId.trim();

  if (!sessionId) {
    return {
      success: false,
      error:
        "The workout session is invalid.",
    };
  }

  const now = new Date();

  try {
    const timing = await db.transaction(
      async (tx) => {
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtext(${sessionId}))`,
        );

        const session =
          await tx.query.workoutSessions.findFirst({
            where: and(
              eq(
                workoutSessions.id,
                sessionId,
              ),
              eq(
                workoutSessions.userId,
                userId,
              ),
            ),
          });

        if (!session) {
          throw new Error(
            "This workout session could not be found.",
          );
        }

        const next = resumeWorkoutTiming({
          timing: toTimingState(session),
          now,
        });

        const openPause =
          await tx.query.workoutSessionPauses.findFirst({
            where: and(
              eq(
                workoutSessionPauses.sessionId,
                sessionId,
              ),
              eq(
                workoutSessionPauses.userId,
                userId,
              ),
              isNull(
                workoutSessionPauses.endedAt,
              ),
            ),
            orderBy: [
              asc(
                workoutSessionPauses.startedAt,
              ),
            ],
          });

        if (!openPause) {
          throw new Error(
            "The active workout pause record could not be found.",
          );
        }

        const pauseDurationSeconds =
          Math.max(
            0,
            Math.floor(
              (
                now.getTime() -
                openPause.startedAt.getTime()
              ) / 1000,
            ),
          );

        await tx
          .update(workoutSessionPauses)
          .set({
            endedAt: now,
            durationSeconds:
              pauseDurationSeconds,
            updatedAt: now,
          })
          .where(
            and(
              eq(
                workoutSessionPauses.id,
                openPause.id,
              ),
              eq(
                workoutSessionPauses.userId,
                userId,
              ),
            ),
          );

        await tx
          .update(workoutSessions)
          .set({
            status: next.status,
            activeStartedAt:
              next.activeStartedAt,
            pausedAt: next.pausedAt,
            totalPausedSeconds:
              next.totalPausedSeconds,
            pauseCount: next.pauseCount,
            longestPauseSeconds:
              next.longestPauseSeconds,
            updatedAt: now,
          })
          .where(
            and(
              eq(
                workoutSessions.id,
                sessionId,
              ),
              eq(
                workoutSessions.userId,
                userId,
              ),
            ),
          );

        await tx.insert(apexEvents).values({
          id: randomUUID(),
          userId,
          type: "workout.session_resumed",
          category: "workout",
          source: "workout-lifecycle",
          payload: {
            sessionId,
            pauseId: openPause.id,
            pauseDurationSeconds,
            totalPausedSeconds:
              next.totalPausedSeconds,
            pauseCount:
              next.pauseCount,
            longestPauseSeconds:
              next.longestPauseSeconds,
          },
          schemaVersion: 1,
          occurredAt: now,
        });

        return next;
      },
    );

    return toLifecycleSuccess(timing);
  } catch (error) {
    console.error(
      "Failed to resume workout:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Apex could not resume this workout.",
    };
  }
}

export async function skipWorkoutExercise(
  input: SkipWorkoutExerciseInput,
): Promise<SkipWorkoutExerciseResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      error:
        "You must be signed in to skip an exercise.",
    };
  }

  const sessionId =
    input.sessionId.trim();

  const exerciseResultId =
    input.exerciseResultId.trim();

  if (
    !sessionId ||
    !exerciseResultId
  ) {
    return {
      success: false,
      error:
        "The workout exercise is invalid.",
    };
  }

  if (
    !isWorkoutSkipReason(input.reason)
  ) {
    return {
      success: false,
      error:
        "The exercise skip reason is invalid.",
    };
  }

  const note =
    input.note?.trim().slice(0, 500) ||
    null;

  const now = new Date();

  try {
    return await db.transaction(
      async (tx) => {
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtext(${sessionId}))`,
        );

        const session =
          await tx.query.workoutSessions.findFirst({
            where: and(
              eq(
                workoutSessions.id,
                sessionId,
              ),
              eq(
                workoutSessions.userId,
                userId,
              ),
            ),
          });

        if (!session) {
          return {
            success: false,
            error:
              "This workout session could not be found.",
          } as const;
        }

        if (
          session.status !== "in-progress" &&
          session.status !== "paused"
        ) {
          return {
            success: false,
            error:
              "Start the workout before resolving exercises.",
          } as const;
        }

        const exercise =
          await tx.query.workoutExerciseResults.findFirst({
            where: and(
              eq(
                workoutExerciseResults.id,
                exerciseResultId,
              ),
              eq(
                workoutExerciseResults.sessionId,
                sessionId,
              ),
              eq(
                workoutExerciseResults.userId,
                userId,
              ),
            ),
          });

        if (!exercise) {
          return {
            success: false,
            error:
              "This exercise could not be found.",
          } as const;
        }

        await tx
          .update(workoutExerciseResults)
          .set({
            completionStatus: "skipped",
            skipReason: input.reason,
            skipNote: note,
            resolvedAt: now,
            updatedAt: now,
          })
          .where(
            and(
              eq(
                workoutExerciseResults.id,
                exerciseResultId,
              ),
              eq(
                workoutExerciseResults.userId,
                userId,
              ),
            ),
          );

        await tx.insert(apexEvents).values({
          id: randomUUID(),
          userId,
          type: "workout.exercise_skipped",
          category: "workout",
          source: "workout-lifecycle",
          payload: {
            sessionId,
            exerciseResultId,
            exerciseId:
              exercise.exerciseId,
            exerciseName:
              exercise.exerciseName,
            reason: input.reason,
            note,
          },
          schemaVersion: 1,
          occurredAt: now,
        });

        const statusRows = await tx
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
                sessionId,
              ),
              eq(
                workoutExerciseResults.userId,
                userId,
              ),
            ),
          );

        const resolution =
          summariseWorkoutResolution(
            statusRows.map(
              (row) =>
                row.completionStatus as
                  WorkoutExerciseResolutionStatus,
            ),
          );

        let sessionStatus:
          | "in-progress"
          | "paused"
          | "ready-to-complete" =
            session.status;

        if (resolution.allResolved) {
          const next =
            resolveWorkoutTiming({
              timing:
                toTimingState(session),
              now,
            });

          /*

           * The final exercise may be skipped while

           * the workout is paused. Close the durable

           * pause record in the same transaction.

           */

          if (

            session.status === "paused"

          ) {

            const openPause =

              await tx.query.workoutSessionPauses.findFirst({

                where: and(

                  eq(

                    workoutSessionPauses.sessionId,

                    sessionId,

                  ),

                  eq(

                    workoutSessionPauses.userId,

                    userId,

                  ),

                  isNull(

                    workoutSessionPauses.endedAt,

                  ),

                ),

                orderBy: [

                  asc(

                    workoutSessionPauses.startedAt,

                  ),

                ],

              });


            if (!openPause) {

              throw new Error(

                "The active workout pause record could not be found.",

              );

            }


            const pauseDurationSeconds =

              Math.max(

                0,

                Math.floor(

                  (

                    now.getTime() -

                    openPause.startedAt.getTime()

                  ) / 1000,

                ),

              );


            await tx

              .update(workoutSessionPauses)

              .set({

                endedAt: now,

                durationSeconds:

                  pauseDurationSeconds,

                updatedAt: now,

              })

              .where(

                and(

                  eq(

                    workoutSessionPauses.id,

                    openPause.id,

                  ),

                  eq(

                    workoutSessionPauses.userId,

                    userId,

                  ),

                ),

              );

          }


          sessionStatus =
            "ready-to-complete";

          await tx
            .update(workoutSessions)
            .set({
              status:
                next.status,
              activeStartedAt:
                next.activeStartedAt,
              pausedAt:
                next.pausedAt,
              accumulatedActiveSeconds:
                next.accumulatedActiveSeconds,
              totalPausedSeconds:
                next.totalPausedSeconds,
              pauseCount:
                next.pauseCount,
              longestPauseSeconds:
                next.longestPauseSeconds,
              updatedAt: now,
            })
            .where(
              and(
                eq(
                  workoutSessions.id,
                  sessionId,
                ),
                eq(
                  workoutSessions.userId,
                  userId,
                ),
              ),
            );

          await tx.insert(apexEvents).values({
            id: randomUUID(),
            userId,
            type:
              "workout.session_ready_to_complete",
            category: "workout",
            source: "workout-lifecycle",
            payload: {
              sessionId,
              completedExercises:
                resolution.completedExercises,
              skippedExercises:
                resolution.skippedExercises,
              totalExercises:
                resolution.totalExercises,
              accumulatedActiveSeconds:
                next.accumulatedActiveSeconds,
              totalPausedSeconds:
                next.totalPausedSeconds,
            },
            schemaVersion: 1,
            occurredAt: now,
          });
        }

        return {
          success: true,
          completionStatus:
            "skipped",
          sessionStatus,
          allExercisesResolved:
            resolution.allResolved,
          completedExercises:
            resolution.completedExercises,
          skippedExercises:
            resolution.skippedExercises,
          totalExercises:
            resolution.totalExercises,
        } as const;
      },
    );
  } catch (error) {
    console.error(
      "Failed to skip workout exercise:",
      error,
    );

    return {
      success: false,
      error:
        "Apex could not skip this exercise.",
    };
  }
}

export type ResolveWorkoutSessionResult =
  | {
      success: true;
      status:
        | "in-progress"
        | "paused"
        | "ready-to-complete";
      allExercisesResolved: boolean;
      completedExercises: number;
      skippedExercises: number;
      unresolvedExercises: number;
      totalExercises: number;
      accumulatedActiveSeconds: number;
      totalPausedSeconds: number;
      pauseCount: number;
      longestPauseSeconds: number;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Checks whether every exercise has been explicitly completed or skipped.
 *
 * When everything is resolved, the active workout timer is stopped and the
 * session becomes ready for its final effort rating, notes and debrief.
 *
 * This action is intentionally idempotent so the client can safely call it
 * after exercise saves or route refreshes.
 */
export async function resolveWorkoutSessionWhenReady(
  sessionIdInput: string,
): Promise<ResolveWorkoutSessionResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      error:
        "You must be signed in to update a workout.",
    };
  }

  const sessionId =
    sessionIdInput.trim();

  if (!sessionId) {
    return {
      success: false,
      error:
        "The workout session is invalid.",
    };
  }

  const now = new Date();

  try {
    return await db.transaction(
      async (tx) => {
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtext(${sessionId}))`,
        );

        const session =
          await tx.query.workoutSessions.findFirst({
            where: and(
              eq(
                workoutSessions.id,
                sessionId,
              ),
              eq(
                workoutSessions.userId,
                userId,
              ),
            ),
          });

        if (!session) {
          return {
            success: false,
            error:
              "This workout session could not be found.",
          } as const;
        }

        const statusRows = await tx
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
                sessionId,
              ),
              eq(
                workoutExerciseResults.userId,
                userId,
              ),
            ),
          );

        const resolution =
          summariseWorkoutResolution(
            statusRows.map(
              (row) =>
                row.completionStatus as
                  WorkoutExerciseResolutionStatus,
            ),
          );

        if (
          session.status ===
          "ready-to-complete"
        ) {
          return {
            success: true,
            status:
              "ready-to-complete",
            allExercisesResolved:
              resolution.allResolved,
            completedExercises:
              resolution.completedExercises,
            skippedExercises:
              resolution.skippedExercises,
            unresolvedExercises:
              resolution.unresolvedExercises,
            totalExercises:
              resolution.totalExercises,
            accumulatedActiveSeconds:
              session.accumulatedActiveSeconds,
            totalPausedSeconds:
              session.totalPausedSeconds,
            pauseCount:
              session.pauseCount,
            longestPauseSeconds:
              session.longestPauseSeconds,
          } as const;
        }

        if (
          session.status !== "in-progress" &&
          session.status !== "paused"
        ) {
          return {
            success: false,
            error:
              "Start the workout before resolving its exercises.",
          } as const;
        }

        if (!resolution.allResolved) {
          return {
            success: true,
            status:
              session.status,
            allExercisesResolved:
              false,
            completedExercises:
              resolution.completedExercises,
            skippedExercises:
              resolution.skippedExercises,
            unresolvedExercises:
              resolution.unresolvedExercises,
            totalExercises:
              resolution.totalExercises,
            accumulatedActiveSeconds:
              session.accumulatedActiveSeconds,
            totalPausedSeconds:
              session.totalPausedSeconds,
            pauseCount:
              session.pauseCount,
            longestPauseSeconds:
              session.longestPauseSeconds,
          } as const;
        }

        const next =
          resolveWorkoutTiming({
            timing:
              toTimingState(session),
            now,
          });

        /*
         * A session may become fully resolved while paused.
         * Close the durable pause record before completing
         * the lifecycle transition.
         */
        if (
          session.status === "paused"
        ) {
          const openPause =
            await tx.query.workoutSessionPauses.findFirst({
              where: and(
                eq(
                  workoutSessionPauses.sessionId,
                  sessionId,
                ),
                eq(
                  workoutSessionPauses.userId,
                  userId,
                ),
                isNull(
                  workoutSessionPauses.endedAt,
                ),
              ),
              orderBy: [
                asc(
                  workoutSessionPauses.startedAt,
                ),
              ],
            });

          if (!openPause) {
            throw new Error(
              "The active workout pause record could not be found.",
            );
          }

          const pauseDurationSeconds =
            Math.max(
              0,
              Math.floor(
                (
                  now.getTime() -
                  openPause.startedAt.getTime()
                ) / 1000,
              ),
            );

          await tx
            .update(workoutSessionPauses)
            .set({
              endedAt: now,
              durationSeconds:
                pauseDurationSeconds,
              updatedAt: now,
            })
            .where(
              and(
                eq(
                  workoutSessionPauses.id,
                  openPause.id,
                ),
                eq(
                  workoutSessionPauses.userId,
                  userId,
                ),
              ),
            );
        }

        await tx
          .update(workoutSessions)
          .set({
            status:
              next.status,
            activeStartedAt:
              next.activeStartedAt,
            pausedAt:
              next.pausedAt,
            accumulatedActiveSeconds:
              next.accumulatedActiveSeconds,
            totalPausedSeconds:
              next.totalPausedSeconds,
            pauseCount:
              next.pauseCount,
            longestPauseSeconds:
              next.longestPauseSeconds,
            updatedAt: now,
          })
          .where(
            and(
              eq(
                workoutSessions.id,
                sessionId,
              ),
              eq(
                workoutSessions.userId,
                userId,
              ),
            ),
          );

        await tx.insert(apexEvents).values({
          id: randomUUID(),
          userId,
          type:
            "workout.session_ready_to_complete",
          category: "workout",
          source:
            "workout-lifecycle",
          payload: {
            sessionId,
            completedExercises:
              resolution.completedExercises,
            skippedExercises:
              resolution.skippedExercises,
            unresolvedExercises:
              resolution.unresolvedExercises,
            totalExercises:
              resolution.totalExercises,
            accumulatedActiveSeconds:
              next.accumulatedActiveSeconds,
            totalPausedSeconds:
              next.totalPausedSeconds,
            pauseCount:
              next.pauseCount,
            longestPauseSeconds:
              next.longestPauseSeconds,
          },
          schemaVersion: 1,
          occurredAt: now,
        });

        return {
          success: true,
          status:
            "ready-to-complete",
          allExercisesResolved:
            true,
          completedExercises:
            resolution.completedExercises,
          skippedExercises:
            resolution.skippedExercises,
          unresolvedExercises:
            resolution.unresolvedExercises,
          totalExercises:
            resolution.totalExercises,
          accumulatedActiveSeconds:
            next.accumulatedActiveSeconds,
          totalPausedSeconds:
            next.totalPausedSeconds,
          pauseCount:
            next.pauseCount,
          longestPauseSeconds:
            next.longestPauseSeconds,
        } as const;
      },
    );
  } catch (error) {
    console.error(
      "Failed to resolve workout session:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Apex could not update this workout.",
    };
  }
}
