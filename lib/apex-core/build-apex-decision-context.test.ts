import {
  buildApexDecisionContext,
} from "./build-apex-decision-context";
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

const now = new Date(
  "2026-08-04T12:00:00.000Z",
);

const recentTrainingLoad =
  analyseRecentTrainingLoad([], now);

const exerciseRotation =
  analyseExerciseRotation([], now);

const recovery =
  analyseRecoveryStatus({
    readinessScore: 82,
    adaptiveRecoveryScore: 78,
    recentTrainingLoad,
    exerciseRotation,
  });

const trainingBlock =
  generateTrainingBlock({
    primaryGoal: "health",
    experienceLevel: "beginner",
    blockLengthWeeks: 8,
    trainingDaysPerWeek: 3,
    currentWeek: 1,
  });

const blockWeek =
  trainingBlock.weeks[0];

if (!blockWeek) {
  throw new Error(
    "Expected the training block to contain week one.",
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

const context =
  buildApexDecisionContext({
    identity: {
      userId: " user-1 ",
      preferredName: " James ",
    },
    profile: {
      primaryGoal: "health",
      experienceLevel: "beginner",
      trainingEnvironment:
        "commercial-gym",
      equipment: [
        "full-gym",
        "full-gym",
      ],
      equipmentInventory: [],
      accessibilityNeeds: [],
      movementConstraints: [],
    },
    today: {
      readinessScore: 120,
      recoveryScore: 78,
      consistencyScore: 74,
      trainingCapacity: 81,
      coachPriority: "train",
    },
    programme: {
      structure: programme,
      currentSession:
        programme.sessions[0] ?? null,
      completedProgrammeSessions: 1.9,
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
        " apex-rules-v1 ",
      confidence: 105,
    },
    generatedAt: now,
  });

if (context.identity.userId !== "user-1") {
  throw new Error(
    "The user ID should be normalised.",
  );
}

if (
  context.identity.preferredName !== "James"
) {
  throw new Error(
    "The preferred name should be normalised.",
  );
}

if (context.today.readinessScore !== 100) {
  throw new Error(
    "Readiness should be clamped to 100.",
  );
}

if (context.evidence.confidence !== 100) {
  throw new Error(
    "Evidence confidence should be clamped.",
  );
}

if (
  context.profile.equipment.length !== 1
) {
  throw new Error(
    "Repeated equipment values should be removed.",
  );
}

if (
  context.programme
    .completedProgrammeSessions !== 1
) {
  throw new Error(
    "Completed programme sessions should be a safe integer.",
  );
}

if (
  context.intelligence
    .recoveryForecast.days.length !== 7
) {
  throw new Error(
    "The decision context should preserve the seven-day recovery forecast.",
  );
}

console.log(
  "Unified Apex Decision Context test passed.",
);
