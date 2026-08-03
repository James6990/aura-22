"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { savePerformanceGenome } from "@/app/actions/performance-genome";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Dumbbell,
  Heart,
  Home,
  ShieldCheck,
  Sparkles,
  Trophy,
  Utensils,
} from "lucide-react";

type Goal =
  | "muscle"
  | "fat-loss"
  | "recomposition"
  | "performance"
  | "health";

type Experience = "beginner" | "intermediate" | "advanced";

type Equipment =
  | "full-gym"
  | "home-gym"
  | "bodyweight"
  | "outdoors";

type Diet =
  | "standard"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "other";

type CoachStyle =
  | "encouraging"
  | "scientific"
  | "competitive"
  | "calm";

type OnboardingData = {
  name: string;
  age: string;
  heightCm: string;
  weightKg: string;
  goal: Goal | null;
  experience: Experience | null;
  equipment: Equipment[];
  diet: Diet;
  allergies: string;
  highContrast: boolean;
  reducedMotion: boolean;
  focusMode: boolean;
  largerText: boolean;
  coachStyle: CoachStyle;
};

const TOTAL_STEPS = 8;

const goalOptions: Array<{
  value: Goal;
  title: string;
  description: string;
}> = [
  {
    value: "muscle",
    title: "Build muscle",
    description: "Increase strength and lean muscle mass.",
  },
  {
    value: "fat-loss",
    title: "Lose body fat",
    description: "Build sustainable nutrition and activity habits.",
  },
  {
    value: "recomposition",
    title: "Body recomposition",
    description: "Build muscle while gradually reducing body fat.",
  },
  {
    value: "performance",
    title: "Improve performance",
    description: "Develop strength, speed, stamina or endurance.",
  },
  {
    value: "health",
    title: "Health and vitality",
    description: "Improve movement, energy and consistency.",
  },
];

const equipmentOptions: Array<{
  value: Equipment;
  title: string;
  description: string;
}> = [
  {
    value: "full-gym",
    title: "Full gym",
    description: "Machines, cables, barbells and dumbbells.",
  },
  {
    value: "home-gym",
    title: "Home equipment",
    description: "Dumbbells, bands, bench or limited equipment.",
  },
  {
    value: "bodyweight",
    title: "Bodyweight",
    description: "No equipment required.",
  },
  {
    value: "outdoors",
    title: "Outdoor training",
    description: "Walking, running, cycling or outdoor activity.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [data, setData] = useState<OnboardingData>({
    name: "",
    age: "",
    heightCm: "",
    weightKg: "",
    goal: null,
    experience: null,
    equipment: [],
    diet: "standard",
    allergies: "",
    highContrast: false,
    reducedMotion: false,
    focusMode: false,
    largerText: false,
    coachStyle: "encouraging",
  });

  const progress = Math.round((step / TOTAL_STEPS) * 100);

  function updateData<K extends keyof OnboardingData>(
    key: K,
    value: OnboardingData[K],
  ) {
    setData((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function toggleEquipment(value: Equipment) {
    setData((current) => ({
      ...current,
      equipment: current.equipment.includes(value)
        ? current.equipment.filter((item) => item !== value)
        : [...current.equipment, value],
    }));
  }

  function canContinue() {
    if (step === 2) {
      return data.name.trim().length > 0;
    }

    if (step === 3) {
      return (
        Number(data.age) > 0 &&
        Number(data.heightCm) > 0 &&
        Number(data.weightKg) > 0
      );
    }

    if (step === 4) {
      return data.goal !== null;
    }

    if (step === 5) {
      return data.experience !== null && data.equipment.length > 0;
    }

    return true;
  }

  function goBack() {
    setStep((current) => Math.max(1, current - 1));
  }

  async function goNext() {
    if (!canContinue() || savingProfile) {
      return;
    }

    setSaveError("");

    if (step < TOTAL_STEPS) {
      setStep((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!data.goal || !data.experience) {
      setSaveError(
        "Please complete all required onboarding information.",
      );
      return;
    }

    setSavingProfile(true);

    const result = await savePerformanceGenome({
      preferredName: data.name.trim(),
      age: Number(data.age),
      heightCm: Number(data.heightCm),
      weightKg: Number(data.weightKg),
      primaryGoal: data.goal,
      experienceLevel: data.experience,
      equipment: data.equipment,
      dietaryPreference: data.diet,
      allergiesAndAvoidances: data.allergies,
      coachStyle: data.coachStyle,
      focusMode: data.focusMode,
      highContrast: data.highContrast,
      reducedMotion: data.reducedMotion,
      largerText: data.largerText,
    });

    if (!result.success) {
      setSaveError(result.error);
      setSavingProfile(false);
      return;
    }

    router.replace("/");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-8 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 font-black text-slate-950">
                AX
              </div>

              <div>
                <p className="font-black text-white">APEX OS</p>
                <p className="text-xs text-slate-400">
                  Performance Genome setup
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-slate-400">
              Step {step} of {TOTAL_STEPS}
            </span>
          </div>

          <div
            className="h-2 overflow-hidden rounded-full bg-slate-800"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Onboarding progress"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-black/30 sm:p-9">
          {step === 1 && (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/30 bg-emerald-500/10">
                <Sparkles className="h-9 w-9 text-emerald-400" />
              </div>

              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Welcome to Apex
              </p>

              <h1 className="mt-3 text-3xl font-black text-white sm:text-5xl">
                Build your
                <span className="block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Performance Genome
                </span>
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300">
                Apex will use your goals, preferences and feedback to create a
                fitness, nutrition and recovery experience that adapts over
                time.
              </p>

              <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                {[
                  "Personalised guidance",
                  "Accessible by default",
                  "Adapts as you progress",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-left text-xs font-semibold"
                  >
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <StepHeading
                eyebrow="Your identity"
                title="What should Apex call you?"
                description="This name will appear throughout your dashboard and coaching experience."
              />

              <label
                htmlFor="preferred-name"
                className="mt-8 block text-sm font-semibold"
              >
                Preferred name
              </label>

              <input
                id="preferred-name"
                type="text"
                autoComplete="name"
                value={data.name}
                onChange={(event) => updateData("name", event.target.value)}
                placeholder="Enter your name"
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />

              <PrivacyNotice />
            </div>
          )}

          {step === 3 && (
            <div>
              <StepHeading
                eyebrow="Starting measurements"
                title="Tell Apex about your current starting point"
                description="These values help personalise future targets. They can be updated at any time."
              />

              <div className="mt-8 grid gap-5 sm:grid-cols-3">
                <NumberField
                  id="age"
                  label="Age"
                  value={data.age}
                  suffix="years"
                  onChange={(value) => updateData("age", value)}
                />

                <NumberField
                  id="height"
                  label="Height"
                  value={data.heightCm}
                  suffix="cm"
                  onChange={(value) => updateData("heightCm", value)}
                />

                <NumberField
                  id="weight"
                  label="Weight"
                  value={data.weightKg}
                  suffix="kg"
                  onChange={(value) => updateData("weightKg", value)}
                />
              </div>

              <PrivacyNotice />
            </div>
          )}

          {step === 4 && (
            <div>
              <StepHeading
                eyebrow="Your primary goal"
                title="What would you most like to achieve?"
                description="Apex will use this as the starting point for your first plan."
              />

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {goalOptions.map((option) => {
                  const selected = data.goal === option.value;

                  return (
                    <SelectionCard
                      key={option.value}
                      selected={selected}
                      title={option.title}
                      description={option.description}
                      onClick={() => updateData("goal", option.value)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <StepHeading
                eyebrow="Training setup"
                title="How do you currently train?"
                description="This helps Apex recommend realistic sessions using equipment you actually have."
              />

              <h2 className="mt-8 font-bold text-white">
                Experience level
              </h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    value: "beginner" as const,
                    title: "Beginner",
                    description: "New or returning after a long break.",
                  },
                  {
                    value: "intermediate" as const,
                    title: "Intermediate",
                    description: "Training consistently for some time.",
                  },
                  {
                    value: "advanced" as const,
                    title: "Advanced",
                    description: "Experienced with structured programming.",
                  },
                ].map((option) => (
                  <SelectionCard
                    key={option.value}
                    selected={data.experience === option.value}
                    title={option.title}
                    description={option.description}
                    onClick={() =>
                      updateData("experience", option.value)
                    }
                  />
                ))}
              </div>

              <h2 className="mt-8 font-bold text-white">
                Equipment available
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Select every option you can regularly use.
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {equipmentOptions.map((option) => (
                  <SelectionCard
                    key={option.value}
                    selected={data.equipment.includes(option.value)}
                    title={option.title}
                    description={option.description}
                    onClick={() => toggleEquipment(option.value)}
                  />
                ))}
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <StepHeading
                eyebrow="Nutrition preferences"
                title="How should Apex personalise food guidance?"
                description="Dietary restrictions and allergies will be treated as firm exclusions."
              />

              <label
                htmlFor="diet"
                className="mt-8 block text-sm font-semibold"
              >
                Dietary preference
              </label>

              <select
                id="diet"
                value={data.diet}
                onChange={(event) =>
                  updateData("diet", event.target.value as Diet)
                }
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
              >
                <option value="standard">Standard / omnivore</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan / plant-based</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="other">Other preference</option>
              </select>

              <label
                htmlFor="allergies"
                className="mt-6 block text-sm font-semibold"
              >
                Allergies, intolerances or foods to avoid
              </label>

              <textarea
                id="allergies"
                value={data.allergies}
                onChange={(event) =>
                  updateData("allergies", event.target.value)
                }
                placeholder="For example: dairy, peanuts, wheat or foods you dislike"
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-emerald-400"
              />

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                <Utensils className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <p className="text-xs leading-6 text-slate-300">
                  Food recognition and nutrition estimates may be approximate.
                  Users should always check ingredient labels when managing
                  allergies.
                </p>
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <StepHeading
                eyebrow="Accessibility and coaching"
                title="How should Apex work for you?"
                description="These preferences will shape the interface and the way Apex communicates."
              />

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <ToggleCard
                  title="Focus mode"
                  description="Reduce visual clutter and highlight the current task."
                  enabled={data.focusMode}
                  onClick={() =>
                    updateData("focusMode", !data.focusMode)
                  }
                />

                <ToggleCard
                  title="High contrast"
                  description="Increase contrast between text, controls and backgrounds."
                  enabled={data.highContrast}
                  onClick={() =>
                    updateData("highContrast", !data.highContrast)
                  }
                />

                <ToggleCard
                  title="Reduced motion"
                  description="Limit optional animations and visual movement."
                  enabled={data.reducedMotion}
                  onClick={() =>
                    updateData("reducedMotion", !data.reducedMotion)
                  }
                />

                <ToggleCard
                  title="Larger text"
                  description="Use larger default text throughout Apex."
                  enabled={data.largerText}
                  onClick={() =>
                    updateData("largerText", !data.largerText)
                  }
                />
              </div>

              <label
                htmlFor="coach-style"
                className="mt-8 block text-sm font-semibold"
              >
                Preferred coaching style
              </label>

              <select
                id="coach-style"
                value={data.coachStyle}
                onChange={(event) =>
                  updateData(
                    "coachStyle",
                    event.target.value as CoachStyle,
                  )
                }
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-white outline-none focus:border-emerald-400"
              >
                <option value="encouraging">Encouraging coach</option>
                <option value="scientific">
                  Clear and evidence-informed
                </option>
                <option value="competitive">
                  Competitive and challenge-focused
                </option>
                <option value="calm">
                  Calm and habit-focused
                </option>
              </select>
            </div>
          )}

          {step === 8 && (
            <div>
              <StepHeading
                eyebrow="Performance Genome ready"
                title={`Welcome to Apex, ${data.name}`}
                description="Review your starting profile before Apex creates your first personalised experience."
              />

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <SummaryCard
                  icon={<Trophy className="h-5 w-5" />}
                  label="Primary goal"
                  value={
                    goalOptions.find(
                      (option) => option.value === data.goal,
                    )?.title ?? "Not selected"
                  }
                />

                <SummaryCard
                  icon={<Dumbbell className="h-5 w-5" />}
                  label="Experience"
                  value={data.experience ?? "Not selected"}
                />

                <SummaryCard
                  icon={<Home className="h-5 w-5" />}
                  label="Training access"
                  value={`${data.equipment.length} option${
                    data.equipment.length === 1 ? "" : "s"
                  } selected`}
                />

                <SummaryCard
                  icon={<Utensils className="h-5 w-5" />}
                  label="Nutrition"
                  value={data.diet}
                />

                <SummaryCard
                  icon={<Heart className="h-5 w-5" />}
                  label="Coaching style"
                  value={data.coachStyle}
                />

                <SummaryCard
                  icon={<ShieldCheck className="h-5 w-5" />}
                  label="Accessibility"
                  value={`${
                    [
                      data.focusMode,
                      data.highContrast,
                      data.reducedMotion,
                      data.largerText,
                    ].filter(Boolean).length
                  } preferences enabled`}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <p className="text-sm font-bold text-emerald-300">
                  Your first Apex profile is ready.
                </p>

                <p className="mt-2 text-xs leading-6 text-slate-300">
                  Apex will begin with these preferences and improve future
                  recommendations through your feedback and activity.
                </p>
              </div>
            </div>
          )}

          {saveError && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
            >
              {saveError}
            </div>
          )}

          <footer className="mt-9 flex items-center justify-between gap-3 border-t border-slate-800 pt-6">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 1}
              className="flex min-h-11 items-center gap-2 rounded-xl border border-slate-700 px-4 text-sm font-bold text-slate-300 transition hover:border-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue() || savingProfile}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {savingProfile
                ? "Creating profile..."
                : step === TOTAL_STEPS
                  ? "Create my Apex profile"
                  : "Continue"}

              <ArrowRight className="h-4 w-4" />
            </button>
          </footer>
        </section>
      </div>
    </main>
  );
}

function StepHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
        {eyebrow}
      </p>

      <h1 className="mt-2 text-3xl font-black text-white">
        {title}
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  suffix,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  suffix: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-200"
      >
        {label}
      </label>

      <div className="relative mt-2">
        <input
          id={id}
          type="number"
          min="1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 pr-16 text-white outline-none focus:border-emerald-400"
        />

        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function SelectionCard({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-24 rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-emerald-400 bg-emerald-500/10"
          : "border-slate-800 bg-slate-950/70 hover:border-slate-600"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-bold text-white">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>

        {selected && (
          <Check className="h-5 w-5 shrink-0 text-emerald-400" />
        )}
      </div>
    </button>
  );
}

function ToggleCard({
  title,
  description,
  enabled,
  onClick,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={enabled}
      className={`rounded-2xl border p-4 text-left transition ${
        enabled
          ? "border-cyan-400 bg-cyan-500/10"
          : "border-slate-800 bg-slate-950/70"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-bold text-white">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>

        <span
          className={`mt-1 flex h-6 w-11 shrink-0 items-center rounded-full p-1 transition ${
            enabled ? "bg-cyan-400" : "bg-slate-700"
          }`}
        >
          <span
            className={`h-4 w-4 rounded-full bg-white transition ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </span>
      </div>
    </button>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-center gap-3 text-emerald-400">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-3 font-bold capitalize text-white">{value}</p>
    </div>
  );
}

function PrivacyNotice() {
  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />

      <p className="text-xs leading-6 text-slate-300">
        Apex only uses personal information you choose to provide. You will
        be able to update or remove it later.
      </p>
    </div>
  );
}
