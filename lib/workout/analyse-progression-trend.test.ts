import { analyseProgressionTrend } from "./analyse-progression-trend";

const now = new Date(
  "2026-08-04T10:00:00.000Z",
);

const strongTrend =
  analyseProgressionTrend({
    latestDecision: {
      decision: "increase",
      recommendedNextLoadKg: 41,
      reason: "Strong latest result.",
    },
    history: [
      {
        loadKg: 40,
        plannedSets: 3,
        completedSets: 3,
        rpe: 7,
        discomfortLevel: 0,
        techniqueConfidence: 85,
        completedAt: now,
      },
      {
        loadKg: 40,
        plannedSets: 3,
        completedSets: 3,
        rpe: 7,
        discomfortLevel: 1,
        techniqueConfidence: 82,
        completedAt: new Date(
          "2026-08-01T10:00:00.000Z",
        ),
      },
    ],
  });

if (
  strongTrend.route !== "increase-load"
) {
  throw new Error(
    "Repeated successful sessions should support a small load increase.",
  );
}

const singleSuccess =
  analyseProgressionTrend({
    latestDecision: {
      decision: "increase",
      recommendedNextLoadKg: 41,
      reason: "Strong latest result.",
    },
    history: [
      {
        loadKg: 40,
        plannedSets: 3,
        completedSets: 3,
        rpe: 7,
        discomfortLevel: 0,
        techniqueConfidence: 85,
        completedAt: now,
      },
    ],
  });

if (
  singleSuccess.route !==
  "increase-repetitions"
) {
  throw new Error(
    "One successful session should progress repetitions before load.",
  );
}

const techniqueTrend =
  analyseProgressionTrend({
    latestDecision: {
      decision: "maintain",
      recommendedNextLoadKg: 40,
      reason: "Maintain.",
    },
    history: [
      {
        loadKg: 40,
        plannedSets: 3,
        completedSets: 3,
        rpe: 7,
        discomfortLevel: 0,
        techniqueConfidence: 50,
        completedAt: now,
      },
      {
        loadKg: 40,
        plannedSets: 3,
        completedSets: 3,
        rpe: 7,
        discomfortLevel: 0,
        techniqueConfidence: 55,
        completedAt: new Date(
          "2026-08-01T10:00:00.000Z",
        ),
      },
    ],
  });

if (
  techniqueTrend.route !==
  "technique-focus"
) {
  throw new Error(
    "Repeated low technique confidence should prioritise technique.",
  );
}

console.log(
  "Progression Trend Engine test passed.",
);

const discomfortOverride =
  analyseProgressionTrend({
    latestDecision: {
      decision: "review",
      recommendedNextLoadKg: 36,
      reason: "High discomfort.",
    },
    history: [
      {
        loadKg: 40,
        plannedSets: 3,
        completedSets: 3,
        rpe: 6,
        discomfortLevel: 7,
        techniqueConfidence: 85,
        completedAt: now,
      },
      {
        loadKg: 40,
        plannedSets: 3,
        completedSets: 3,
        rpe: 7,
        discomfortLevel: 0,
        techniqueConfidence: 85,
        completedAt: new Date(
          "2026-08-01T10:00:00.000Z",
        ),
      },
    ],
  });

if (
  discomfortOverride.route !== "review" ||
  discomfortOverride.decision !== "review"
) {
  throw new Error(
    "Immediate safety decisions must override positive historical progression.",
  );
}
