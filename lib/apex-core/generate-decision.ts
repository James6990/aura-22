import type {
  CoachDecision,
  CoachPriority,
} from "@/lib/companion/generate-coach-decision";

export type ApexDecision = {
  priority: CoachPriority;
  confidence: number;
  reasons: string[];
  nextBestAction: string;
  supportingSignals: {
    readinessScore: number;
    recovery: number;
    consistency: number;
    currentStreak: number;
  };
};

export type GenerateDecisionInput = {
  readinessScore: number;
  currentStreak: number;
  recovery: number;
  consistency: number;
  coachDecision: CoachDecision;
};

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function generateDecision({
  readinessScore,
  currentStreak,
  recovery,
  consistency,
  coachDecision,
}: GenerateDecisionInput): ApexDecision {
  const reasons = [...coachDecision.reasons];

  if (
    readinessScore < 60 &&
    !reasons.some((reason) =>
      reason.toLowerCase().includes("readiness"),
    )
  ) {
    reasons.push(
      `Readiness is currently ${Math.round(
        readinessScore,
      )}%.`,
    );
  }

  if (
    recovery < 50 &&
    !reasons.some((reason) =>
      reason.toLowerCase().includes("recovery"),
    )
  ) {
    reasons.push(
      `Adaptive recovery is currently ${Math.round(
        recovery,
      )}%.`,
    );
  }

  if (
    consistency >= 80 &&
    !reasons.some((reason) =>
      reason.toLowerCase().includes("consistency"),
    )
  ) {
    reasons.push(
      "Your recent consistency remains a strength.",
    );
  }

  if (
    currentStreak >= 7 &&
    !reasons.some((reason) =>
      reason.toLowerCase().includes("streak"),
    )
  ) {
    reasons.push(
      `Your current streak is ${currentStreak} days.`,
    );
  }

  return {
    priority: coachDecision.priority,
    confidence: clamp(
      coachDecision.confidence,
    ),
    reasons: Array.from(new Set(reasons)),
    nextBestAction: coachDecision.action,
    supportingSignals: {
      readinessScore: clamp(readinessScore),
      recovery: clamp(recovery),
      consistency: clamp(consistency),
      currentStreak,
    },
  };
}
