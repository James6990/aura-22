import { redirect } from "next/navigation";

import GreetingCard from "@/components/dashboard/GreetingCard";
import ApexCoachCard from "@/components/dashboard/ApexCoachCard";
import { generateCoachInsight } from "@/lib/coach/generate-coach-insight";
import ReadinessHistory from "@/components/dashboard/ReadinessHistory";
import CheckInReadinessPanel from "@/components/checkin/CheckInReadinessPanel";
import { getDashboardData } from "@/lib/dashboard/get-dashboard";

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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
        <GreetingCard
          preferredName={preferredName}
          primaryGoal={primaryGoal}
        />

        <ApexCoachCard insight={coachInsight} />

        <CheckInReadinessPanel
          initialCheckIn={dashboard.todayCheckIn}
        />

        <ReadinessHistory
          entries={dashboard.readinessHistory}
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
