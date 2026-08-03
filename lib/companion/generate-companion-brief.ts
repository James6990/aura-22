import type { GenomeTraits } from "@/lib/genome/calculate-adaptive-traits";
import type { LatestWorkoutSummary } from "@/lib/workout/get-latest-workout-summary";
import {
  generateCoachDecision,
  type CoachDecision,
} from "@/lib/companion/generate-coach-decision";

export type CompanionTone =
  | "celebratory"
  | "encouraging"
  | "reassuring"
  | "focused"
  | "gentle"
  | "reflective";

export type CompanionMemory = {
  title: string;
  message: string;
  category: string;
  occurredAt: Date;
};

export type CompanionBrief = {
  greeting: string;
  todayFocus: string;
  encouragement: string;
  celebration: string | null;
  tone: CompanionTone;
  isComeback: boolean;
  daysSinceLastWorkout: number | null;
  decision: CoachDecision;
};

export type GenerateCompanionBriefInput = {
  preferredName: string;
  readinessScore: number;
  traits: GenomeTraits;
  currentStreak: number;
  latestWorkout: LatestWorkoutSummary | null;
  recentMemories?: CompanionMemory[];
};

function getDaysSince(date: Date | null) {
  if (!date) {
    return null;
  }

  const elapsed =
    Date.now() - new Date(date).getTime();

  if (elapsed < 0) {
    return 0;
  }

  return Math.floor(elapsed / 86_400_000);
}

function formatFocus(
  priority: CoachDecision["priority"],
) {
  switch (priority) {
    case "celebrate":
      return "Recognise your progress";

    case "recover":
      return "Recovery";

    case "train":
      return "Purposeful training";

    case "technique":
      return "Comfort and technique";

    case "hydrate":
      return "Hydration";

    case "build-consistency":
      return "One achievable step";

    case "collect-data":
      return "Help Apex learn";

    default:
      return "Keep moving forward";
  }
}

function getTone(
  decision: CoachDecision,
  isComeback: boolean,
): CompanionTone {
  if (isComeback) {
    return "reassuring";
  }

  if (decision.priority === "celebrate") {
    return "celebratory";
  }

  if (
    decision.priority === "recover" ||
    decision.priority === "technique"
  ) {
    return "gentle";
  }

  if (decision.priority === "train") {
    return "focused";
  }

  if (decision.priority === "collect-data") {
    return "reflective";
  }

  return "encouraging";
}

function getComebackEncouragement(
  daysSinceLastWorkout: number,
) {
  if (daysSinceLastWorkout >= 30) {
    return (
      "You do not need to make up for lost time. " +
      "We will continue your Journey with one comfortable, achievable step."
    );
  }

  if (daysSinceLastWorkout >= 14) {
    return (
      "It has been a little while, and that is okay. " +
      "Today is about rebuilding confidence rather than testing your limits."
    );
  }

  return (
    "Welcome back. Your Journey was never erased. " +
    "Let’s begin again from where you are today."
  );
}

function getStandardEncouragement(
  decision: CoachDecision,
  currentStreak: number,
) {
  if (decision.priority === "celebrate") {
    return (
      "Take a moment to recognise the work you completed. " +
      "Progress deserves to be noticed as well as measured."
    );
  }

  if (decision.priority === "recover") {
    return (
      "Choosing recovery is not stepping backwards. " +
      "It is part of building progress that lasts."
    );
  }

  if (decision.priority === "technique") {
    return (
      "You never need to push through discomfort to prove commitment. " +
      "Comfortable, controlled movement comes first."
    );
  }

  if (decision.priority === "build-consistency") {
    return (
      "A small action completed today is more valuable than a perfect plan postponed."
    );
  }

  if (currentStreak >= 7) {
    return (
      "Your consistency is becoming a strength. " +
      "Keep today manageable enough that you can return again."
    );
  }

  if (decision.priority === "train") {
    return (
      "You are ready to make today count. " +
      "Train with purpose, but leave room to recover and return."
    );
  }

  return (
    "You do not need to be perfect today. " +
    "Choose the next action that genuinely supports you."
  );
}

export function generateCompanionBrief({
  preferredName,
  readinessScore,
  traits,
  currentStreak,
  latestWorkout,
  recentMemories = [],
}: GenerateCompanionBriefInput): CompanionBrief {
  const decision = generateCoachDecision({
    preferredName,
    readinessScore,
    traits,
    currentStreak,
    latestWorkout,
  });

  const daysSinceLastWorkout = getDaysSince(
    latestWorkout?.completedAt ?? null,
  );

  const isComeback =
    daysSinceLastWorkout !== null &&
    daysSinceLastWorkout >= 7;

  const celebration =
    recentMemories.length > 0
      ? recentMemories[0].title
      : decision.priority === "celebrate"
        ? latestWorkout?.title
          ? `${latestWorkout.title} completed`
          : "You completed meaningful work"
        : null;

  return {
    greeting: isComeback
      ? `I’m glad you’re back, ${preferredName}.`
      : `Welcome, ${preferredName}.`,

    todayFocus: isComeback
      ? "A confident return"
      : formatFocus(decision.priority),

    encouragement: isComeback
      ? getComebackEncouragement(
          daysSinceLastWorkout ?? 7,
        )
      : getStandardEncouragement(
          decision,
          currentStreak,
        ),

    celebration,

    tone: getTone(decision, isComeback),
    isComeback,
    daysSinceLastWorkout,
    decision,
  };
}
