import {
  calculateEvidenceWeight,
} from "./calculate-evidence-weight";
import {
  createLearningLedgerEntry,
} from "./create-learning-ledger-entry";
import {
  validateLearningLedgerEntry,
} from "./validate-learning-ledger-entry";

const learning =
  createLearningLedgerEntry({
    id: "learning-1",
    userId: "user-1",
    domain: "recovery",
    key: "hydration-readiness",
    title:
      "Hydration may support readiness",
    conclusion:
      "Readiness appears higher on hydrated days.",
    evidenceWeight:
      calculateEvidenceWeight({
        sampleSize: 18,
        recencyScore: 82,
        consistencyScore: 76,
        directnessScore: 84,
      }),
    sources: [
      {
        sourceType:
          "behaviour-pattern",
        sourceId:
          "recovery-pattern-1",
        contribution: 72,
      },
    ],
  });

const strengthened =
  validateLearningLedgerEntry({
    learning,
    supportingEvidence: 5,
    contradictingEvidence: 1,
    latestConfidence: 70,
  });

if (
  strengthened.status !==
    "strengthened" ||
  strengthened.recommendedStatus !==
    "validated" ||
  !strengthened
    .canContinueInfluencingDecisions
) {
  throw new Error(
    "Strong supporting evidence should validate and strengthen learning.",
  );
}

if (
  strengthened.confidenceDelta !== 16
) {
  throw new Error(
    `Expected strengthened confidence delta 16, received ${strengthened.confidenceDelta}.`,
  );
}

const confirmed =
  validateLearningLedgerEntry({
    learning,
    supportingEvidence: 3,
    contradictingEvidence: 2,
    latestConfidence: 70,
  });

if (
  confirmed.status !== "confirmed" ||
  confirmed.recommendedStatus !==
    learning.status ||
  confirmed
    .canContinueInfluencingDecisions !==
    learning.canInfluenceDecision
) {
  throw new Error(
    "Slightly supportive evidence should preserve the current learning state.",
  );
}

if (confirmed.confidenceDelta !== 4) {
  throw new Error(
    `Expected confirmed confidence delta 4, received ${confirmed.confidenceDelta}.`,
  );
}

const weakened =
  validateLearningLedgerEntry({
    learning,
    supportingEvidence: 2,
    contradictingEvidence: 2,
    latestConfidence: 70,
  });

if (
  weakened.status !== "weakened" ||
  weakened.recommendedStatus !==
    "provisional" ||
  weakened.canContinueInfluencingDecisions
) {
  throw new Error(
    "Mixed evidence should weaken learning and prevent decision influence.",
  );
}

if (weakened.confidenceDelta !== 0) {
  throw new Error(
    `Expected weakened confidence delta 0, received ${weakened.confidenceDelta}.`,
  );
}

const challenged =
  validateLearningLedgerEntry({
    learning,
    supportingEvidence: 1,
    contradictingEvidence: 3,
    latestConfidence: 70,
  });

if (
  challenged.status !== "challenged" ||
  challenged.recommendedStatus !==
    "challenged" ||
  challenged.canContinueInfluencingDecisions
) {
  throw new Error(
    "Contradictory evidence should challenge learning and stop decision influence.",
  );
}

if (
  challenged.confidenceDelta !== -8
) {
  throw new Error(
    `Expected challenged confidence delta -8, received ${challenged.confidenceDelta}.`,
  );
}

const retired =
  validateLearningLedgerEntry({
    learning,
    supportingEvidence: 0,
    contradictingEvidence: 4,
    latestConfidence: 70,
  });

if (
  retired.status !== "retired" ||
  retired.recommendedStatus !==
    "retired" ||
  retired.canContinueInfluencingDecisions
) {
  throw new Error(
    "Repeated contradictory evidence should retire learning.",
  );
}

if (retired.confidenceDelta !== -16) {
  throw new Error(
    `Expected retired confidence delta -16, received ${retired.confidenceDelta}.`,
  );
}

const clamped =
  validateLearningLedgerEntry({
    learning,
    supportingEvidence: 20,
    contradictingEvidence: 0,
    latestConfidence: 95,
  });

if (clamped.confidenceDelta !== 5) {
  throw new Error(
    "Validation confidence should clamp at 100.",
  );
}

for (const result of [
  strengthened,
  confirmed,
  weakened,
  challenged,
  retired,
  clamped,
]) {
  if (!result.explanation.trim()) {
    throw new Error(
      "Every learning validation result should include an explanation.",
    );
  }
}

console.log(
  "Learning Ledger Validation test passed.",
);
