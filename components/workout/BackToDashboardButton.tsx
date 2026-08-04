"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle } from "lucide-react";

export default function BackToDashboardButton() {
  const router = useRouter();
  const [navigating, setNavigating] =
    useState(false);

  function handleBack() {
    if (navigating) {
      return;
    }

    setNavigating(true);

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      disabled={navigating}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm font-bold text-slate-300 transition hover:border-slate-700 hover:text-white disabled:cursor-wait disabled:opacity-60"
    >
      {navigating ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowLeft className="h-4 w-4" />
      )}

      {navigating
        ? "Opening dashboard..."
        : "Back to dashboard"}
    </button>
  );
}
