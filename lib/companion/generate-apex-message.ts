import type { GenomeTraits } from "@/lib/genome/calculate-adaptive-traits";
import type { LatestWorkoutSummary } from "@/lib/workout/get-latest-workout-summary";

export type ApexCompanionMessage = {
  eyebrow: string;
  headline: string;
  message: string;
  action: string;
  mood:
    | "celebration"
    | "focused"
    | "recovery"
    | "supportive"
    | "learning";
};

export type GenerateApexMessageInput = {
  preferredName: string;
  readinessScore: number;
  traits: GenomeTraits;
  currentStreak: number;
  latestWorkout: LatestWorkoutSummary | null;
};

function completedWithinHours(
  date: Date | null,
  hours: number,
) {
  if (!date) return false;

  const elapsed =
    Date.now() - new Date(date).getTime();

  return elapsed >= 0 && elapsed <= hours * 3_600_000;
}

export function generateApexMessage({
  preferredName,
  readinessScore,
  traits,
  currentStreak,
  latestWorkout,
}: GenerateApexMessageInput): ApexCompanionMessage {
  if (
    latestWorkout &&
    latestWorkout.highestDiscomfort >= 4
  ) {
    return {
      eyebrow: "Apex noticed something",
      headline: `Let’s protect your progress, ${preferredName}.`,
      message:
        "Your latest workout included noticeable discomfort. Today’s training should avoid aggravating movements and remain conservative.",
      action:
        "Review the affected exercise before your next demanding session.",
      mood: "recovery",
    };
  }

  if (
    latestWorkout &&
    completedWithinHours(
      latestWorkout.completedAt,
      24,
    )
  ) {
    if (latestWorkout.progressionReady > 0) {
      return {
        eyebrow: "Workout analysed",
        headline: `Excellent work, ${preferredName}.`,
        message:
          `You completed ${latestWorkout.completedExercises} of ${latestWorkout.totalExercises} exercises. ${latestWorkout.progressionReady} exercise ${
            latestWorkout.progressionReady === 1
              ? "is"
              : "are"
          } showing early signs that progression may be appropriate next time.`,
        action:
          "Prioritise hydration and recovery before the next session.",
        mood: "celebration",
      };
    }

    return {
      eyebrow: "Workout complete",
      headline: `Good work, ${preferredName}.`,
      message:
        "Your latest workout is saved and Apex is using the results to shape your future training.",
      action:
        "Recover well and continue recording how you feel.",
      mood: "celebration",
    };
  }

  if (
    readinessScore < 50 ||
    traits.recovery < 50
  ) {
    return {
      eyebrow: "Recovery comes first",
      headline: `Take the pressure off today, ${preferredName}.`,
      message:
        "Your current recovery signals do not support a demanding workout. Progress today means reducing unnecessary fatigue.",
      action:
        "Choose comfortable movement, mobility or a recovery session.",
      mood: "recovery",
    };
  }

  if (
    readinessScore >= 85 &&
    traits.recovery >= 70
  ) {
    return {
      eyebrow: "Strong readiness",
      headline: `You’re ready, ${preferredName}.`,
      message:
        "Your readiness and recovery support a productive session today. Follow the planned workout and keep your technique controlled.",
      action:
        "Start today’s personalised session when you are prepared.",
      mood: "focused",
    };
  }

  if (currentStreak >= 7) {
    return {
      eyebrow: "Consistency recognised",
      headline: `${currentStreak} days and building.`,
      message:
        "You are creating a reliable routine. Apex rewards the habit of showing up, not perfection.",
      action:
        "Complete today’s most meaningful achievable action.",
      mood: "celebration",
    };
  }

  if (traits.confidence < 50) {
    return {
      eyebrow: "Apex is learning",
      headline: `Keep checking in, ${preferredName}.`,
      message:
        "Your early data is beginning to form a personalised picture, but Apex needs more history before making stronger conclusions.",
      action:
        "Complete today’s check-in and record your workout honestly.",
      mood: "learning",
    };
  }

  return {
    eyebrow: "Today’s direction",
    headline: `Let’s keep moving, ${preferredName}.`,
    message:
      "Your current signals support a controlled session. Consistent, manageable work will be more valuable than adding unnecessary intensity.",
    action:
      "Follow today’s recommendation and adjust anything that does not feel right.",
    mood: "supportive",
  };
}
