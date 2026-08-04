import {
  createDecisionTrace,
  type DecisionReason,
  type DecisionTrace,
} from "./create-decision-trace";
import type {
  ApexDecisionOrchestration,
} from "./orchestrate-apex-decision";
import type {
  ApexReasoningState,
} from "./build-apex-reasoning-state";
import {
  evidenceRegistryVersion,
} from "@/lib/evidence/evidence-registry";

export type ApexReasoningTraceSnapshot = {
  tone: ApexReasoningState["tone"];

  evidenceSufficient: boolean;
  requiresMoreEvidence: boolean;

  strongestDomain:
    ApexReasoningState["strongestDomain"];

  weakestDomain:
    ApexReasoningState["weakestDomain"];

  prioritiesAligned: boolean;
  checkedPriorities: string[];

  summary: string;
};

export type ApexReasoningDecisionTrace = {
  trace: DecisionTrace;
  reasoning:
    ApexReasoningTraceSnapshot;
};

export type BuildApexReasoningTraceInput = {
  decisionId: string;

  orchestration:
    ApexDecisionOrchestration;

  reasoning:
    ApexReasoningState;

  createdAt?: Date;
};

function toSupportingReason(
  detail: string,
  index: number,
): DecisionReason {
  return {
    code:
      `reasoning-support-${index + 1}`,
    label: "Supporting evidence",
    detail,
    influence: "positive",
    evidenceRuleId: null,
    evidenceStrength: null,
  };
}

function toCautionReason(
  detail: string,
  index: number,
): DecisionReason {
  return {
    code:
      `reasoning-caution-${index + 1}`,
    label: "Caution signal",
    detail,
    influence:
      detail.toLowerCase().includes(
        "elevated fatigue risk",
      )
        ? "strong-negative"
        : "negative",
    evidenceRuleId:
      detail.toLowerCase().includes(
        "recovery",
      ) ||
      detail.toLowerCase().includes(
        "fatigue",
      )
        ? "recovery-respect-current-signals"
        : null,
    evidenceStrength:
      detail.toLowerCase().includes(
        "recovery",
      ) ||
      detail.toLowerCase().includes(
        "fatigue",
      )
        ? "strong"
        : null,
  };
}

export function buildApexReasoningTrace({
  decisionId,
  orchestration,
  reasoning,
  createdAt = new Date(),
}: BuildApexReasoningTraceInput): ApexReasoningDecisionTrace {
  if (
    reasoning.priority !==
    orchestration.resolvedPriority
  ) {
    throw new Error(
      "Reasoning priority does not match the orchestrated decision.",
    );
  }

  const reasons: DecisionReason[] = [
    ...reasoning.supportingReasons.map(
      toSupportingReason,
    ),
    ...reasoning.cautionReasons.map(
      toCautionReason,
    ),
  ];

  if (reasons.length === 0) {
    reasons.push({
      code:
        "reasoning-no-specific-signals",
      label: "Decision context",
      detail:
        "Apex did not record any additional supporting or caution signals.",
      influence: "neutral",
      evidenceRuleId: null,
      evidenceStrength: null,
    });
  }

  const trace =
    createDecisionTrace({
      decisionId,
      decisionType:
        "apex-coaching",
      outcome:
        orchestration
          .resolvedPriority,
      confidence:
        reasoning.confidence,
      reasons,
      overriddenBy:
        reasoning.evidenceSufficient
          ? null
          : "insufficient-personal-evidence",
      evidenceRegistryVersion,
      createdAt,
    });

  return {
    trace,

    reasoning: {
      tone: reasoning.tone,

      evidenceSufficient:
        reasoning.evidenceSufficient,

      requiresMoreEvidence:
        reasoning.requiresMoreEvidence,

      strongestDomain:
        reasoning.strongestDomain,

      weakestDomain:
        reasoning.weakestDomain,

      prioritiesAligned:
        orchestration.consistency
          .prioritiesAligned,

      checkedPriorities: [
        ...orchestration.consistency
          .checkedPriorities,
      ],

      summary:
        reasoning.summary,
    },
  };
}
