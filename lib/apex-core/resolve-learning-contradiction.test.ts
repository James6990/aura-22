import {
  calculateEvidenceWeight,
} from "./calculate-evidence-weight";
import {
  createLearningLedgerEntry,
  type LearningLedgerEntry,
} from "./create-learning-ledger-entry";
import {
  detectLearningContradictions,
  type LearningContradiction,
} from "./detect-learning-contradictions";
import {
  resolveLearningContradiction,
} from "./resolve-learning-contradiction";

function createLearning({
  id,
  userId = "user-1",
  key,
  confidenceLevel,
}: {
  id: string;
  userId?: string;
  key: string;
  confidenceLevel:
    | "moderate"
    | "strong";
}): LearningLedgerEntry {
  const evidenceWeight =
    confidenceLevel === "strong"
      ? calculateEvidenceWeight({
          sampleSize: 64,
          recencyScore: 95,
          consistencyScore: 92,
          directnessScore: 94,
        })
      : calculateEvidenceWeight({
          sampleSize: 18,
          recencyScore: 80,
          consistencyScore: 72,
          directnessScore: 82,
        });

  return createLearningLedgerEntry({
    id,
    userId,
    domain: "training-behaviour",
    key,
    title: key,
    conclusion:
      `Apex has learned ${key}.`,
    evidenceWeight,
    sources: [
      {
        sourceType:
          "behaviour-pattern",
        sourceId:
          `${id}-source`,
        contribution:
          evidenceWeight.score,
      },
    ],
  });
}

const strongerLearning =
  createLearning({
    id: "learning-strong",
    key: "preferred-training-window",
    confidenceLevel: "strong",
  });

const weakerLearning =
  createLearning({
    id: "learning-weak",
    key: "preferred-training-window",
    confidenceLevel: "moderate",
  });

const preferAContradiction =
  detectLearningContradictions({
    learningA: strongerLearning,
    learningB: weakerLearning,
  });

const preferA =
  resolveLearningContradiction({
    contradiction:
      preferAContradiction,
    learningA: strongerLearning,
    learningB: weakerLearning,
  });

if (
  preferA.action !== "prefer-a" ||
  preferA.preferredLearningId !==
    strongerLearning.id ||
  preferA.challengedLearningIds
    .join(",") !== weakerLearning.id ||
  preferA.requiresHumanReview ||
  preferA.requiresMoreEvidence
) {
  throw new Error(
    "A stronger first learning should be preferred while the weaker learning is challenged.",
  );
}

const preferBContradiction =
  detectLearningContradictions({
    learningA: weakerLearning,
    learningB: strongerLearning,
  });

const preferB =
  resolveLearningContradiction({
    contradiction:
      preferBContradiction,
    learningA: weakerLearning,
    learningB: strongerLearning,
  });

if (
  preferB.action !== "prefer-b" ||
  preferB.preferredLearningId !==
    strongerLearning.id ||
  preferB.challengedLearningIds
    .join(",") !== weakerLearning.id
) {
  throw new Error(
    "A stronger second learning should be preferred while the weaker first learning is challenged.",
  );
}

const equallyStrongLearning =
  createLearning({
    id: "learning-equal",
    key: "preferred-training-window",
    confidenceLevel: "strong",
  });

const reviewContradiction =
  detectLearningContradictions({
    learningA: strongerLearning,
    learningB: equallyStrongLearning,
  });

const review =
  resolveLearningContradiction({
    contradiction:
      reviewContradiction,
    learningA: strongerLearning,
    learningB:
      equallyStrongLearning,
  });

if (
  review.action !== "challenge-both" ||
  review.preferredLearningId !== null ||
  review.challengedLearningIds.length !== 2 ||
  !review.requiresHumanReview ||
  !review.requiresMoreEvidence
) {
  throw new Error(
    "Equal-confidence contradictory learnings should both be challenged for review.",
  );
}

const durationLearning =
  createLearning({
    id: "learning-duration",
    key: "preferred-session-duration",
    confidenceLevel: "strong",
  });

const overlapContradiction =
  detectLearningContradictions({
    learningA: strongerLearning,
    learningB: durationLearning,
  });

const moreEvidence =
  resolveLearningContradiction({
    contradiction:
      overlapContradiction,
    learningA: strongerLearning,
    learningB: durationLearning,
  });

if (
  moreEvidence.action !==
    "request-more-evidence" ||
  moreEvidence.preferredLearningId !==
    null ||
  moreEvidence.requiresHumanReview ||
  !moreEvidence.requiresMoreEvidence
) {
  throw new Error(
    "Related same-domain learnings should request more evidence without challenging either conclusion.",
  );
}

const recoveryLearning =
  createLearningLedgerEntry({
    id: "learning-recovery",
    userId: "user-1",
    domain: "recovery",
    key: "hydration-readiness",
    title:
      "Hydration supports readiness",
    conclusion:
      "Hydrated days appear to support readiness.",
    evidenceWeight:
      calculateEvidenceWeight({
        sampleSize: 64,
        recencyScore: 95,
        consistencyScore: 92,
        directnessScore: 94,
      }),
    sources: [
      {
        sourceType:
          "behaviour-pattern",
        sourceId:
          "recovery-source",
        contribution: 90,
      },
    ],
  });

const safeContradiction =
  detectLearningContradictions({
    learningA: strongerLearning,
    learningB: recoveryLearning,
  });

const retainBoth =
  resolveLearningContradiction({
    contradiction:
      safeContradiction,
    learningA: strongerLearning,
    learningB: recoveryLearning,
  });

if (
  retainBoth.action !==
    "retain-both" ||
  retainBoth.preferredLearningId !==
    null ||
  retainBoth.requiresHumanReview ||
  retainBoth.requiresMoreEvidence ||
  retainBoth.confidence !== 100
) {
  throw new Error(
    "Unrelated learnings should safely remain active.",
  );
}

const retireContradiction:
  LearningContradiction = {
    learningAId:
      strongerLearning.id,
    learningBId:
      weakerLearning.id,
    contradictionScore: 95,
    recommendation:
      "retire-both",
    explanation:
      "Both conclusions are no longer reliable.",
  };

const retireBoth =
  resolveLearningContradiction({
    contradiction:
      retireContradiction,
    learningA: strongerLearning,
    learningB: weakerLearning,
  });

if (
  retireBoth.action !==
    "retire-both" ||
  retireBoth.retiredLearningIds
    .join(",") !==
    `${strongerLearning.id},${weakerLearning.id}` ||
  !retireBoth.requiresHumanReview ||
  retireBoth.requiresMoreEvidence
) {
  throw new Error(
    "An explicit retire-both contradiction should retire both learnings.",
  );
}

let invalidReferenceRejected =
  false;

try {
  resolveLearningContradiction({
    contradiction: {
      ...preferAContradiction,
      learningAId:
        "incorrect-learning-id",
    },
    learningA: strongerLearning,
    learningB: weakerLearning,
  });
} catch {
  invalidReferenceRejected = true;
}

if (!invalidReferenceRejected) {
  throw new Error(
    "Contradictions with invalid learning references should be rejected.",
  );
}

const otherUserLearning =
  createLearning({
    id: "learning-other-user",
    userId: "user-2",
    key: "preferred-training-window",
    confidenceLevel: "strong",
  });

let crossUserRejected = false;

try {
  resolveLearningContradiction({
    contradiction: {
      learningAId:
        strongerLearning.id,
      learningBId:
        otherUserLearning.id,
      contradictionScore: 90,
      recommendation: "review",
      explanation:
        "Invalid cross-user contradiction.",
    },
    learningA: strongerLearning,
    learningB:
      otherUserLearning,
  });
} catch {
  crossUserRejected = true;
}

if (!crossUserRejected) {
  throw new Error(
    "Cross-user knowledge resolution should be rejected.",
  );
}

for (const result of [
  preferA,
  preferB,
  review,
  moreEvidence,
  retainBoth,
  retireBoth,
]) {
  if (
    result.confidence < 0 ||
    result.confidence > 100
  ) {
    throw new Error(
      "Knowledge-resolution confidence must remain between 0 and 100.",
    );
  }

  if (!result.explanation.trim()) {
    throw new Error(
      "Every knowledge-resolution plan should include an explanation.",
    );
  }
}

console.log(
  "Knowledge Resolution Engine test passed.",
);
