export type DecisionReflectionInput = {
  recommendation: string;
  athleteOutcome:
    | "better"
    | "same"
    | "worse";
  confidence: number;
};

export type DecisionReflection = {
  outcome:
    | "successful"
    | "neutral"
    | "needs-review";

  learningScore: number;

  recommendationReliability:
    | "increase"
    | "maintain"
    | "decrease";

  summary: string;
};

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

export function analyseDecisionReflection({
  recommendation,
  athleteOutcome,
  confidence,
}: DecisionReflectionInput): DecisionReflection {

  const learningScore =
    athleteOutcome === "better"
      ? clamp(confidence + 10)
      : athleteOutcome === "same"
        ? clamp(confidence)
        : clamp(confidence - 25);

  return {
    outcome:
      athleteOutcome === "better"
        ? "successful"
        : athleteOutcome === "same"
          ? "neutral"
          : "needs-review",

    learningScore,

    recommendationReliability:
      athleteOutcome === "better"
        ? "increase"
        : athleteOutcome === "same"
          ? "maintain"
          : "decrease",

    summary:
      `${recommendation} resulted in a ${athleteOutcome} outcome.`,
  };
}
