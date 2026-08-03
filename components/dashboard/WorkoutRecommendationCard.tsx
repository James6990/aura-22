import {
  Clock3,
  Dumbbell,
  Gauge,
  MapPin,
  Sparkles,
} from "lucide-react";

import type { WorkoutRecommendation } from "@/lib/workout/generate-workout-recommendation";

type WorkoutRecommendationCardProps = {
  recommendation: WorkoutRecommendation;
};

function formatVolume(multiplier: number) {
  const difference = Math.round((multiplier - 1) * 100);

  if (difference === 0) {
    return "Standard";
  }

  if (difference > 0) {
    return `+${difference}%`;
  }

  return `${difference}%`;
}

export default function WorkoutRecommendationCard({
  recommendation,
}: WorkoutRecommendationCardProps) {
  return (
    <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 to-emerald-950/30 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
          <Dumbbell className="h-7 w-7" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Today&apos;s workout decision
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            {recommendation.focus}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {recommendation.explanation}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <WorkoutStat
          icon={<Gauge className="h-4 w-4" />}
          label="Intensity"
          value={recommendation.intensity}
        />

        <WorkoutStat
          icon={<Clock3 className="h-4 w-4" />}
          label="Duration"
          value={`${recommendation.durationMinutes} min`}
        />

        <WorkoutStat
          icon={<Sparkles className="h-4 w-4" />}
          label="Volume"
          value={formatVolume(
            recommendation.volumeMultiplier,
          )}
        />

        <WorkoutStat
          icon={<MapPin className="h-4 w-4" />}
          label="Environment"
          value={recommendation.environment}
        />
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <p className="text-xs leading-5 text-slate-500">
          This is a planning recommendation based on your recorded
          readiness and preferences. Stop or adapt activity that causes
          pain, dizziness or unusual discomfort.
        </p>
      </div>
    </section>
  );
}

function WorkoutStat({
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
      <div className="flex items-center gap-2 text-emerald-300">
        {icon}

        <p className="text-xs font-bold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-3 text-lg font-black capitalize text-white">
        {value}
      </p>
    </article>
  );
}
