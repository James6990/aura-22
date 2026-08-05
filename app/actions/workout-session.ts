"use server";

import { randomUUID } from "crypto";
import { headers } from "next/headers";
import {
  and,
  asc,
  desc,
  eq,
  inArray,
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
import { processApexMemories } from "@/lib/memory/process-apex-memories";
import { analyseProgressionTrend } from "@/lib/workout/analyse-progression-trend";
import { calculateProgressionDecision } from "@/lib/workout/calculate-progression-decision";
import { getExerciseProgressionTrends } from "@/lib/workout/get-exercise-progression-trends";
import {
  resolveWorkoutTiming,
  summariseWorkoutResolution,
  type WorkoutCompletionMode,
  type WorkoutExerciseResolutionStatus,
  type WorkoutTimingState,
} from "@/lib/workout/workout-session-lifecycle";

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
        WorkoutExerciseResolutionStatus;
    }
  | {
      success: false;
      error: string;
    };

export type CompleteWorkoutSessionInput = {
  sessionId: string;
  sessionRpe: number | null;
  notes: string;

  /**
   * Optional during the interface transition.
   * Existing callers therefore continue to compile.
   */
  completionMode?: WorkoutCompletionMode;

  /**
   * Required for an early completion.
   */
  finishReason?: string;
};

export type WorkoutDebrief = {
  durationMinutes: number;
  activeDurationSeconds: number;
  pausedDurationSeconds: number;
  pauseCount: number;
  longestPauseSeconds: number;

  completionMode: WorkoutCompletionMode;

  completedExercises: number;
  skippedExercises: number;
  partialExercises: number;
  unresolvedExercises: number;
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

function getTodayDate() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

async function getCurrentUserId() {
  const session =
    await auth.api.getSession({
      headers:
        await headers(),
    });

  return session?.user?.id ?? null;
}

function toTimingState(
  session:
    typeof workoutSessions.$inferSelect,
): WorkoutTimingState {
  return {
    status:
      session.status,

    startedAt:
      session.startedAt,

    activeStartedAt:
      session.activeStartedAt,

    pausedAt:
      session.pausedAt,

    accumulatedActiveSeconds:
      session.accumulatedActiveSeconds,

    totalPausedSeconds:
      session.totalPausedSeconds,

    pauseCount:
      session.pauseCount,

    longestPauseSeconds:
      session.longestPauseSeconds,
  };
}

function validateSessionRpe(
  sessionRpe: number | null,
) {
  return (
    sessionRpe === null ||
    (
      Number.isInteger(sessionRpe) &&
      sessionRpe >= 1 &&
      sessionRpe <= 10
    )
  );
}

function secondsToRoundedMinutes(
  seconds: number,
) {
  if (seconds <= 0) {
    return 0;
  }

  return Math.max(
    1,
    Math.round(
      seconds / 60,
    ),
  );
}

export async function startWorkoutSession(
  input: StartWorkoutSessionInput,
): Promise<StartWorkoutSessionResult> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      error:
        "You must be signed in to prepare a workout.",
    };
  }

  if (
    !input.title.trim() ||
    !input.intensity.trim() ||
    !Number.isInteger(
      input.plannedDurationMinutes,
    ) ||
    input.plannedDurationMinutes < 1 ||
    input.plannedDurationMinutes > 300
  ) {
    return {
      success: false,
      error:
        "The workout session contains invalid details.",
    };
  }

  if (
    input.exercises.length === 0 ||
    input.exercises.length > 20
  ) {
    return {
      success: false,
      error:
        "The workout must contain between 1 and 20 exercises.",
    };
  }

  const invalidExercise =
    input.exercises.some(
      (exercise) =>
        !exercise.id.trim() ||
        !exercise.name.trim() ||
        !exercise.reps.trim() ||
        !Number.isInteger(
          exercise.sets,
        ) ||
        exercise.sets < 1 ||
        exercise.sets > 20,
    );

  if (invalidExercise) {
    return {
      success: false,
      error:
        "One or more planned exercises are invalid.",
    };
  }

  const now =
    new Date();

  try {
    const result =
      await db.transaction(
        async (tx) => {
          /*
           * Serialise workout preparation for this user.
           * This prevents multiple tabs or repeated taps
           * from creating duplicate open sessions.
           */
          await tx.execute(
            sql`
              select pg_advisory_xact_lock(
                hashtext(${userId})
              )
            `,
          );

          const existingSession =
            await tx.query.workoutSessions.findFirst({
              where: and(
                eq(
                  workoutSessions.userId,
                  userId,
                ),
                inArray(
                  workoutSessions.status,
                  [
                    "ready",
                    "in-progress",
                    "paused",
                    "ready-to-complete",
                  ],
                ),
              ),
              orderBy: [
                desc(
                  workoutSessions.updatedAt,
                ),
              ],
            });

          if (existingSession) {
            return {
              sessionId:
                existingSession.id,
              resumed: true,
            };
          }

          const workoutSessionId =
            randomUUID();

          await tx
            .insert(workoutSessions)
            .values({
              id:
                workoutSessionId,

              userId,

              date:
                getTodayDate(),

              title:
                input.title.trim(),

              intensity:
                input.intensity.trim(),

              plannedDurationMinutes:
                input.plannedDurationMinutes,

              status:
                "ready",

              startedAt:
                null,

              activeStartedAt:
                null,

              pausedAt:
                null,

              accumulatedActiveSeconds:
                0,

              totalPausedSeconds:
                0,

              pauseCount:
                0,

              longestPauseSeconds:
                0,

              completionMode:
                null,

              finishReason:
                null,

              updatedAt:
                now,
            });

          await tx
            .insert(
              workoutExerciseResults,
            )
            .values(
              input.exercises.map(
                (
                  exercise,
                  index,
                ) => ({
                  id:
                    randomUUID(),

                  sessionId:
                    workoutSessionId,

                  userId,

                  exerciseId:
                    exercise.id.trim(),

                  exerciseName:
                    exercise.name.trim(),

                  orderIndex:
                    index,

                  plannedSets:
                    exercise.sets,

                  targetReps:
                    exercise.reps.trim(),

                  completionStatus:
                    "not-started" as const,

                  resolvedAt:
                    null,

                  updatedAt:
                    now,
                }),
              ),
            );

          await tx
            .insert(apexEvents)
            .values({
              id:
                randomUUID(),

              userId,

              type:
                "workout.session_prepared",

              category:
                "workout",

              source:
                "workout-preparation",

              payload: {
                sessionId:
                  workoutSessionId,

                title:
                  input.title.trim(),

                intensity:
                  input.intensity.trim(),

                plannedDurationMinutes:
                  input.plannedDurationMinutes,

                exerciseCount:
                  input.exercises.length,

                status:
                  "ready",
              },

              schemaVersion:
                1,

              occurredAt:
                now,
            });

          return {
            sessionId:
              workoutSessionId,

            resumed:
              false,
          };
        },
      );

    return {
      success: true,
      sessionId:
        result.sessionId,
      resumed:
        result.resumed,
    };
  } catch (error) {
    console.error(
      "Failed to prepare or reopen workout session:",
      error,
    );

    return {
      success: false,
      error:
        "Apex could not prepare or reopen this workout session.",
    };
  }
}

export async function saveExerciseResult(
  input: SaveExerciseResultInput,
): Promise<SaveExerciseResultResult> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      error:
        "You must be signed in to log an exercise.",
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
        "The exercise record is invalid.",
    };
  }

  if (
    input.loadKg !== null &&
    (
      !Number.isFinite(
        input.loadKg,
      ) ||
      input.loadKg < 0 ||
      input.loadKg > 1500
    )
  ) {
    return {
      success: false,
      error:
        "Please enter a valid exercise load.",
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
      error:
        "Please enter valid repetitions.",
    };
  }

  if (
    input.rpe !== null &&
    (
      !Number.isInteger(input.rpe) ||
      input.rpe < 1 ||
      input.rpe > 10
    )
  ) {
    return {
      success: false,
      error:
        "RPE must be between 1 and 10.",
    };
  }

  if (
    input.discomfortLevel !== null &&
    (
      !Number.isInteger(
        input.discomfortLevel,
      ) ||
      input.discomfortLevel < 0 ||
      input.discomfortLevel > 10
    )
  ) {
    return {
      success: false,
      error:
        "Discomfort must be between 0 and 10.",
    };
  }

  if (
    input.techniqueConfidence !== null &&
    (
      !Number.isInteger(
        input.techniqueConfidence,
      ) ||
      input.techniqueConfidence < 0 ||
      input.techniqueConfidence > 100
    )
  ) {
    return {
      success: false,
      error:
        "Technique confidence must be between 0 and 100.",
    };
  }

  const now =
    new Date();

  try {
    return await db.transaction(
      async (tx) => {
        await tx.execute(
          sql`
            select pg_advisory_xact_lock(
              hashtext(${sessionId})
            )
          `,
        );

        const workoutSession =
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

        if (!workoutSession) {
          return {
            success: false,
            error:
              "This workout session could not be found.",
          } as const;
        }

        if (
          workoutSession.status !==
            "in-progress" &&
          workoutSession.status !==
            "paused"
        ) {
          return {
            success: false,
            error:
              workoutSession.status ===
              "ready"
                ? "Start the workout timer before logging exercises."
                : "This workout is no longer accepting exercise results.",
          } as const;
        }

        const existing =
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

        if (!existing) {
          return {
            success: false,
            error:
              "This exercise could not be found.",
          } as const;
        }

        const completedSets =
          input.completedReps.filter(
            (reps) =>
              reps > 0,
          ).length;

        const completionStatus:
          WorkoutExerciseResolutionStatus =
            completedSets === 0
              ? "not-started"
              : completedSets >=
                    existing.plannedSets
                ? "completed"
                : "partial";

        await tx
          .update(
            workoutExerciseResults,
          )
          .set({
            loadKg:
              input.loadKg,

            completedReps:
              input.completedReps,

            completedSets,

            rpe:
              input.rpe,

            discomfortLevel:
              input.discomfortLevel,

            techniqueConfidence:
              input.techniqueConfidence,

            completionStatus,

            notes:
              input.notes
                .trim()
                .slice(0, 1000),

            /*
             * Logging a previously skipped exercise converts it back
             * into a normal exercise result.
             */
            skipReason:
              null,

            skipNote:
              null,

            resolvedAt:
              completionStatus ===
              "completed"
                ? now
                : null,

            updatedAt:
              now,
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

        await tx
          .insert(apexEvents)
          .values({
            id:
              randomUUID(),

            userId,

            type:
              "workout.exercise_logged",

            category:
              "workout",

            source:
              "live-coach",

            payload: {
              sessionId,

              exerciseResultId,

              exerciseId:
                existing.exerciseId,

              exerciseName:
                existing.exerciseName,

              completedSets,

              plannedSets:
                existing.plannedSets,

              loadKg:
                input.loadKg,

              completedReps:
                input.completedReps,

              rpe:
                input.rpe,

              discomfortLevel:
                input.discomfortLevel,

              techniqueConfidence:
                input.techniqueConfidence,

              completionStatus,

              resolved:
                completionStatus ===
                "completed",
            },

            schemaVersion:
              1,

            occurredAt:
              now,
          });

        return {
          success: true,
          completionStatus,
        } as const;
      },
    );
  } catch (error) {
    console.error(
      "Failed to save exercise result:",
      error,
    );

    return {
      success: false,
      error:
        "Apex could not save this exercise.",
    };
  }
}

export async function completeWorkoutSession(
  input: CompleteWorkoutSessionInput,
): Promise<CompleteWorkoutSessionResult> {
  const userId =
    await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      error:
        "You must be signed in to complete a workout.",
    };
  }

  const sessionId =
    input.sessionId.trim();

  if (!sessionId) {
    return {
      success: false,
      error:
        "The workout session is invalid.",
    };
  }

  if (
    !validateSessionRpe(
      input.sessionRpe,
    )
  ) {
    return {
      success: false,
      error:
        "Session effort must be between 1 and 10.",
    };
  }

  const completionMode =
    input.completionMode ??
    "normal";

  const finishReason =
    input.finishReason
      ?.trim()
      .slice(0, 500) ??
    "";

  if (
    completionMode === "early" &&
    !finishReason
  ) {
    return {
      success: false,
      error:
        "Add a brief reason before ending the workout early.",
    };
  }

  const now =
    new Date();

  try {
    const result =
      await db.transaction(
        async (tx) => {
          await tx.execute(
            sql`
              select pg_advisory_xact_lock(
                hashtext(${sessionId})
              )
            `,
          );

          const workoutSession =
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

          if (!workoutSession) {
            return {
              success: false,
              error:
                "This workout session could not be found.",
            } as const;
          }

          if (
            workoutSession.status ===
            "completed"
          ) {
            return {
              success: false,
              error:
                "This workout has already been completed.",
            } as const;
          }

          if (
            workoutSession.status ===
            "ready"
          ) {
            return {
              success: false,
              error:
                "Start the workout before completing it.",
            } as const;
          }

          const exercises =
            await tx
              .select()
              .from(
                workoutExerciseResults,
              )
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
              )
              .orderBy(
                asc(
                  workoutExerciseResults.orderIndex,
                ),
              );

          if (
            exercises.length === 0
          ) {
            return {
              success: false,
              error:
                "This workout has no exercises to complete.",
            } as const;
          }

          const resolution =
            summariseWorkoutResolution(
              exercises.map(
                (exercise) =>
                  exercise.completionStatus,
              ),
            );

          if (
            completionMode === "normal" &&
            !resolution.allResolved
          ) {
            return {
              success: false,
              error:
                `Complete or skip every exercise before finishing normally. ${resolution.unresolvedExercises} exercise${resolution.unresolvedExercises === 1 ? "" : "s"} remain unresolved.`,
            } as const;
          }

          const completedSets =
            exercises.reduce(
              (
                total,
                exercise,
              ) =>
                total +
                exercise.completedSets,
              0,
            );

          if (
            completedSets === 0
          ) {
            return {
              success: false,
              error:
                "Log at least one completed set before finishing the workout.",
            } as const;
          }

          let finalTiming =
            toTimingState(
              workoutSession,
            );

          if (
            workoutSession.status ===
              "in-progress" ||
            workoutSession.status ===
              "paused"
          ) {
            finalTiming =
              resolveWorkoutTiming({
                timing:
                  finalTiming,
                now,
              });
          }

          if (
            workoutSession.status ===
            "paused"
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
              .update(
                workoutSessionPauses,
              )
              .set({
                endedAt:
                  now,

                durationSeconds:
                  pauseDurationSeconds,

                updatedAt:
                  now,
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

          const progressionExercises =
            exercises.filter(
              (exercise) =>
                exercise.completionStatus ===
                  "completed" &&
                exercise.completedSets > 0,
            );

          const previousProgressionTrends =
            progressionExercises.length > 0
              ? await getExerciseProgressionTrends({
                  userId,
                  exerciseIds:
                    progressionExercises.map(
                      (exercise) =>
                        exercise.exerciseId,
                    ),
                })
              : {};

          const progressionResults =
            progressionExercises.map(
              (exercise) => {
                const immediateDecision =
                  calculateProgressionDecision(
                    exercise,
                  );

                const trend =
                  analyseProgressionTrend({
                    latestDecision:
                      immediateDecision,

                    history: [
                      {
                        loadKg:
                          exercise.loadKg,

                        plannedSets:
                          exercise.plannedSets,

                        completedSets:
                          exercise.completedSets,

                        rpe:
                          exercise.rpe,

                        discomfortLevel:
                          exercise.discomfortLevel,

                        techniqueConfidence:
                          exercise.techniqueConfidence,

                        completedAt:
                          now,
                      },

                      ...(
                        previousProgressionTrends[
                          exercise.exerciseId
                        ] ?? []
                      ),
                    ],
                  });

                return {
                  exercise,

                  decision:
                    trend.decision,

                  recommendedNextLoadKg:
                    trend.recommendedNextLoadKg,

                  progressionRoute:
                    trend.route,

                  progressionConfidence:
                    trend.confidence,

                  progressionReason:
                    trend.reason,

                  successfulSessions:
                    trend.successfulSessions,
                };
              },
            );

          const progressionReady =
            progressionResults.filter(
              (result) =>
                result.decision ===
                "increase",
            ).length;

          const maintainCount =
            progressionResults.filter(
              (result) =>
                result.decision ===
                "maintain",
            ).length;

          const reviewCount =
            progressionResults.filter(
              (result) =>
                result.decision ===
                  "review" ||
                result.decision ===
                  "reduce",
            ).length;

          const totalTrainingVolumeKg =
            Math.round(
              progressionExercises.reduce(
                (
                  total,
                  exercise,
                ) => {
                  if (
                    exercise.loadKg ===
                      null ||
                    exercise.loadKg <= 0
                  ) {
                    return total;
                  }

                  const repetitions =
                    exercise.completedReps.reduce(
                      (
                        sum,
                        reps,
                      ) =>
                        sum + reps,
                      0,
                    );

                  return (
                    total +
                    exercise.loadKg *
                      repetitions
                  );
                },
                0,
              ) * 100,
            ) / 100;

          for (
            const progressionResult
            of progressionResults
          ) {
            await tx
              .update(
                workoutExerciseResults,
              )
              .set({
                progressionDecision:
                  progressionResult.decision,

                recommendedNextLoadKg:
                  progressionResult
                    .recommendedNextLoadKg,

                updatedAt:
                  now,
              })
              .where(
                and(
                  eq(
                    workoutExerciseResults.id,
                    progressionResult
                      .exercise.id,
                  ),
                  eq(
                    workoutExerciseResults.userId,
                    userId,
                  ),
                ),
              );
          }

          const activeDurationSeconds =
            finalTiming
              .accumulatedActiveSeconds;

          const pausedDurationSeconds =
            finalTiming
              .totalPausedSeconds;

          const durationMinutes =
            secondsToRoundedMinutes(
              activeDurationSeconds,
            );

          await tx
            .update(
              workoutSessions,
            )
            .set({
              status:
                "completed",

              activeStartedAt:
                null,

              pausedAt:
                null,

              accumulatedActiveSeconds:
                activeDurationSeconds,

              totalPausedSeconds:
                pausedDurationSeconds,

              pauseCount:
                finalTiming.pauseCount,

              longestPauseSeconds:
                finalTiming
                  .longestPauseSeconds,

              actualDurationMinutes:
                durationMinutes,

              completionMode,

              finishReason:
                finishReason || null,

              sessionRpe:
                input.sessionRpe,

              notes:
                input.notes
                  .trim()
                  .slice(0, 2000),

              completedAt:
                now,

              updatedAt:
                now,
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
            .insert(apexEvents)
            .values({
              id:
                randomUUID(),

              userId,

              type:
                completionMode ===
                "early"
                  ? "workout.session_completed_early"
                  : "workout.session_completed",

              category:
                "workout",

              source:
                "workout-lifecycle",

              payload: {
                sessionId,

                title:
                  workoutSession.title,

                completionMode,

                finishReason:
                  finishReason || null,

                durationMinutes,

                activeDurationSeconds,

                pausedDurationSeconds,

                pauseCount:
                  finalTiming.pauseCount,

                longestPauseSeconds:
                  finalTiming
                    .longestPauseSeconds,

                completedExercises:
                  resolution.completedExercises,

                skippedExercises:
                  resolution.skippedExercises,

                partialExercises:
                  resolution.partialExercises,

                unresolvedExercises:
                  resolution.unresolvedExercises,

                totalExercises:
                  resolution.totalExercises,

                completedSets,

                totalTrainingVolumeKg,

                sessionRpe:
                  input.sessionRpe,

                progressionReady,

                maintainCount,

                reviewCount,

                progressionEligibleExercises:
                  progressionExercises.length,

                progressionResultsJson:
                  JSON.stringify(
                    progressionResults.map(
                      (progressionResult) => ({
                        exerciseId:
                          progressionResult
                            .exercise
                            .exerciseId,

                        exerciseName:
                          progressionResult
                            .exercise
                            .exerciseName,

                        decision:
                          progressionResult
                            .decision,

                        route:
                          progressionResult
                            .progressionRoute,

                        confidence:
                          progressionResult
                            .progressionConfidence,

                        recommendedNextLoadKg:
                          progressionResult
                            .recommendedNextLoadKg,

                        successfulSessions:
                          progressionResult
                            .successfulSessions,

                        reason:
                          progressionResult
                            .progressionReason,
                      }),
                    ),
                  ),
              },

              schemaVersion:
                1,

              occurredAt:
                now,
            });

          return {
            success: true,

            debrief: {
              durationMinutes,

              activeDurationSeconds,

              pausedDurationSeconds,

              pauseCount:
                finalTiming.pauseCount,

              longestPauseSeconds:
                finalTiming
                  .longestPauseSeconds,

              completionMode,

              completedExercises:
                resolution.completedExercises,

              skippedExercises:
                resolution.skippedExercises,

              partialExercises:
                resolution.partialExercises,

              unresolvedExercises:
                resolution.unresolvedExercises,

              totalExercises:
                resolution.totalExercises,

              completedSets,

              totalTrainingVolumeKg,

              progressionReady,

              maintainCount,

              reviewCount,
            },
          } as const;
        },
      );

    if (!result.success) {
      return result;
    }

    /*
     * Memory processing occurs only after the durable completion
     * transaction has succeeded.
     */
    await processApexMemories(
      userId,
    );

    return result;
  } catch (error) {
    console.error(
      "Failed to complete workout session:",
      error,
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Apex could not complete this workout.",
    };
  }
}
