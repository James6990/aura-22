type GreetingCardProps = {
  preferredName: string;
  primaryGoal: string;
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
}: GreetingCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
      <p className="text-sm text-emerald-400 font-bold">
        {getGreeting()}, {preferredName} 👋
      </p>

      <h1 className="mt-2 text-3xl font-black text-white">
        Welcome back to Apex
      </h1>

      <p className="mt-3 text-slate-300">
        Your current mission is{" "}
        <span className="font-bold text-emerald-400">
          {primaryGoal}
        </span>
      </p>
    </div>
  );
}
