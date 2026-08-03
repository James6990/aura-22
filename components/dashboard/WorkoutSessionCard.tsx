import {
  AlertTriangle,
  Clock3,
  Dumbbell,
  RefreshCcw,
  ShieldCheck,
  TimerReset,
} from "lucide-react";

import type { WorkoutSession } from "@/lib/workout/generate-workout-session";

type WorkoutSessionCardProps = {
  session: WorkoutSession;
};

function formatPattern(pattern: string) {
  return pattern
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ");
}

export default function WorkoutSessionCard({
  session,
}: WorkoutSessionCardProps) {
  return (
    <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 to-emerald-950/20 p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
            <Dumbbell className="h-7 w-7" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Today&apos;s personalised session
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              {session.title}
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {session.intensity} intensity ·{" "}
              {session.exercises.length} exercises
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
          <Clock3 className="h-4 w-4 text-emerald-300" />

          <span className="font-black text-white">
            {session.estimatedDurationMinutes} min
          </span>
        </div>
      </div>

      {session.safetyMessage && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />

          <div>
            <p className="font-black text-amber-200">
              Session adaptation
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-100/80">
              {session.safetyMessage}
            </p>
          </div>
        </div>
      )}

      {session.requiresProfessionalReview && (
        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />

          <p className="text-sm leading-6 text-slate-300">
            A recorded limitation is currently unassessed. Apex has
            applied conservative filters, but professional guidance
            should take priority.
          </p>
        </div>
      )}

      {session.exercises.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-6 text-center">
          <p className="font-black text-white">
            No suitable session could be generated
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Review the available equipment, accessibility preferences
            or movement constraints before trying again.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {session.exercises.map((exercise, index) => (
            <article
              key={exercise.id}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 font-black text-emerald-300">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div>
                      <h3 className="font-black text-white">
                        {exercise.name}
                      </h3>

                      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                        {formatPattern(
                          exercise.movementPattern,
                        )}
                      </p>
                    </div>

                    <span className="w-fit rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-bold text-slate-300">
                      Fatigue {exercise.fatigueScore}/10
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <SessionDetail
                      label="Sets"
                      value={String(exercise.sets)}
                      icon={
                        <Dumbbell className="h-4 w-4" />
                      }
                    />

                    <SessionDetail
                      label="Repetitions"
                      value={exercise.reps}
                      icon={
                        <RefreshCcw className="h-4 w-4" />
                      }
                    />

                    <SessionDetail
                      label="Rest"
                      value={`${exercise.restSeconds} sec`}
                      icon={
                        <TimerReset className="h-4 w-4" />
                      }
                    />
                  </div>

                  {exercise.substitutions.length > 0 && (
                    <details className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                      <summary className="cursor-pointer text-sm font-bold text-slate-300">
                        Alternative exercises
                      </summary>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {exercise.substitutions.join(", ")}
                      </p>
                    </details>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-xs leading-5 text-slate-500">
          Begin conservatively and use controlled technique. Stop the
          session and seek appropriate support if you experience pain,
          dizziness or unusual symptoms.
        </p>
      </div>
    </section>
  );
}

function SessionDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
      <div className="flex items-center gap-2 text-emerald-300">
        {icon}

        <p className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-2 text-sm font-black text-white">
        {value}
      </p>
    </div>
  );
}
