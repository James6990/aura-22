import {
  Brain,
  CircleAlert,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import type { GenomeInsight } from "@/lib/genome/generate-genome-insights";

type GenomeInsightsCardProps = {
  insights: GenomeInsight[];
};

function InsightIcon({
  type,
}: {
  type: GenomeInsight["type"];
}) {
  if (type === "positive") {
    return <Sparkles className="h-5 w-5" />;
  }

  if (type === "attention") {
    return <CircleAlert className="h-5 w-5" />;
  }

  if (type === "trend") {
    return <TrendingUp className="h-5 w-5" />;
  }

  return <Lightbulb className="h-5 w-5" />;
}

export default function GenomeInsightsCard({
  insights,
}: GenomeInsightsCardProps) {
  return (
    <section className="rounded-3xl border border-fuchsia-500/20 bg-gradient-to-br from-slate-900 to-fuchsia-950/20 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300">
          <Brain className="h-7 w-7" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-fuchsia-400">
            Genome learning
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Patterns Apex has noticed
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Early observations become more reliable as your history grows.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {insights.map((insight) => (
          <article
            key={insight.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-fuchsia-300">
                <InsightIcon type={insight.type} />
              </div>

              <div>
                <h3 className="font-black text-white">
                  {insight.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {insight.message}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        These are behavioural observations, not medical conclusions.
      </p>
    </section>
  );
}
