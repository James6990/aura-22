import Link from "next/link";

import {
  CalendarDays,
  Dumbbell,
  Flame,
  Sparkles,
  Trophy,
} from "lucide-react";

type ApexMemory = {
  id: string;
  key: string;
  category: string;
  title: string;
  message: string;
  payload: Record<
    string,
    string | number | boolean | null
  >;
  occurredAt: Date;
  celebratedAt: Date | null;
};

type ApexMemoriesCardProps = {
  memories: ApexMemory[];
};

function MemoryIcon({
  category,
}: {
  category: string;
}) {
  if (category === "workout") {
    return <Dumbbell className="h-5 w-5" />;
  }

  if (category === "consistency") {
    return <Flame className="h-5 w-5" />;
  }

  if (category === "anniversary") {
    return <CalendarDays className="h-5 w-5" />;
  }

  if (category === "progress") {
    return <Trophy className="h-5 w-5" />;
  }

  return <Sparkles className="h-5 w-5" />;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function ApexMemoriesCard({
  memories,
}: ApexMemoriesCardProps) {
  return (
    <section className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-900 to-amber-950/20 p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
          Apex memory
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          Your journey so far
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Meaningful milestones that Apex will remember as
          your story grows.
        </p>
      </div>

      <Link
        href="/journey"
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 text-sm font-black text-amber-200 transition hover:bg-amber-500/20"
      >
        Open The Apex Journey
      </Link>

      {memories.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-6 text-center">
          <p className="font-black text-white">
            Your first memory is waiting
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Complete workouts and build consistent habits to
            begin your Apex journey.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {memories.map((memory) => (
            <article
              key={memory.id}
              className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                <MemoryIcon
                  category={memory.category}
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-black text-white">
                  {memory.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {memory.message}
                </p>

                <time className="mt-3 block text-xs text-slate-500">
                  {formatDate(memory.occurredAt)}
                </time>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
