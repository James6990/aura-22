import type {
  ApexDecisionOrchestration,
} from "@/lib/apex-core/orchestrate-apex-decision";
import type {
  ApexCoachingState,
} from "@/lib/apex-core/build-apex-coaching-state";

export type DecisionRecordStatus =
  | "issued"
  | "accepted"
  | "partially-followed"
  | "completed"
  | "declined"
  | "expired";

export type ApexDecisionRecord = {
  id: string;
  userId: string;

  decisionType: string;
  priority:
    ApexDecisionOrchestration["resolvedPriority"];

  recommendation: string;
  explanation: string;

  confidence: number;
  rulesetVersion: string;

  coreReasons: string[];
  personalisedReasons: string[];

  status: DecisionRecordStatus;

  issuedAt: Date;
  validUntil: Date | null;

  schemaVersion: number;
};

export type CreateDecisionRecordInput = {
  id: string;
  userId: string;
  decisionType: string;

  orchestration:
    ApexDecisionOrchestration;

  coachingState:
    ApexCoachingState;

  status?: DecisionRecordStatus;
  issuedAt?: Date;
  validUntil?: Date | null;
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

export function createDecisionRecord({
  id,
  userId,
  decisionType,
  orchestration,
  coachingState,
  status = "issued",
  issuedAt = new Date(),
  validUntil = null,
  schemaVersion = 1,
}: CreateDecisionRecordInput): ApexDecisionRecord {
  return {
    id:
      id.trim() ||
      "unidentified-decision-record",

    userId: userId.trim(),

    decisionType:
      decisionType.trim() ||
      "coaching",

    priority:
      orchestration.resolvedPriority,

    recommendation:
      coachingState.nextAction.trim(),

    explanation:
      coachingState.explanation.trim(),

    confidence: Math.round(
      clamp(
        coachingState.confidence,
      ),
    ),

    rulesetVersion:
      coachingState.evidenceSummary
        .rulesetVersion.trim() ||
      "unversioned",

    coreReasons: [
      ...coachingState.evidenceSummary
        .coreReasons,
    ],

    personalisedReasons: [
      ...coachingState.evidenceSummary
        .personalisedReasons,
    ],

    status,
    issuedAt,
    validUntil,

    schemaVersion: Math.max(
      1,
      Math.floor(schemaVersion),
    ),
  };
}
