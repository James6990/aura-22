import {
  buildAdaptiveConfidenceState,
} from "./build-adaptive-confidence-state";
import type {
  DashboardData,
} from "./get-dashboard";
import type {
  MemoryReasoningProfile,
} from "@/lib/memory/analyse-memory-patterns";
import type {
  PersonalisationState,
} from "./build-personalisation-state";

const populatedData = {
  exerciseProgressionHistory: {
    "dumbbell-bench": {
      exerciseId: "dumbbell-bench",
    },
    "cable-row": {
      exerciseId: "cable-row",
    },
    "leg-press": {
      exerciseId: "leg-press",
    },
  },

  readinessHistory: [
    {
      date: "2026-08-01",
      energy: 7,
      readinessScore: 76,
      readinessLevel: "moderate",
      workoutCompleted: true,
      recoveryCompleted: true,
      hydrationTargetReached: true,
    },
    {
      date: "2026-08-02",
      energy: 8,
      readinessScore: 82,
      readinessLevel: "high",
      workoutCompleted: true,
      recoveryCompleted: false,
      hydrationTargetReached: true,
    },
    {
      date: "2026-08-03",
      energy: 6,
      readinessScore: 70,
      readinessLevel: "moderate",
      workoutCompleted: false,
      recoveryCompleted: true,
      hydrationTargetReached: false,
    },
  ],

  apexMemories: [
    {
      id: "memory-1",
      key: "first-workout-completed",
      category: "first",
      title: "First workout completed",
      message: "Your training history began.",
      payload: {
        completedWorkoutCount: 1,
      },
      occurredAt: new Date(
        "2026-07-01T10:00:00Z",
      ),
      celebratedAt: null,
    },
  ],
} as unknown as DashboardData;

const populatedPersonalisation:
  PersonalisationState = {
    exercise: {
      frequentlyCompletedExerciseIds: [
        "dumbbell-bench",
      ],
      progressionReadyExerciseIds: [
        "dumbbell-bench",
        "cable-row",
      ],
      reviewExerciseIds: [],
      discomfortExerciseIds: [],
      exerciseSignals: [
        {
          exerciseId:
            "dumbbell-bench",
          completedAppearances: 5,
          averageRpe: 7,
          averageDiscomfort: 1,
        },
      ],
      confidence: 78,
      summary:
        "Exercise evidence is becoming reliable.",
    },

    training: {
      totalPlannedSessions: 12,
      completedSessions: 10,
      skippedSessions: 2,
      completionRate: 83,
      averageActualDurationMinutes: 46,
      averageSessionRpe: 7,
      preferredIntensity: "moderate",
      preferredTrainingWindow:
        "morning",
      confidence: 82,
      summary:
        "Training behaviour is becoming reliable.",
    },

    recovery: {
      recordedDays: 7,
      averageReadiness: 76,
      averageEnergy: 7,
      readinessStability: 84,
      hydrationAdherence: 71,
      recoveryAdherence: 71,
      hydratedReadinessAverage: 80,
      nonHydratedReadinessAverage: 69,
      hydrationReadinessDifference: 11,
      confidence: 75,
      summary:
        "Recovery behaviour is becoming reliable.",
    },
  };

const populatedMemory:
  MemoryReasoningProfile = {
    patterns: [
      {
        id:
          "hydration-readiness-pattern",
        category: "recovery",
        title:
          "Hydration may support readiness",
        insight:
          "Readiness has averaged 11 points higher on hydrated days.",
        confidence: 75,
        supportingMemoryKeys: [],
      },
      {
        id:
          "preferred-training-window",
        category: "preference",
        title:
          "A preferred training window is emerging",
        insight:
          "Completed sessions most often take place in the morning.",
        confidence: 82,
        supportingMemoryKeys: [],
      },
    ],
    strongestPattern: {
      id:
        "preferred-training-window",
      category: "preference",
      title:
        "A preferred training window is emerging",
      insight:
        "Completed sessions most often take place in the morning.",
      confidence: 82,
      supportingMemoryKeys: [],
    },
    evidenceCount: 20,
    confidence: 79,
    summary:
      "Apex identified two evidence-backed patterns.",
  };

const populated =
  buildAdaptiveConfidenceState({
    data: populatedData,
    personalisation:
      populatedPersonalisation,
    memoryReasoning:
      populatedMemory,
  });

for (const value of [
  populated.progression,
  populated.recovery,
  populated.behaviour,
  populated.memory,
  populated.overall,
]) {
  if (value < 0 || value > 100) {
    throw new Error(
      "Adaptive confidence values must remain between 0 and 100.",
    );
  }
}

if (populated.overall <= 0) {
  throw new Error(
    "Populated athlete evidence should produce positive overall confidence.",
  );
}

if (
  populated.recovery <=
    populated.progression
) {
  throw new Error(
    "The richer recovery evidence should produce stronger confidence than progression.",
  );
}

if (
  populated.strongestDomain !==
    "recovery" &&
  populated.strongestDomain !==
    "behaviour" &&
  populated.strongestDomain !==
    "memory"
) {
  throw new Error(
    `Expected a well-supported domain to be strongest, received ${populated.strongestDomain}.`,
  );
}

const emptyData = {
  exerciseProgressionHistory: {},
  readinessHistory: [],
  apexMemories: [],
} as unknown as DashboardData;

const emptyPersonalisation:
  PersonalisationState = {
    exercise: {
      frequentlyCompletedExerciseIds: [],
      progressionReadyExerciseIds: [],
      reviewExerciseIds: [],
      discomfortExerciseIds: [],
      exerciseSignals: [],
      confidence: 0,
      summary:
        "Apex needs exercise history.",
    },

    training: {
      totalPlannedSessions: 0,
      completedSessions: 0,
      skippedSessions: 0,
      completionRate: 0,
      averageActualDurationMinutes: null,
      averageSessionRpe: null,
      preferredIntensity: null,
      preferredTrainingWindow:
        "unknown",
      confidence: 0,
      summary:
        "Apex needs workout history.",
    },

    recovery: {
      recordedDays: 0,
      averageReadiness: null,
      averageEnergy: null,
      readinessStability: 0,
      hydrationAdherence: 0,
      recoveryAdherence: 0,
      hydratedReadinessAverage: null,
      nonHydratedReadinessAverage: null,
      hydrationReadinessDifference: null,
      confidence: 0,
      summary:
        "Apex needs readiness history.",
    },
  };

const emptyMemory:
  MemoryReasoningProfile = {
    patterns: [],
    strongestPattern: null,
    evidenceCount: 0,
    confidence: 0,
    summary:
      "Apex needs more history.",
  };

const empty =
  buildAdaptiveConfidenceState({
    data: emptyData,
    personalisation:
      emptyPersonalisation,
    memoryReasoning:
      emptyMemory,
  });

if (
  empty.progression !== 0 ||
  empty.recovery !== 0 ||
  empty.behaviour !== 0 ||
  empty.memory !== 0 ||
  empty.overall !== 0
) {
  throw new Error(
    "An empty athlete history should produce zero adaptive confidence.",
  );
}

console.log(
  "Adaptive Confidence State test passed.",
);
