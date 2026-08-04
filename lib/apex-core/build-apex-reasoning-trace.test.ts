import {
  buildApexDecisionContext,
} from "./build-apex-decision-context";
import {
  buildApexReasoningState,
} from "./build-apex-reasoning-state";
import {
  buildApexReasoningTrace,
} from "./build-apex-reasoning-trace";
import {
  generateApexCore,
} from "./generate-apex-core";
import {
  orchestrateApexDecision,
} from "./orchestrate-apex-decision";
import {
  generateProgrammeStructure,
} from "@/lib/planning/generate-programme-structure";
import {
  generateTrainingBlock,
} from "@/lib/planning/generate-training-block";
import {
  analyseExerciseRotation,
} from "@/lib/workout/analyse-exercise-rotation";
import {
  analyseRecentTrainingLoad,
} from "@/lib/workout/analyse-recent-training-load";
import {
  analyseRecoveryForecast,
} from "@/lib/workout/analyse-recovery-forecast";
import {
  analyseRecoveryStatus,
} from "@/lib/workout/analyse-recovery-status";

function createScenario({
  readinessScore,
  recoveryScore,
  evidenceConfidence,
  adaptiveOverall,
}: {
  readinessScore: number;
  recoveryScore: number;
  evidenceConfidence: number;
  adaptiveOverall: number;
}) {
  const recentTrainingLoad =
    analyseRecentTrainingLoad([]);

  const exerciseRotation =
    analyseExerciseRotation([]);

  const recovery =
    analyseRecoveryStatus({
      readinessScore,
      adaptiveRecoveryScore:
        recoveryScore,
      recentTrainingLoad,
      exerciseRotation,
    });

  const block =
    generateTrainingBlock({
      primaryGoal: "health",
      experienceLevel: "beginner",
      blockLengthWeeks: 8,
      trainingDaysPerWeek: 3,
    });

  const blockWeek =
    block.weeks[0];

  if (!blockWeek) {
    throw new Error(
      "Expected training block week one.",
    );
  }

  const programme =
    generateProgrammeStructure({
      primaryGoal: "health",
      experienceLevel: "beginner",
      trainingDaysPerWeek: 3,
      trainingEnvironment:
        "commercial-gym",
      equipmentInventory: [],
    });

  const recoveryForecast =
    analyseRecoveryForecast({
      recoveryIntelligence:
        recovery,
      recentTrainingLoad,
      blockWeek,
    });

  const core =
    generateApexCore({
      preferredName: "James",
      readinessScore,
      traits: {
        recovery: recoveryScore,
        consistency:
          evidenceConfidence,
        hydration:
          evidenceConfidence,
        trainingCapacity:
          evidenceConfidence,
        confidence:
          evidenceConfidence,
      },
      currentStreak: 5,
      latestWorkout: null,
    });

  const context =
    buildApexDecisionContext({
      identity: {
        userId: "user-1",
        preferredName: "James",
      },
      profile: {
        primaryGoal: "health",
        experienceLevel:
          "beginner",
        trainingEnvironment:
          "commercial-gym",
        equipment: [],
        equipmentInventory: [],
        accessibilityNeeds: [],
        movementConstraints: [],
      },
      today: {
        readinessScore,
        recoveryScore,
        consistencyScore:
          evidenceConfidence,
        trainingCapacity:
          evidenceConfidence,
        coachPriority:
          core.decision.priority,
      },
      programme: {
        structure: programme,
        currentSession:
          programme.sessions[0] ??
          null,
        completedProgrammeSessions: 0,
        blockWeek,
      },
      intelligence: {
        recentTrainingLoad,
        exerciseRotation,
        recovery,
        recoveryForecast,
        adaptiveConfidence: {
          progression:
            adaptiveOverall,
          recovery:
            adaptiveOverall,
          behaviour:
            adaptiveOverall,
          memory:
            adaptiveOverall,
          overall:
            adaptiveOverall,
          strongestDomain:
            "recovery",
          weakestDomain:
            "progression",
        },
      },
      evidence: {
        rulesetVersion:
          "apex-rules-v1",
        confidence:
          evidenceConfidence,
      },
    });

  const orchestration =
    orchestrateApexDecision({
      context,
      core,
    });

  const reasoning =
    buildApexReasoningState({
      context,
      core,
    });

  return {
    orchestration,
    reasoning,
  };
}

const strongScenario =
  createScenario({
    readinessScore: 88,
    recoveryScore: 86,
    evidenceConfidence: 88,
    adaptiveOverall: 84,
  });

const createdAt = new Date(
  "2026-08-04T19:00:00Z",
);

const strongTrace =
  buildApexReasoningTrace({
    decisionId:
      " reasoning-trace-1 ",
    orchestration:
      strongScenario.orchestration,
    reasoning:
      strongScenario.reasoning,
    createdAt,
  });

if (
  strongTrace.trace.decisionId !==
  "reasoning-trace-1"
) {
  throw new Error(
    "Reasoning trace id should be normalised.",
  );
}

if (
  strongTrace.trace.outcome !==
  strongScenario.orchestration
    .resolvedPriority
) {
  throw new Error(
    "Reasoning trace outcome should match the orchestrated priority.",
  );
}

if (
  strongTrace.trace.confidence !==
  strongScenario.reasoning.confidence
) {
  throw new Error(
    "Reasoning trace should preserve reasoning confidence.",
  );
}

if (
  strongTrace.trace.overriddenBy !==
  null
) {
  throw new Error(
    "Sufficient evidence should not create an override.",
  );
}

if (
  strongTrace.trace.reasons.length ===
  0
) {
  throw new Error(
    "Reasoning trace should include supporting reasons.",
  );
}

if (
  !strongTrace.trace.reasons.some(
    (reason) =>
      reason.label ===
      "Supporting evidence",
  )
) {
  throw new Error(
    "Core reasoning signals should become supporting trace reasons.",
  );
}

if (
  strongTrace.reasoning.tone !==
  strongScenario.reasoning.tone ||
  strongTrace.reasoning
    .strongestDomain !== "recovery" ||
  strongTrace.reasoning
    .weakestDomain !== "progression"
) {
  throw new Error(
    "Reasoning snapshot should preserve tone and confidence domains.",
  );
}

if (
  strongTrace.reasoning
    .prioritiesAligned !== true ||
  strongTrace.reasoning
    .checkedPriorities.length !== 4
) {
  throw new Error(
    "Reasoning trace should preserve orchestration consistency.",
  );
}

if (
  strongTrace.trace.createdAt !==
  createdAt
) {
  throw new Error(
    "Reasoning trace should preserve the supplied timestamp.",
  );
}

const cautiousScenario =
  createScenario({
    readinessScore: 35,
    recoveryScore: 32,
    evidenceConfidence: 28,
    adaptiveOverall: 20,
  });

const cautiousTrace =
  buildApexReasoningTrace({
    decisionId:
      "reasoning-trace-2",
    orchestration:
      cautiousScenario.orchestration,
    reasoning:
      cautiousScenario.reasoning,
  });

if (
  cautiousTrace.trace.overriddenBy !==
  "insufficient-personal-evidence"
) {
  throw new Error(
    "Insufficient evidence should be recorded as an override.",
  );
}

if (
  !cautiousTrace.trace.reasons.some(
    (reason) =>
      reason.label ===
      "Caution signal",
  )
) {
  throw new Error(
    "Caution signals should be converted into trace reasons.",
  );
}

if (
  !cautiousTrace.trace.reasons.some(
    (reason) =>
      reason.evidenceRuleId ===
      "recovery-respect-current-signals",
  )
) {
  throw new Error(
    "Recovery-related caution should reference the recovery safety rule.",
  );
}

if (
  cautiousTrace.reasoning
    .evidenceSufficient ||
  !cautiousTrace.reasoning
    .requiresMoreEvidence
) {
  throw new Error(
    "Low-confidence reasoning should remain marked as insufficient.",
  );
}

let mismatchRejected = false;

try {
  buildApexReasoningTrace({
    decisionId:
      "reasoning-trace-invalid",
    orchestration:
      strongScenario.orchestration,
    reasoning: {
      ...strongScenario.reasoning,
      priority:
        strongScenario.reasoning
          .priority === "train"
          ? "recover"
          : "train",
    },
  });
} catch {
  mismatchRejected = true;
}

if (!mismatchRejected) {
  throw new Error(
    "Mismatched reasoning and orchestration priorities should be rejected.",
  );
}

for (const trace of [
  strongTrace,
  cautiousTrace,
]) {
  if (
    trace.trace.confidence < 0 ||
    trace.trace.confidence > 100
  ) {
    throw new Error(
      "Trace confidence must remain between 0 and 100.",
    );
  }

  if (
    !trace.reasoning.summary.trim()
  ) {
    throw new Error(
      "Every reasoning trace snapshot should include a summary.",
    );
  }
}

console.log(
  "Apex Reasoning Trace test passed.",
);
