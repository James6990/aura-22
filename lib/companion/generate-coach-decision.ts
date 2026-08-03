import type { GenomeTraits } from "@/lib/genome/calculate-adaptive-traits";
import type { LatestWorkoutSummary } from "@/lib/workout/get-latest-workout-summary";

export type CoachPriority =
  | "celebrate"
  | "recover"
  | "train"
  | "technique"
  | "hydrate"
  | "build-consistency"
  | "collect-data";

export type CoachDecision = {
  priority: CoachPriority;
  confidence: number;
  eyebrow: string;
  headline: string;
  message: string;
  action: string;
  reasons: string[];
  mood:
    | "celebration"
    | "focused"
    | "recovery"
    | "supportive"
    | "learning";
};

export type GenerateCoachDecisionInput = {
  preferredName: string;
  readinessScore: number;
  traits: GenomeTraits;
  currentStreak: number;
  latestWorkout: LatestWorkoutSummary | null;
};

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.max(minimum, Math.min(maximum, value));
}

function completedWithinHours(
  date: Date | null,
  hours: number,
) {
  if (!date) return false;

  const elapsed =
    Date.now() - new Date(date).getTime();

  return elapsed >= 0 && elapsed <= hours * 3_600_000;
}

function calculateConfidence({
  dataConfidence,
  signalStrength,
}: {
  dataConfidence: number;
  signalStrength: number;
}) {
  return Math.round(
    clamp(dataConfidence * 0.6 + signalStrength * 0.4),
  );
}

export function generateCoachDecision({
  preferredName,
  readinessScore,
  traits,
  currentStreak,
  latestWorkout,
}: GenerateCoachDecisionInput): CoachDecision {
  const readiness = clamp(readinessScore);
  const recovery = clamp(traits.recovery);
  const dataConfidence = clamp(traits.confidence);

  if (
    latestWorkout &&
    latestWorkout.highestDiscomfort >= 4
  ) {
    const reasons = [
      `Discomfort reached ${latestWorkout.highestDiscomfort}/10 in the latest workout.`,
      "Movement quality and comfort should take priority over progression.",
    ];

    if (latestWorkout.reviewCount > 0) {
      reasons.push(
        `${latestWorkout.reviewCount} ${
          latestWorkout.reviewCount === 1
            ? "exercise needs"
            : "exercises need"
        } review.`,
      );
    }

    return {
      priority: "technique",
      confidence: calculateConfidence({
        dataConfidence,
        signalStrength: 95,
      }),
      eyebrow: "Apex safety priority",
      headline: `Let’s protect your progress, ${preferredName}.`,
      message:
        "Your latest workout included noticeable discomfort, so today’s plan should avoid aggravating movements and prioritise comfortable technique.",
      action:
        "Review the affected exercise and use a suitable alternative before another demanding session.",
      reasons,
      mood: "recovery",
    };
  }

  if (
    latestWorkout &&
    completedWithinHours(latestWorkout.completedAt, 24)
  ) {
    const reasons = [
      `You completed a workout within the past 24 hours.`,
      `${latestWorkout.completedExercises} of ${latestWorkout.totalExercises} exercises were completed.`,
    ];

    if (latestWorkout.progressionReady > 0) {
      reasons.push(
        `${latestWorkout.progressionReady} ${
          latestWorkout.progressionReady === 1
            ? "exercise shows"
            : "exercises show"
        } early progression potential.`,
      );
    }

    return {
      priority: "celebrate",
      confidence: calculateConfidence({
        dataConfidence,
        signalStrength: 90,
      }),
      eyebrow: "Apex has reviewed your workout",
      headline: `Good work, ${preferredName}.`,
      message:
        "Your workout is saved. I am now using the results to shape your recovery and future training.",
      action:
        "Prioritise hydration, food and recovery before your next demanding session.",
      reasons,
      mood: "celebration",
    };
  }

  if (readiness < 50 || recovery < 50) {
    const reasons: string[] = [];

    if (readiness < 50) {
      reasons.push(
        `Readiness is currently ${readiness}%.`,
      );
    }

    if (recovery < 50) {
      reasons.push(
        `Adaptive recovery is currently ${recovery}%.`,
      );
    }

    return {
      priority: "recover",
      confidence: calculateConfidence({
        dataConfidence,
        signalStrength: Math.max(
          70,
          100 - Math.min(readiness, recovery),
        ),
      }),
      eyebrow: "Recovery comes first",
      headline: `Take the pressure off today, ${preferredName}.`,
      message:
        "Your current signals do not support unnecessary intensity. A lighter day can protect consistency and improve the quality of your next session.",
      action:
        "Choose comfortable movement, mobility or a recovery-focused session.",
      reasons,
      mood: "recovery",
    };
  }

  if (readiness >= 85 && recovery >= 70) {
    return {
      priority: "train",
      confidence: calculateConfidence({
        dataConfidence,
        signalStrength: 90,
      }),
      eyebrow: "Your daily direction",
      headline: `Today looks like a strong training day, ${preferredName}.`,
      message:
        "Your readiness and recovery currently support a productive session.",
      action:
        "Follow today’s personalised workout while keeping technique controlled.",
      reasons: [
        `Readiness is ${readiness}%.`,
        `Adaptive recovery is ${recovery}%.`,
        `Training capacity is ${traits.trainingCapacity}%.`,
      ],
      mood: "focused",
    };
  }

  if (traits.hydration < 40) {
    return {
      priority: "hydrate",
      confidence: calculateConfidence({
        dataConfidence,
        signalStrength: 75,
      }),
      eyebrow: "Apex habit focus",
      headline: `Hydration is today’s clearest opportunity.`,
      message:
        "Your recent check-ins show that hydration is less consistent than your other recorded habits.",
      action:
        "Complete one realistic hydration target before adding more training intensity.",
      reasons: [
        `Hydration adherence is ${traits.hydration}%.`,
        `Recovery is currently ${recovery}%.`,
      ],
      mood: "supportive",
    };
  }

  if (currentStreak === 0 || traits.consistency < 40) {
    return {
      priority: "build-consistency",
      confidence: calculateConfidence({
        dataConfidence,
        signalStrength: 75,
      }),
      eyebrow: "Consistency before intensity",
      headline: `Let’s rebuild momentum, ${preferredName}.`,
      message:
        "A manageable action today is more valuable than an ambitious plan that is difficult to repeat.",
      action:
        "Complete the smallest meaningful version of today’s plan.",
      reasons: [
        `Current streak: ${currentStreak} days.`,
        `Training consistency is ${traits.consistency}%.`,
      ],
      mood: "supportive",
    };
  }

  if (dataConfidence < 50) {
    return {
      priority: "collect-data",
      confidence: dataConfidence,
      eyebrow: "Apex is learning",
      headline: `Keep checking in, ${preferredName}.`,
      message:
        "Your early data is forming a personalised picture, but more history is needed before Apex makes stronger conclusions.",
      action:
        "Complete today’s check-in and record your activity honestly.",
      reasons: [
        `Genome confidence is currently ${dataConfidence}%.`,
        "More completed check-ins will strengthen future recommendations.",
      ],
      mood: "learning",
    };
  }

  return {
    priority: "train",
    confidence: calculateConfidence({
      dataConfidence,
      signalStrength: 65,
    }),
    eyebrow: "Today’s direction",
    headline: `Let’s keep moving, ${preferredName}.`,
    message:
      "Your current signals support a controlled session without unnecessary intensity.",
    action:
      "Follow today’s recommendation and adapt anything that does not feel right.",
    reasons: [
      `Readiness is ${readiness}%.`,
      `Recovery is ${recovery}%.`,
      `Current streak is ${currentStreak} days.`,
    ],
    mood: "supportive",
  };
}
