import type {
  MovementPattern,
} from "@/lib/workout/exercise-library";
import type {
  RecentTrainingLoad,
} from "@/lib/workout/analyse-recent-training-load";
import type {
  ExerciseRotationAnalysis,
} from "@/lib/workout/analyse-exercise-rotation";

export type RecoveryStatus =
  | "ready"
  | "caution"
  | "recovering"
  | "avoid-today";

export type MovementRecoverySignal = {
  movementPattern: MovementPattern;
  status: RecoveryStatus;
  recoveryScore: number;
  recoveryPressure: number;
  fatiguedMuscles: string[];
  overworkedMuscles: string[];
  reason: string;
};

export type RecoveryIntelligence = {
  overallStatus: RecoveryStatus;
  overallScore: number;
  movementSignals: Record<
    MovementPattern,
    MovementRecoverySignal
  >;
  preferredPatterns: MovementPattern[];
  cautionPatterns: MovementPattern[];
  recoveringPatterns: MovementPattern[];
  avoidPatterns: MovementPattern[];
  explanation: string;
};

export type AnalyseRecoveryStatusInput = {
  readinessScore: number;
  adaptiveRecoveryScore: number;
  recentTrainingLoad: RecentTrainingLoad;
  exerciseRotation: ExerciseRotationAnalysis;
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

const patternMuscles: Record<
  MovementPattern,
  string[]
> = {
  "horizontal-push": [
    "chest",
    "triceps",
    "front-deltoids",
  ],
  "horizontal-pull": [
    "upper-back",
    "lats",
    "biceps",
    "rear-deltoids",
  ],
  "vertical-push": [
    "shoulders",
    "front-deltoids",
    "triceps",
  ],
  "vertical-pull": [
    "lats",
    "upper-back",
    "biceps",
    "rear-deltoids",
  ],
  squat: [
    "quadriceps",
    "glutes",
    "adductors",
  ],
  hinge: [
    "hamstrings",
    "glutes",
    "lower-back",
  ],
  "single-leg": [
    "quadriceps",
    "glutes",
    "hamstrings",
    "calves",
  ],
  core: [
    "abdominals",
    "obliques",
    "lower-back",
  ],
  cardio: [
    "quadriceps",
    "hamstrings",
    "glutes",
    "calves",
  ],
  mobility: [],
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

function getStatus(
  score: number,
  hasOverworkedMuscle: boolean,
): RecoveryStatus {
  if (
    hasOverworkedMuscle ||
    score < 30
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

function getReason({
  status,
  recoveryPressure,
  fatiguedMuscles,
  overworkedMuscles,
}: {
  status: RecoveryStatus;
  recoveryPressure: number;
  fatiguedMuscles: string[];
  overworkedMuscles: string[];
}) {
  if (status === "avoid-today") {
    if (overworkedMuscles.length > 0) {
      return `Recent fatigue is high in ${overworkedMuscles.join(
        ", ",
      )}. Apex should avoid demanding work for this pattern today.`;
    }

    return "Current readiness, recovery and recent training load do not support demanding work for this pattern today.";
  }

  if (status === "recovering") {
    return fatiguedMuscles.length > 0
      ? `This pattern is still recovering, with fatigue recorded in ${fatiguedMuscles.join(
          ", ",
        )}.`
      : "Recent training pressure suggests this pattern needs additional recovery.";
  }

  if (status === "caution") {
    return recoveryPressure > 40
      ? "This pattern can be trained conservatively, but recent workload suggests avoiding unnecessary volume or intensity."
      : "Overall recovery supports training, although a controlled approach is recommended.";
  }

  return "Current recovery, readiness and recent training history support this movement pattern.";
}

export function analyseRecoveryStatus({
  readinessScore,
  adaptiveRecoveryScore,
  recentTrainingLoad,
  exerciseRotation,
}: AnalyseRecoveryStatusInput): RecoveryIntelligence {
  const readiness =
    clamp(readinessScore);

  const adaptiveRecovery =
    clamp(adaptiveRecoveryScore);

  const movementSignals =
    Object.fromEntries(
      movementPatterns.map(
        (movementPattern) => {
          const loadSignal =
            recentTrainingLoad
              .movementSignals[
              movementPattern
            ];

          const relevantMuscles =
            patternMuscles[
              movementPattern
            ];

          const fatiguedMuscles =
            relevantMuscles.filter(
              (muscle) =>
                exerciseRotation
                  .fatiguedMuscles
                  .includes(muscle),
            );

          const overworkedMuscles =
            relevantMuscles.filter(
              (muscle) =>
                exerciseRotation
                  .overworkedMuscles
                  .includes(muscle),
            );

          const muscleFatiguePenalty =
            fatiguedMuscles.length * 10 +
            overworkedMuscles.length * 22;

          const globalRecovery =
            readiness * 0.45 +
            adaptiveRecovery * 0.55;

          const recoveryScore = clamp(
            Math.round(
              globalRecovery -
                loadSignal
                  .recoveryPressure *
                  0.45 -
                muscleFatiguePenalty,
            ),
          );

          const status = getStatus(
            recoveryScore,
            overworkedMuscles.length > 0,
          );

          const signal:
            MovementRecoverySignal = {
            movementPattern,
            status,
            recoveryScore,
            recoveryPressure:
              loadSignal
                .recoveryPressure,
            fatiguedMuscles,
            overworkedMuscles,
            reason: getReason({
              status,
              recoveryPressure:
                loadSignal
                  .recoveryPressure,
              fatiguedMuscles,
              overworkedMuscles,
            }),
          };

          return [
            movementPattern,
            signal,
          ];
        },
      ),
    ) as Record<
      MovementPattern,
      MovementRecoverySignal
    >;

  const preferredPatterns =
    movementPatterns
      .filter(
        (pattern) =>
          movementSignals[pattern]
            .status === "ready",
      )
      .sort(
        (a, b) =>
          movementSignals[b]
            .recoveryScore -
          movementSignals[a]
            .recoveryScore,
      );

  const cautionPatterns =
    movementPatterns.filter(
      (pattern) =>
        movementSignals[pattern]
          .status === "caution",
    );

  const recoveringPatterns =
    movementPatterns.filter(
      (pattern) =>
        movementSignals[pattern]
          .status === "recovering",
    );

  const avoidPatterns =
    movementPatterns.filter(
      (pattern) =>
        movementSignals[pattern]
          .status === "avoid-today",
    );

  const overallScore = clamp(
    Math.round(
      readiness * 0.45 +
        adaptiveRecoveryScore * 0.55,
    ),
  );

  const overallStatus =
    avoidPatterns.length >= 3 ||
    overallScore < 35
      ? "avoid-today"
      : recoveringPatterns.length >= 3 ||
          overallScore < 55
        ? "recovering"
        : cautionPatterns.length >= 3 ||
            overallScore < 75
          ? "caution"
          : "ready";

  let explanation =
    "Recovery signals support normal goal-focused training.";

  if (
    overallStatus === "avoid-today"
  ) {
    explanation =
      "Current recovery and accumulated fatigue favour recovery-focused or very light activity today.";
  } else if (
    overallStatus === "recovering"
  ) {
    explanation =
      "Several movement patterns are still recovering, so Apex should reduce intensity and favour fresher areas.";
  } else if (
    overallStatus === "caution"
  ) {
    explanation =
      "Training is possible, but recent workload suggests using controlled volume and avoiding unnecessary fatigue.";
  }

  return {
    overallStatus,
    overallScore,
    movementSignals,
    preferredPatterns,
    cautionPatterns,
    recoveringPatterns,
    avoidPatterns,
    explanation,
  };
}
