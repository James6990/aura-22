import type {
  PersonalisationState,
} from "@/lib/dashboard/build-personalisation-state";

export type ApexMemoryRecord = {
  key: string;
  category: string;
  title: string;
  message: string;
  payload: Record<
    string,
    string | number | boolean | null
  >;
  occurredAt: Date;
};

export type MemoryPattern = {
  id: string;
  category:
    | "consistency"
    | "progression"
    | "recovery"
    | "preference"
    | "learning";
  title: string;
  insight: string;
  confidence: number;
  supportingMemoryKeys: string[];
};

export type MemoryReasoningProfile = {
  patterns: MemoryPattern[];
  strongestPattern: MemoryPattern | null;
  evidenceCount: number;
  confidence: number;
  summary: string;
};

export type AnalyseMemoryPatternsInput = {
  memories: ApexMemoryRecord[];
  personalisation: PersonalisationState;
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

export function analyseMemoryPatterns({
  memories,
  personalisation,
}: AnalyseMemoryPatternsInput): MemoryReasoningProfile {
  const patterns: MemoryPattern[] = [];

  const workoutMemories =
    memories.filter(
      (memory) =>
        memory.category === "workout" ||
        memory.key ===
          "first-workout-completed",
    );

  const progressionMemories =
    memories.filter(
      (memory) =>
        memory.category === "progress",
    );

  if (
    workoutMemories.length > 0 &&
    personalisation.training.confidence >= 50
  ) {
    patterns.push({
      id: "training-consistency",
      category: "consistency",
      title: "Training consistency is forming",
      insight:
        `Your Journey includes ${workoutMemories.length} recorded workout milestone${
          workoutMemories.length === 1
            ? ""
            : "s"
        }, and you have completed ${personalisation.training.completionRate}% of recent planned sessions.`,
      confidence: Math.round(
        clamp(
          (
            personalisation.training.confidence +
            Math.min(
              workoutMemories.length * 10,
              100,
            )
          ) / 2,
        ),
      ),
      supportingMemoryKeys:
        workoutMemories.map(
          (memory) => memory.key,
        ),
    });
  }

  if (
    progressionMemories.length > 0 &&
    personalisation.exercise.confidence >= 50
  ) {
    patterns.push({
      id: "progression-history",
      category: "progression",
      title: "Progression is becoming repeatable",
      insight:
        `${progressionMemories.length} progression milestone${
          progressionMemories.length === 1
            ? " has"
            : "s have"
        } been recorded, with ${personalisation.exercise.progressionReadyExerciseIds.length} recent exercise ${
          personalisation.exercise
            .progressionReadyExerciseIds.length === 1
            ? "opportunity"
            : "opportunities"
        } currently identified.`,
      confidence: Math.round(
        clamp(
          personalisation.exercise.confidence,
        ),
      ),
      supportingMemoryKeys:
        progressionMemories.map(
          (memory) => memory.key,
        ),
    });
  }

  if (
    personalisation.recovery.confidence >= 50 &&
    personalisation.recovery
      .hydrationReadinessDifference !== null &&
    personalisation.recovery
      .hydrationReadinessDifference >= 5
  ) {
    patterns.push({
      id: "hydration-readiness-pattern",
      category: "recovery",
      title: "Hydration may support readiness",
      insight:
        `Recorded readiness has averaged ${personalisation.recovery.hydrationReadinessDifference} points higher on hydrated days.`,
      confidence:
        personalisation.recovery.confidence,
      supportingMemoryKeys: [],
    });
  }

  if (
    personalisation.training.confidence >= 50 &&
    personalisation.training
      .preferredTrainingWindow !== "unknown"
  ) {
    patterns.push({
      id: "preferred-training-window",
      category: "preference",
      title: "A preferred training window is emerging",
      insight:
        `Recent completed sessions most often took place in the ${personalisation.training.preferredTrainingWindow}.`,
      confidence:
        personalisation.training.confidence,
      supportingMemoryKeys: [],
    });
  }

  const sortedPatterns =
    [...patterns].sort(
      (a, b) =>
        b.confidence - a.confidence,
    );

  const evidenceCount =
    memories.length +
    personalisation.exercise
      .exerciseSignals.length +
    personalisation.training
      .totalPlannedSessions +
    personalisation.recovery.recordedDays;

  const confidence = Math.round(
    clamp(
      sortedPatterns.length === 0
        ? 0
        : sortedPatterns.reduce(
            (total, pattern) =>
              total + pattern.confidence,
            0,
          ) / sortedPatterns.length,
    ),
  );

  return {
    patterns: sortedPatterns,
    strongestPattern:
      sortedPatterns[0] ?? null,
    evidenceCount,
    confidence,
    summary:
      sortedPatterns.length === 0
        ? "Apex needs more history before it can identify reliable long-term patterns."
        : `Apex identified ${sortedPatterns.length} evidence-backed pattern${
            sortedPatterns.length === 1
              ? ""
              : "s"
          } across memories and recent behaviour.`,
  };
}
