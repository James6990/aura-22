import GreetingCard from "@/components/dashboard/GreetingCard";
import ApexCompanionCard from "@/components/dashboard/ApexCompanionCard";
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
import ReadinessHistory from "@/components/dashboard/ReadinessHistory";
import CheckInReadinessPanel from "@/components/checkin/CheckInReadinessPanel";

import type {
  DashboardData,
  DashboardState,
} from "@/lib/dashboard";

type DashboardDataWithGenome =
  DashboardData & {
    genome: NonNullable<
      DashboardData["genome"]
    >;
  };

type DashboardContentProps = {
  state: DashboardState;
  data: DashboardDataWithGenome;
};

export default function DashboardContent({
  state,
  data,
}: DashboardContentProps) {
  const { view } = state;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
        <GreetingCard
          preferredName={view.preferredName}
          primaryGoal={view.primaryGoal}
          missionHeadline={
            view.coachingState.headline
          }
          nextAction={
            view.coachingState.nextAction
          }
          confidence={
            view.coachingState.confidence
          }
        />

        <ApexCompanionCard
          briefing={view.apex.dailyBriefing}
          coachingState={
            view.coachingState
          }
        />

        <ApexCoachCard
          insight={view.coachInsight}
        />

        <WorkoutRecommendationCard
          recommendation={
            view.workoutRecommendation
          }
        />

        {data.activeWorkout ? (
          <ActiveWorkoutCard
            workout={data.activeWorkout}
          />
        ) : (
          <WorkoutSessionCard
            session={view.workoutSession}
          />
        )}

        <AdaptivePlanCard
          plan={view.adaptivePlan}
        />

        <PerformanceGenomeCard
          metrics={view.genomeMetrics}
          adaptiveTraits={
            view.adaptiveTraits
          }
        />

        <GenomeInsightsCard
          insights={view.genomeInsights}
        />

        <WeeklyReviewCard
          review={view.weeklyReview}
        />

        <ProgressionCard
          progression={view.progression}
        />

        <StreakCard
          streak={view.streak}
        />

        <CheckInReadinessPanel
          initialCheckIn={
            data.todayCheckIn
          }
        />

        <ReadinessHistory
          entries={data.readinessHistory}
        />

        <ApexMemoriesCard
          memories={data.apexMemories}
        />

        {data.apexMemories.length === 0 && (
          <SyncMemoriesButton />
        )}

        <ActivityTimeline
          events={data.recentEvents}
        />

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStat
            label="Genome version"
            value={`v${data.genome.genomeVersion}`}
          />

          <DashboardStat
            label="Experience"
            value={
              data.genome
                .experienceLevel ??
              "Not set"
            }
          />

          <DashboardStat
            label="Current weight"
            value={
              data.genome.weightKg
                ? `${data.genome.weightKg} kg`
                : "Not set"
            }
          />

          <DashboardStat
            label="Coaching style"
            value={
              data.genome.coachStyle
            }
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
            Apex can now use your saved goal,
            experience, equipment, nutrition and
            accessibility preferences to personalise
            future training and recovery guidance.
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
