"use client";

import { useEffect, useState } from "react";
import {
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  TimerReset,
} from "lucide-react";

type RestTimerProps = {
  initialSeconds?: number;
  startSignal: number;
};

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return `${minutes}:${String(remainder).padStart(
    2,
    "0",
  )}`;
}

export default function RestTimer({
  initialSeconds = 90,
  startSignal,
}: RestTimerProps) {
  const [secondsRemaining, setSecondsRemaining] =
    useState(initialSeconds);

  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (startSignal <= 0) {
      return;
    }

    setSecondsRemaining(initialSeconds);
    setRunning(true);
  }, [initialSeconds, startSignal]);

  useEffect(() => {
    if (!running) {
      return;
    }

    if (secondsRemaining <= 0) {
      setRunning(false);
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsRemaining((current) =>
        Math.max(0, current - 1),
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [running, secondsRemaining]);

  function reset() {
    setSecondsRemaining(initialSeconds);
    setRunning(false);
  }

  function skip() {
    setSecondsRemaining(0);
    setRunning(false);
  }

  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
            <TimerReset className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
              Rest timer
            </p>

            <p
              className="mt-1 text-3xl font-black tabular-nums text-white"
              aria-live="polite"
            >
              {formatTime(secondsRemaining)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setRunning((current) => !current)
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 font-bold text-cyan-200"
          >
            {running ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}

            {running ? "Pause" : "Start"}
          </button>

          <button
            type="button"
            onClick={() =>
              setSecondsRemaining(
                (current) => current + 30,
              )
            }
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 font-bold text-slate-300"
          >
            <Plus className="h-4 w-4" />
            30 sec
          </button>

          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 font-bold text-slate-300"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <button
            type="button"
            onClick={skip}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 font-bold text-slate-300"
          >
            <SkipForward className="h-4 w-4" />
            Skip
          </button>
        </div>
      </div>

      {secondsRemaining === 0 && (
        <p
          role="status"
          className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm font-bold text-emerald-300"
        >
          Rest complete. Continue when you feel ready.
        </p>
      )}
    </section>
  );
}
