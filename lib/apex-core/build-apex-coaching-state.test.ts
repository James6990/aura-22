import {
  buildApexCoachingState,
} from "./build-apex-coaching-state";
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

const recoveryForecast =
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
      recoveryForecast,
      personalisation: {
        exercise: {
          frequentlyCompletedExerciseIds: [
            "dumbbell-bench",
          ],
          progressionReadyExerciseIds: [
            "dumbbell-bench",
          ],
          reviewExerciseIds: [],
          discomfortExerciseIds: [
            "barbell-squat",
          ],
          exerciseSignals: [],
          confidence: 75,
          summary:
            "Apex has enough exercise history to personalise movement choices.",
        },
        training: {
          totalPlannedSessions: 10,
          completedSessions: 8,
          skippedSessions: 2,
          completionRate: 80,
          averageActualDurationMinutes: 45,
          averageSessionRpe: 7,
          preferredIntensity: "moderate",
          preferredTrainingWindow:
            "morning",
          confidence: 80,
          summary:
            "Apex has enough training history to personalise session guidance.",
        },
        recovery: {
          recordedDays: 7,
          averageReadiness: 74,
          averageEnergy: 7,
          readinessStability: 82,
          hydrationAdherence: 71,
          recoveryAdherence: 71,
          hydratedReadinessAverage: 79,
          nonHydratedReadinessAverage: 68,
          hydrationReadinessDifference: 11,
          confidence: 70,
          summary:
            "Apex has enough recent check-ins to adapt recovery guidance.",
        },
      },
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

const coachingState =
  buildApexCoachingState(orchestration);

if (
  coachingState.priority !==
  orchestration.resolvedPriority
) {
  throw new Error(
    "Coaching state priority should match the orchestrator.",
  );
}

if (!coachingState.headline.trim()) {
  throw new Error(
    "Coaching state should include a headline.",
  );
}

if (!coachingState.nextAction.trim()) {
  throw new Error(
    "Coaching state should include a next action.",
  );
}

if (!coachingState.explanation.trim()) {
  throw new Error(
    "Coaching state should include an explanation.",
  );
}

if (
  coachingState.personalisedReasons.length !== 3
) {
  throw new Error(
    `Expected three personalised reasons, received ${coachingState.personalisedReasons.length}.`,
  );
}

if (
  !coachingState.personalisedReasons.some(
    (reason) =>
      reason.includes("80%"),
  )
) {
  throw new Error(
    "Expected completion-rate evidence in personalised coaching reasons.",
  );
}

if (
  !coachingState.personalisedReasons.some(
    (reason) =>
      reason.includes("morning"),
  )
) {
  throw new Error(
    "Expected preferred training-window evidence in personalised coaching reasons.",
  );
}

if (
  !coachingState.personalisedReasons.some(
    (reason) =>
      reason.includes("11 points higher"),
  )
) {
  throw new Error(
    "Expected hydration-readiness evidence in personalised coaching reasons.",
  );
}

if (
  coachingState.confidence < 0 ||
  coachingState.confidence > 100
) {
  throw new Error(
    "Coaching-state confidence must remain between 0 and 100.",
  );
}

console.log(
  "Apex Coaching State test passed.",
);
