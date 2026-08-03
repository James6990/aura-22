import type { MovementPattern } from "@/lib/workout/exercise-library";

export type SupportedTrainingGoal =
  | "muscle"
  | "fat-loss"
  | "recomposition"
  | "performance"
  | "health";

export type TrainingGoalProfile = {
  goal: SupportedTrainingGoal;
  title: string;
  focus: string;
  movementPatterns: MovementPattern[];

  standardPrescription: {
    sets: number;
    reps: string;
    restSeconds: number;
  };

  highReadinessPrescription: {
    sets: number;
    reps: string;
    restSeconds: number;
  };

  volumeBias: number;
  conditioningBias: number;

  principles: string[];
};

const profiles: Record<
  SupportedTrainingGoal,
  TrainingGoalProfile
> = {
  muscle: {
    goal: "muscle",
    title: "Build muscle",
    focus: "Hypertrophy strength",
    movementPatterns: [
      "horizontal-push",
      "horizontal-pull",
      "vertical-push",
      "vertical-pull",
      "squat",
      "hinge",
    ],
    standardPrescription: {
      sets: 3,
      reps: "8–12 controlled reps",
      restSeconds: 90,
    },
    highReadinessPrescription: {
      sets: 4,
      reps: "6–12 challenging reps",
      restSeconds: 120,
    },
    volumeBias: 1.1,
    conditioningBias: 0.6,
    principles: [
      "Prioritise repeatable hypertrophy volume.",
      "Progress load or repetitions gradually.",
      "Train major muscle groups with balanced movement coverage.",
    ],
  },

  "fat-loss": {
    goal: "fat-loss",
    title: "Lose body fat",
    focus: "Strength and conditioning",
    movementPatterns: [
      "squat",
      "hinge",
      "horizontal-push",
      "horizontal-pull",
      "cardio",
      "core",
    ],
    standardPrescription: {
      sets: 3,
      reps: "8–12 controlled reps",
      restSeconds: 75,
    },
    highReadinessPrescription: {
      sets: 3,
      reps: "8–12 purposeful reps",
      restSeconds: 75,
    },
    volumeBias: 0.95,
    conditioningBias: 1.15,
    principles: [
      "Use resistance training to support strength and muscle retention.",
      "Add sustainable conditioning without creating excessive fatigue.",
      "Avoid punishment-based exercise or extreme workloads.",
    ],
  },

  recomposition: {
    goal: "recomposition",
    title: "Body recomposition",
    focus: "Balanced strength and conditioning",
    movementPatterns: [
      "horizontal-push",
      "horizontal-pull",
      "squat",
      "hinge",
      "core",
      "cardio",
    ],
    standardPrescription: {
      sets: 3,
      reps: "8–12 controlled reps",
      restSeconds: 90,
    },
    highReadinessPrescription: {
      sets: 4,
      reps: "6–12 challenging reps",
      restSeconds: 105,
    },
    volumeBias: 1,
    conditioningBias: 0.9,
    principles: [
      "Balance muscle-building work with manageable conditioning.",
      "Use gradual progression rather than aggressive changes.",
      "Protect recovery so both strength and body-composition progress remain sustainable.",
    ],
  },

  performance: {
    goal: "performance",
    title: "Improve performance",
    focus: "Athletic performance",
    movementPatterns: [
      "squat",
      "hinge",
      "single-leg",
      "horizontal-push",
      "horizontal-pull",
      "core",
    ],
    standardPrescription: {
      sets: 3,
      reps: "5–10 high-quality reps",
      restSeconds: 105,
    },
    highReadinessPrescription: {
      sets: 4,
      reps: "4–8 powerful, controlled reps",
      restSeconds: 150,
    },
    volumeBias: 1,
    conditioningBias: 1,
    principles: [
      "Prioritise movement quality, strength and athletic capacity.",
      "Use longer recovery when output quality matters.",
      "Avoid adding fatigue that does not support the user’s performance outcome.",
    ],
  },

  health: {
    goal: "health",
    title: "Health and vitality",
    focus: "Full-body health",
    movementPatterns: [
      "horizontal-push",
      "horizontal-pull",
      "squat",
      "hinge",
      "core",
      "cardio",
      "mobility",
    ],
    standardPrescription: {
      sets: 2,
      reps: "8–12 comfortable reps",
      restSeconds: 75,
    },
    highReadinessPrescription: {
      sets: 3,
      reps: "8–12 confident reps",
      restSeconds: 90,
    },
    volumeBias: 0.85,
    conditioningBias: 1,
    principles: [
      "Prioritise balanced movement and long-term consistency.",
      "Keep sessions sustainable and adaptable.",
      "Support strength, mobility and cardiovascular health together.",
    ],
  },
};

export function isSupportedTrainingGoal(
  value: string,
): value is SupportedTrainingGoal {
  return value in profiles;
}

export function getTrainingGoalProfile(
  primaryGoal: string,
): TrainingGoalProfile {
  if (isSupportedTrainingGoal(primaryGoal)) {
    return profiles[primaryGoal];
  }

  return profiles.health;
}
