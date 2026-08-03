import {
  Activity,
  CheckCircle2,
  Dumbbell,
  HeartPulse,
  Sparkles,
  Trophy,
  Utensils,
} from "lucide-react";

import type { ApexEventPayload } from "@/lib/db/schema";

type TimelineEvent = {
  id: string;
  type: string;
  category: string;
  source: string;
  payload: ApexEventPayload;
  occurredAt: Date;
};

type ActivityTimelineProps = {
  events: TimelineEvent[];
};

function formatEventTitle(type: string) {
  const titles: Record<string, string> = {
    "readiness.check_in_saved": "Daily check-in saved",
    "workout.completed": "Workout completed",
    "nutrition.target_completed": "Nutrition target reached",
    "recovery.completed": "Recovery activity completed",
    "progress.personal_record": "New personal record",
    "profile.updated": "Performance Genome updated",
  };

  return titles[type] ?? type.replaceAll(".", " ");
}

function formatEventTime(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function EventIcon({
  category,
}: {
  category: string;
}) {
  if (category === "workout") {
    return <Dumbbell className="h-5 w-5" />;
  }

  if (category === "nutrition") {
    return <Utensils className="h-5 w-5" />;
  }

  if (category === "recovery") {
    return <HeartPulse className="h-5 w-5" />;
  }

  if (category === "progress" || category === "gamification") {
    return <Trophy className="h-5 w-5" />;
  }

  if (category === "profile") {
    return <Sparkles className="h-5 w-5" />;
  }

  return <Activity className="h-5 w-5" />;
}

function EventSummary({
  event,
}: {
  event: TimelineEvent;
}) {
  if (event.type === "readiness.check_in_saved") {
    const score = event.payload.readinessScore;
    const level = event.payload.readinessLevel;

    return (
      <p className="mt-1 text-sm text-slate-400">
        Readiness {String(score ?? "—")}% ·{" "}
        {String(level ?? "Recorded")}
      </p>
    );
  }

  return (
    <p className="mt-1 text-sm capitalize text-slate-400">
      {event.category} activity recorded
    </p>
  );
}

export default function ActivityTimeline({
  events,
}: ActivityTimelineProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
          Apex memory
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          Recent activity
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Meaningful actions recorded by your Event Engine.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-6 text-center">
          <p className="font-bold text-white">
            No activity recorded yet
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Complete a check-in or another Apex activity to begin your timeline.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {events.map((event) => (
            <article
              key={event.id}
              className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                <EventIcon category={event.category} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />

                      <h3 className="font-bold capitalize text-white">
                        {formatEventTitle(event.type)}
                      </h3>
                    </div>

                    <EventSummary event={event} />
                  </div>

                  <time className="shrink-0 text-xs text-slate-500">
                    {formatEventTime(event.occurredAt)}
                  </time>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
