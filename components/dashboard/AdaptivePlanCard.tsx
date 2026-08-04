import {
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Gauge,
  HeartPulse,
  Sparkles,
} from "lucide-react";

import type {
  AdaptivePlan,
  AdaptivePlanDay,
} from "@/lib/planning/generate-adaptive-plan";

type AdaptivePlanCardProps = {
  plan: AdaptivePlan;
};

function DayIcon({
  type,
}: {
  type: AdaptivePlanDay["type"];
}) {
  if (type === "train") {
    return <Dumbbell className="h-4 w-4" />;
  }

  if (type === "recovery") {
    return <HeartPulse className="h-4 w-4" />;
  }

  if (type === "light") {
    return <Gauge className="h-4 w-4" />;
  }

  if (type === "conditioning") {
    return <Sparkles className="h-4 w-4" />;
  }

  return <CalendarDays className="h-4 w-4" />;
}

function getDecisionConfidenceLabel(
  confidence: number,
) {
  if (confidence >= 85) {
    return "High confidence";
  }

  if (confidence >= 65) {
    return "Moderate confidence";
  }

  return "Still learning";
}

function getDayStyle(
  type: AdaptivePlanDay["type"],
) {
  if (type === "train") {
    return "border-emerald-500/20 bg-emerald-500/5 text-emerald-300";
  }

  if (type === "recovery") {
    return "border-cyan-500/20 bg-cyan-500/5 text-cyan-300";
  }

  if (type === "light") {
    return "border-amber-500/20 bg-amber-500/5 text-amber-300";
  }

  return "border-slate-800 bg-slate-950/70 text-slate-300";
}

export default function AdaptivePlanCard({
  plan,
}: AdaptivePlanCardProps) {
  return (
    <section className="rounded-3xl border border-violet-500/20 bg-slate-900/70 p-5 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-violet-300">
            This week with Apex
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            {plan.headline}
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            {plan.summary}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl border border-violet-500/20 bg-violet-500/5 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-violet-300">
            Planning confidence
          </p>

          <div className="mt-2 flex items-end gap-2">
            <span className="text-xl font-black text-white">
              {plan.confidence.label}
            </span>

            <span className="pb-0.5 text-sm font-bold text-violet-300">
              {plan.confidence.score}%
            </span>
          </div>
        </div>
      </div>

      {plan.missedSessionsRedistributed && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

          <p className="text-sm leading-6 text-slate-300">
            Missed sessions were redistributed rather than stacked together. Nothing needs to be “caught up”.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {plan.days.map((day) => (
          <article
            key={day.dayOffset}
            className={`rounded-2xl border p-4 ${getDayStyle(
              day.type,
            )}`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <DayIcon type={day.type} />

                <p className="text-xs font-black uppercase tracking-wider">
                  {day.label}
                </p>
              </div>

              {day.optional && (
                <span className="rounded-full border border-current/20 px-2 py-1 text-[10px] font-bold uppercase">
                  Flexible
                </span>
              )}
            </div>

            <h3 className="mt-3 font-black text-white">
              {day.title}
            </h3>

            <p className="mt-2 text-xs leading-5 text-slate-400">
              {day.reason}
            </p>

            <details className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-3">
              <summary className="cursor-pointer text-xs font-black text-slate-200">
                Why Apex chose this
              </summary>

              <div className="mt-3 space-y-3">
                <p className="text-xs leading-5 text-slate-300">
                  {
                    day.decisionTrace.reasons[0]
                      ?.detail ??
                    "Apex used your current training and recovery information."
                  }
                </p>

                {day.decisionTrace.reasons.length > 1 && (
                  <div className="space-y-2 border-t border-white/10 pt-3">
                    {day.decisionTrace.reasons
                      .slice(1, 3)
                      .map((reason) => (
                        <div
                          key={`${reason.code}-${reason.label}`}
                        >
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                            {reason.label}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {reason.detail}
                          </p>
                        </div>
                      ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                  <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-violet-300">
                    {getDecisionConfidenceLabel(
                      day.decisionTrace.confidence,
                    )}
                  </span>

                  <span className="text-[11px] font-bold text-slate-400">
                    {day.decisionTrace.confidence}%
                  </span>
                </div>

                {day.decisionTrace.overriddenBy && (
                  <p className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 p-2 text-[11px] font-bold leading-5 text-cyan-200">
                    Recovery and safety signals took priority over the original training plan.
                  </p>
                )}
              </div>
            </details>
          </article>
        ))}
      </div>

      <details className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <summary className="cursor-pointer font-bold text-slate-200">
          How confident is Apex, and why?
        </summary>

        <div className="mt-3 space-y-2">
          {plan.confidence.reasons.map((reason) => (
            <p
              key={reason}
              className="text-sm leading-6 text-slate-400"
            >
              • {reason}
            </p>
          ))}
        </div>
      </details>
    </section>
  );
}
