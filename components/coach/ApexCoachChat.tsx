"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Send,
  Sparkles,
} from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

type ApexCoachChatProps = {
  preferredName: string;
};

export default function ApexCoachChat({
  preferredName,
}: ApexCoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text:
        `Welcome, ${preferredName}. Ask me about your latest workout, recovery, progression, nutrition or Apex Journey.`,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    const previousMessages = messages;

    setMessages((current) => [
      ...current,
      {
        role: "user",
        text: message,
      },
    ]);

    setInput("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history: previousMessages,
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
      };

      if (
        !response.ok ||
        typeof data.reply !== "string"
      ) {
        throw new Error(
          data.reply ??
            "Apex returned an invalid response.",
        );
      }

      const reply = data.reply;

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: reply,
        },
      ]);
    } catch (caughtError) {
      console.error(
        "Apex Coach request failed:",
        caughtError,
      );

      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Apex could not answer just now.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
            <Bot className="h-7 w-7" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
              Apex Coach
            </p>

            <h1 className="mt-2 text-2xl font-black text-white">
              Ask Apex
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Personalised answers grounded in your Apex data.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 text-sm font-bold text-slate-300 transition hover:border-slate-700 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
      </div>

      <div
        className="mt-6 space-y-3"
        aria-live="polite"
      >
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${
              message.role === "user"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                message.role === "user"
                  ? "bg-cyan-400 font-medium text-slate-950"
                  : "border border-slate-800 bg-slate-950 text-slate-200"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-400">
              Apex is reviewing your data...
            </div>
          </div>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 border-t border-slate-800 pt-5"
      >
        <label
          htmlFor="apex-message"
          className="text-sm font-bold text-slate-200"
        >
          Message Apex
        </label>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="apex-message"
            type="text"
            value={input}
            maxLength={1200}
            onChange={(event) =>
              setInput(event.target.value)
            }
            placeholder="Why did you recommend maintaining my load?"
            className="min-h-12 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 text-base text-white"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <Sparkles className="h-5 w-5" />
            ) : (
              <Send className="h-5 w-5" />
            )}

            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </form>
    </section>
  );
}
