"use client";

import { useState } from "react";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { syncApexMemories } from "@/app/actions/apex-memory";

export default function SyncMemoriesButton() {
  const router = useRouter();

  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSync() {
    if (syncing) return;

    setSyncing(true);
    setMessage("");
    setError("");

    try {
      const result = await syncApexMemories();

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessage("Apex memories updated.");
      router.refresh();
    } catch (caughtError) {
      console.error(
        "Failed to sync memories:",
        caughtError,
      );

      setError(
        "Apex could not update your memories.",
      );
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div>
      {message && (
        <p
          role="status"
          className="mb-3 text-sm text-emerald-300"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-3 text-sm text-rose-300"
        >
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSync}
        disabled={syncing}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 font-black text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCcw className="h-5 w-5" />

        {syncing
          ? "Updating memories..."
          : "Update journey memories"}
      </button>
    </div>
  );
}
