import type {
  LearningLedgerEntry,
} from "@/lib/apex-core/create-learning-ledger-entry";

export type KnowledgeRelationshipType =
  | "supports"
  | "contributes-to"
  | "correlates-with"
  | "contradicts"
  | "supersedes"
  | "depends-on";

export type KnowledgeRelationshipStatus =
  | "observing"
  | "provisional"
  | "validated"
  | "challenged"
  | "retired";

export type KnowledgeRelationship = {
  id: string;
  userId: string;

  sourceLearningId: string;
  targetLearningId: string;

  type: KnowledgeRelationshipType;
  status: KnowledgeRelationshipStatus;

  confidence: number;
  canInfluenceDecision: boolean;

  explanation: string;
  supportingSourceIds: string[];

  firstObservedAt: Date;
  lastUpdatedAt: Date;

  schemaVersion: number;
};

export type CreateKnowledgeRelationshipInput = {
  id: string;
  userId: string;

  source: LearningLedgerEntry;
  target: LearningLedgerEntry;

  type: KnowledgeRelationshipType;
  confidence: number;

  explanation: string;
  supportingSourceIds?: string[];

  status?: KnowledgeRelationshipStatus;

  firstObservedAt?: Date;
  lastUpdatedAt?: Date;

  schemaVersion?: number;
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

function getDefaultStatus(
  confidence: number,
): KnowledgeRelationshipStatus {
  if (confidence >= 80) {
    return "validated";
  }

  if (confidence >= 55) {
    return "provisional";
  }

  return "observing";
}

export function createKnowledgeRelationship({
  id,
  userId,
  source,
  target,
  type,
  confidence,
  explanation,
  supportingSourceIds = [],
  status,
  firstObservedAt = new Date(),
  lastUpdatedAt = firstObservedAt,
  schemaVersion = 1,
}: CreateKnowledgeRelationshipInput): KnowledgeRelationship {
  if (source.id === target.id) {
    throw new Error(
      "A knowledge relationship cannot connect a learning entry to itself.",
    );
  }

  if (
    source.userId !== target.userId ||
    source.userId !== userId.trim()
  ) {
    throw new Error(
      "Knowledge relationships must connect learning entries belonging to the same user.",
    );
  }

  const resolvedConfidence =
    Math.round(
      clamp(confidence),
    );

  const resolvedStatus =
    status ??
    getDefaultStatus(
      resolvedConfidence,
    );

  const sourceCanInfluence =
    source.canInfluenceDecision;

  const targetCanInfluence =
    target.canInfluenceDecision;

  return {
    id:
      id.trim() ||
      "unidentified-knowledge-relationship",

    userId:
      userId.trim(),

    sourceLearningId:
      source.id,

    targetLearningId:
      target.id,

    type,
    status:
      resolvedStatus,

    confidence:
      resolvedConfidence,

    canInfluenceDecision:
      resolvedConfidence >= 55 &&
      (
        resolvedStatus === "provisional" ||
        resolvedStatus === "validated"
      ) &&
      sourceCanInfluence &&
      targetCanInfluence,

    explanation:
      explanation.trim() ||
      "Apex is still evaluating this relationship.",

    supportingSourceIds:
      [
        ...new Set(
          supportingSourceIds
            .map(
              (sourceId) =>
                sourceId.trim(),
            )
            .filter(Boolean),
        ),
      ],

    firstObservedAt,
    lastUpdatedAt,

    schemaVersion:
      Math.max(
        1,
        Math.floor(
          schemaVersion,
        ),
      ),
  };
}
