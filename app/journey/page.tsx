import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Dumbbell,
  Flame,
  Sparkles,
  Trophy,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { getApexJourney } from "@/lib/memory/get-apex-journey";

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
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function getChapter(
  index: number,
  total: number,
) {
  if (total <= 1 || index === 0) {
    return {
      number: 1,
      title: "The Beginning",
    };
  }

  if (index < 5) {
    return {
      number: 2,
      title: "Building Habits",
    };
  }

  if (index < 10) {
    return {
      number: 3,
      title: "Finding Consistency",
    };
  }

  return {
    number: 4,
    title: "Growing Stronger",
  };
}

export default async function JourneyPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth");
  }

  const memories = await getApexJourney(
    session.user.id,
  );

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm font-bold text-slate-300 transition hover:border-slate-700 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <header className="mt-6 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-slate-900 to-amber-950/20 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
            The Apex Journey
          </p>

          <h1 className="mt-2 text-3xl font-black text-white">
            How far you&apos;ve come
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
            A permanent record of the milestones, turning points and
            meaningful moments that shape your story with Apex.
          </p>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Memories recorded
            </p>

            <p className="mt-2 text-3xl font-black text-amber-300">
              {memories.length}
            </p>
          </div>
        </header>

        {memories.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-slate-700 bg-slate-900/30 p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-amber-300" />

            <h2 className="mt-4 text-xl font-black text-white">
              Your journey is ready to begin
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Complete workouts and build consistent habits. Apex will
              quietly preserve the moments that matter.
            </p>
          </section>
        ) : (
          <section className="mt-8 space-y-5">
            {memories.map((memory, index) => {
              const chapter = getChapter(
                index,
                memories.length,
              );

              return (
                <article
                  key={memory.id}
                  className="relative rounded-3xl border border-slate-800 bg-slate-900/70 p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-300">
                      <MemoryIcon
                        category={memory.category}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                        Chapter {chapter.number} ·{" "}
                        {chapter.title}
                      </p>

                      <h2 className="mt-2 text-xl font-black text-white">
                        {memory.title}
                      </h2>

                      <p className="mt-3 text-sm leading-7 text-slate-400">
                        {memory.message}
                      </p>

                      <time className="mt-4 block text-xs text-slate-500">
                        {formatDate(memory.occurredAt)}
                      </time>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <footer className="mt-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="text-sm leading-6 text-slate-400">
            Apex celebrates effort, consistency and personal progress.
            Your Journey is private and is never shared unless you
            deliberately choose to share something.
          </p>
        </footer>
      </div>
    </main>
  );
}
