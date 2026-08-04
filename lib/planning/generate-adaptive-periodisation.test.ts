import {
  generateAdaptivePlan,
} from "./generate-adaptive-plan";
import {
  analyseRecentTrainingLoad,
} from "@/lib/workout/analyse-recent-training-load";
import {
  analyseExerciseRotation,
} from "@/lib/workout/analyse-exercise-rotation";
import {
  analyseRecoveryStatus,
} from "@/lib/workout/analyse-recovery-status";

const now = new Date(
  "2026-08-04T10:00:00.000Z",
);

const performances = [
  {
    exerciseId:
      "machine-chest-press",
    completedAt: new Date(
      "2026-08-04T02:00:00.000Z",
    ),
    completedSets: 4,
    rpe: 9,
    discomfortLevel: 5,
  },
];

const recentTrainingLoad =
  analyseRecentTrainingLoad(
    performances,
    now,
  );

const exerciseRotation =
  analyseExerciseRotation(
    performances,
    now,
  );

const recoveryIntelligence =
  analyseRecoveryStatus({
    readinessScore: 65,
    adaptiveRecoveryScore: 60,
    recentTrainingLoad,
    exerciseRotation,
  });

const plan = generateAdaptivePlan({
  primaryGoal: "muscle",
  experienceLevel: "intermediate",
  currentPriority: "train",
  readinessScore: 65,
  recoveryScore: 60,
  consistencyScore: 75,
  latestWorkoutCompletedAt: null,
  latestWorkoutRpe: null,
  latestWorkoutDiscomfort: 0,
  progressionReadyCount: 1,
  recentWorkouts: [],
  availableTrainingDays: 3,
  programmeSessions: [
    {
      order: 1,
      role: "push",
      title: "Push",
      purpose:
        "Develop pressing strength.",
      optional: false,
    },
    {
      order: 2,
      role: "pull",
      title: "Pull",
      purpose:
        "Develop pulling strength.",
      optional: false,
    },
    {
      order: 3,
      role: "legs",
      title: "Legs",
      purpose:
        "Develop lower-body strength.",
      optional: false,
    },
  ],
  completedProgrammeSessions: 0,
  recoveryIntelligence,
});

if (plan.days.length !== 7) {
  throw new Error(
    "Adaptive periodisation must return seven days.",
  );
}

const trainingTitles =
  plan.days
    .filter(
      (day) =>
        day.type === "train" ||
        day.type === "conditioning",
    )
    .map((day) => day.title);

if (
  trainingTitles.includes("Push") &&
  plan.days[0]?.title === "Push"
) {
  throw new Error(
    "A recovery-conflicting push session should not be forced today.",
  );
}

if (
  !trainingTitles.includes("Pull") &&
  !trainingTitles.includes("Legs")
) {
  throw new Error(
    "The plan should preserve suitable programme roles.",
  );
}

if (
  plan.days.some(
    (day, index) =>
      (
        day.type === "train" ||
        day.type === "conditioning"
      ) &&
      (
        plan.days[index - 1]?.type ===
          "train" ||
        plan.days[index - 1]?.type ===
          "conditioning"
      ),
  )
) {
  throw new Error(
    "Demanding programme sessions must not be stacked.",
  );
}

console.log(
  "Adaptive Periodisation Integration test passed.",
);
