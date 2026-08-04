import {
  analyseMemoryPatterns,
} from "./analyse-memory-patterns";

const profile =
  analyseMemoryPatterns({
    memories: [
      {
        key: "first-workout-completed",
        category: "first",
        title: "First workout completed",
        message:
          "Your training history began.",
        payload: {
          completedWorkoutCount: 1,
        },
        occurredAt: new Date(
          "2026-07-01T10:00:00Z",
        ),
      },
      {
        key: "workouts-completed-10",
        category: "workout",
        title: "10 workouts completed",
        message:
          "Consistency is becoming part of your story.",
        payload: {
          completedWorkoutCount: 10,
          milestone: 10,
        },
        occurredAt: new Date(
          "2026-08-01T10:00:00Z",
        ),
      },
      {
        key:
          "first-progression-ready-exercise",
        category: "progress",
        title:
          "First progression opportunity",
        message:
          "A progression opportunity was identified.",
        payload: {
          progressionReadyCount: 1,
        },
        occurredAt: new Date(
          "2026-08-02T10:00:00Z",
        ),
      },
    ],

    personalisation: {
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
            completedAppearances: 4,
            averageRpe: 7.5,
            averageDiscomfort: 1,
          },
        ],
        confidence: 80,
        summary:
          "Exercise preferences are becoming reliable.",
      },

      training: {
        totalPlannedSessions: 10,
        completedSessions: 8,
        skippedSessions: 2,
        completionRate: 80,
        averageActualDurationMinutes: 45,
        averageSessionRpe: 7,
        preferredIntensity: "moderate",
        preferredTrainingWindow:
          "morning",
        confidence: 80,
        summary:
          "Training behaviour is becoming reliable.",
      },

      recovery: {
        recordedDays: 7,
        averageReadiness: 74,
        averageEnergy: 7,
        readinessStability: 80,
        hydrationAdherence: 71,
        recoveryAdherence: 71,
        hydratedReadinessAverage: 79,
        nonHydratedReadinessAverage: 68,
        hydrationReadinessDifference: 11,
        confidence: 70,
        summary:
          "Recovery behaviour is becoming reliable.",
      },
    },
  });

if (profile.patterns.length !== 4) {
  throw new Error(
    `Expected four memory patterns, received ${profile.patterns.length}.`,
  );
}

if (
  profile.strongestPattern?.id !==
  "progression-history"
) {
  throw new Error(
    `Expected progression history to be the strongest pattern, received ${profile.strongestPattern?.id ?? "none"}.`,
  );
}

if (
  !profile.patterns.some(
    (pattern) =>
      pattern.id ===
      "progression-history" &&
      pattern.insight.includes(
        "2 recent exercise opportunities",
      ),
  )
) {
  throw new Error(
    "Expected correctly worded progression evidence.",
  );
}

if (
  !profile.patterns.some(
    (pattern) =>
      pattern.id ===
      "hydration-readiness-pattern",
  )
) {
  throw new Error(
    "Expected hydration-readiness pattern.",
  );
}

if (
  !profile.patterns.some(
    (pattern) =>
      pattern.id ===
      "preferred-training-window",
  )
) {
  throw new Error(
    "Expected preferred training-window pattern.",
  );
}

if (profile.evidenceCount !== 21) {
  throw new Error(
    `Expected evidence count 21, received ${profile.evidenceCount}.`,
  );
}

if (
  profile.confidence <= 0 ||
  profile.confidence > 100
) {
  throw new Error(
    "Memory-reasoning confidence must remain between 1 and 100.",
  );
}

console.log(
  "Memory Reasoning Engine test passed.",
);
