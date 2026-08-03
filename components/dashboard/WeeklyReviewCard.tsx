import {
  CalendarDays,
  CheckCircle2,
  Droplets,
  Dumbbell,
  HeartPulse,
  Sparkles,
} from "lucide-react";

import type { WeeklyReview } from "@/lib/reviews/generate-weekly-review";

type WeeklyReviewCardProps = {
  review: WeeklyReview;
};

export default function WeeklyReviewCard({
  review,
}: WeeklyReviewCardProps) {
  return (
    <section className="rounded-3xl border border-sky-500/20 bg-gradient-to-br from-slate-900 to-sky-950/30 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-300">
          <CalendarDays className="h-7 w-7" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Weekly review
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            {review.headline}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {review.summary}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ReviewStat
          icon={<Sparkles className="h-4 w-4" />}
          label="Avg readiness"
          value={`${review.averageReadiness}%`}
        />

        <ReviewStat
          icon={<Dumbbell className="h-4 w-4" />}
          label="Workouts"
          value={String(review.completedWorkouts)}
        />

        <ReviewStat
          icon={<Droplets className="h-4 w-4" />}
          label="Hydration days"
          value={String(review.hydratedDays)}
        />

        <ReviewStat
          icon={<HeartPulse className="h-4 w-4" />}
          label="Recovery days"
          value={String(review.recoveryDays)}
        />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <article className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 className="h-4 w-4" />

            <p className="text-xs font-bold uppercase tracking-wider">
              Weekly highlight
            </p>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            {review.highlight}
          </p>
        </article>

        <article className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2 text-amber-300">
            <Sparkles className="h-4 w-4" />

            <p className="text-xs font-bold uppercase tracking-wider">
              Next-week focus
            </p>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            {review.focus}
          </p>
        </article>
      </div>

      <p className="mt-5 text-xs leading-5 text-slate-500">
        This review is based on recorded Apex activity and is not medical advice.
      </p>
    </section>
  );
}

function ReviewStat({
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
      <div className="flex items-center gap-2 text-sky-300">
        {icon}

        <p className="text-xs font-bold uppercase tracking-wider">
          {label}
        </p>
      </div>

      <p className="mt-3 text-2xl font-black text-white">
        {value}
      </p>
    </article>
  );
}
