import type {
  LearningLedgerEntry,
} from "./create-learning-ledger-entry";
import type {
  LearningContradiction,
} from "./detect-learning-contradictions";

export type KnowledgeResolutionAction =
  | "retain-both"
  | "prefer-a"
  | "prefer-b"
  | "challenge-both"
  | "retire-both"
  | "request-more-evidence";

export type KnowledgeResolutionPlan = {
  action: KnowledgeResolutionAction;

  preferredLearningId: string | null;
  challengedLearningIds: string[];
  retiredLearningIds: string[];

  confidence: number;
  requiresHumanReview: boolean;
  requiresMoreEvidence: boolean;

  explanation: string;
};

export type ResolveLearningContradictionInput = {
  contradiction: LearningContradiction;
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

export function resolveLearningContradiction({
  contradiction,
  learningA,
  learningB,
}: ResolveLearningContradictionInput): KnowledgeResolutionPlan {
  if (
    contradiction.learningAId !==
      learningA.id ||
    contradiction.learningBId !==
      learningB.id
  ) {
    throw new Error(
      "Contradiction references do not match the supplied learning entries.",
    );
  }

  if (
    learningA.userId !== learningB.userId
  ) {
    throw new Error(
      "Knowledge resolution cannot combine learning entries from different users.",
    );
  }

  const confidenceGap =
    Math.abs(
      learningA.confidence -
        learningB.confidence,
    );

  if (
    contradiction.recommendation ===
    "prefer-a"
  ) {
    return {
      action: "prefer-a",
      preferredLearningId:
        learningA.id,
      challengedLearningIds: [
        learningB.id,
      ],
      retiredLearningIds: [],
      confidence: Math.round(
        clamp(
          contradiction
            .contradictionScore *
            0.6 +
            confidenceGap * 0.4,
        ),
      ),
      requiresHumanReview: false,
      requiresMoreEvidence: false,
      explanation:
        "Learning A has stronger supporting confidence and should be preferred while Learning B is challenged.",
    };
  }

  if (
    contradiction.recommendation ===
    "prefer-b"
  ) {
    return {
      action: "prefer-b",
      preferredLearningId:
        learningB.id,
      challengedLearningIds: [
        learningA.id,
      ],
      retiredLearningIds: [],
      confidence: Math.round(
        clamp(
          contradiction
            .contradictionScore *
            0.6 +
            confidenceGap * 0.4,
        ),
      ),
      requiresHumanReview: false,
      requiresMoreEvidence: false,
      explanation:
        "Learning B has stronger supporting confidence and should be preferred while Learning A is challenged.",
    };
  }

  if (
    contradiction.recommendation ===
    "retire-both"
  ) {
    return {
      action: "retire-both",
      preferredLearningId: null,
      challengedLearningIds: [],
      retiredLearningIds: [
        learningA.id,
        learningB.id,
      ],
      confidence:
        contradiction
          .contradictionScore,
      requiresHumanReview: true,
      requiresMoreEvidence: false,
      explanation:
        "Both learnings should be retired because the contradiction cannot be resolved safely.",
    };
  }

  if (
    contradiction.recommendation ===
    "review"
  ) {
    return {
      action: "challenge-both",
      preferredLearningId: null,
      challengedLearningIds: [
        learningA.id,
        learningB.id,
      ],
      retiredLearningIds: [],
      confidence:
        contradiction
          .contradictionScore,
      requiresHumanReview: true,
      requiresMoreEvidence: true,
      explanation:
        "Both learnings have similar confidence and should be challenged until more evidence is available.",
    };
  }

  if (
    contradiction.contradictionScore >=
    50
  ) {
    return {
      action:
        "request-more-evidence",
      preferredLearningId: null,
      challengedLearningIds: [],
      retiredLearningIds: [],
      confidence:
        contradiction
          .contradictionScore,
      requiresHumanReview: false,
      requiresMoreEvidence: true,
      explanation:
        "The learnings may conflict, but the current evidence is not strong enough to prefer or challenge either conclusion.",
    };
  }

  return {
    action: "retain-both",
    preferredLearningId: null,
    challengedLearningIds: [],
    retiredLearningIds: [],
    confidence: Math.round(
      clamp(
        100 -
          contradiction
            .contradictionScore,
      ),
    ),
    requiresHumanReview: false,
    requiresMoreEvidence: false,
    explanation:
      "The learnings can safely remain active because no meaningful contradiction was detected.",
  };
}
