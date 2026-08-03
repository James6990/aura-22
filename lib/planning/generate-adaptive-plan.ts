import type { CoachPriority } from "@/lib/companion/generate-coach-decision";
import type {
  TrainingBlockPhase,
  TrainingBlockWeek,
} from "@/lib/planning/generate-training-block";

export type PlanningDayType =
  | "train"
  | "light"
  | "recovery"
  | "conditioning"
  | "flexible";

export type RecentPlannedWorkout = {
  date: string;
  status:
    | "planned"
    | "in-progress"
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
};

export type AdaptivePlanDay = {
  dayOffset: number;
  label: string;
  type: PlanningDayType;
  title: string;
  reason: string;
  optional: boolean;
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
): AdaptivePlanDay {
  return {
    dayOffset: offset,
    label: getDayLabel(offset),
    type: "recovery",
    title: "Recovery and comfortable movement",
    reason,
    optional: false,
  };
}

function createTrainingDay(
  offset: number,
  primaryGoal: string,
  reason: string,
): AdaptivePlanDay {
  return {
    dayOffset: offset,
    label: getDayLabel(offset),
    type: "train",
    title: getGoalTrainingTitle(primaryGoal),
    reason,
    optional: false,
  };
}

function createLightDay(
  offset: number,
  reason: string,
): AdaptivePlanDay {
  return {
    dayOffset: offset,
    label: getDayLabel(offset),
    type: "light",
    title: "Light technique session",
    reason,
    optional: false,
  };
}

function createFlexibleDay(
  offset: number,
  reason: string,
): AdaptivePlanDay {
  return {
    dayOffset: offset,
    label: getDayLabel(offset),
    type: "flexible",
    title: "Flexible activity day",
    reason,
    optional: true,
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

export function generateAdaptivePlan(
  input: AdaptivePlanningInput,
): AdaptivePlan {
  const blockWeek = input.blockWeek;

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

  const days: AdaptivePlanDay[] = [];

  let demandingSessionsPlaced = 0;

  for (let offset = 0; offset < 7; offset += 1) {
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

    const previousDay = days[offset - 1];

    const canPlaceTraining =
      demandingSessionsPlaced <
        availableTrainingDays &&
      previousDay?.type !== "train" &&
      !(
        blockFoundation &&
        highEffortCount >= 2
      );

    if (canPlaceTraining) {
      days.push(
        createTrainingDay(
          offset,
          input.primaryGoal,
          getBlockTrainingReason({
            blockWeek,
            progressionReadyCount:
              input.progressionReadyCount,
          }),
        ),
      );

      demandingSessionsPlaced += 1;
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

  return {
    headline,
    summary,
    days,
    confidence,
    missedSessionsRedistributed,
  };
}
