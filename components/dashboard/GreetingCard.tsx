type GreetingCardProps = {
  preferredName: string;
  primaryGoal: string;
  missionHeadline?: string;
  nextAction?: string;
  confidence?: number;
};

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";

  return "Good evening";
}

export default function GreetingCard({
  preferredName,
  primaryGoal,
  missionHeadline =
    "Keep moving forward",
  nextAction =
    "Choose the next action that supports your goal today.",
  confidence = 50,
}: GreetingCardProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
      <p className="text-sm font-bold text-emerald-400">
        {getGreeting()}, {preferredName} 👋
      </p>

      <p className="mt-5 text-xs font-black uppercase tracking-widest text-slate-500">
        Today&apos;s mission
      </p>

      <h1 className="mt-2 text-3xl font-black text-white">
        {missionHeadline}
      </h1>

      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
        {nextAction}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
          Goal: {primaryGoal}
        </span>

        <span className="text-xs font-bold text-slate-500">
          Apex confidence {confidence}%
        </span>
      </div>
    </section>
  );
}
