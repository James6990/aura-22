import type {
  LearningLedgerEntry,
} from "./create-learning-ledger-entry";

export type LearningContradiction = {
  learningAId: string;
  learningBId: string;

  contradictionScore: number;

  recommendation:
    | "keep-both"
    | "prefer-a"
    | "prefer-b"
    | "review"
    | "retire-both";

  explanation: string;
};

export type DetectLearningContradictionsInput = {
  learningA: LearningLedgerEntry;
  learningB: LearningLedgerEntry;
};

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

export function detectLearningContradictions({
  learningA,
  learningB,
}: DetectLearningContradictionsInput): LearningContradiction {
  const sameDomain =
    learningA.domain ===
    learningB.domain;

  const sameKey =
    learningA.key ===
    learningB.key;

  const contradictionScore =
    sameDomain && sameKey
      ? 90
      : sameDomain
        ? 60
        : 0;

  let recommendation:
    LearningContradiction["recommendation"] =
      "keep-both";

  if (contradictionScore >= 80) {
    if (
      learningA.confidence >
      learningB.confidence
    ) {
      recommendation = "prefer-a";
    } else if (
      learningB.confidence >
      learningA.confidence
    ) {
      recommendation = "prefer-b";
    } else {
      recommendation = "review";
    }
  }

  return {
    learningAId: learningA.id,
    learningBId: learningB.id,

    contradictionScore:
      clamp(contradictionScore),

    recommendation,

    explanation:
      contradictionScore === 0
        ? "No contradiction detected."
        : "Potential contradiction detected between learned conclusions.",
  };
}
