import type {
  EvidenceStrength,
} from "@/lib/evidence/evidence-registry";

export type DecisionInfluence =
  | "strong-positive"
  | "positive"
  | "neutral"
  | "negative"
  | "strong-negative";

export type DecisionReason = {
  code: string;
  label: string;
  detail: string;
  influence: DecisionInfluence;
  evidenceRuleId: string | null;
  evidenceStrength: EvidenceStrength | null;
};

export type DecisionTrace = {
  decisionId: string;
  decisionType: string;
  outcome: string;
  confidence: number;
  reasons: DecisionReason[];
  overriddenBy: string | null;
  evidenceRegistryVersion: string;
  createdAt: Date;
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

export function createDecisionTrace({
  decisionId,
  decisionType,
  outcome,
  confidence,
  reasons,
  overriddenBy = null,
  evidenceRegistryVersion,
  createdAt = new Date(),
}: {
  decisionId: string;
  decisionType: string;
  outcome: string;
  confidence: number;
  reasons: DecisionReason[];
  overriddenBy?: string | null;
  evidenceRegistryVersion: string;
  createdAt?: Date;
}): DecisionTrace {
  return {
    decisionId:
      decisionId.trim() ||
      "unidentified-decision",
    decisionType:
      decisionType.trim() ||
      "unknown",
    outcome:
      outcome.trim() ||
      "unknown",
    confidence: clamp(confidence),
    reasons: reasons.map((reason) => ({
      ...reason,
      code:
        reason.code.trim() ||
        "unspecified",
      label:
        reason.label.trim() ||
        "Decision factor",
      detail:
        reason.detail.trim() ||
        "No additional detail was recorded.",
    })),
    overriddenBy:
      overriddenBy?.trim() || null,
    evidenceRegistryVersion:
      evidenceRegistryVersion.trim() ||
      "unversioned",
    createdAt,
  };
}
