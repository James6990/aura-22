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
import { calculateStreaks } from "@/lib/progression/calculate-streaks";
import { calculateProgression } from "@/lib/progression/calculate-xp";
import PerformanceGenomeCard from "@/components/dashboard/PerformanceGenomeCard";
import GenomeInsightsCard from "@/components/dashboard/GenomeInsightsCard";
import WeeklyReviewCard from "@/components/dashboard/WeeklyReviewCard";
import WorkoutRecommendationCard from "@/components/dashboard/WorkoutRecommendationCard";
import WorkoutSessionCard from "@/components/dashboard/WorkoutSessionCard";
import AdaptivePlanCard from "@/components/dashboard/AdaptivePlanCard";
import ActiveWorkoutCard from "@/components/dashboard/ActiveWorkoutCard";
import { generateWorkoutSession } from "@/lib/workout/generate-workout-session";
import type {
  ExerciseDifficulty,
  ExerciseEquipment,
} from "@/lib/workout/exercise-library";
import type { EquipmentInventoryItem } from "@/lib/workout/equipment-capabilities";
import { normaliseTrainingSetup } from "@/lib/workout/normalise-training-setup";
import { generateWorkoutRecommendation } from "@/lib/workout/generate-workout-recommendation";
import { generateWeeklyReview } from "@/lib/reviews/generate-weekly-review";
import { generateGenomeInsights } from "@/lib/genome/generate-genome-insights";
import { calculateGenomeMetrics } from "@/lib/genome/calculate-genome-metrics";
import { calculateAdaptiveTraits } from "@/lib/genome/calculate-adaptive-traits";
import { generateCoachInsight } from "@/lib/coach/generate-coach-insight";
import ReadinessHistory from "@/components/dashboard/ReadinessHistory";
import CheckInReadinessPanel from "@/components/checkin/CheckInReadinessPanel";
import { getDashboardData } from "@/lib/dashboard/get-dashboard";
import { generateApexCore } from "@/lib/apex-core";
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

  const coachInsight = generateCoachInsight(
    dashboard.readinessHistory,
  );

  const genomeMetrics = calculateGenomeMetrics(
    dashboard.readinessHistory,
  );

  const adaptiveTraits = calculateAdaptiveTraits(
    dashboard.readinessHistory,
  );

  const genomeInsights = generateGenomeInsights(
    dashboard.readinessHistory,
    adaptiveTraits,
  );

  const weeklyReview = generateWeeklyReview(
    dashboard.readinessHistory,
  );

  const progression = calculateProgression(
    dashboard.recentEvents,
  );

  const streak = calculateStreaks(
    dashboard.checkInDates,
  );

  const readinessScore =
    dashboard.todayCheckIn?.readinessScore ??
    genomeMetrics.readinessBaseline;

  const apex = generateApexCore({
    preferredName,
    readinessScore,
    traits: adaptiveTraits,
    currentStreak: streak.currentStreak,
    latestWorkout: dashboard.latestWorkout,
    recentMemories: dashboard.apexMemories.map(
      (memory) => ({
        title: memory.title,
        message: memory.message,
        category: memory.category,
        occurredAt: memory.occurredAt,
      }),
    ),
  });

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

  const workoutRecommendation =
    generateWorkoutRecommendation({
      readinessScore,
      consistency:
        adaptiveTraits.consistency,
      recovery:
        adaptiveTraits.recovery,
      trainingCapacity:
        adaptiveTraits.trainingCapacity,
      primaryGoal:
        dashboard.genome.primaryGoal ??
        "health",
      experienceLevel:
        dashboard.genome.experienceLevel ??
        "beginner",
      equipment:
        dashboard.genome.equipment,
      decisionPriority:
        apex.decision.priority,
    });

  const workoutSession =
    generateWorkoutSession({
      recommendation:
        workoutRecommendation,
      primaryGoal:
        dashboard.genome.primaryGoal ??
        "health",
      experienceLevel: (
        dashboard.genome.experienceLevel ??
        "beginner"
      ) as ExerciseDifficulty,
      equipment:
        trainingSetup
          .equipment as ExerciseEquipment[],
      trainingEnvironment:
        trainingSetup.trainingEnvironment,
      equipmentInventory:
        trainingSetup
          .equipmentInventory as EquipmentInventoryItem[],
      programmeRole:
        programmeSession?.role ??
        "full-body",
      blockPhase:
        currentBlockWeek.phase,

      // These will later come from the user's
      // saved accessibility and movement profile.
      accessibilityNeeds: [],
      movementConstraints: [],
      progressionHistory:
        dashboard.exerciseProgressionHistory,
    });

  const adaptivePlan = generateAdaptivePlan({
    primaryGoal:
      dashboard.genome.primaryGoal ?? "health",
    experienceLevel:
      dashboard.genome.experienceLevel ??
      "beginner",
    currentPriority:
      apex.decision.priority,
    readinessScore,
    recoveryScore:
      adaptiveTraits.recovery,
    consistencyScore:
      adaptiveTraits.consistency,
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
      currentBlockWeek.trainingDaysTarget,
    blockWeek:
      currentBlockWeek,
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
        <GreetingCard
          preferredName={preferredName}
          primaryGoal={primaryGoal}
        />

        <ApexCompanionCard
          briefing={apex.dailyBriefing}
        />

        <ApexCoachCard insight={coachInsight} />

        <WorkoutRecommendationCard
          recommendation={workoutRecommendation}
        />

        {dashboard.activeWorkout ? (
          <ActiveWorkoutCard
            workout={dashboard.activeWorkout}
          />
        ) : (
          <WorkoutSessionCard
            session={workoutSession}
          />
        )}

        <AdaptivePlanCard
          plan={adaptivePlan}
        />

        <PerformanceGenomeCard
          metrics={genomeMetrics}
          adaptiveTraits={adaptiveTraits}
        />

        <GenomeInsightsCard
          insights={genomeInsights}
        />

        <WeeklyReviewCard
          review={weeklyReview}
        />

        <ProgressionCard progression={progression} />

        <StreakCard streak={streak} />

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
