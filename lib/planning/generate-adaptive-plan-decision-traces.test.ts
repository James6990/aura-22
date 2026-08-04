import {
  generateAdaptivePlan,
} from "./generate-adaptive-plan";

const plan = generateAdaptivePlan({
  primaryGoal: "muscle",
  experienceLevel: "intermediate",
  currentPriority: "recover",
  readinessScore: 42,
  recoveryScore: 38,
  consistencyScore: 70,
  latestWorkoutCompletedAt:
    new Date(
      "2026-08-04T08:00:00.000Z",
    ),
  latestWorkoutRpe: 9,
  latestWorkoutDiscomfort: 2,
  progressionReadyCount: 1,
  recentWorkouts: [
    {
      date: "2026-08-03",
      status: "completed",
      intensity: "High",
      sessionRpe: 9,
    },
  ],
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
});

if (plan.days.length !== 7) {
  throw new Error(
    "Expected seven adaptive-plan days.",
  );
}

for (const day of plan.days) {
  if (!day.decisionTrace) {
    throw new Error(
      "Every adaptive-plan day must carry a decision trace.",
    );
  }

  if (
    day.decisionTrace.confidence < 0 ||
    day.decisionTrace.confidence > 100
  ) {
    throw new Error(
      "Decision-trace confidence must remain between 0 and 100.",
    );
  }

  if (
    day.decisionTrace.reasons.length === 0
  ) {
    throw new Error(
      "Every decision trace must include at least one reason.",
    );
  }
}

const today = plan.days[0];

if (
  today.type !== "recovery" ||
  today.decisionTrace.overriddenBy !==
    "recovery-safety"
) {
  throw new Error(
    "Measured low recovery should create an explicit safety override.",
  );
}

if (
  !today.decisionTrace.reasons.some(
    (reason) =>
      reason.evidenceRuleId ===
      "recovery-respect-current-signals",
  )
) {
  throw new Error(
    "Recovery decisions should link to the recovery evidence rule.",
  );
}

const trainingDay = plan.days.find(
  (day) =>
    day.type === "train" ||
    day.type === "conditioning",
);

if (
  trainingDay &&
  !trainingDay.decisionTrace.reasons.some(
    (reason) =>
      reason.code === "programme-role",
  )
) {
  throw new Error(
    "Programme-aware training days should record programme continuity.",
  );
}

console.log(
  "Adaptive Planning Decision Trace Integration test passed.",
);
