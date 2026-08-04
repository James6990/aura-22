import {
  calculateAdaptiveConfidence,
  type AdaptiveConfidence,
} from "@/lib/apex-core/calculate-adaptive-confidence";
import type {
  DashboardData,
} from "@/lib/dashboard/get-dashboard";
import type {
  MemoryReasoningProfile,
} from "@/lib/memory/analyse-memory-patterns";
import type {
  PersonalisationState,
} from "@/lib/dashboard/build-personalisation-state";

export type BuildAdaptiveConfidenceStateInput = {
  data: DashboardData;
  personalisation: PersonalisationState;
  memoryReasoning: MemoryReasoningProfile;
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

export function buildAdaptiveConfidenceState({
  data,
  personalisation,
  memoryReasoning,
}: BuildAdaptiveConfidenceStateInput): AdaptiveConfidence {
  const progressionSampleSize =
    Object.keys(
      data.exerciseProgressionHistory,
    ).length;

  const recoverySampleSize =
    data.readinessHistory.length;

  const behaviourSampleSize =
    personalisation.training
      .totalPlannedSessions;

  const memorySampleSize =
    memoryReasoning.evidenceCount;

  return calculateAdaptiveConfidence({
    progression: {
      sampleSize:
        progressionSampleSize,
      recencyScore:
        progressionSampleSize > 0
          ? 80
          : 0,
      consistencyScore:
        personalisation.exercise
          .confidence,
      directnessScore:
        clamp(
          personalisation.exercise
            .progressionReadyExerciseIds
            .length * 20,
        ),
    },

    recovery: {
      sampleSize:
        recoverySampleSize,
      recencyScore:
        recoverySampleSize > 0
          ? 90
          : 0,
      consistencyScore:
        personalisation.recovery
          .readinessStability,
      directnessScore:
        personalisation.recovery
          .confidence,
    },

    behaviour: {
      sampleSize:
        behaviourSampleSize,
      recencyScore:
        behaviourSampleSize > 0
          ? 85
          : 0,
      consistencyScore:
        personalisation.training
          .completionRate,
      directnessScore:
        personalisation.training
          .confidence,
    },

    memory: {
      sampleSize:
        memorySampleSize,
      recencyScore:
        data.apexMemories.length > 0
          ? 75
          : 0,
      consistencyScore:
        memoryReasoning.confidence,
      directnessScore:
        memoryReasoning.patterns.length > 0
          ? memoryReasoning.confidence
          : 0,
    },
  });
}
