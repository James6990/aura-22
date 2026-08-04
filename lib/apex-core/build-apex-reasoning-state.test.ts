import {
  buildApexDecisionContext,
} from "./build-apex-decision-context";
import {
  buildApexReasoningState,
} from "./build-apex-reasoning-state";
import {
  generateApexCore,
} from "./generate-apex-core";
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

  return {
    context,
    core,
  };
}

const strongScenario =
  createScenario({
    readinessScore: 90,
    recoveryScore: 88,
    evidenceConfidence: 90,
    adaptiveOverall: 88,
  });

const decisive =
  buildApexReasoningState(
    strongScenario,
  );

if (
  decisive.tone !== "decisive" ||
  !decisive.evidenceSufficient ||
  decisive.requiresMoreEvidence
) {
  throw new Error(
    "Strong evidence should produce decisive reasoning.",
  );
}

if (
  decisive.strongestDomain !==
    "recovery" ||
  decisive.weakestDomain !==
    "progression"
) {
  throw new Error(
    "Adaptive-confidence domains should be preserved.",
  );
}

const measuredScenario =
  createScenario({
    readinessScore: 72,
    recoveryScore: 70,
    evidenceConfidence: 68,
    adaptiveOverall: 65,
  });

const measured =
  buildApexReasoningState(
    measuredScenario,
  );

if (
  measured.tone !== "measured" ||
  !measured.evidenceSufficient
) {
  throw new Error(
    "Moderate evidence should produce measured reasoning.",
  );
}

const cautiousScenario =
  createScenario({
    readinessScore: 45,
    recoveryScore: 42,
    evidenceConfidence: 55,
    adaptiveOverall: 40,
  });

const cautious =
  buildApexReasoningState(
    cautiousScenario,
  );

if (
  cautious.tone !== "cautious" ||
  !cautious.cautionReasons.some(
    (reason) =>
      reason.includes("Readiness"),
  ) ||
  !cautious.cautionReasons.some(
    (reason) =>
      reason.includes("Recovery"),
  )
) {
  throw new Error(
    "Low readiness and recovery should produce cautious reasoning.",
  );
}

const observationalScenario =
  createScenario({
    readinessScore: 30,
    recoveryScore: 30,
    evidenceConfidence: 20,
    adaptiveOverall: 15,
  });

const observational =
  buildApexReasoningState(
    observationalScenario,
  );

if (
  observational.tone !==
    "observational" ||
  observational.evidenceSufficient ||
  !observational.requiresMoreEvidence
) {
  throw new Error(
    "Very limited evidence should remain observational.",
  );
}

for (const state of [
  decisive,
  measured,
  cautious,
  observational,
]) {
  if (
    state.confidence < 0 ||
    state.confidence > 100
  ) {
    throw new Error(
      "Reasoning confidence must remain between 0 and 100.",
    );
  }

  if (!state.summary.trim()) {
    throw new Error(
      "Every reasoning state should include a summary.",
    );
  }

  if (
    state.supportingReasons.length ===
    0
  ) {
    throw new Error(
      "Reasoning state should preserve core decision reasons.",
    );
  }
}

console.log(
  "Apex Reasoning State test passed.",
);
