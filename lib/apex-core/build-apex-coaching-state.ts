import type {
  ApexDecisionOrchestration,
} from "@/lib/apex-core/orchestrate-apex-decision";

export type ApexCoachingState = {
  priority: ApexDecisionOrchestration["resolvedPriority"];
  confidence: number;
  headline: string;
  nextAction: string;
  explanation: string;
  generatedAt: Date;
};

export function buildApexCoachingState(
  orchestration: ApexDecisionOrchestration,
): ApexCoachingState {
  return {
    priority: orchestration.resolvedPriority,
    confidence: orchestration.confidence,
    headline:
      orchestration.core.companion.todayFocus,
    nextAction:
      orchestration.core.decision.nextBestAction,
    explanation:
      orchestration.core.decision.reasons[0] ??
      "Apex selected today's coaching focus.",
    generatedAt:
      orchestration.generatedAt,
  };
}
