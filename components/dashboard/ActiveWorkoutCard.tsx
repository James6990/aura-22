import Link from "next/link";
import {
  Clock3,
  Dumbbell,
  Play,
} from "lucide-react";

type ActiveWorkoutCardProps = {
  workout: {
    id: string;
    title: string;
    intensity: string;
    startedAt: Date | null;
    plannedDurationMinutes: number | null;
    completedExercises: number;
    totalExercises: number;
  };
};

function getElapsedMinutes(
  startedAt: Date | null,
) {
  if (!startedAt) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      (Date.now() - startedAt.getTime()) /
        60_000,
    ),
  );
}

export default function ActiveWorkoutCard({
  workout,
}: ActiveWorkoutCardProps) {
  const elapsedMinutes =
    getElapsedMinutes(workout.startedAt);

  const progress =
    workout.totalExercises > 0
      ? Math.round(
          (
            workout.completedExercises /
            workout.totalExercises
          ) * 100,
        )
      : 0;

  return (
    <section className="rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-slate-900 to-cyan-950/30 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
          <Dumbbell className="h-7 w-7" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
            Workout in progress
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            {workout.title}
          </h2>

          <p className="mt-2 text-sm capitalize text-slate-400">
            {workout.intensity} intensity
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-center gap-2 text-cyan-300">
            <Clock3 className="h-4 w-4" />

            <p className="text-xs font-bold uppercase tracking-wider">
              Session time
            </p>
          </div>

          <p className="mt-3 font-black text-white">
            Started {elapsedMinutes} min ago
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
            Exercise progress
          </p>

          <p className="mt-3 font-black text-white">
            {workout.completedExercises} of{" "}
            {workout.totalExercises} complete
          </p>
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <Link
        href={`/workout/${workout.id}`}
        className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 font-black text-slate-950 transition hover:bg-cyan-300"
      >
        <Play className="h-5 w-5" />
        Resume workout
      </Link>
    </section>
  );
}
