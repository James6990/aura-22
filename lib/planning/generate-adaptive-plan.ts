import type { CoachPriority } from "@/lib/companion/generate-coach-decision";
import type {
  TrainingBlockPhase,
  TrainingBlockWeek,
} from "@/lib/planning/generate-training-block";
import type {
  ProgrammeSession,
  ProgrammeSessionRole,
} from "@/lib/planning/generate-programme-structure";
import type {
  RecoveryIntelligence,
} from "@/lib/workout/analyse-recovery-status";
import type {
  RecoveryForecast,
  RecoveryForecastDay,
} from "@/lib/workout/analyse-recovery-forecast";
import type {
  MovementPattern,
} from "@/lib/workout/exercise-library";
import {
  createDecisionTrace,
  type DecisionTrace,
  type DecisionReason,
} from "@/lib/apex-core/create-decision-trace";
import {
  calculateDecisionConfidence,
} from "@/lib/apex-core/calculate-decision-confidence";
import {
  evidenceRegistryVersion,
} from "@/lib/evidence/evidence-registry";

export type PlanningDayType =
  | "train"
  | "light"
  | "recovery"
  | "conditioning"
  | "flexible";

export type RecentPlannedWorkout = {
  date: string;
  status:
    | "ready"
    | "in-progress"
    | "paused"
    | "ready-to-complete"
    | "completed"
    | "skipped";
  intensity: string;
  sessionRpe: number | null;
};

export type AdaptivePlanningInput = {
  primaryGoal: string;
  experienceLevel: string;

  currentPriority: CoachPriority;
  readinessScore: number;
  recoveryScore: number;
  consistencyScore: number;

  latestWorkoutCompletedAt: Date | null;
  latestWorkoutRpe: number | null;
  latestWorkoutDiscomfort: number;
  progressionReadyCount: number;

  recentWorkouts: RecentPlannedWorkout[];
  availableTrainingDays?: number;

  blockWeek?: TrainingBlockWeek;

  programmeSessions?: ProgrammeSession[];
  completedProgrammeSessions?: number;
  recoveryIntelligence?: RecoveryIntelligence;
  recoveryForecast?: RecoveryForecast;
};

type AdaptivePlanDayBase = {
  dayOffset: number;
  label: string;
  type: PlanningDayType;
  title: string;
  reason: string;
  optional: boolean;
  programmeRole: ProgrammeSessionRole | null;
};

export type AdaptivePlanDay =
  AdaptivePlanDayBase & {
    decisionTrace: DecisionTrace;
  };

export type AdaptiveConfidence = {
  score: number;
  label: "Learning" | "Moderate" | "Strong" | "High";
  reasons: string[];
};

export type AdaptivePlan = {
  headline: string;
  summary: string;
  days: AdaptivePlanDay[];
  confidence: AdaptiveConfidence;
  missedSessionsRedistributed: boolean;
};

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

function getDayLabel(offset: number) {
  if (offset === 0) return "Today";
  if (offset === 1) return "Tomorrow";

  return `Day ${offset + 1}`;
}

function getCompletedWorkoutCount(
  workouts: RecentPlannedWorkout[],
) {
  return workouts.filter(
    (workout) =>
      workout.status === "completed",
  ).length;
}

function getSkippedWorkoutCount(
  workouts: RecentPlannedWorkout[],
) {
  return workouts.filter(
    (workout) =>
      workout.status === "skipped",
  ).length;
}

function getRecentHighEffortCount(
  workouts: RecentPlannedWorkout[],
) {
  return workouts.filter(
    (workout) =>
      workout.status === "completed" &&
      (
        workout.intensity.toLowerCase() ===
          "high" ||
        (workout.sessionRpe ?? 0) >= 8
      ),
  ).length;
}

function calculateConfidence({
  recentWorkouts,
  readinessScore,
  recoveryScore,
  consistencyScore,
  latestWorkoutCompletedAt,
}: Pick<
  AdaptivePlanningInput,
  | "recentWorkouts"
  | "readinessScore"
  | "recoveryScore"
  | "consistencyScore"
  | "latestWorkoutCompletedAt"
>): AdaptiveConfidence {
  const reasons: string[] = [];

  let score = 25;

  const completedCount =
    getCompletedWorkoutCount(recentWorkouts);

  score += Math.min(completedCount * 6, 30);

  if (recentWorkouts.length >= 7) {
    score += 12;
    reasons.push(
      "Apex has a useful recent workout history.",
    );
  } else if (recentWorkouts.length > 0) {
    reasons.push(
      "Apex has some recent training history.",
    );
  } else {
    reasons.push(
      "Apex has limited workout history so far.",
    );
  }

  if (
    readinessScore > 0 &&
    recoveryScore > 0
  ) {
    score += 12;
    reasons.push(
      "Current readiness and recovery signals are available.",
    );
  }

  if (consistencyScore >= 50) {
    score += 8;
    reasons.push(
      "Recent consistency provides a clearer planning pattern.",
    );
  }

  if (latestWorkoutCompletedAt) {
    const daysSinceLatest =
      Math.max(
        0,
        Math.floor(
          (
            Date.now() -
            latestWorkoutCompletedAt.getTime()
          ) /
            86_400_000,
        ),
      );

    if (daysSinceLatest <= 3) {
      score += 8;
      reasons.push(
        "Recent workout data is still current.",
      );
    }
  }

  const finalScore = clamp(score);

  const label =
    finalScore >= 85
      ? "High"
      : finalScore >= 70
        ? "Strong"
        : finalScore >= 50
          ? "Moderate"
          : "Learning";

  return {
    score: finalScore,
    label,
    reasons,
  };
}

function getGoalTrainingTitle(
  primaryGoal: string,
) {
  switch (primaryGoal) {
    case "muscle":
      return "Goal-focused strength session";

    case "fat-loss":
      return "Strength and conditioning session";

    case "recomposition":
      return "Balanced strength session";

    case "performance":
      return "Performance training session";

    case "health":
    default:
      return "Full-body health session";
  }
}

function createRecoveryDay(
  offset: number,
  reason: string,
): AdaptivePlanDayBase {
  return {
    dayOffset: offset,
    label: getDayLabel(offset),
    type: "recovery",
    title: "Recovery and comfortable movement",
    reason,
    optional: false,
    programmeRole: "recovery",
  };
}

function createTrainingDay(
  offset: number,
  primaryGoal: string,
  reason: string,
  programmeSession?: ProgrammeSession,
): AdaptivePlanDayBase {
  return {
    dayOffset: offset,
    label: getDayLabel(offset),
    type:
      programmeSession?.role ===
      "conditioning"
        ? "conditioning"
        : "train",
    title:
      programmeSession?.title ??
      getGoalTrainingTitle(primaryGoal),
    reason:
      programmeSession
        ? `${reason} ${programmeSession.purpose}`
        : reason,
    optional:
      programmeSession?.optional ?? false,
    programmeRole:
      programmeSession?.role ?? null,
  };
}

function createLightDay(
  offset: number,
  reason: string,
): AdaptivePlanDayBase {
  return {
    dayOffset: offset,
    label: getDayLabel(offset),
    type: "light",
    title: "Light technique session",
    reason,
    optional: false,
    programmeRole: null,
  };
}

function createFlexibleDay(
  offset: number,
  reason: string,
): AdaptivePlanDayBase {
  return {
    dayOffset: offset,
    label: getDayLabel(offset),
    type: "flexible",
    title: "Flexible activity day",
    reason,
    optional: true,
    programmeRole: null,
  };
}

function getBlockHeadline(
  phase: TrainingBlockPhase,
) {
  switch (phase) {
    case "foundation":
      return "Build a repeatable foundation";

    case "progression":
      return "Progress with control";

    case "consolidation":
      return "Make strong performances repeatable";

    case "deload":
      return "Recover and absorb your progress";
  }
}

function getBlockTrainingReason({
  blockWeek,
  progressionReadyCount,
}: {
  blockWeek: TrainingBlockWeek | undefined;
  progressionReadyCount: number;
}) {
  if (!blockWeek) {
    return progressionReadyCount > 0
      ? "Recovery is sufficiently spaced and previous results show progression opportunities."
      : "The weekly rhythm supports a controlled goal-focused training day.";
  }

  switch (blockWeek.phase) {
    case "foundation":
      return "This foundation week prioritises repeatable training, confident technique and manageable effort.";

    case "progression":
      return (
        blockWeek.progressionAllowed &&
        progressionReadyCount > 0
          ? "This progression week supports a carefully earned increase based on previous performance."
          : "This progression week supports productive training, but progression remains dependent on performance and recovery."
      );

    case "consolidation":
      return "This consolidation week prioritises repeating strong performances before adding more challenge.";

    case "deload":
      return "This deload week keeps movement present while reducing accumulated fatigue.";
  }
}

const rolePatterns: Record<
  ProgrammeSessionRole,
  MovementPattern[]
> = {
  "full-body": [
    "horizontal-push",
    "horizontal-pull",
    "squat",
    "hinge",
    "core",
  ],
  upper: [
    "horizontal-push",
    "horizontal-pull",
    "vertical-push",
    "vertical-pull",
  ],
  lower: [
    "squat",
    "hinge",
    "single-leg",
  ],
  push: [
    "horizontal-push",
    "vertical-push",
  ],
  pull: [
    "horizontal-pull",
    "vertical-pull",
  ],
  legs: [
    "squat",
    "hinge",
    "single-leg",
  ],
  strength: [
    "horizontal-push",
    "horizontal-pull",
    "squat",
    "hinge",
  ],
  conditioning: ["cardio", "core"],
  performance: [
    "squat",
    "hinge",
    "single-leg",
    "core",
    "cardio",
  ],
  mobility: ["mobility", "core"],
  recovery: [
    "mobility",
    "cardio",
    "core",
  ],
};

function sessionConflictsWithRecovery({
  session,
  recoveryIntelligence,
}: {
  session: ProgrammeSession;
  recoveryIntelligence:
    | RecoveryIntelligence
    | undefined;
}) {
  if (!recoveryIntelligence) {
    return false;
  }

  if (
    session.role === "mobility" ||
    session.role === "recovery"
  ) {
    return false;
  }

  const relevantPatterns =
    rolePatterns[session.role];

  return relevantPatterns.some(
    (pattern) =>
      recoveryIntelligence.avoidPatterns
        .includes(pattern),
  );
}

function sessionConflictsWithForecast({
  session,
  forecastDay,
}: {
  session: ProgrammeSession;
  forecastDay: RecoveryForecastDay | undefined;
}) {
  if (!forecastDay) {
    return false;
  }

  if (
    session.role === "mobility" ||
    session.role === "recovery"
  ) {
    return false;
  }

  const relevantPatterns =
    rolePatterns[session.role];

  return relevantPatterns.some(
    (pattern) =>
      forecastDay.avoidPatterns.includes(
        pattern,
      ),
  );
}

function forecastRequiresRecovery(
  forecastDay: RecoveryForecastDay | undefined,
) {
  return (
    forecastDay?.status === "recovering" ||
    forecastDay?.status === "avoid-today"
  );
}

export function generateAdaptivePlan(
  input: AdaptivePlanningInput,
): AdaptivePlan {
  const blockWeek = input.blockWeek;

  const programmeSessions =
    input.programmeSessions ?? [];

  let programmeIndex =
    programmeSessions.length > 0
      ? (
          input.completedProgrammeSessions ??
          0
        ) % programmeSessions.length
      : 0;

  const requestedTrainingDays =
    blockWeek?.trainingDaysTarget ??
    input.availableTrainingDays ??
    3;

  const availableTrainingDays = Math.max(
    1,
    Math.min(
      blockWeek?.phase === "deload"
        ? Math.min(requestedTrainingDays, 2)
        : requestedTrainingDays,
      7,
    ),
  );

  const skippedCount =
    getSkippedWorkoutCount(
      input.recentWorkouts,
    );

  const highEffortCount =
    getRecentHighEffortCount(
      input.recentWorkouts,
    );

  const recoveryNeeded =
    input.currentPriority === "recover" ||
    input.currentPriority === "hydrate" ||
    input.readinessScore < 55 ||
    input.recoveryScore < 50 ||
    input.latestWorkoutDiscomfort >= 4 ||
    input.latestWorkoutRpe !== null &&
      input.latestWorkoutRpe >= 9;

  const techniqueNeeded =
    input.currentPriority === "technique" ||
    input.currentPriority === "collect-data";

  const blockDeload =
    blockWeek?.phase === "deload";

  const blockFoundation =
    blockWeek?.phase === "foundation";

  const days: AdaptivePlanDayBase[] = [];

  let demandingSessionsPlaced = 0;

  for (let offset = 0; offset < 7; offset += 1) {
    const forecastDay =
      input.recoveryForecast?.days.find(
        (day) =>
          day.dayOffset === offset,
      );

    if (offset === 0 && recoveryNeeded) {
      days.push(
        createRecoveryDay(
          offset,
          "Current recovery, readiness or discomfort signals favour a lower-load day.",
        ),
      );
      continue;
    }

    if (offset === 0 && techniqueNeeded) {
      days.push(
        createLightDay(
          offset,
          "Apex is prioritising movement quality and useful baseline information.",
        ),
      );
      continue;
    }

    if (offset === 0 && blockDeload) {
      days.push(
        createLightDay(
          offset,
          "The current training block is in a deload phase, so volume and intensity should remain reduced.",
        ),
      );
      continue;
    }

    if (
      offset > 0 &&
      forecastRequiresRecovery(forecastDay)
    ) {
      days.push(
        createRecoveryDay(
          offset,
          forecastDay?.explanation ??
            "Forecast recovery does not yet support a demanding session.",
        ),
      );
      continue;
    }

    const previousDay = days[offset - 1];

    const canPlaceTraining =
      demandingSessionsPlaced <
        availableTrainingDays &&
      previousDay?.type !== "train" &&
      previousDay?.type !== "conditioning" &&
      !(
        blockFoundation &&
        highEffortCount >= 2
      );

    if (canPlaceTraining) {
      const programmeSession =
        programmeSessions.length > 0
          ? programmeSessions[
              programmeIndex %
                programmeSessions.length
            ]
          : undefined;

      const measuredRecoveryConflict =
        programmeSession &&
        offset === 0 &&
        sessionConflictsWithRecovery({
          session: programmeSession,
          recoveryIntelligence:
            input.recoveryIntelligence,
        });

      const forecastRecoveryConflict =
        programmeSession &&
        offset > 0 &&
        sessionConflictsWithForecast({
          session: programmeSession,
          forecastDay,
        });

      if (
        measuredRecoveryConflict ||
        forecastRecoveryConflict
      ) {
        days.push(
          createRecoveryDay(
            offset,
            forecastDay?.explanation ??
              `${programmeSession.title} has been postponed because recovery signals conflict with its main movement demands.`,
          ),
        );

        /*
         * Programme order is deliberately
         * unchanged. The postponed session is
         * reconsidered on the next suitable day.
         */
        continue;
      }

      days.push(
        createTrainingDay(
          offset,
          input.primaryGoal,
          getBlockTrainingReason({
            blockWeek,
            progressionReadyCount:
              input.progressionReadyCount,
          }),
          programmeSession,
        ),
      );

      demandingSessionsPlaced += 1;

      if (programmeSession) {
        programmeIndex += 1;
      }

      continue;
    }

    if (
      highEffortCount >= 2 &&
      offset <= 3
    ) {
      days.push(
        createRecoveryDay(
          offset,
          "Recent high-effort sessions make additional recovery valuable.",
        ),
      );
      continue;
    }

    days.push(
      createFlexibleDay(
        offset,
        "Use readiness and schedule availability to choose light activity, mobility or rest.",
      ),
    );
  }

  const missedSessionsRedistributed =
    skippedCount > 0;

  const confidence = calculateConfidence({
    recentWorkouts: input.recentWorkouts,
    readinessScore: input.readinessScore,
    recoveryScore: input.recoveryScore,
    consistencyScore:
      input.consistencyScore,
    latestWorkoutCompletedAt:
      input.latestWorkoutCompletedAt,
  });

  const headline = recoveryNeeded
    ? "Protect recovery, then rebuild momentum"
    : techniqueNeeded
      ? "Build quality before intensity"
      : blockWeek
        ? getBlockHeadline(blockWeek.phase)
        : "A balanced seven-day rhythm";

  const summary =
    missedSessionsRedistributed
      ? "Missed sessions have been redistributed rather than stacked together. Apex is protecting recovery while preserving the week’s most valuable training opportunities."
      : "This rhythm separates demanding sessions with recovery or flexible days so progress can continue without unnecessary fatigue.";

  const tracedDays = days.map((day) => {
    const forecastDay =
      input.recoveryForecast?.days.find(
        (candidate) =>
          candidate.dayOffset ===
          day.dayOffset,
      );

    const evidenceRuleId =
      day.type === "recovery" ||
      day.type === "light"
        ? "recovery-respect-current-signals"
        : "progression-require-repeatable-performance";

    const reasons: DecisionReason[] = [
      {
        code: `adaptive-plan-${day.type}`,
        label: "Adaptive planning decision",
        detail: day.reason,
        influence:
          day.type === "recovery"
            ? "strong-negative"
            : day.type === "light"
              ? "negative"
              : day.type === "flexible"
                ? "neutral"
                : "positive",
        evidenceRuleId,
        evidenceStrength:
          day.type === "recovery"
            ? "strong"
            : "moderate",
      },
    ];

    if (day.programmeRole) {
      reasons.push({
        code: "programme-role",
        label: "Programme continuity",
        detail:
          `The ${day.programmeRole} programme role was considered for this day.`,
        influence: "positive",
        evidenceRuleId: null,
        evidenceStrength:
          "personal-trend",
      });
    }

    if (forecastDay) {
      reasons.push({
        code: "recovery-forecast",
        label: "Recovery forecast",
        detail:
          `${forecastDay.explanation} Forecast confidence is ${forecastDay.confidence}%.`,
        influence:
          forecastDay.status === "ready"
            ? "positive"
            : forecastDay.status === "caution"
              ? "neutral"
              : "strong-negative",
        evidenceRuleId:
          "recovery-respect-current-signals",
        evidenceStrength: "strong",
      });
    }

    const dataCompleteness =
      Math.min(
        100,
        45 +
          input.recentWorkouts.length * 8 +
          (input.recoveryIntelligence ? 15 : 0) +
          (forecastDay ? 10 : 0),
      );

    const signalAgreement =
      Math.max(
        0,
        100 -
          Math.abs(
            input.readinessScore -
              input.recoveryScore,
          ),
      );

    const historyDepth =
      Math.min(
        100,
        input.recentWorkouts.length * 12,
      );

    const safetyOverrideActive =
      day.type === "recovery" &&
      (
        day.dayOffset === 0 ||
        forecastDay?.status ===
          "recovering" ||
        forecastDay?.status ===
          "avoid-today"
      );

    const traceConfidence =
      calculateDecisionConfidence({
        dataCompleteness,
        signalAgreement,
        historyDepth,
        forecastCertainty:
          forecastDay?.confidence ?? 100,
        safetyOverrideActive,
      });

    return {
      ...day,
      decisionTrace:
        createDecisionTrace({
          decisionId:
            `adaptive-plan-day-${day.dayOffset}`,
          decisionType:
            "adaptive-plan-day",
          outcome:
            `${day.type}:${day.title}`,
          confidence: traceConfidence,
          reasons,
          overriddenBy:
            safetyOverrideActive
              ? "recovery-safety"
              : null,
          evidenceRegistryVersion,
        }),
    };
  });

  return {
    headline,
    summary,
    days: tracedDays,
    confidence,
    missedSessionsRedistributed,
  };
}
