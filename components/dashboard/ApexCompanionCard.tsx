import {
  Brain,
  CheckCircle2,
  HeartPulse,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { CoachDecision } from "@/lib/companion/generate-coach-decision";

type ApexCompanionCardProps = {
  companion: CoachDecision;
};

function CompanionIcon({
  mood,
}: {
  mood: CoachDecision["mood"];
}) {
  if (mood === "recovery") {
    return <HeartPulse className="h-7 w-7" />;
  }

  if (mood === "celebration") {
    return <Sparkles className="h-7 w-7" />;
  }

  if (mood === "focused") {
    return <ShieldCheck className="h-7 w-7" />;
  }

  return <Brain className="h-7 w-7" />;
}

function formatPriority(priority: string) {
  return priority.replaceAll("-", " ");
}

export default function ApexCompanionCard({
  companion,
}: ApexCompanionCardProps) {
  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 to-cyan-950/30 p-6">
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
        >
          <CompanionIcon mood={companion.mood} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              {companion.eyebrow}
            </p>

            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold capitalize text-cyan-200">
              {formatPriority(companion.priority)}
            </span>
          </div>

          <h2 className="mt-2 text-2xl font-black text-white">
            {companion.headline}
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            {companion.message}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Apex recommends
          </p>

          <p className="mt-2 text-sm leading-6 text-white">
            {companion.action}
          </p>
        </div>
      </div>

      <details className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
        <summary className="cursor-pointer font-bold text-slate-200">
          Why Apex recommends this
        </summary>

        <div className="mt-4 space-y-3">
          {companion.reasons.map((reason) => (
            <div
              key={reason}
              className="flex items-start gap-3 text-sm leading-6 text-slate-400"
            >
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
              <span>{reason}</span>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recommendation confidence
            </span>

            <span className="font-black text-cyan-300">
              {companion.confidence}%
            </span>
          </div>

          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-label="Apex recommendation confidence"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={companion.confidence}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
              style={{
                width: `${companion.confidence}%`,
              }}
            />
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {companion.confidence < 50
              ? "I am still learning your patterns. More completed check-ins and workouts will make my recommendations increasingly personal."
              : companion.confidence < 80
                ? "I have enough information to offer useful guidance, but additional history will improve the accuracy of future recommendations."
                : "I have a strong history of your recent behaviour and can make more personalised recommendations with higher confidence."}
          </p>
        </div>
      </details>

      <p className="mt-5 text-right text-sm font-bold text-cyan-300">
        — Apex
      </p>
    </section>
  );
}
