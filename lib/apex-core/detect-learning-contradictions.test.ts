import {
  calculateEvidenceWeight,
} from "./calculate-evidence-weight";
import {
  createLearningLedgerEntry,
  type LearningLedgerEntry,
} from "./create-learning-ledger-entry";
import {
  detectLearningContradictions,
} from "./detect-learning-contradictions";

function createLearning({
  id,
  domain,
  key,
  confidenceLevel,
}: {
  id: string;
  domain: LearningLedgerEntry["domain"];
  key: string;
  confidenceLevel:
    | "moderate"
    | "strong";
}) {
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
    userId: "user-1",
    domain,
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

const strongerMorning =
  createLearning({
    id: "learning-morning",
    domain: "training-behaviour",
    key: "preferred-training-window",
    confidenceLevel: "strong",
  });

const weakerEvening =
  createLearning({
    id: "learning-evening",
    domain: "training-behaviour",
    key: "preferred-training-window",
    confidenceLevel: "moderate",
  });

const preferA =
  detectLearningContradictions({
    learningA: strongerMorning,
    learningB: weakerEvening,
  });

if (
  preferA.contradictionScore !== 90 ||
  preferA.recommendation !== "prefer-a"
) {
  throw new Error(
    "A stronger learning with the same domain and key should be preferred.",
  );
}

const preferB =
  detectLearningContradictions({
    learningA: weakerEvening,
    learningB: strongerMorning,
  });

if (
  preferB.contradictionScore !== 90 ||
  preferB.recommendation !== "prefer-b"
) {
  throw new Error(
    "The stronger second learning should be preferred.",
  );
}

const equallyStrongMorning =
  createLearning({
    id: "learning-morning-equal",
    domain: "training-behaviour",
    key: "preferred-training-window",
    confidenceLevel: "strong",
  });

const review =
  detectLearningContradictions({
    learningA: strongerMorning,
    learningB: equallyStrongMorning,
  });

if (
  review.contradictionScore !== 90 ||
  review.recommendation !== "review"
) {
  throw new Error(
    "Equal-confidence learnings with the same key should require review.",
  );
}

const sameDomainDifferentKey =
  createLearning({
    id: "learning-duration",
    domain: "training-behaviour",
    key: "preferred-session-duration",
    confidenceLevel: "strong",
  });

const domainOverlap =
  detectLearningContradictions({
    learningA: strongerMorning,
    learningB: sameDomainDifferentKey,
  });

if (
  domainOverlap.contradictionScore !== 60 ||
  domainOverlap.recommendation !==
    "keep-both"
) {
  throw new Error(
    "Same-domain learnings with different keys should be flagged as related but retained.",
  );
}

const recoveryLearning =
  createLearning({
    id: "learning-recovery",
    domain: "recovery",
    key: "hydration-readiness",
    confidenceLevel: "strong",
  });

const noContradiction =
  detectLearningContradictions({
    learningA: strongerMorning,
    learningB: recoveryLearning,
  });

if (
  noContradiction.contradictionScore !==
    0 ||
  noContradiction.recommendation !==
    "keep-both" ||
  noContradiction.explanation !==
    "No contradiction detected."
) {
  throw new Error(
    "Different learning domains should not be treated as contradictory.",
  );
}

for (const result of [
  preferA,
  preferB,
  review,
  domainOverlap,
  noContradiction,
]) {
  if (
    result.contradictionScore < 0 ||
    result.contradictionScore > 100
  ) {
    throw new Error(
      "Contradiction scores must remain between 0 and 100.",
    );
  }

  if (!result.explanation.trim()) {
    throw new Error(
      "Every contradiction result should include an explanation.",
    );
  }
}

console.log(
  "Learning Contradiction Detection test passed.",
);
