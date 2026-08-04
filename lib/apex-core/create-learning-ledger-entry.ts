import type {
  EvidenceWeight,
} from "@/lib/apex-core/calculate-evidence-weight";

export type LearningDomain =
  | "progression"
  | "recovery"
  | "training-behaviour"
  | "exercise-preference"
  | "accessibility"
  | "nutrition"
  | "coaching-effectiveness";

export type LearningLedgerStatus =
  | "observing"
  | "provisional"
  | "validated"
  | "challenged"
  | "retired";

export type LearningLedgerSource = {
  sourceType:
    | "behaviour-pattern"
    | "memory-pattern"
    | "decision-outcome"
    | "reflection"
    | "user-confirmation";

  sourceId: string;
  contribution: number;
};

export type LearningLedgerEntry = {
  id: string;
  userId: string;

  domain: LearningDomain;
  key: string;

  title: string;
  conclusion: string;

  status: LearningLedgerStatus;

  confidence: number;
  evidenceLevel:
    EvidenceWeight["level"];

  canInfluenceDecision: boolean;

  sources: LearningLedgerSource[];

  firstObservedAt: Date;
  lastUpdatedAt: Date;

  schemaVersion: number;
};

export type CreateLearningLedgerEntryInput = {
  id: string;
  userId: string;

  domain: LearningDomain;
  key: string;

  title: string;
  conclusion: string;

  evidenceWeight: EvidenceWeight;

  sources: LearningLedgerSource[];

  status?: LearningLedgerStatus;

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
  evidenceWeight: EvidenceWeight,
): LearningLedgerStatus {
  if (
    evidenceWeight.level === "strong" &&
    evidenceWeight.canInfluenceDecision
  ) {
    return "validated";
  }

  if (
    evidenceWeight.level === "moderate" &&
    evidenceWeight.canInfluenceDecision
  ) {
    return "provisional";
  }

  return "observing";
}

export function createLearningLedgerEntry({
  id,
  userId,
  domain,
  key,
  title,
  conclusion,
  evidenceWeight,
  sources,
  status,
  firstObservedAt = new Date(),
  lastUpdatedAt = firstObservedAt,
  schemaVersion = 1,
}: CreateLearningLedgerEntryInput): LearningLedgerEntry {
  const resolvedStatus =
    status ??
    getDefaultStatus(
      evidenceWeight,
    );

  return {
    id:
      id.trim() ||
      "unidentified-learning",

    userId:
      userId.trim(),

    domain,

    key:
      key.trim() ||
      "unspecified-learning",

    title:
      title.trim() ||
      "Emerging Apex learning",

    conclusion:
      conclusion.trim() ||
      "Apex is still evaluating this pattern.",

    status:
      resolvedStatus,

    confidence:
      Math.round(
        clamp(
          evidenceWeight.score,
        ),
      ),

    evidenceLevel:
      evidenceWeight.level,

    canInfluenceDecision:
      evidenceWeight
        .canInfluenceDecision &&
      (
        resolvedStatus === "provisional" ||
        resolvedStatus === "validated"
      ),

    sources:
      sources.map((source) => ({
        ...source,
        sourceId:
          source.sourceId.trim() ||
          "unknown-source",
        contribution:
          Math.round(
            clamp(
              source.contribution,
            ),
          ),
      })),

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
