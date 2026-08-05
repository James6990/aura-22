import { notFound, redirect } from "next/navigation";
import {
  Clock3,
  Dumbbell,
  Gauge,
} from "lucide-react";

import { getWorkoutSession } from "@/lib/workout/get-workout-session";
import WorkoutExecutionClient from "@/components/workout/WorkoutExecutionClient";
import BackToDashboardButton from "@/components/workout/BackToDashboardButton";

type WorkoutPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function WorkoutPage({
  params,
}: WorkoutPageProps) {
  const { sessionId } = await params;
  const data = await getWorkoutSession(sessionId);

  if (data.status === "unauthenticated") {
    redirect("/auth");
  }

  if (
    data.status === "not-found" ||
    !data.session
  ) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <BackToDashboardButton />

        <header className="mt-6 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 to-emerald-950/30 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
              <Dumbbell className="h-7 w-7" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Apex Live Coach
              </p>

              <h1 className="mt-2 text-3xl font-black text-white">
                {data.session.title}
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Your active personalised workout is ready.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <SessionStat
              icon={<Gauge className="h-4 w-4" />}
              label="Intensity"
              value={data.session.intensity}
            />

            <SessionStat
              icon={<Clock3 className="h-4 w-4" />}
              label="Planned time"
              value={`${
                data.session.plannedDurationMinutes ?? "—"
              } min`}
            />

            <SessionStat
              icon={<Dumbbell className="h-4 w-4" />}
              label="Exercises"
              value={String(data.exercises.length)}
            />
          </div>
        </header>

        <WorkoutExecutionClient
          sessionId={data.session.id}
          exercises={data.exercises}
          initialStatus={data.session.status}
          initialActiveStartedAt={
            data.session.activeStartedAt?.toISOString() ??
            null
          }
          initialAccumulatedActiveSeconds={
            data.session.accumulatedActiveSeconds
          }
          initialTotalPausedSeconds={
            data.session.totalPausedSeconds
          }
          initialPauseCount={
            data.session.pauseCount
          }
          initialLongestPauseSeconds={
            data.session.longestPauseSeconds
          }
        />
      </div>
    </main>
  );
}

function SessionStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center gap-2 text-emerald-300">
        {icon}

        <p className="text-xs font-bold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-3 font-black capitalize text-white">
        {value}
      </p>
    </article>
  );
}
