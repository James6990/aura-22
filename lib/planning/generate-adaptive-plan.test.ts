import { generateAdaptivePlan } from "./generate-adaptive-plan";

const plan = generateAdaptivePlan({
  primaryGoal: "muscle",
  experienceLevel: "intermediate",
  currentPriority: "recover",
  readinessScore: 48,
  recoveryScore: 44,
  consistencyScore: 70,
  latestWorkoutCompletedAt: new Date(),
  latestWorkoutRpe: 9,
  latestWorkoutDiscomfort: 1,
  progressionReadyCount: 2,
  recentWorkouts: [
    {
      date: "2026-08-02",
      status: "completed",
      intensity: "High",
      sessionRpe: 9,
    },
    {
      date: "2026-08-01",
      status: "skipped",
      intensity: "Moderate",
      sessionRpe: null,
    },
  ],
  availableTrainingDays: 3,
});

if (plan.days.length !== 7) {
  throw new Error(
    "Adaptive plan must contain seven days.",
  );
}

if (plan.days[0].type !== "recovery") {
  throw new Error(
    "Recovery priority must produce a recovery-focused first day.",
  );
}

if (!plan.missedSessionsRedistributed) {
  throw new Error(
    "Skipped sessions should trigger redistribution.",
  );
}

if (
  plan.days.some(
    (day, index) =>
      day.type === "train" &&
      plan.days[index - 1]?.type === "train",
  )
) {
  throw new Error(
    "Demanding training days must not be stacked together.",
  );
}

console.log(
  "Adaptive Planning Engine test passed.",
);
