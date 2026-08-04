import type {
  ApexDecisionOrchestration,
} from "@/lib/apex-core/orchestrate-apex-decision";

export type CoachingEvidenceSummary = {
  rulesetVersion: string;
  confidence: number;
  prioritiesAligned: boolean;
  coreReasons: string[];
  personalisedReasons: string[];
};

export type ApexCoachingState = {
  priority: ApexDecisionOrchestration["resolvedPriority"];
  confidence: number;
  headline: string;
  nextAction: string;
  explanation: string;
  personalisedReasons: string[];
  evidenceSummary: CoachingEvidenceSummary;
  generatedAt: Date;
};

function getPersonalisedReasons(
  orchestration: ApexDecisionOrchestration,
) {
  const personalisation =
    orchestration.context.intelligence
      .personalisation;

  if (!personalisation) {
    return [];
  }

  const reasons: string[] = [];

  if (
    personalisation.training.confidence >= 50
  ) {
    reasons.push(
      `You have completed ${personalisation.training.completionRate}% of your recent planned sessions.`,
    );

    if (
      personalisation.training
        .preferredTrainingWindow !==
      "unknown"
    ) {
      reasons.push(
        `Your recent completed sessions most often took place in the ${personalisation.training.preferredTrainingWindow}.`,
      );
    }
  }

  if (
    personalisation.recovery.confidence >= 50 &&
    personalisation.recovery
      .hydrationReadinessDifference !== null &&
    Math.abs(
      personalisation.recovery
        .hydrationReadinessDifference,
    ) >= 5
  ) {
    const difference =
      personalisation.recovery
        .hydrationReadinessDifference;

    reasons.push(
      difference > 0
        ? `Your recorded readiness has averaged ${difference} points higher on hydrated days.`
        : `Your current history does not yet show hydration improving readiness, so Apex will keep learning this pattern.`,
    );
  }

  if (
    personalisation.exercise.confidence >= 50 &&
    personalisation.exercise
      .discomfortExerciseIds.length > 0
  ) {
    reasons.push(
      `${personalisation.exercise.discomfortExerciseIds.length} recent exercise pattern${
        personalisation.exercise
          .discomfortExerciseIds.length === 1
          ? ""
          : "s"
      } will be treated cautiously because of recorded discomfort.`,
    );
  }

  return reasons.slice(0, 3);
}

export function buildApexCoachingState(
  orchestration: ApexDecisionOrchestration,
): ApexCoachingState {
  const personalisedReasons =
    getPersonalisedReasons(orchestration);

  const evidenceSummary: CoachingEvidenceSummary = {
    rulesetVersion:
      orchestration.context.evidence
        .rulesetVersion,
    confidence:
      orchestration.confidence,
    prioritiesAligned:
      orchestration.consistency
        .prioritiesAligned,
    coreReasons: [
      ...orchestration.core.decision
        .reasons,
    ],
    personalisedReasons: [
      ...personalisedReasons,
    ],
  };

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
    personalisedReasons,
    evidenceSummary,
    generatedAt:
      orchestration.generatedAt,
  };
}
