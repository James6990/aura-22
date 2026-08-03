export type ProgressionDecision =
  | "increase"
  | "maintain"
  | "reduce"
  | "review";

export type ProgressionDecisionInput = {
  plannedSets: number;
  completedSets: number;
  loadKg: number | null;
  rpe: number | null;
  discomfortLevel: number | null;
  techniqueConfidence: number | null;
};

export type ProgressionDecisionResult = {
  decision: ProgressionDecision;
  recommendedNextLoadKg: number | null;
  reason: string;
};

function roundLoad(value: number) {
  return Math.round(value * 4) / 4;
}

export function calculateProgressionDecision({
  plannedSets,
  completedSets,
  loadKg,
  rpe,
  discomfortLevel,
  techniqueConfidence,
}: ProgressionDecisionInput): ProgressionDecisionResult {
  const discomfort = discomfortLevel ?? 0;
  const technique = techniqueConfidence;

  if (discomfort >= 6) {
    return {
      decision: "review",
      recommendedNextLoadKg:
        loadKg === null
          ? null
          : roundLoad(loadKg * 0.9),
      reason:
        "Discomfort was high enough that the exercise should be reviewed before progressing.",
    };
  }

  if (
    discomfort >= 4 ||
    (technique !== null && technique < 60)
  ) {
    return {
      decision: "review",
      recommendedNextLoadKg: loadKg,
      reason:
        "Discomfort or low technique confidence means the exercise should be reviewed before changing the load.",
    };
  }

  if (completedSets < plannedSets) {
    return {
      decision: "maintain",
      recommendedNextLoadKg: loadKg,
      reason:
        "The planned sets were not all completed, so Apex recommends maintaining the current challenge.",
    };
  }

  if (rpe !== null && rpe >= 9) {
    return {
      decision: "maintain",
      recommendedNextLoadKg: loadKg,
      reason:
        "The effort was already very high, so increasing the load is not recommended yet.",
    };
  }

  if (
    loadKg !== null &&
    loadKg > 0 &&
    rpe !== null &&
    rpe <= 7 &&
    discomfort <= 2 &&
    (technique === null || technique >= 75)
  ) {
    return {
      decision: "increase",
      recommendedNextLoadKg:
        roundLoad(loadKg * 1.025),
      reason:
        "All planned sets were completed with manageable effort, low discomfort and confident technique.",
    };
  }

  return {
    decision: "maintain",
    recommendedNextLoadKg: loadKg,
    reason:
      "The result supports repeating the current challenge and building another confident performance.",
  };
}
