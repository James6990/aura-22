import type { GenomeTraits } from "@/lib/genome/calculate-adaptive-traits";
import type { LatestWorkoutSummary } from "@/lib/workout/get-latest-workout-summary";
import type {
  CoachDecision,
  CoachPriority,
} from "@/lib/companion/generate-coach-decision";

export type ApexRecoveryState =
  | "low"
  | "moderate"
  | "high";

export type ApexMomentumState =
  | "starting"
  | "rebuilding"
  | "building"
  | "strong";

export type ApexWellbeingState =
  | "needs-support"
  | "stable"
  | "thriving"
  | "unknown";

export type ApexState = {
  readiness: number;
  recovery: ApexRecoveryState;
  momentum: ApexMomentumState;
  wellbeing: ApexWellbeingState;
  todayPriority: CoachPriority;
  confidence: number;

  currentStreak: number;
  daysSinceLastWorkout: number | null;
  isComeback: boolean;

  latestWorkout: {
    id: string;
    title: string;
    completedExercises: number;
    totalExercises: number;
    progressionReady: number;
    reviewCount: number;
    highestDiscomfort: number;
  } | null;

  reasons: string[];
};

export type GetApexStateInput = {
  readinessScore: number;
  traits: GenomeTraits;
  currentStreak: number;
  latestWorkout: LatestWorkoutSummary | null;
  coachDecision: CoachDecision;
};

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.max(minimum, Math.min(maximum, value));
}

function getDaysSince(date: Date | null) {
  if (!date) {
    return null;
  }

  const elapsed =
    Date.now() - new Date(date).getTime();

  if (elapsed <= 0) {
    return 0;
  }

  return Math.floor(elapsed / 86_400_000);
}

function getRecoveryState(
  recoveryScore: number,
): ApexRecoveryState {
  if (recoveryScore < 50) {
    return "low";
  }

  if (recoveryScore < 75) {
    return "moderate";
  }

  return "high";
}

function getMomentumState({
  currentStreak,
  consistency,
  daysSinceLastWorkout,
}: {
  currentStreak: number;
  consistency: number;
  daysSinceLastWorkout: number | null;
}): ApexMomentumState {
  if (
    daysSinceLastWorkout !== null &&
    daysSinceLastWorkout >= 7
  ) {
    return "rebuilding";
  }

  if (currentStreak >= 14 && consistency >= 75) {
    return "strong";
  }

  if (currentStreak >= 3 || consistency >= 45) {
    return "building";
  }

  return "starting";
}

function getWellbeingState({
  readiness,
  recovery,
  discomfort,
}: {
  readiness: number;
  recovery: number;
  discomfort: number;
}): ApexWellbeingState {
  /*
   * This is a general training-and-recovery state.
   * It is not a mental-health diagnosis.
   */
  if (
    readiness < 40 ||
    recovery < 40 ||
    discomfort >= 6
  ) {
    return "needs-support";
  }

  if (
    readiness >= 80 &&
    recovery >= 75 &&
    discomfort <= 2
  ) {
    return "thriving";
  }

  return "stable";
}

export function getApexState({
  readinessScore,
  traits,
  currentStreak,
  latestWorkout,
  coachDecision,
}: GetApexStateInput): ApexState {
  const readiness = clamp(readinessScore);
  const recoveryScore = clamp(traits.recovery);

  const daysSinceLastWorkout = getDaysSince(
    latestWorkout?.completedAt ?? null,
  );

  const isComeback =
    daysSinceLastWorkout !== null &&
    daysSinceLastWorkout >= 7;

  const highestDiscomfort =
    latestWorkout?.highestDiscomfort ?? 0;

  const recovery = getRecoveryState(
    recoveryScore,
  );

  const momentum = getMomentumState({
    currentStreak,
    consistency: clamp(traits.consistency),
    daysSinceLastWorkout,
  });

  const wellbeing = getWellbeingState({
    readiness,
    recovery: recoveryScore,
    discomfort: highestDiscomfort,
  });

  const reasons = [
    ...coachDecision.reasons,
  ];

  if (isComeback) {
    reasons.unshift(
      `It has been ${daysSinceLastWorkout} days since the latest completed workout, so Apex is prioritising a gradual return.`,
    );
  }

  return {
    readiness,
    recovery,
    momentum,
    wellbeing,
    todayPriority: coachDecision.priority,
    confidence: clamp(
      coachDecision.confidence,
    ),

    currentStreak,
    daysSinceLastWorkout,
    isComeback,

    latestWorkout: latestWorkout
      ? {
          id: latestWorkout.id,
          title: latestWorkout.title,
          completedExercises:
            latestWorkout.completedExercises,
          totalExercises:
            latestWorkout.totalExercises,
          progressionReady:
            latestWorkout.progressionReady,
          reviewCount:
            latestWorkout.reviewCount,
          highestDiscomfort:
            latestWorkout.highestDiscomfort,
        }
      : null,

    reasons: Array.from(new Set(reasons)),
  };
}
