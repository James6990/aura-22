import {
  Dna,
  Droplets,
  Gauge,
  HeartPulse,
  ShieldCheck,
  Target,
  Zap,
} from "lucide-react";

import type { GenomeMetrics } from "@/lib/genome/calculate-genome-metrics";
import type { GenomeTraits } from "@/lib/genome/calculate-adaptive-traits";

type PerformanceGenomeCardProps = {
  metrics: GenomeMetrics;
  adaptiveTraits: GenomeTraits;
};

export default function PerformanceGenomeCard({
  metrics,
  adaptiveTraits,
}: PerformanceGenomeCardProps) {
  return (
    <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-slate-900 to-violet-950/30 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
          <Dna className="h-7 w-7" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-violet-400">
            Evolving Performance Genome
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Your adaptive traits
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Apex updates these traits from your recent behaviour and readiness
            history. They become more reliable as more data is recorded.
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <GenomeTrait
          label="Consistency"
          value={adaptiveTraits.consistency}
          icon={<Target className="h-4 w-4" />}
        />

        <GenomeTrait
          label="Recovery"
          value={adaptiveTraits.recovery}
          icon={<HeartPulse className="h-4 w-4" />}
        />

        <GenomeTrait
          label="Hydration"
          value={adaptiveTraits.hydration}
          icon={<Droplets className="h-4 w-4" />}
        />

        <GenomeTrait
          label="Training capacity"
          value={adaptiveTraits.trainingCapacity}
          icon={<Zap className="h-4 w-4" />}
        />

        <GenomeTrait
          label="Readiness baseline"
          value={metrics.readinessBaseline}
          icon={<Gauge className="h-4 w-4" />}
        />

        <GenomeTrait
          label="Energy stability"
          value={metrics.energyStability}
          icon={<ShieldCheck className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Learning confidence
          </span>

          <span className="font-black text-violet-300">
            {adaptiveTraits.confidence}%
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
            style={{ width: `${adaptiveTraits.confidence}%` }}
          />
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-500">
          Confidence increases as Apex collects more check-ins, workouts,
          nutrition records and future wearable data.
        </p>
      </div>
    </section>
  );
}

function GenomeTrait({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center gap-2 text-violet-300">
        {icon}

        <p className="text-xs font-bold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <div className="mt-3 flex items-end justify-between gap-4">
        <span className="text-3xl font-black text-white">
          {value}%
        </span>

        <span className="text-xs font-bold text-slate-500">
          Adaptive
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </article>
  );
}
