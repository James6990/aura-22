import {
  createDecisionOutcome,
} from "./create-decision-outcome";
import type {
  ApexDecisionRecord,
} from "./create-decision-record";

const decision: ApexDecisionRecord = {
  id: "decision-1",
  userId: "user-1",
  decisionType: "daily-coaching",
  priority: "train",
  recommendation:
    "Complete a moderate training session.",
  explanation:
    "Readiness and recovery support training.",
  confidence: 80,
  rulesetVersion: "apex-rules-v1",
  coreReasons: [
    "Readiness is supportive.",
  ],
  personalisedReasons: [],
  status: "completed",
  issuedAt: new Date(
    "2026-08-03T10:00:00Z",
  ),
  validUntil: null,
  schemaVersion: 1,
};

const positive =
  createDecisionOutcome({
    decision,
    evidence: {
      followedRecommendation: "yes",
      readinessChange: 6,
      recoveryChange: 5,
      workoutCompleted: true,
      sessionRpe: 7,
      discomfortChange: -2,
      progressionOccurred: true,
    },
  });

if (positive.status !== "positive") {
  throw new Error(
    "Expected positive outcome evidence.",
  );
}

if (positive.evidenceCount !== 7) {
  throw new Error(
    `Expected seven evidence fields, received ${positive.evidenceCount}.`,
  );
}

const negative =
  createDecisionOutcome({
    decision,
    evidence: {
      followedRecommendation: "yes",
      readinessChange: -8,
      recoveryChange: -6,
      workoutCompleted: false,
      sessionRpe: 10,
      discomfortChange: 3,
      progressionOccurred: false,
    },
  });

if (negative.status !== "negative") {
  throw new Error(
    "Expected negative outcome evidence.",
  );
}

const neutral =
  createDecisionOutcome({
    decision,
    evidence: {
      followedRecommendation: "partially",
      readinessChange: 1,
      recoveryChange: 0,
      workoutCompleted: true,
      sessionRpe: 7,
      discomfortChange: 0,
      progressionOccurred: false,
    },
  });

if (neutral.status !== "neutral") {
  throw new Error(
    "Expected mixed evidence to remain neutral.",
  );
}

const insufficient =
  createDecisionOutcome({
    decision,
    evidence: {
      followedRecommendation: "unknown",
      readinessChange: null,
      recoveryChange: null,
      workoutCompleted: null,
      sessionRpe: 7,
      discomfortChange: null,
      progressionOccurred: null,
    },
  });

if (
  insufficient.status !==
  "insufficient-data"
) {
  throw new Error(
    "Expected one isolated signal to be insufficient.",
  );
}

for (const outcome of [
  positive,
  negative,
  neutral,
  insufficient,
]) {
  if (
    outcome.decisionId !== decision.id ||
    outcome.userId !== decision.userId ||
    outcome.decisionPriority !==
      decision.priority
  ) {
    throw new Error(
      "Outcome should remain linked to its decision.",
    );
  }

  if (
    outcome.confidence < 0 ||
    outcome.confidence > 100
  ) {
    throw new Error(
      "Outcome confidence must remain between 0 and 100.",
    );
  }

  if (!outcome.summary.trim()) {
    throw new Error(
      "Every outcome should include a summary.",
    );
  }

  if (outcome.schemaVersion !== 1) {
    throw new Error(
      "Outcome schema version should default to one.",
    );
  }
}

console.log(
  "Apex Decision Outcome test passed.",
);
