import {
  buildApexDecisionContext,
} from "./build-apex-decision-context";
import {
  generateApexCore,
} from "./generate-apex-core";
import {
  orchestrateApexDecision,
} from "./orchestrate-apex-decision";
import {
  analyseRecentTrainingLoad,
} from "@/lib/workout/analyse-recent-training-load";
import {
  analyseExerciseRotation,
} from "@/lib/workout/analyse-exercise-rotation";
import {
  analyseRecoveryStatus,
} from "@/lib/workout/analyse-recovery-status";
import {
  analyseRecoveryForecast,
} from "@/lib/workout/analyse-recovery-forecast";
import {
  generateProgrammeStructure,
} from "@/lib/planning/generate-programme-structure";
import {
  generateTrainingBlock,
} from "@/lib/planning/generate-training-block";

const recentTrainingLoad =
  analyseRecentTrainingLoad([]);

const exerciseRotation =
  analyseExerciseRotation([]);

const recovery =
  analyseRecoveryStatus({
    readinessScore: 82,
    adaptiveRecoveryScore: 78,
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

const blockWeek = block.weeks[0];

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

const forecast =
  analyseRecoveryForecast({
    recoveryIntelligence: recovery,
    recentTrainingLoad,
    blockWeek,
  });

const traits = {
  recovery: 78,
  consistency: 72,
  hydration: 65,
  trainingCapacity: 80,
  confidence: 75,
};

const core = generateApexCore({
  preferredName: "James",
  readinessScore: 82,
  traits,
  currentStreak: 6,
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
      experienceLevel: "beginner",
      trainingEnvironment:
        "commercial-gym",
      equipment: [],
      equipmentInventory: [],
      accessibilityNeeds: [],
      movementConstraints: [],
    },
    today: {
      readinessScore: 82,
      recoveryScore: 78,
      consistencyScore: 72,
      trainingCapacity: 80,
      coachPriority:
        core.decision.priority,
    },
    programme: {
      structure: programme,
      currentSession:
        programme.sessions[0] ?? null,
      completedProgrammeSessions: 0,
      blockWeek,
    },
    intelligence: {
      recentTrainingLoad,
      exerciseRotation,
      recovery,
      recoveryForecast: forecast,
    },
    evidence: {
      rulesetVersion:
        "apex-rules-v1",
      confidence: 75,
    },
  });

const orchestration =
  orchestrateApexDecision({
    context,
    core,
  });

if (
  !orchestration.consistency
    .prioritiesAligned
) {
  throw new Error(
    "Expected all Apex priorities to align.",
  );
}

if (
  orchestration.resolvedPriority !==
  core.decision.priority
) {
  throw new Error(
    "Resolved priority must match Apex Core.",
  );
}

if (
  orchestration.confidence < 0 ||
  orchestration.confidence > 100
) {
  throw new Error(
    "Orchestration confidence must remain between 0 and 100.",
  );
}

if (
  orchestration.consistency
    .checkedPriorities.length !== 4
) {
  throw new Error(
    "Expected four priority sources to be checked.",
  );
}

console.log(
  "Apex Decision Orchestrator test passed.",
);
