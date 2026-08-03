import {
  CheckCircle2,
  Droplets,
  Dumbbell,
  HeartPulse,
} from "lucide-react";

type HistoryEntry = {
  date: string;
  energy: number;
  readinessScore: number;
  readinessLevel: string;
  workoutCompleted: boolean;
  recoveryCompleted: boolean;
  hydrationTargetReached: boolean;
};

type ReadinessHistoryProps = {
  entries: HistoryEntry[];
};

function formatDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(parsed);
}

export default function ReadinessHistory({
  entries,
}: ReadinessHistoryProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
          Seven-day history
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">
          Readiness trend
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Your most recent daily check-ins and recovery signals.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-700 p-6 text-center">
          <p className="font-bold text-white">
            No readiness history yet
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Complete daily check-ins to build your trend.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {entries.map((entry) => (
            <article
              key={entry.date}
              className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-white">
                    {formatDate(entry.date)}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Energy {entry.energy}/10 ·{" "}
                    {entry.readinessLevel}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-black text-emerald-400">
                    {entry.readinessScore}%
                  </p>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Readiness
                  </p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                  style={{
                    width: `${entry.readinessScore}%`,
                  }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Status
                  label="Workout"
                  active={entry.workoutCompleted}
                  icon={<Dumbbell className="h-3.5 w-3.5" />}
                />

                <Status
                  label="Recovery"
                  active={entry.recoveryCompleted}
                  icon={<HeartPulse className="h-3.5 w-3.5" />}
                />

                <Status
                  label="Hydration"
                  active={entry.hydrationTargetReached}
                  icon={<Droplets className="h-3.5 w-3.5" />}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Status({
  label,
  active,
  icon,
}: {
  label: string;
  active: boolean;
  icon: React.ReactNode;
}) {
  return (
    <span
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
        active
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-slate-700 bg-slate-900 text-slate-500"
      }`}
    >
      {active ? (
        <CheckCircle2 className="h-3.5 w-3.5" />
      ) : (
        icon
      )}
      {label}
    </span>
  );
}
