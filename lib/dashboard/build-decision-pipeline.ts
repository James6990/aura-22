import {
  buildApexCoachingState,
  buildApexDecisionContext,
  generateApexCore,
  orchestrateApexDecision,
  type ApexCoachingState,
  type ApexCoreResult,
  type ApexDecisionContext,
  type ApexDecisionOrchestration,
} from "@/lib/apex-core";
import type {
  DashboardData,
} from "@/lib/dashboard/get-dashboard";

type DashboardDataWithGenome =
  DashboardData & {
    genome: NonNullable<
      DashboardData["genome"]
    >;
  };
import type {
  DerivedAthleteState,
} from "@/lib/dashboard/build-derived-athlete-state";
import type {
  TrainingIntelligenceState,
} from "@/lib/dashboard/build-training-intelligence";
import type {
  ProgrammeSession,
  ProgrammeStructure,
} from "@/lib/planning/generate-programme-structure";
import type {
  TrainingBlockWeek,
} from "@/lib/planning/generate-training-block";

export type DecisionPipelineState = {
  apex: ApexCoreResult;
  context: ApexDecisionContext;
  orchestration: ApexDecisionOrchestration;
  coachingState: ApexCoachingState;
};

export type BuildDecisionPipelineInput = {
  data: DashboardDataWithGenome;
  preferredName: string;
  readinessScore: number;
  derivedAthleteState: DerivedAthleteState;
  trainingIntelligence: TrainingIntelligenceState;

  programme: ProgrammeStructure;
  programmeSession: ProgrammeSession | null;
  completedProgrammeSessions: number;
  blockWeek: TrainingBlockWeek;
};

export function buildDecisionPipeline({
  data,
  preferredName,
  readinessScore,
  derivedAthleteState,
  trainingIntelligence,
  programme,
  programmeSession,
  completedProgrammeSessions,
  blockWeek,
}: BuildDecisionPipelineInput): DecisionPipelineState {
  const apex =
    generateApexCore({
      preferredName,
      readinessScore,
      traits:
        derivedAthleteState.adaptiveTraits,
      currentStreak:
        derivedAthleteState.streak.currentStreak,
      latestWorkout:
        data.latestWorkout,
      recentMemories:
        data.apexMemories.map((memory) => ({
          title: memory.title,
          message: memory.message,
          category: memory.category,
          occurredAt: memory.occurredAt,
        })),
    });

  const context =
    buildApexDecisionContext({
      identity: {
        userId: data.user.id,
        preferredName,
      },
      profile: {
        primaryGoal:
          data.genome.primaryGoal ??
          "health",
        experienceLevel:
          data.genome.experienceLevel ??
          "beginner",
        trainingEnvironment:
          data.genome.trainingEnvironment,
        equipment:
          data.genome.equipment,
        equipmentInventory:
          data.genome.equipmentInventory,
        accessibilityNeeds: [],
        movementConstraints: [],
      },
      today: {
        readinessScore,
        recoveryScore:
          derivedAthleteState
            .adaptiveTraits.recovery,
        consistencyScore:
          derivedAthleteState
            .adaptiveTraits.consistency,
        trainingCapacity:
          derivedAthleteState
            .adaptiveTraits.trainingCapacity,
        coachPriority:
          apex.decision.priority,
      },
      programme: {
        structure: programme,
        currentSession:
          programmeSession,
        completedProgrammeSessions,
        blockWeek,
      },
      intelligence: {
        recentTrainingLoad:
          trainingIntelligence
            .recentTrainingLoad,
        exerciseRotation:
          trainingIntelligence
            .exerciseRotation,
        recovery:
          trainingIntelligence
            .recoveryIntelligence,
        recoveryForecast:
          trainingIntelligence
            .recoveryForecast,
      },
      evidence: {
        rulesetVersion:
          "apex-rules-v1",
        confidence:
          derivedAthleteState
            .adaptiveTraits.confidence,
      },
    });

  const orchestration =
    orchestrateApexDecision({
      context,
      core: apex,
    });

  const coachingState =
    buildApexCoachingState(
      orchestration,
    );

  return {
    apex,
    context,
    orchestration,
    coachingState,
  };
}
