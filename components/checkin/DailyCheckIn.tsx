"use client";

import { useState } from "react";

export default function DailyCheckIn() {
  const [energy, setEnergy] = useState(7);

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="text-xl font-black text-white">
        Daily Check-In
      </h2>

      <p className="mt-2 text-sm text-slate-400">
        Tell Apex how you're feeling today.
      </p>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-bold text-slate-300">
          Energy: {energy}/10
        </label>

        <input
          type="range"
          min="1"
          max="10"
          value={energy}
          onChange={(e) => setEnergy(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <button
        className="mt-6 rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-400"
      >
        Continue
      </button>
    </div>
  );
}
