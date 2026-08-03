import { getApexState } from "@/lib/apex-core/get-apex-state";

const state = getApexState({
  readinessScore: 82,

  traits: {
    consistency: 78,
    recovery: 76,
    trainingCapacity: 72,
    hydration: 65,
    confidence: 70,
  },

  currentStreak: 8,

  latestWorkout: {
    id: "test-workout",
    title: "Balanced strength",
    completedAt: new Date(),
    durationMinutes: 45,
    sessionRpe: 7,
    completedExercises: 4,
    totalExercises: 4,
    progressionReady: 1,
    reviewCount: 0,
    highestDiscomfort: 1,
  },

  coachDecision: {
    priority: "train",
    confidence: 84,
    eyebrow: "Strong readiness",
    headline: "You are ready.",
    message:
      "Your current signals support a productive session.",
    action:
      "Follow today’s personalised workout.",
    reasons: [
      "Readiness and recovery are supportive.",
    ],
    mood: "focused",
  },
});

if (state.recovery !== "high") {
  throw new Error(
    "Expected a high recovery state.",
  );
}

if (state.momentum !== "building") {
  throw new Error(
    "Expected building momentum.",
  );
}

if (state.todayPriority !== "train") {
  throw new Error(
    "Expected the training priority to be preserved.",
  );
}

if (state.isComeback) {
  throw new Error(
    "A recent workout should not trigger comeback mode.",
  );
}
