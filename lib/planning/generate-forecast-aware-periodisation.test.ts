import {
  generateAdaptivePlan,
} from "./generate-adaptive-plan";
import type {
  RecoveryForecast,
} from "@/lib/workout/analyse-recovery-forecast";

const recoveryForecast: RecoveryForecast = {
  summary:
    "Demanding training should become suitable in two days.",
  days: [
    {
      dayOffset: 0,
      expectedRecoveryScore: 42,
      status: "recovering",
      demandingTrainingSuitable: false,
      preferredPatterns: ["core", "mobility"],
      avoidPatterns: [
        "horizontal-push",
        "vertical-push",
      ],
      confidence: 95,
      explanation:
        "Pressing patterns are still recovering.",
    },
    {
      dayOffset: 1,
      expectedRecoveryScore: 55,
      status: "caution",
      demandingTrainingSuitable: false,
      preferredPatterns: [
        "horizontal-pull",
        "core",
      ],
      avoidPatterns: [
        "horizontal-push",
        "vertical-push",
      ],
      confidence: 92,
      explanation:
        "Pulling work may be suitable, but pressing still needs time.",
    },
    {
      dayOffset: 2,
      expectedRecoveryScore: 73,
      status: "ready",
      demandingTrainingSuitable: true,
      preferredPatterns: [
        "horizontal-pull",
        "horizontal-push",
        "squat",
      ],
      avoidPatterns: [],
      confidence: 89,
      explanation:
        "Normal training is likely to be suitable.",
    },
    ...Array.from(
      { length: 4 },
      (_, index) => ({
        dayOffset: index + 3,
        expectedRecoveryScore: 78 + index,
        status: "ready" as const,
        demandingTrainingSuitable: true,
        preferredPatterns: [
          "horizontal-push" as const,
          "horizontal-pull" as const,
          "squat" as const,
        ],
        avoidPatterns: [],
        confidence: 86 - index * 3,
        explanation:
          "Normal training is forecast to be suitable.",
      }),
    ),
  ],
};

const plan = generateAdaptivePlan({
  primaryGoal: "muscle",
  experienceLevel: "intermediate",
  currentPriority: "train",
  readinessScore: 48,
  recoveryScore: 44,
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
  recoveryForecast,
});

if (plan.days[0]?.type !== "recovery") {
  throw new Error(
    "Measured low recovery should protect today.",
  );
}

if (plan.days[1]?.title === "Push") {
  throw new Error(
    "A push session must remain postponed while forecast pressing patterns are avoided.",
  );
}

const pushDay = plan.days.find(
  (day) => day.title === "Push",
);

if (!pushDay || pushDay.dayOffset < 2) {
  throw new Error(
    "The postponed Push session should return on a later forecast-ready day.",
  );
}

const orderedTitles = plan.days
  .filter(
    (day) =>
      day.type === "train" ||
      day.type === "conditioning",
  )
  .map((day) => day.title);

if (
  orderedTitles[0] !== "Push" ||
  orderedTitles[1] !== "Pull"
) {
  throw new Error(
    "Postponement must preserve programme order.",
  );
}

console.log(
  "Forecast-Aware Periodisation test passed.",
);
