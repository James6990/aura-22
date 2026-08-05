"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Save,
  ShieldAlert,
} from "lucide-react";

import { saveExerciseResult } from "@/app/actions/workout-session";
import {
  skipWorkoutExercise,
} from "@/app/actions/workout-lifecycle";
import {
  workoutSkipReasons,
  type WorkoutExerciseResolutionStatus,
  type WorkoutSkipReason,
} from "@/lib/workout/workout-session-lifecycle";

type ExerciseLoggerDisplayStatus =
  | WorkoutExerciseResolutionStatus
  | "unsaved";

const workoutSkipReasonLabels:
  Record<WorkoutSkipReason, string> = {
    "equipment-unavailable":
      "Equipment unavailable",
    discomfort:
      "Discomfort or pain concern",
    "time-limit":
      "Time limit",
    accessibility:
      "Accessibility or movement need",
    substituted:
      "Used a substitute exercise",
    "personal-choice":
      "Personal choice",
    other:
      "Other reason",
  };

type ExerciseLoggerProps = {
  sessionId: string;
  exerciseNumber?: number;
  totalExercises?: number;
  active?: boolean;
  onSaved?: (
    completionStatus:
      WorkoutExerciseResolutionStatus,
  ) => void | Promise<void>;
  exercise: {
    id: string;
    exerciseName: string;
    plannedSets: number;
    completedSets: number;
    targetReps: string;
    loadKg: number | null;
    completedReps: number[];
    rpe: number | null;
    discomfortLevel: number | null;
    techniqueConfidence: number | null;
    completionStatus:
      WorkoutExerciseResolutionStatus;
    notes: string;
  };
};

export default function ExerciseLogger({
  sessionId,
  exercise,
  exerciseNumber,
  totalExercises,
  active = false,
  onSaved,
}: ExerciseLoggerProps) {
  const router = useRouter();

  const initialReps = Array.from(
    { length: exercise.plannedSets },
    (_, index) =>
      String(exercise.completedReps[index] ?? ""),
  );

  const [loadKg, setLoadKg] = useState(
    exercise.loadKg === null
      ? ""
      : String(exercise.loadKg),
  );

  const [reps, setReps] = useState(initialReps);

  const [rpe, setRpe] = useState(
    exercise.rpe === null ? "" : String(exercise.rpe),
  );

  const [discomfort, setDiscomfort] = useState(
    exercise.discomfortLevel === null
      ? ""
      : String(exercise.discomfortLevel),
  );

  const [techniqueConfidence, setTechniqueConfidence] =
    useState(
      exercise.techniqueConfidence === null
        ? ""
        : String(exercise.techniqueConfidence),
    );

  const [notes, setNotes] = useState(exercise.notes);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedStatus, setSavedStatus] =
    useState<ExerciseLoggerDisplayStatus>(
      exercise.completionStatus,
    );

  const [skipExpanded, setSkipExpanded] =
    useState(false);

  const [skipReason, setSkipReason] =
    useState<WorkoutSkipReason | "">("");

  const [skipNote, setSkipNote] =
    useState("");

  const [skipping, setSkipping] =
    useState(false);

  function updateSetReps(index: number, value: string) {
    setReps((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? value : item,
      ),
    );

    setSavedStatus("unsaved");
    setSaveError("");
  }

  async function handleSave() {
    if (saving) return;

    setSaving(true);
    setSaveError("");

    const hasEnteredReps = reps.some(
      (value) => value.trim() !== "",
    );

    if (!hasEnteredReps) {
      setSaveError(
        "Enter the repetitions completed for at least one set before saving.",
      );
      setSaving(false);
      return;
    }

    const parsedReps = reps.map((value) => {
      if (value.trim() === "") {
        return 0;
      }

      const parsed = Number(value);

      return Number.isInteger(parsed) && parsed > 0
        ? parsed
        : 0;
    });

    if (!parsedReps.some((value) => value > 0)) {
      setSaveError(
        "At least one completed set must contain a repetition value greater than zero.",
      );
      setSaving(false);
      return;
    }

    try {
      const result = await saveExerciseResult({
        exerciseResultId: exercise.id,
        sessionId,
        loadKg:
          loadKg.trim() === ""
            ? null
            : Number(loadKg),
        completedReps: parsedReps,
        rpe:
          rpe.trim() === ""
            ? null
            : Number(rpe),
        discomfortLevel:
          discomfort.trim() === ""
            ? null
            : Number(discomfort),
        techniqueConfidence:
          techniqueConfidence.trim() === ""
            ? null
            : Number(techniqueConfidence),
        notes,
      });

      if (!result.success) {
        setSaveError(result.error);
        return;
      }

      setSavedStatus(result.completionStatus);
      await onSaved?.(
        result.completionStatus,
      );

      router.refresh();
    } catch (error) {
      console.error("Failed to log exercise:", error);

      setSaveError(
        "Apex could not save this exercise. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    if (
      skipping ||
      saving ||
      savedStatus === "completed" ||
      savedStatus === "skipped"
    ) {
      return;
    }

    if (!skipReason) {
      setSaveError(
        "Choose a reason before skipping this exercise.",
      );
      return;
    }

    setSkipping(true);
    setSaveError("");

    try {
      const result =
        await skipWorkoutExercise({
          sessionId,
          exerciseResultId:
            exercise.id,
          reason:
            skipReason,
          note:
            skipNote,
        });

      if (!result.success) {
        setSaveError(
          result.error,
        );
        return;
      }

      setSavedStatus(
        result.completionStatus,
      );

      setSkipExpanded(false);

      await onSaved?.(
        result.completionStatus,
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Failed to skip exercise:",
        error,
      );

      setSaveError(
        "Apex could not skip this exercise. Please try again.",
      );
    } finally {
      setSkipping(false);
    }
  }

  const discomfortNumber = Number(discomfort);
  const showDiscomfortWarning =
    Number.isFinite(discomfortNumber) &&
    discomfortNumber >= 4;

  return (
    <article
      className={`rounded-2xl border bg-slate-900/70 p-5 ${
        active
          ? "border-emerald-400/60 ring-1 ring-emerald-400/20"
          : "border-slate-800"
      }`}
    >
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          {exerciseNumber !== undefined &&
            totalExercises !== undefined && (
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
                Exercise {exerciseNumber} of{" "}
                {totalExercises}
              </p>
            )}

          <h2 className="text-xl font-black text-white">
            {exercise.exerciseName}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {exercise.plannedSets} sets ·{" "}
            {exercise.targetReps}
          </p>
        </div>

        <span className="w-fit rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-bold capitalize text-slate-300">
          {savedStatus.replaceAll("-", " ")}
        </span>
      </div>

      <div className="mt-5">
        <label
          htmlFor={`${exercise.id}-load`}
          className="text-sm font-bold text-slate-200"
        >
          Load used (kg)
        </label>

        <input
          id={`${exercise.id}-load`}
          type="number"
          min="0"
          max="1500"
          step="0.25"
          inputMode="decimal"
          value={loadKg}
          onChange={(event) => {
            setLoadKg(event.target.value);
            setSavedStatus("unsaved");
          }}
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-base text-white"
          placeholder="Example: 45"
        />
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-bold text-slate-200">
          Repetitions completed
        </legend>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {reps.map((value, index) => (
            <label
              key={index}
              className="rounded-xl border border-slate-800 bg-slate-950/70 p-3"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Set {index + 1}
              </span>

              <input
                type="number"
                min="0"
                max="1000"
                step="1"
                inputMode="numeric"
                value={value}
                onChange={(event) =>
                  updateSetReps(
                    index,
                    event.target.value,
                  )
                }
                className="mt-2 min-h-11 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 text-base text-white"
                aria-label={`Repetitions completed for set ${
                  index + 1
                }`}
                placeholder="Reps"
              />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <NumberField
          id={`${exercise.id}-rpe`}
          label="Effort (RPE 1–10)"
          value={rpe}
          minimum={1}
          maximum={10}
          onChange={(value) => {
            setRpe(value);
            setSavedStatus("unsaved");
          }}
        />

        <NumberField
          id={`${exercise.id}-discomfort`}
          label="Discomfort (0–10)"
          value={discomfort}
          minimum={0}
          maximum={10}
          onChange={(value) => {
            setDiscomfort(value);
            setSavedStatus("unsaved");
          }}
        />

        <NumberField
          id={`${exercise.id}-technique`}
          label="Technique confidence %"
          value={techniqueConfidence}
          minimum={0}
          maximum={100}
          onChange={(value) => {
            setTechniqueConfidence(value);
            setSavedStatus("unsaved");
          }}
        />
      </div>

      {showDiscomfortWarning && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
        >
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />

          <p className="text-sm leading-6 text-amber-100">
            You recorded noticeable discomfort. Stop or adapt the
            movement rather than pushing through it. Seek appropriate
            professional advice when symptoms are severe, worsening or
            concerning.
          </p>
        </div>
      )}

      <div className="mt-5">
        <label
          htmlFor={`${exercise.id}-notes`}
          className="text-sm font-bold text-slate-200"
        >
          Exercise notes
        </label>

        <textarea
          id={`${exercise.id}-notes`}
          value={notes}
          maxLength={1000}
          rows={3}
          onChange={(event) => {
            setNotes(event.target.value);
            setSavedStatus("unsaved");
          }}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white"
          placeholder="Optional notes about technique, setup or substitutions"
        />
      </div>

      {saveError && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
        >
          {saveError}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={
          saving ||
          skipping ||
          savedStatus === "skipped"
        }
        className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {savedStatus === "completed" ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Save className="h-5 w-5" />
        )}

        {saving
          ? "Saving exercise..."
          : savedStatus === "skipped"
            ? "Exercise skipped"
            : savedStatus === "completed"
              ? "Update completed exercise"
              : "Save exercise"}
      </button>

      <div className="mt-3">
        <button
          type="button"
          onClick={() => {
            setSkipExpanded(
              (current) => !current,
            );

            setSaveError("");
          }}
          disabled={
            saving ||
            skipping ||
            savedStatus === "completed" ||
            savedStatus === "skipped"
          }
          aria-expanded={skipExpanded}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-5 font-black text-slate-300 transition hover:border-amber-500/40 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Ban className="h-5 w-5" />

          {savedStatus === "skipped"
            ? "Exercise skipped"
            : "Skip this exercise"}

          {savedStatus !== "skipped" &&
            (skipExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            ))}
        </button>
      </div>

      {skipExpanded &&
        savedStatus !== "completed" &&
        savedStatus !== "skipped" && (
          <section className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <p className="font-black text-amber-100">
              Skip exercise
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Skipping is not treated as failure. The reason helps Apex
              understand equipment, safety, accessibility and session
              context without making assumptions.
            </p>

            <div className="mt-4">
              <label
                htmlFor={`${exercise.id}-skip-reason`}
                className="text-sm font-bold text-slate-200"
              >
                Reason
              </label>

              <select
                id={`${exercise.id}-skip-reason`}
                value={skipReason}
                onChange={(event) => {
                  setSkipReason(
                    event.target.value as
                      WorkoutSkipReason | "",
                  );

                  setSaveError("");
                }}
                className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-base text-white"
              >
                <option value="">
                  Choose a reason
                </option>

                {workoutSkipReasons.map(
                  (reason) => (
                    <option
                      key={reason}
                      value={reason}
                    >
                      {
                        workoutSkipReasonLabels[
                          reason
                        ]
                      }
                    </option>
                  ),
                )}
              </select>
            </div>

            <div className="mt-4">
              <label
                htmlFor={`${exercise.id}-skip-note`}
                className="text-sm font-bold text-slate-200"
              >
                Optional note
              </label>

              <textarea
                id={`${exercise.id}-skip-note`}
                value={skipNote}
                maxLength={500}
                rows={3}
                onChange={(event) =>
                  setSkipNote(
                    event.target.value,
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white"
                placeholder="Example: cable station unavailable, used dumbbells instead"
              />
            </div>

            {skipReason === "discomfort" && (
              <div
                role="note"
                className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
              >
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />

                <p className="text-sm leading-6 text-amber-100">
                  Choosing not to continue a movement because of
                  discomfort is a responsible training decision.
                  Consider an appropriate alternative or professional
                  guidance when symptoms are concerning.
                </p>
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setSkipExpanded(false);
                  setSaveError("");
                }}
                disabled={skipping}
                className="min-h-12 rounded-xl border border-slate-700 bg-slate-950 px-5 font-black text-slate-300 disabled:opacity-50"
              >
                Keep exercise
              </button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={
                  skipping ||
                  !skipReason
                }
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 font-black text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Ban className="h-5 w-5" />

                {skipping
                  ? "Skipping exercise..."
                  : "Confirm skip"}
              </button>
            </div>
          </section>
        )}
    </article>
  );
}

function NumberField({
  id,
  label,
  value,
  minimum,
  maximum,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  minimum: number;
  maximum: number;
  onChange: (value: string) => void;
}) {
  return (
    <label htmlFor={id}>
      <span className="text-sm font-bold text-slate-200">
        {label}
      </span>

      <input
        id={id}
        type="number"
        min={minimum}
        max={maximum}
        step="1"
        inputMode="numeric"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="mt-2 min-h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-base text-white"
      />
    </label>
  );
}
