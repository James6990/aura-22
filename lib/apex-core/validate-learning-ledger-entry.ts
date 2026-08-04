import type {
  LearningLedgerEntry,
} from "./create-learning-ledger-entry";

export type LearningValidationResult = {
  status:
    | "confirmed"
    | "strengthened"
    | "weakened"
    | "challenged"
    | "retired";

  confidenceDelta: number;

  recommendedStatus:
    LearningLedgerEntry["status"];

  canContinueInfluencingDecisions: boolean;

  explanation: string;
};

export type ValidateLearningLedgerInput = {
  learning: LearningLedgerEntry;

  supportingEvidence: number;

  contradictingEvidence: number;

  latestConfidence: number;
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

export function validateLearningLedgerEntry({
  learning,
  supportingEvidence,
  contradictingEvidence,
  latestConfidence,
}: ValidateLearningLedgerInput): LearningValidationResult {
  const delta =
    supportingEvidence -
    contradictingEvidence;

  const newConfidence =
    clamp(
      latestConfidence + delta * 4,
    );

  if (delta >= 3) {
    return {
      status: "strengthened",
      confidenceDelta:
        newConfidence -
        latestConfidence,
      recommendedStatus:
        "validated",
      canContinueInfluencingDecisions: true,
      explanation:
        "Recent evidence strengthened this learning.",
    };
  }

  if (delta >= 1) {
    return {
      status: "confirmed",
      confidenceDelta:
        newConfidence -
        latestConfidence,
      recommendedStatus:
        learning.status,
      canContinueInfluencingDecisions:
        learning.canInfluenceDecision,
      explanation:
        "Recent evidence continues to support this learning.",
    };
  }

  if (delta <= -3) {
    return {
      status: "retired",
      confidenceDelta:
        newConfidence -
        latestConfidence,
      recommendedStatus:
        "retired",
      canContinueInfluencingDecisions: false,
      explanation:
        "Repeated contradictory evidence retired this learning.",
    };
  }

  if (delta <= -1) {
    return {
      status: "challenged",
      confidenceDelta:
        newConfidence -
        latestConfidence,
      recommendedStatus:
        "challenged",
      canContinueInfluencingDecisions: false,
      explanation:
        "Recent evidence challenges this learning.",
    };
  }

  return {
    status: "weakened",
    confidenceDelta:
      newConfidence -
      latestConfidence,
    recommendedStatus:
      "provisional",
    canContinueInfluencingDecisions: false,
    explanation:
      "Evidence is currently mixed.",
  };
}
