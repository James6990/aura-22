import {
  buildApexCoachingState,
} from "./build-apex-coaching-state";
import {
  buildApexDecisionContext,
} from "./build-apex-decision-context";
import {
  createDecisionRecord,
} from "./create-decision-record";
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

const recentTrainingLoad =
  analyseRecentTrainingLoad([]);

const exerciseRotation =
  analyseExerciseRotation([]);

const recovery =
  analyseRecoveryStatus({
    readinessScore: 80,
    adaptiveRecoveryScore: 76,
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

const recoveryForecast =
  analyseRecoveryForecast({
    recoveryIntelligence: recovery,
    recentTrainingLoad,
    blockWeek,
  });

const core =
  generateApexCore({
    preferredName: "James",
    readinessScore: 80,
    traits: {
      recovery: 76,
      consistency: 74,
      hydration: 70,
      trainingCapacity: 78,
      confidence: 72,
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
      experienceLevel: "beginner",
      trainingEnvironment:
        "commercial-gym",
      equipment: [],
      equipmentInventory: [],
      accessibilityNeeds: [],
      movementConstraints: [],
    },
    today: {
      readinessScore: 80,
      recoveryScore: 76,
      consistencyScore: 74,
      trainingCapacity: 78,
      coachPriority:
        core.decision.priority,
    },
    programme: {
      structure: programme,
      currentSession:
        programme.sessions[0] ?? null,
      completedProgrammeSessions: 2,
      blockWeek,
    },
    intelligence: {
      recentTrainingLoad,
      exerciseRotation,
      recovery,
      recoveryForecast,
    },
    evidence: {
      rulesetVersion:
        "apex-rules-v1",
      confidence: 72,
    },
  });

const orchestration =
  orchestrateApexDecision({
    context,
    core,
  });

const coachingState =
  buildApexCoachingState(
    orchestration,
  );

const issuedAt = new Date(
  "2026-08-04T17:00:00Z",
);

const validUntil = new Date(
  "2026-08-05T17:00:00Z",
);

const record =
  createDecisionRecord({
    id: " decision-1 ",
    userId: " user-1 ",
    decisionType:
      " daily-coaching ",
    orchestration,
    coachingState,
    issuedAt,
    validUntil,
    schemaVersion: 1,
  });

if (record.id !== "decision-1") {
  throw new Error(
    "Decision-record id should be normalised.",
  );
}

if (record.userId !== "user-1") {
  throw new Error(
    "Decision-record user id should be normalised.",
  );
}

if (
  record.decisionType !==
  "daily-coaching"
) {
  throw new Error(
    "Decision type should be normalised.",
  );
}

if (
  record.priority !==
  orchestration.resolvedPriority
) {
  throw new Error(
    "Decision-record priority should match orchestration.",
  );
}

if (
  record.recommendation !==
  coachingState.nextAction
) {
  throw new Error(
    "Decision record should preserve the recommendation.",
  );
}

if (
  record.rulesetVersion !==
  coachingState.evidenceSummary
    .rulesetVersion
) {
  throw new Error(
    "Decision record should preserve the ruleset version.",
  );
}

if (
  record.confidence !==
  coachingState.confidence
) {
  throw new Error(
    "Decision record should preserve confidence.",
  );
}

if (record.status !== "issued") {
  throw new Error(
    "New decision records should default to issued.",
  );
}

if (
  record.issuedAt !== issuedAt ||
  record.validUntil !== validUntil
) {
  throw new Error(
    "Decision record should preserve lifecycle timestamps.",
  );
}

if (record.schemaVersion !== 1) {
  throw new Error(
    "Decision record should preserve schema version.",
  );
}

console.log(
  "Apex Decision Record test passed.",
);
