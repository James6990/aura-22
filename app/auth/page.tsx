"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      if (mode === "sign-up") {
        const result = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
        });

        if (result.error) {
          setErrorMessage(
            result.error.message ?? "We could not create your account.",
          );
          return;
        }
      } else {
        const result = await authClient.signIn.email({
          email: email.trim(),
          password,
        });

        if (result.error) {
          setErrorMessage(
            result.error.message ?? "Your email or password was not accepted.",
          );
          return;
        }
      }

      router.push("/");
      router.refresh();
    } catch {
      setErrorMessage(
        "Apex could not connect to the authentication service. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrorMessage("");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-2">
        <section className="hidden border-r border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/50 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 font-black text-slate-950">
              AX
            </div>

            <div>
              <p className="font-black tracking-wide text-white">APEX OS</p>
              <p className="text-xs text-slate-400">
                Adaptive human performance platform
              </p>
            </div>
          </div>

          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-300">
              <Activity className="h-4 w-4" />
              Your journey starts here
            </span>

            <h1 className="max-w-lg text-5xl font-black leading-tight text-white">
              Understand yourself.
              <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Improve every day.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">
              Apex adapts training, nutrition, recovery and daily guidance
              around your goals, preferences and accessibility requirements.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Your account protects your progress and personalised settings.
          </div>
        </section>

        <section className="flex items-center justify-center p-5 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 font-black text-slate-950">
                AX
              </div>

              <div>
                <p className="font-black text-white">APEX OS</p>
                <p className="text-xs text-slate-400">
                  Your adaptive performance system
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  {mode === "sign-in" ? "Welcome back" : "Join Apex"}
                </p>

                <h2 className="mt-2 text-3xl font-black text-white">
                  {mode === "sign-in"
                    ? "Sign in to continue"
                    : "Create your account"}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {mode === "sign-in"
                    ? "Continue your personalised Apex journey."
                    : "Securely save your progress across Apex."}
                </p>
              </div>

              <div
                className="mb-6 grid grid-cols-2 rounded-xl bg-slate-950 p-1"
                aria-label="Choose authentication mode"
              >
                <button
                  type="button"
                  onClick={() => changeMode("sign-in")}
                  className={`min-h-11 rounded-lg px-3 text-sm font-bold transition ${
                    mode === "sign-in"
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={() => changeMode("sign-up")}
                  className={`min-h-11 rounded-lg px-3 text-sm font-bold transition ${
                    mode === "sign-up"
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Create account
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "sign-up" && (
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-slate-200"
                    >
                      Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                      placeholder="Your name"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-200"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        mode === "sign-up"
                          ? "new-password"
                          : "current-password"
                      }
                      required
                      minLength={8}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                      placeholder="At least 8 characters"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
                  >
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    <>
                      {mode === "sign-in"
                        ? "Enter Apex"
                        : "Create Apex account"}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                Apex recommendations are personalised estimates and are not a
                replacement for professional medical advice.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
