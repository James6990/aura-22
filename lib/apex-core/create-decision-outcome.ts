import type {
  ApexDecisionRecord,
} from "@/lib/apex-core/create-decision-record";

export type DecisionOutcomeStatus =
  | "positive"
  | "neutral"
  | "negative"
  | "insufficient-data";

export type DecisionOutcomeEvidence = {
  followedRecommendation:
    | "yes"
    | "partially"
    | "no"
    | "unknown";

  readinessChange: number | null;
  recoveryChange: number | null;

  workoutCompleted: boolean | null;
  sessionRpe: number | null;
  discomfortChange: number | null;

  progressionOccurred: boolean | null;
};

export type ApexDecisionOutcome = {
  decisionId: string;
  userId: string;
  decisionPriority:
    ApexDecisionRecord["priority"];

  status: DecisionOutcomeStatus;
  evidence: DecisionOutcomeEvidence;

  evidenceCount: number;
  confidence: number;

  occurredAt: Date;
  schemaVersion: number;

  summary: string;
};

export type CreateDecisionOutcomeInput = {
  decision: ApexDecisionRecord;
  evidence: DecisionOutcomeEvidence;
  occurredAt?: Date;
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

function countEvidence(
  evidence: DecisionOutcomeEvidence,
) {
  return [
    evidence.followedRecommendation !==
      "unknown",
    evidence.readinessChange !== null,
    evidence.recoveryChange !== null,
    evidence.workoutCompleted !== null,
    evidence.sessionRpe !== null,
    evidence.discomfortChange !== null,
    evidence.progressionOccurred !== null,
  ].filter(Boolean).length;
}

function calculateOutcomeStatus(
  evidence: DecisionOutcomeEvidence,
  evidenceCount: number,
): DecisionOutcomeStatus {
  if (evidenceCount < 2) {
    return "insufficient-data";
  }

  let score = 0;

  if (
    evidence.followedRecommendation ===
    "yes"
  ) {
    score += 1;
  } else if (
    evidence.followedRecommendation ===
    "no"
  ) {
    score -= 1;
  }

  if (
    evidence.readinessChange !== null
  ) {
    score +=
      evidence.readinessChange >= 5
        ? 1
        : evidence.readinessChange <= -5
          ? -1
          : 0;
  }

  if (
    evidence.recoveryChange !== null
  ) {
    score +=
      evidence.recoveryChange >= 5
        ? 1
        : evidence.recoveryChange <= -5
          ? -1
          : 0;
  }

  if (
    evidence.workoutCompleted === true
  ) {
    score += 1;
  } else if (
    evidence.workoutCompleted === false
  ) {
    score -= 1;
  }

  if (
    evidence.discomfortChange !== null
  ) {
    score +=
      evidence.discomfortChange <= -2
        ? 1
        : evidence.discomfortChange >= 2
          ? -1
          : 0;
  }

  if (
    evidence.progressionOccurred === true
  ) {
    score += 1;
  }

  if (score >= 2) {
    return "positive";
  }

  if (score <= -2) {
    return "negative";
  }

  return "neutral";
}

export function createDecisionOutcome({
  decision,
  evidence,
  occurredAt = new Date(),
  schemaVersion = 1,
}: CreateDecisionOutcomeInput): ApexDecisionOutcome {
  const evidenceCount =
    countEvidence(evidence);

  const status =
    calculateOutcomeStatus(
      evidence,
      evidenceCount,
    );

  const confidence = Math.round(
    clamp(
      evidenceCount * 12 +
        (
          evidence.followedRecommendation ===
          "unknown"
            ? 0
            : 8
        ),
    ),
  );

  return {
    decisionId: decision.id,
    userId: decision.userId,
    decisionPriority:
      decision.priority,

    status,
    evidence: {
      ...evidence,
    },

    evidenceCount,
    confidence,

    occurredAt,

    schemaVersion: Math.max(
      1,
      Math.floor(schemaVersion),
    ),

    summary:
      status === "positive"
        ? "The recorded outcome supports this decision."
        : status === "negative"
          ? "The recorded outcome suggests this decision should be reviewed."
          : status === "neutral"
            ? "The recorded outcome is mixed or unchanged."
            : "There is not yet enough outcome evidence to evaluate this decision.",
  };
}
