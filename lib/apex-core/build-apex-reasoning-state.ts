import type {
  ApexDecisionContext,
} from "./build-apex-decision-context";
import type {
  ApexCoreResult,
} from "./generate-apex-core";

export type ApexReasoningTone =
  | "decisive"
  | "measured"
  | "cautious"
  | "observational";

export type ApexReasoningState = {
  priority:
    ApexCoreResult["decision"]["priority"];

  confidence: number;
  tone: ApexReasoningTone;

  evidenceSufficient: boolean;
  requiresMoreEvidence: boolean;

  strongestDomain:
    | "progression"
    | "recovery"
    | "behaviour"
    | "memory"
    | null;

  weakestDomain:
    | "progression"
    | "recovery"
    | "behaviour"
    | "memory"
    | null;

  supportingReasons: string[];
  cautionReasons: string[];

  summary: string;
};

export type BuildApexReasoningStateInput = {
  context: ApexDecisionContext;
  core: ApexCoreResult;
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

function getTone(
  confidence: number,
  evidenceSufficient: boolean,
): ApexReasoningTone {
  if (!evidenceSufficient) {
    return confidence >= 35
      ? "cautious"
      : "observational";
  }

  if (confidence >= 80) {
    return "decisive";
  }

  if (confidence >= 60) {
    return "measured";
  }

  return "cautious";
}

export function buildApexReasoningState({
  context,
  core,
}: BuildApexReasoningStateInput): ApexReasoningState {
  const adaptiveConfidence =
    context.intelligence
      .adaptiveConfidence;

  const confidenceInputs = [
    context.evidence.confidence,
    core.state.confidence,
    core.decision.confidence,
    core.companion.decision
      .confidence,
  ];

  if (adaptiveConfidence) {
    confidenceInputs.push(
      adaptiveConfidence.overall,
    );
  }

  const confidence = Math.round(
    clamp(
      confidenceInputs.reduce(
        (total, value) =>
          total + value,
        0,
      ) / confidenceInputs.length,
    ),
  );

  const supportingReasons = [
    ...core.decision.reasons,
  ];

  const cautionReasons: string[] = [];

  if (
    context.today.readinessScore < 50
  ) {
    cautionReasons.push(
      `Readiness is currently ${Math.round(
        context.today.readinessScore,
      )}/100.`,
    );
  }

  if (
    context.today.recoveryScore < 50
  ) {
    cautionReasons.push(
      `Recovery is currently ${Math.round(
        context.today.recoveryScore,
      )}/100.`,
    );
  }

  const elevatedForecastRisk =
    context.intelligence
      .recoveryForecast.days
      .slice(0, 3)
      .some(
        (day) =>
          day.status === "avoid-today" ||
          day.status === "recovering",
      );

  if (elevatedForecastRisk) {
    cautionReasons.push(
      "The current recovery forecast indicates elevated fatigue risk.",
    );
  }

  if (
    adaptiveConfidence &&
    adaptiveConfidence.overall < 50
  ) {
    cautionReasons.push(
      "Apex is still building enough personal evidence to make highly confident recommendations.",
    );
  }

  if (
    adaptiveConfidence &&
    adaptiveConfidence[
      adaptiveConfidence.weakestDomain
    ] < 35
  ) {
    cautionReasons.push(
      `Confidence in the ${adaptiveConfidence.weakestDomain} domain remains low.`,
    );
  }

  const evidenceSufficient =
    confidence >= 50 &&
    (
      adaptiveConfidence === undefined ||
      adaptiveConfidence.overall >= 35
    );

  const requiresMoreEvidence =
    !evidenceSufficient ||
    cautionReasons.some(
      (reason) =>
        reason.includes(
          "still building enough personal evidence",
        ),
    );

  const tone = getTone(
    confidence,
    evidenceSufficient,
  );

  return {
    priority:
      core.decision.priority,

    confidence,
    tone,

    evidenceSufficient,
    requiresMoreEvidence,

    strongestDomain:
      adaptiveConfidence
        ?.strongestDomain ?? null,

    weakestDomain:
      adaptiveConfidence
        ?.weakestDomain ?? null,

    supportingReasons: [
      ...new Set(
        supportingReasons,
      ),
    ],

    cautionReasons: [
      ...new Set(
        cautionReasons,
      ),
    ],

    summary:
      tone === "decisive"
        ? "Apex has strong evidence supporting today’s coaching direction."
        : tone === "measured"
          ? "Apex has enough evidence to guide today’s decision carefully."
          : tone === "cautious"
            ? "Apex can offer cautious guidance while continuing to gather evidence."
            : "Apex is still observing this pattern and should avoid firm conclusions.",
  };
}
