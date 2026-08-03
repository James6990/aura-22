import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  HeartPulse,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import type { DailyBriefing } from "@/lib/companion/generate-daily-briefing";

type ApexCompanionCardProps = {
  briefing: DailyBriefing;
};

function CompanionIcon({
  briefing,
}: {
  briefing: DailyBriefing;
}) {
  if (briefing.isComeback) {
    return <RotateCcw className="h-7 w-7" />;
  }

  if (
    briefing.companion.decision.mood ===
    "recovery"
  ) {
    return <HeartPulse className="h-7 w-7" />;
  }

  if (
    briefing.companion.decision.mood ===
    "celebration"
  ) {
    return <Sparkles className="h-7 w-7" />;
  }

  if (
    briefing.companion.decision.mood ===
    "focused"
  ) {
    return <ShieldCheck className="h-7 w-7" />;
  }

  return <Brain className="h-7 w-7" />;
}

export default function ApexCompanionCard({
  briefing,
}: ApexCompanionCardProps) {
  const decision = briefing.companion.decision;

  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 to-cyan-950/30 p-6">
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
        >
          <CompanionIcon briefing={briefing} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            Your Apex Daily Briefing
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            {briefing.greeting}
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            {briefing.opening}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <div className="flex items-center gap-2 text-cyan-300">
            <Target className="h-5 w-5" />

            <p className="text-xs font-bold uppercase tracking-wider">
              Today&apos;s focus
            </p>
          </div>

          <p className="mt-3 text-lg font-black text-white">
            {briefing.focus}
          </p>
        </article>

        {briefing.win ? (
          <article className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-center gap-2 text-amber-300">
              <Trophy className="h-5 w-5" />

              <p className="text-xs font-bold uppercase tracking-wider">
                A win worth noticing
              </p>
            </div>

            <p className="mt-3 text-lg font-black text-white">
              {briefing.win}
            </p>
          </article>
        ) : (
          <article className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Today&apos;s tone
            </p>

            <p className="mt-3 text-lg font-black capitalize text-white">
              {briefing.tone}
            </p>
          </article>
        )}
      </div>

      <article className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Your next step
            </p>

            <p className="mt-2 text-sm font-bold leading-6 text-white">
              {briefing.nextAction}
            </p>
          </div>
        </div>
      </article>

      <details className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
        <summary className="cursor-pointer font-bold text-slate-200">
          Why Apex chose today&apos;s focus
        </summary>

        <div className="mt-4 space-y-3">
          {briefing.isComeback &&
            briefing.companion
              .daysSinceLastWorkout !== null && (
              <div className="flex items-start gap-3 text-sm leading-6 text-slate-400">
                <RotateCcw className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />

                <span>
                  It has been{" "}
                  {
                    briefing.companion
                      .daysSinceLastWorkout
                  }{" "}
                  days since your latest completed
                  workout. Apex is prioritising a
                  gradual, confident return.
                </span>
              </div>
            )}

          {decision.reasons.map((reason) => (
            <div
              key={reason}
              className="flex items-start gap-3 text-sm leading-6 text-slate-400"
            >
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />
              <span>{reason}</span>
            </div>
          ))}

          <p className="pt-2 text-sm leading-6 text-slate-400">
            {decision.message}
          </p>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recommendation confidence
            </span>

            <span className="font-black text-cyan-300">
              {decision.confidence}%
            </span>
          </div>

          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-label="Apex recommendation confidence"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={decision.confidence}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
              style={{
                width: `${decision.confidence}%`,
              }}
            />
          </div>

          <p className="mt-3 text-xs leading-5 text-slate-500">
            {decision.confidence < 50
              ? "I am still learning your patterns. More history will make my guidance increasingly personal."
              : decision.confidence < 80
                ? "I have useful context, but more consistent history will strengthen future guidance."
                : "I have a strong recent history and can offer more personalised guidance with higher confidence."}
          </p>
        </div>
      </details>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/coach"
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 font-black text-slate-950 transition hover:bg-cyan-300"
        >
          <MessageCircle className="h-5 w-5" />
          Talk with Apex
        </Link>

        <Link
          href="/journey"
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-slate-700 bg-slate-950 px-5 font-black text-slate-200 transition hover:border-slate-600"
        >
          View your Journey
        </Link>
      </div>

      <p className="mt-5 text-right text-sm font-bold text-cyan-300">
        — Apex
      </p>
    </section>
  );
}
