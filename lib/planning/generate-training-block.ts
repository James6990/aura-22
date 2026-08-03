import {
  getTrainingGoalProfile,
  type SupportedTrainingGoal,
} from "@/lib/workout/training-goal-profile";

export type TrainingBlockLength = 4 | 8 | 12;

export type TrainingBlockPhase =
  | "foundation"
  | "progression"
  | "consolidation"
  | "deload";

export type TrainingBlockInput = {
  primaryGoal: string;
  experienceLevel: string;
  blockLengthWeeks: TrainingBlockLength;
  trainingDaysPerWeek: number;

  currentWeek?: number;
  recentConsistency?: number;
  recentRecovery?: number;
  missedSessions?: number;
};

export type TrainingBlockWeek = {
  weekNumber: number;
  phase: TrainingBlockPhase;
  title: string;
  objective: string;

  trainingDaysTarget: number;
  volumeMultiplier: number;
  intensityBias:
    | "recovery"
    | "light"
    | "moderate"
    | "progressive";

  conditioningSessionsTarget: number;
  progressionAllowed: boolean;
  optional: boolean;

  reasons: string[];
};

export type TrainingBlock = {
  goal: SupportedTrainingGoal;
  lengthWeeks: TrainingBlockLength;
  currentWeek: number;
  headline: string;
  summary: string;
  weeks: TrainingBlockWeek[];

  guidance: {
    missedSessionPolicy: string;
    recoveryOverridePolicy: string;
    progressionPolicy: string;
  };
};

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

function getPhaseForWeek({
  weekNumber,
  blockLengthWeeks,
}: {
  weekNumber: number;
  blockLengthWeeks: TrainingBlockLength;
}): TrainingBlockPhase {
  if (weekNumber === blockLengthWeeks) {
    return "deload";
  }

  const progress =
    weekNumber / blockLengthWeeks;

  if (progress <= 0.25) {
    return "foundation";
  }

  if (progress <= 0.7) {
    return "progression";
  }

  return "consolidation";
}

function getPhaseTitle(
  phase: TrainingBlockPhase,
) {
  switch (phase) {
    case "foundation":
      return "Build the foundation";

    case "progression":
      return "Progress with control";

    case "consolidation":
      return "Make progress repeatable";

    case "deload":
      return "Recover and absorb progress";
  }
}

function getPhaseObjective({
  phase,
  goalTitle,
}: {
  phase: TrainingBlockPhase;
  goalTitle: string;
}) {
  switch (phase) {
    case "foundation":
      return `Establish consistent, technically confident training for ${goalTitle.toLowerCase()}.`;

    case "progression":
      return "Gradually progress suitable exercises while protecting recovery and movement quality.";

    case "consolidation":
      return "Repeat strong performances and confirm that progression remains sustainable.";

    case "deload":
      return "Reduce accumulated fatigue while preserving movement, confidence and routine.";
  }
}

function getVolumeMultiplier({
  phase,
  weekNumber,
  blockLengthWeeks,
}: {
  phase: TrainingBlockPhase;
  weekNumber: number;
  blockLengthWeeks: TrainingBlockLength;
}) {
  if (phase === "foundation") {
    return 0.85;
  }

  if (phase === "deload") {
    return 0.6;
  }

  if (phase === "consolidation") {
    return 1;
  }

  const progressionPosition =
    weekNumber / blockLengthWeeks;

  return clamp(
    0.95 + progressionPosition * 0.2,
    0.95,
    1.12,
  );
}

function getConditioningTarget({
  conditioningBias,
  trainingDaysTarget,
  phase,
}: {
  conditioningBias: number;
  trainingDaysTarget: number;
  phase: TrainingBlockPhase;
}) {
  if (phase === "deload") {
    return conditioningBias >= 1
      ? 1
      : 0;
  }

  if (conditioningBias >= 1.1) {
    return Math.min(
      3,
      Math.max(1, trainingDaysTarget - 1),
    );
  }

  if (conditioningBias >= 0.9) {
    return 1;
  }

  return 0;
}

function getIntensityBias(
  phase: TrainingBlockPhase,
): TrainingBlockWeek["intensityBias"] {
  if (phase === "deload") {
    return "recovery";
  }

  if (phase === "foundation") {
    return "moderate";
  }

  if (phase === "progression") {
    return "progressive";
  }

  return "moderate";
}

export function generateTrainingBlock({
  primaryGoal,
  experienceLevel,
  blockLengthWeeks,
  trainingDaysPerWeek,
  currentWeek = 1,
  recentConsistency = 50,
  recentRecovery = 50,
  missedSessions = 0,
}: TrainingBlockInput): TrainingBlock {
  const goalProfile =
    getTrainingGoalProfile(primaryGoal);

  const safeTrainingDays = clamp(
    trainingDaysPerWeek,
    1,
    experienceLevel === "beginner"
      ? 4
      : 6,
  );

  const safeCurrentWeek = clamp(
    currentWeek,
    1,
    blockLengthWeeks,
  );

  const weeks: TrainingBlockWeek[] =
    Array.from(
      {
        length: blockLengthWeeks,
      },
      (_, index) => {
        const weekNumber = index + 1;

        const phase = getPhaseForWeek({
          weekNumber,
          blockLengthWeeks,
        });

        let trainingDaysTarget =
          safeTrainingDays;

        const reasons: string[] = [
          `${goalProfile.title} determines the block’s training philosophy.`,
          `${getPhaseTitle(
            phase,
          )} shapes this week’s volume and progression approach.`,
        ];

        if (
          recentConsistency < 40 &&
          weekNumber === safeCurrentWeek
        ) {
          trainingDaysTarget = Math.max(
            1,
            trainingDaysTarget - 1,
          );

          reasons.push(
            "The current target is slightly reduced to rebuild consistency without catch-up pressure.",
          );
        }

        if (
          recentRecovery < 45 &&
          weekNumber === safeCurrentWeek
        ) {
          trainingDaysTarget = Math.max(
            1,
            trainingDaysTarget - 1,
          );

          reasons.push(
            "Recent recovery signals support a more manageable current week.",
          );
        }

        if (
          missedSessions > 0 &&
          weekNumber === safeCurrentWeek
        ) {
          reasons.push(
            "Missed sessions are redistributed rather than compressed into extra demanding days.",
          );
        }

        const progressionAllowed =
          phase === "progression" ||
          phase === "consolidation";

        const optional =
          phase === "deload";

        return {
          weekNumber,
          phase,
          title: getPhaseTitle(phase),
          objective: getPhaseObjective({
            phase,
            goalTitle:
              goalProfile.title,
          }),

          trainingDaysTarget,
          volumeMultiplier:
            getVolumeMultiplier({
              phase,
              weekNumber,
              blockLengthWeeks,
            }) *
            goalProfile.volumeBias,

          intensityBias:
            getIntensityBias(phase),

          conditioningSessionsTarget:
            getConditioningTarget({
              conditioningBias:
                goalProfile.conditioningBias,
              trainingDaysTarget,
              phase,
            }),

          progressionAllowed,
          optional,
          reasons,
        };
      },
    );

  return {
    goal: goalProfile.goal,
    lengthWeeks: blockLengthWeeks,
    currentWeek: safeCurrentWeek,

    headline:
      `${blockLengthWeeks}-week ${goalProfile.title.toLowerCase()} block`,

    summary:
      "Apex will use this block as the long-term direction, while daily readiness, recovery, discomfort and life circumstances can still adjust individual sessions.",

    weeks,

    guidance: {
      missedSessionPolicy:
        "Missed sessions should be redistributed or removed. They should not be stacked into unsafe catch-up days.",

      recoveryOverridePolicy:
        "Apex Core may reduce, postpone or replace any planned session when recovery, hydration, symptoms, discomfort or technique require it.",

      progressionPolicy:
        "Progression is earned through repeatable performance, manageable effort, confident technique and low discomfort—not simply because a new week has started.",
    },
  };
}
