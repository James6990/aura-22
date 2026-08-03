import {
  Bot,
  Droplets,
  Dumbbell,
  HeartPulse,
  Target,
} from "lucide-react";

import type { CoachInsight } from "@/lib/coach/generate-coach-insight";

type ApexCoachCardProps = {
  insight: CoachInsight;
};

function CoachIcon({
  priority,
}: {
  priority: CoachInsight["priority"];
}) {
  if (priority === "hydration") {
    return <Droplets className="h-6 w-6" />;
  }

  if (priority === "recovery") {
    return <HeartPulse className="h-6 w-6" />;
  }

  if (priority === "consistency") {
    return <Target className="h-6 w-6" />;
  }

  return <Dumbbell className="h-6 w-6" />;
}

export default function ApexCoachCard({
  insight,
}: ApexCoachCardProps) {
  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 to-cyan-950/30 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
          <CoachIcon priority={insight.priority} />
        </div>

        <div>
          <div className="flex items-center gap-2 text-cyan-400">
            <Bot className="h-4 w-4" />

            <p className="text-xs font-bold uppercase tracking-widest">
              Apex Coach
            </p>
          </div>

          <h2 className="mt-2 text-2xl font-black text-white">
            {insight.title}
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            {insight.message}
          </p>
        </div>
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        Guidance is based on your recent check-ins and is not a
        medical assessment.
      </p>
    </section>
  );
}
