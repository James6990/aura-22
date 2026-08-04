import { redirect } from "next/navigation";

import GreetingCard from "@/components/dashboard/GreetingCard";
import ApexCompanionCard from "@/components/dashboard/ApexCompanionCard";
import { generateCompanionBrief } from "@/lib/companion/generate-companion-brief";
import { generateDailyBriefing } from "@/lib/companion/generate-daily-briefing";
import ApexCoachCard from "@/components/dashboard/ApexCoachCard";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";
import ApexMemoriesCard from "@/components/dashboard/ApexMemoriesCard";
import SyncMemoriesButton from "@/components/dashboard/SyncMemoriesButton";
import ProgressionCard from "@/components/dashboard/ProgressionCard";
import StreakCard from "@/components/dashboard/StreakCard";
import PerformanceGenomeCard from "@/components/dashboard/PerformanceGenomeCard";
import GenomeInsightsCard from "@/components/dashboard/GenomeInsightsCard";
import WeeklyReviewCard from "@/components/dashboard/WeeklyReviewCard";
import WorkoutRecommendationCard from "@/components/dashboard/WorkoutRecommendationCard";
import WorkoutSessionCard from "@/components/dashboard/WorkoutSessionCard";
import AdaptivePlanCard from "@/components/dashboard/AdaptivePlanCard";
import ActiveWorkoutCard from "@/components/dashboard/ActiveWorkoutCard";
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
import ReadinessHistory from "@/components/dashboard/ReadinessHistory";
import CheckInReadinessPanel from "@/components/checkin/CheckInReadinessPanel";
import {
  buildDashboardState,
  buildDecisionPipeline,
  buildDerivedAthleteState,
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
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
        <GreetingCard
          preferredName={dashboardState.view.preferredName}
          primaryGoal={dashboardState.view.primaryGoal}
          missionHeadline={
            dashboardState.view.coachingState.headline
          }
          nextAction={
            dashboardState.view.coachingState.nextAction
          }
          confidence={
            dashboardState.view.coachingState.confidence
          }
        />

        <ApexCompanionCard
          briefing={dashboardState.view.apex.dailyBriefing}
          coachingState={dashboardState.view.coachingState}
        />

        <ApexCoachCard insight={dashboardState.view.coachInsight} />

        <WorkoutRecommendationCard
          recommendation={dashboardState.view.workoutRecommendation}
        />

        {dashboard.activeWorkout ? (
          <ActiveWorkoutCard
            workout={dashboard.activeWorkout}
          />
        ) : (
          <WorkoutSessionCard
            session={dashboardState.view.workoutSession}
          />
        )}

        <AdaptivePlanCard
          plan={dashboardState.view.adaptivePlan}
        />

        <PerformanceGenomeCard
          metrics={dashboardState.view.genomeMetrics}
          adaptiveTraits={dashboardState.view.adaptiveTraits}
        />

        <GenomeInsightsCard
          insights={dashboardState.view.genomeInsights}
        />

        <WeeklyReviewCard
          review={dashboardState.view.weeklyReview}
        />

        <ProgressionCard progression={dashboardState.view.progression} />

        <StreakCard streak={dashboardState.view.streak} />

        <CheckInReadinessPanel
          initialCheckIn={dashboard.todayCheckIn}
        />

        <ReadinessHistory
          entries={dashboard.readinessHistory}
        />

        <ApexMemoriesCard
          memories={dashboard.apexMemories}
        />

        {dashboard.apexMemories.length === 0 && (
          <SyncMemoriesButton />
        )}

        <ActivityTimeline
          events={dashboard.recentEvents}
        />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStat
            label="Genome version"
            value={`v${dashboard.genome.genomeVersion}`}
          />

          <DashboardStat
            label="Experience"
            value={dashboard.genome.experienceLevel ?? "Not set"}
          />

          <DashboardStat
            label="Current weight"
            value={
              dashboard.genome.weightKg
                ? `${dashboard.genome.weightKg} kg`
                : "Not set"
            }
          />

          <DashboardStat
            label="Coaching style"
            value={dashboard.genome.coachStyle}
          />
        </section>

        <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Apex Intelligence
          </p>

          <h2 className="mt-2 text-xl font-black text-white">
            Your Performance Genome is connected
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Apex can now use your saved goal, experience, equipment,
            nutrition and accessibility preferences to personalise future
            training and recovery guidance.
          </p>
        </section>
      </div>
    </main>
  );
}

function DashboardStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-black capitalize text-white">
        {value}
      </p>
    </article>
  );
}
