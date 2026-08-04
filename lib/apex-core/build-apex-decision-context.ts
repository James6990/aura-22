import type {
  ProgrammeSession,
  ProgrammeStructure,
} from "@/lib/planning/generate-programme-structure";
import type {
  TrainingBlockWeek,
} from "@/lib/planning/generate-training-block";
import type {
  RecentTrainingLoad,
} from "@/lib/workout/analyse-recent-training-load";
import type {
  ExerciseRotationAnalysis,
} from "@/lib/workout/analyse-exercise-rotation";
import type {
  RecoveryIntelligence,
} from "@/lib/workout/analyse-recovery-status";
import type {
  RecoveryForecast,
} from "@/lib/workout/analyse-recovery-forecast";
import type {
  CoachPriority,
} from "@/lib/companion/generate-coach-decision";
import type {
  ExercisePersonalisationProfile,
} from "@/lib/personalisation/analyse-exercise-preferences";
import type {
  RecoveryBehaviourProfile,
} from "@/lib/personalisation/analyse-recovery-behaviour";
import type {
  TrainingBehaviourProfile,
} from "@/lib/personalisation/analyse-training-behaviour";
import type {
  MemoryReasoningProfile,
} from "@/lib/memory/analyse-memory-patterns";
import type {
  AdaptiveConfidence,
} from "@/lib/apex-core/calculate-adaptive-confidence";
import type {
  LearningIntegrationState,
} from "@/lib/apex-core/build-learning-integration-state";

export type ApexDecisionContext = {
  identity: {
    userId: string;
    preferredName: string;
  };

  profile: {
    primaryGoal: string;
    experienceLevel: string;
    trainingEnvironment: string;
    equipment: string[];
    equipmentInventory: string[];
    accessibilityNeeds: string[];
    movementConstraints: string[];
  };

  today: {
    readinessScore: number;
    recoveryScore: number;
    consistencyScore: number;
    trainingCapacity: number;
    coachPriority: CoachPriority;
  };

  programme: {
    structure: ProgrammeStructure;
    currentSession: ProgrammeSession | null;
    completedProgrammeSessions: number;
    blockWeek: TrainingBlockWeek;
  };

  intelligence: {
    recentTrainingLoad: RecentTrainingLoad;
    exerciseRotation: ExerciseRotationAnalysis;
    recovery: RecoveryIntelligence;
    recoveryForecast: RecoveryForecast;

    personalisation?: {
      exercise:
        ExercisePersonalisationProfile;
      training:
        TrainingBehaviourProfile;
      recovery:
        RecoveryBehaviourProfile;
    };

    memoryReasoning?:
      MemoryReasoningProfile;

    adaptiveConfidence?:
      AdaptiveConfidence;

    integratedLearning?:
      LearningIntegrationState;
  };

  evidence: {
    rulesetVersion: string;
    confidence: number;
  };

  generatedAt: Date;
};

export type BuildApexDecisionContextInput = Omit<
  ApexDecisionContext,
  "generatedAt"
> & {
  generatedAt?: Date;
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

export function buildApexDecisionContext(
  input: BuildApexDecisionContextInput,
): ApexDecisionContext {
  return {
    ...input,
    identity: {
      userId: input.identity.userId.trim(),
      preferredName:
        input.identity.preferredName.trim() ||
        "Athlete",
    },
    profile: {
      ...input.profile,
      primaryGoal:
        input.profile.primaryGoal.trim() ||
        "health",
      experienceLevel:
        input.profile.experienceLevel.trim() ||
        "beginner",
      trainingEnvironment:
        input.profile.trainingEnvironment.trim() ||
        "commercial-gym",
      equipment: [
        ...new Set(input.profile.equipment),
      ],
      equipmentInventory: [
        ...new Set(
          input.profile.equipmentInventory,
        ),
      ],
      accessibilityNeeds: [
        ...new Set(
          input.profile.accessibilityNeeds,
        ),
      ],
      movementConstraints: [
        ...new Set(
          input.profile.movementConstraints,
        ),
      ],
    },
    today: {
      readinessScore: clamp(
        input.today.readinessScore,
      ),
      recoveryScore: clamp(
        input.today.recoveryScore,
      ),
      consistencyScore: clamp(
        input.today.consistencyScore,
      ),
      trainingCapacity: clamp(
        input.today.trainingCapacity,
      ),
      coachPriority:
        input.today.coachPriority,
    },
    programme: {
      ...input.programme,
      completedProgrammeSessions:
        Math.max(
          0,
          Math.floor(
            input.programme
              .completedProgrammeSessions,
          ),
        ),
    },
    evidence: {
      rulesetVersion:
        input.evidence.rulesetVersion.trim() ||
        "apex-rules-v1",
      confidence: clamp(
        input.evidence.confidence,
      ),
    },
    generatedAt:
      input.generatedAt ?? new Date(),
  };
}
