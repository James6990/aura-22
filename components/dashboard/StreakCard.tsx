import { CalendarCheck2, Flame, Trophy } from "lucide-react";

import type { StreakResult } from "@/lib/progression/calculate-streaks";

type StreakCardProps = {
  streak: StreakResult;
};

export default function StreakCard({
  streak,
}: StreakCardProps) {
  const progressPercent = Math.min(
    100,
    Math.round(
      (streak.currentStreak / streak.nextMilestone) * 100,
    ),
  );

  return (
    <section className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-slate-900 to-orange-950/30 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-300">
            <Flame className="h-7 w-7" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
              Consistency streak
            </p>

            <h2 className="mt-2 text-3xl font-black text-white">
              {streak.currentStreak}{" "}
              {streak.currentStreak === 1 ? "day" : "days"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Keep showing up in a way that suits your goals and abilities.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Stat
          icon={<Trophy className="h-4 w-4" />}
          label="Longest streak"
          value={`${streak.longestStreak} days`}
        />

        <Stat
          icon={<CalendarCheck2 className="h-4 w-4" />}
          label="Total active days"
          value={String(streak.totalActiveDays)}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Next milestone
          </span>

          <span className="font-black text-orange-300">
            {streak.nextMilestone} days
          </span>
        </div>

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"
          role="progressbar"
          aria-label="Progress to next streak milestone"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {streak.daysToMilestone === 0
            ? "Milestone reached."
            : `${streak.daysToMilestone} active ${
                streak.daysToMilestone === 1 ? "day" : "days"
              } remaining.`}
        </p>
      </div>
    </section>
  );
}

function Stat({
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
      <div className="flex items-center gap-2 text-orange-300">
        {icon}

        <p className="text-xs font-bold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-3 text-xl font-black text-white">
        {value}
      </p>
    </article>
  );
}
