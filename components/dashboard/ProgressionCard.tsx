import { Crown, Shield, Sparkles } from "lucide-react";

import type { ProgressionResult } from "@/lib/progression/calculate-xp";

type ProgressionCardProps = {
  progression: ProgressionResult;
};

export default function ProgressionCard({
  progression,
}: ProgressionCardProps) {
  return (
    <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-900 to-amber-950/30 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
            <Crown className="h-7 w-7" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Apex progression
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              {progression.rankName}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Level {progression.level}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-3xl font-black text-amber-300">
            {progression.totalXp}
          </p>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Total XP
          </p>
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Shield className="h-4 w-4 text-amber-300" />
            Next level
          </span>

          <span className="font-black text-white">
            {progression.currentLevelXp} / {progression.nextLevelXp} XP
          </span>
        </div>

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"
          role="progressbar"
          aria-label="Progress to next Apex level"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progression.progressPercent}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-300"
            style={{
              width: `${progression.progressPercent}%`,
            }}
          />
        </div>

        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
          Apex rewards meaningful effort, consistency and progress relative
          to your own goals and abilities.
        </p>
      </div>
    </section>
  );
}
