"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronDown,
  MessageCircle,
  Send,
  Sparkles,
  Target,
} from "lucide-react";

type ApexStructuredReply = {
  recommendationTitle: string;
  recommendation: string;
  confidenceLabel: string;
  confidence: number;
  reasons: string[];
  nextStep: string;
  followUpQuestions: string[];
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  structured?: ApexStructuredReply;
};

type ApexCoachChatProps = {
  preferredName: string;
};

function ConfidenceCard({
  label,
  confidence,
}: {
  label: string;
  confidence: number;
}) {
  const displayLabel =
    confidence < 50
      ? "Learning You"
      : confidence < 80
        ? label || "Growing confidence"
        : label || "High confidence";

  return (
    <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
            Apex confidence
          </p>

          <p className="mt-2 font-black text-white">
            {displayLabel}
          </p>
        </div>

        <span className="text-xl font-black text-amber-300">
          {confidence}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Apex recommendation confidence"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={confidence}
        className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400"
          style={{
            width: `${confidence}%`,
          }}
        />
      </div>

      {confidence < 50 && (
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Apex is still learning your patterns. More completed
          check-ins and activities will strengthen future guidance.
        </p>
      )}
    </section>
  );
}

function StructuredReplyCard({
  reply,
  onFollowUp,
}: {
  reply: ApexStructuredReply;
  onFollowUp: (question: string) => void;
}) {
  return (
    <article className="w-full space-y-3 rounded-3xl border border-cyan-500/20 bg-slate-950 p-4 sm:p-5">
      <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
          Today&apos;s mission
        </p>

        <h2 className="mt-2 text-xl font-black text-white">
          {reply.recommendationTitle}
        </h2>

        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
          {reply.recommendation}
        </p>
      </section>

      <ConfidenceCard
        label={reply.confidenceLabel}
        confidence={reply.confidence}
      />

      <details className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-black text-white">
          <span>Why Apex recommends this</span>

          <ChevronDown className="h-5 w-5 transition group-open:rotate-180" />
        </summary>

        <div className="mt-4 space-y-3">
          {reply.reasons.map((reason) => (
            <div
              key={reason}
              className="flex items-start gap-3"
            >
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />

              <p className="text-sm leading-6 text-slate-400">
                {reason}
              </p>
            </div>
          ))}
        </div>
      </details>

      <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-start gap-3">
          <Target className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Your next win
            </p>

            <p className="mt-2 text-sm font-bold leading-6 text-white">
              {reply.nextStep}
            </p>
          </div>
        </div>
      </section>

      {reply.followUpQuestions.length > 0 && (
        <section>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Continue the conversation
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {reply.followUpQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => onFollowUp(question)}
                className="min-h-11 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 text-left text-sm font-bold text-cyan-200 transition hover:bg-cyan-500/10"
              >
                {question}
              </button>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

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

  const conversationEndRef =
    useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  async function sendMessage(message: string) {
    const cleanedMessage = message.trim();

    if (!cleanedMessage || loading) {
      return;
    }

    const previousMessages = messages;

    setMessages((current) => [
      ...current,
      {
        role: "user",
        text: cleanedMessage,
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
          message: cleanedMessage,
          history: previousMessages.map((item) => ({
            role: item.role,
            text: item.text,
          })),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        structured?: ApexStructuredReply;
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
      const structuredReply = data.structured;

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: reply,
          structured: structuredReply,
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

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    await sendMessage(input);
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
              Talk with Apex
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Clear guidance grounded in your Apex data.
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
        className="mt-6 space-y-4"
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
            {message.role === "assistant" &&
            message.structured ? (
              <StructuredReplyCard
                reply={message.structured}
                onFollowUp={sendMessage}
              />
            ) : (
              <div
                className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-cyan-400 font-medium text-slate-950"
                    : "border border-slate-800 bg-slate-950 text-slate-200"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div
            role="status"
            className="flex justify-start"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-400">
              <Sparkles className="h-4 w-4" />
              Apex is reviewing your data...
            </div>
          </div>
        )}

        <div ref={conversationEndRef} />
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
            placeholder="What should I focus on today?"
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

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <MessageCircle className="h-4 w-4" />
          Apex keeps answers focused and explains more when you ask.
        </div>
      </form>
    </section>
  );
}
