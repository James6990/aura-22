import { redirect } from "next/navigation";

import DashboardContent from "@/components/dashboard/DashboardContent";
import { generateWorkoutSession } from "@/lib/workout/generate-workout-session";
import type {
  ExerciseAccessibility,
  ExerciseDifficulty,
  ExerciseEquipment,
} from "@/lib/workout/exercise-library";
import type {
  EquipmentInventoryItem,
  TrainingEnvironment,
} from "@/lib/workout/equipment-capabilities";
import { normaliseTrainingSetup } from "@/lib/workout/normalise-training-setup";
import { generateWorkoutRecommendation } from "@/lib/workout/generate-workout-recommendation";
import {
  buildDashboardState,
  buildDecisionPipeline,
  buildDerivedAthleteState,
  buildMemoryReasoningState,
  buildPersonalisationState,
  buildTrainingIntelligence,
  getDashboardData,
} from "@/lib/dashboard";
import { generateAdaptivePlan } from "@/lib/planning/generate-adaptive-plan";
import { generateTrainingBlock } from "@/lib/planning/generate-training-block";
import { generateProgrammeStructure } from "@/lib/planning/generate-programme-structure";

const goalLabels: Record<string, string> = {
  muscle: "Build muscle",
  "fat-loss": "Lose body fat",
  recomposition: "Body recomposition",
  performance: "Improve performance",
  health: "Health and vitality",
};

export default async function DashboardPage() {
  const dashboard = await getDashboardData();

  if (!dashboard) {
    redirect("/auth");
  }

  if (!dashboard.genome?.onboardingCompleted) {
    redirect("/onboarding");
  }

  const preferredName =
    dashboard.genome.preferredName || dashboard.user.name;

  const primaryGoal =
    goalLabels[dashboard.genome.primaryGoal ?? ""] ??
    "Build consistent progress";

  const derivedAthleteState =
    buildDerivedAthleteState(
      dashboard,
    );

  const {
    coachInsight,
    genomeMetrics,
    adaptiveTraits,
    genomeInsights,
    weeklyReview,
    progression,
    streak,
  } = derivedAthleteState;

  const readinessScore =
    dashboard.todayCheckIn?.readinessScore ??
    genomeMetrics.readinessBaseline;



  const recentSkippedSessions =
    dashboard.recentWorkouts.filter(
      (workout) =>
        workout.status === "skipped",
    ).length;

  const trainingBlock = generateTrainingBlock({
    primaryGoal:
      dashboard.genome.primaryGoal ?? "health",
    experienceLevel:
      dashboard.genome.experienceLevel ??
      "beginner",
    blockLengthWeeks: 8,
    trainingDaysPerWeek: 3,
    currentWeek: 1,
    recentConsistency:
      adaptiveTraits.consistency,
    recentRecovery:
      adaptiveTraits.recovery,
    missedSessions:
      recentSkippedSessions,
  });

  const currentBlockWeek =
    trainingBlock.weeks[
      trainingBlock.currentWeek - 1
    ];

  const programme =
    generateProgrammeStructure({
      primaryGoal:
        dashboard.genome.primaryGoal ??
        "health",
      experienceLevel:
        dashboard.genome.experienceLevel ??
        "beginner",
      trainingDaysPerWeek:
        currentBlockWeek.trainingDaysTarget,
      trainingEnvironment:
        dashboard.genome.trainingEnvironment,
      equipmentInventory:
        dashboard.genome.equipmentInventory,
      accessibilityNeeds: [],
      movementConstraints: [],
      recentConsistency:
        adaptiveTraits.consistency,
      recentRecovery:
        adaptiveTraits.recovery,
    });

  const completedWorkoutCount =
    dashboard.recentWorkouts.filter(
      (workout) =>
        workout.status === "completed",
    ).length;

  const programmeSession =
    programme.sessions[
      completedWorkoutCount %
        programme.sessions.length
    ];

  const trainingSetup =
    normaliseTrainingSetup({
      trainingEnvironment:
        dashboard.genome.trainingEnvironment,
      equipment:
        dashboard.genome.equipment,
      equipmentInventory:
        dashboard.genome.equipmentInventory,
    });

  const personalisation =
    buildPersonalisationState(
      dashboard,
    );

  const memoryReasoning =
    buildMemoryReasoningState({
      data: dashboard,
      personalisation,
    });

  const trainingIntelligence =
    buildTrainingIntelligence({
      data: dashboard,
      readinessScore,
      adaptiveRecoveryScore:
        adaptiveTraits.recovery,
      blockWeek:
        currentBlockWeek,
    });

  const {
    recentTrainingLoad,
    exerciseRotation,
    recoveryIntelligence,
    recoveryForecast,
  } = trainingIntelligence;

  const dashboardWithGenome = {
    ...dashboard,
    genome: dashboard.genome,
  } as typeof dashboard & {
    genome: NonNullable<
      typeof dashboard.genome
    >;
  };

  const decisionPipeline =
    buildDecisionPipeline({
      data: dashboardWithGenome,
      preferredName,
      readinessScore,
      derivedAthleteState,
      trainingIntelligence,
      personalisation,
      memoryReasoning,
      programme,
      programmeSession:
        programmeSession ?? null,
      completedProgrammeSessions:
        completedWorkoutCount,
      blockWeek:
        currentBlockWeek,
    });

  const {
    apex,
    context: decisionContext,
    orchestration,
    coachingState,
  } = decisionPipeline;

  const workoutRecommendation =
    generateWorkoutRecommendation({
      readinessScore:
        orchestration.context.today
          .readinessScore,
      consistency:
        orchestration.context.today
          .consistencyScore,
      recovery:
        orchestration.context.today
          .recoveryScore,
      trainingCapacity:
        orchestration.context.today
          .trainingCapacity,
      primaryGoal:
        orchestration.context.profile
          .primaryGoal,
      experienceLevel:
        orchestration.context.profile
          .experienceLevel,
      equipment:
        orchestration.context.profile
          .equipment,
      decisionPriority:
        orchestration.resolvedPriority,
    });

  const workoutSession =
    generateWorkoutSession({
      recommendation:
        workoutRecommendation,
      primaryGoal:
        orchestration.context.profile
          .primaryGoal,
      experienceLevel:
        orchestration.context.profile
          .experienceLevel as ExerciseDifficulty,
      equipment:
        trainingSetup
          .equipment as ExerciseEquipment[],
      trainingEnvironment:
        orchestration.context.profile
          .trainingEnvironment as TrainingEnvironment,
      equipmentInventory:
        orchestration.context.profile
          .equipmentInventory as EquipmentInventoryItem[],
      programmeRole:
        orchestration.context.programme
          .currentSession?.role ??
        "full-body",
      blockPhase:
        orchestration.context.programme
          .blockWeek.phase,

      accessibilityNeeds:
        orchestration.context.profile
          .accessibilityNeeds as ExerciseAccessibility[],
      movementConstraints: [],
      progressionHistory:
        dashboard.exerciseProgressionHistory,
      recentTrainingLoad:
        orchestration.context.intelligence
          .recentTrainingLoad,
      exerciseRotation:
        orchestration.context.intelligence
          .exerciseRotation,
      recoveryIntelligence:
        orchestration.context.intelligence
          .recovery,
    });

  const adaptivePlan = generateAdaptivePlan({
    primaryGoal:
      orchestration.context.profile
        .primaryGoal,
    experienceLevel:
      orchestration.context.profile
        .experienceLevel,
    currentPriority:
      orchestration.resolvedPriority,
    readinessScore:
      orchestration.context.today
        .readinessScore,
    recoveryScore:
      orchestration.context.today
        .recoveryScore,
    consistencyScore:
      orchestration.context.today
        .consistencyScore,
    latestWorkoutCompletedAt:
      dashboard.latestWorkout?.completedAt ??
      null,
    latestWorkoutRpe:
      dashboard.latestWorkout?.sessionRpe ??
      null,
    latestWorkoutDiscomfort:
      dashboard.latestWorkout
        ?.highestDiscomfort ?? 0,
    progressionReadyCount:
      dashboard.latestWorkout
        ?.progressionReady ?? 0,
    recentWorkouts:
      dashboard.recentWorkouts,
    availableTrainingDays:
      orchestration.context.programme
        .blockWeek.trainingDaysTarget,
    blockWeek:
      orchestration.context.programme
        .blockWeek,
    programmeSessions:
      orchestration.context.programme
        .structure.sessions,
    completedProgrammeSessions:
      orchestration.context.programme
        .completedProgrammeSessions,
    recoveryIntelligence:
      orchestration.context.intelligence
        .recovery,
    recoveryForecast:
      orchestration.context.intelligence
        .recoveryForecast,
  });

  const dashboardState =
    buildDashboardState({
      data: dashboard,
      view: {
        preferredName,
        primaryGoal,
        apex,
        coachingState,
        workoutRecommendation,
        workoutSession,
        adaptivePlan,
                    },
    });

  return (
    <DashboardContent
      state={dashboardState}
      data={dashboardWithGenome}
    />
  );
}
