import type {
  ApexDecisionContext,
} from "@/lib/apex-core/build-apex-decision-context";
import type {
  ApexCoreResult,
} from "@/lib/apex-core/generate-apex-core";

export type ApexDecisionOrchestration = {
  context: ApexDecisionContext;
  core: ApexCoreResult;

  resolvedPriority:
    ApexCoreResult["decision"]["priority"];

  confidence: number;

  consistency: {
    prioritiesAligned: boolean;
    checkedPriorities: string[];
  };

  generatedAt: Date;
};

export type OrchestrateApexDecisionInput = {
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

export function orchestrateApexDecision({
  context,
  core,
}: OrchestrateApexDecisionInput): ApexDecisionOrchestration {
  const checkedPriorities = [
    context.today.coachPriority,
    core.state.todayPriority,
    core.decision.priority,
    core.companion.decision.priority,
  ];

  const prioritiesAligned =
    new Set(checkedPriorities).size === 1;

  if (!prioritiesAligned) {
    throw new Error(
      "Apex Decision Orchestrator detected conflicting priorities.",
    );
  }

  const confidence = Math.round(
    clamp(
      (
        context.evidence.confidence +
        core.state.confidence +
        core.decision.confidence +
        core.companion.decision.confidence
      ) / 4,
    ),
  );

  return {
    context,
    core,
    resolvedPriority:
      core.decision.priority,
    confidence,
    consistency: {
      prioritiesAligned,
      checkedPriorities,
    },
    generatedAt: new Date(),
  };
}
