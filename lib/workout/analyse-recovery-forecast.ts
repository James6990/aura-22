import type {
  TrainingBlockWeek,
} from "@/lib/planning/generate-training-block";
import type {
  RecentTrainingLoad,
} from "@/lib/workout/analyse-recent-training-load";
import type {
  RecoveryIntelligence,
  RecoveryStatus,
} from "@/lib/workout/analyse-recovery-status";
import type {
  MovementPattern,
} from "@/lib/workout/exercise-library";

export type RecoveryForecastDay = {
  dayOffset: number;
  expectedRecoveryScore: number;
  status: RecoveryStatus;
  demandingTrainingSuitable: boolean;
  preferredPatterns: MovementPattern[];
  avoidPatterns: MovementPattern[];
  confidence: number;
  explanation: string;
};

export type RecoveryForecast = {
  days: RecoveryForecastDay[];
  summary: string;
};

export type RecoveryForecastInput = {
  recoveryIntelligence: RecoveryIntelligence;
  recentTrainingLoad: RecentTrainingLoad;
  blockWeek?: TrainingBlockWeek;
};

const movementPatterns: MovementPattern[] = [
  "horizontal-push",
  "horizontal-pull",
  "vertical-push",
  "vertical-pull",
  "squat",
  "hinge",
  "single-leg",
  "core",
  "cardio",
  "mobility",
];

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

function getStatus(
  score: number,
  avoidPatternCount: number,
): RecoveryStatus {
  if (
    score < 30 ||
    avoidPatternCount >= 4
  ) {
    return "avoid-today";
  }

  if (score < 50) {
    return "recovering";
  }

  if (score < 70) {
    return "caution";
  }

  return "ready";
}

function getPhaseRecoveryAdjustment(
  blockWeek: TrainingBlockWeek | undefined,
) {
  if (!blockWeek) {
    return 0;
  }

  switch (blockWeek.phase) {
    case "deload":
      return 3;

    case "foundation":
      return 1;

    case "progression":
      return -1;

    case "consolidation":
    default:
      return 0;
  }
}

function getDailyRecoveryGain({
  currentScore,
  recoveryPressure,
  phaseAdjustment,
}: {
  currentScore: number;
  recoveryPressure: number;
  phaseAdjustment: number;
}) {
  let gain = 7 + phaseAdjustment;

  if (currentScore < 40) {
    gain += 2;
  } else if (currentScore >= 80) {
    gain -= 2;
  }

  if (recoveryPressure >= 70) {
    gain -= 3;
  } else if (recoveryPressure >= 45) {
    gain -= 1;
  }

  return clamp(gain, 2, 12);
}

function getExplanation({
  dayOffset,
  status,
  preferredPatterns,
  avoidPatterns,
}: {
  dayOffset: number;
  status: RecoveryStatus;
  preferredPatterns: MovementPattern[];
  avoidPatterns: MovementPattern[];
}) {
  if (dayOffset === 0) {
    return "Today uses the current measured recovery and training-load signals.";
  }

  if (status === "avoid-today") {
    return "Accumulated fatigue is forecast to remain high. Recovery-focused or very light activity is more appropriate.";
  }

  if (status === "recovering") {
    return avoidPatterns.length > 0
      ? `Recovery is improving, but ${avoidPatterns.join(
          ", ",
        )} may still need additional time.`
      : "Recovery is improving, although demanding training is not yet strongly supported.";
  }

  if (status === "caution") {
    return preferredPatterns.length > 0
      ? `Controlled training may be suitable, with ${preferredPatterns
          .slice(0, 3)
          .join(", ")} currently forecast as the strongest options.`
      : "Controlled training may be suitable, but intensity and volume should remain adaptable.";
  }

  return preferredPatterns.length > 0
    ? `Normal training is likely to be suitable, with ${preferredPatterns
        .slice(0, 3)
        .join(", ")} forecast to be well recovered.`
    : "Normal training is likely to be suitable if actual readiness remains consistent with the forecast.";
}

export function analyseRecoveryForecast({
  recoveryIntelligence,
  recentTrainingLoad,
  blockWeek,
}: RecoveryForecastInput): RecoveryForecast {
  const phaseAdjustment =
    getPhaseRecoveryAdjustment(blockWeek);

  const projectedScores = Object.fromEntries(
    movementPatterns.map((pattern) => [
      pattern,
      recoveryIntelligence
        .movementSignals[pattern]
        .recoveryScore,
    ]),
  ) as Record<
    MovementPattern,
    number
  >;

  const days: RecoveryForecastDay[] = [];

  let previousExpectedRecoveryScore =
    recoveryIntelligence.overallScore;

  for (
    let dayOffset = 0;
    dayOffset < 7;
    dayOffset += 1
  ) {
    if (dayOffset > 0) {
      for (const pattern of movementPatterns) {
        const loadSignal =
          recentTrainingLoad
            .movementSignals[pattern];

        const decayedPressure = clamp(
          loadSignal.recoveryPressure *
            Math.pow(0.72, dayOffset),
        );

        const dailyGain =
          getDailyRecoveryGain({
            currentScore:
              projectedScores[pattern],
            recoveryPressure:
              decayedPressure,
            phaseAdjustment,
          });

        projectedScores[pattern] = clamp(
          projectedScores[pattern] +
            dailyGain,
        );
      }
    }

    const preferredPatterns =
      movementPatterns
        .filter(
          (pattern) =>
            projectedScores[pattern] >= 70,
        )
        .sort(
          (a, b) =>
            projectedScores[b] -
            projectedScores[a],
        );

    const avoidPatterns =
      movementPatterns.filter(
        (pattern) =>
          projectedScores[pattern] < 45,
      );

    const movementAverage =
      Math.round(
        movementPatterns.reduce(
          (total, pattern) =>
            total +
            projectedScores[pattern],
          0,
        ) / movementPatterns.length,
      );

    const expectedRecoveryScore =
      dayOffset === 0
        ? recoveryIntelligence.overallScore
        : clamp(
            Math.max(
              previousExpectedRecoveryScore,
              movementAverage,
            ),
            previousExpectedRecoveryScore,
            previousExpectedRecoveryScore + 12,
          );

    previousExpectedRecoveryScore =
      expectedRecoveryScore;

    const status =
      dayOffset === 0
        ? recoveryIntelligence.overallStatus
        : getStatus(
            expectedRecoveryScore,
            avoidPatterns.length,
          );

    const demandingTrainingSuitable =
      status === "ready" &&
      avoidPatterns.length === 0;

    const confidence = clamp(
      95 - dayOffset * 3,
      70,
      95,
    );

    days.push({
      dayOffset,
      expectedRecoveryScore,
      status,
      demandingTrainingSuitable,
      preferredPatterns,
      avoidPatterns,
      confidence,
      explanation: getExplanation({
        dayOffset,
        status,
        preferredPatterns,
        avoidPatterns,
      }),
    });
  }

  const firstDemandingDay = days.find(
    (day) =>
      day.demandingTrainingSuitable,
  );

  const summary = firstDemandingDay
    ? firstDemandingDay.dayOffset === 0
      ? "Current signals support demanding training today, subject to how the user actually feels."
      : `Demanding training may become suitable in approximately ${firstDemandingDay.dayOffset} ${
          firstDemandingDay.dayOffset === 1
            ? "day"
            : "days"
        }, provided recovery follows the expected trend.`
    : "The seven-day forecast does not yet strongly support demanding training. Apex should continue reassessing actual recovery each day.";

  return {
    days,
    summary,
  };
}
