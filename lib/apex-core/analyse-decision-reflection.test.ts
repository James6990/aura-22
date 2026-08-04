import {
  analyseDecisionReflection,
} from "./analyse-decision-reflection";

const successful =
  analyseDecisionReflection({
    recommendation:
      "Increase bench press load",
    athleteOutcome: "better",
    confidence: 80,
  });

if (
  successful.outcome !== "successful" ||
  successful.recommendationReliability !==
    "increase" ||
  successful.learningScore !== 90
) {
  throw new Error(
    "Successful outcome should strengthen future confidence.",
  );
}

const neutral =
  analyseDecisionReflection({
    recommendation:
      "Maintain current load",
    athleteOutcome: "same",
    confidence: 70,
  });

if (
  neutral.outcome !== "neutral" ||
  neutral.recommendationReliability !==
    "maintain" ||
  neutral.learningScore !== 70
) {
  throw new Error(
    "Neutral outcome should preserve confidence.",
  );
}

const review =
  analyseDecisionReflection({
    recommendation:
      "Increase training volume",
    athleteOutcome: "worse",
    confidence: 75,
  });

if (
  review.outcome !== "needs-review" ||
  review.recommendationReliability !==
    "decrease" ||
  review.learningScore !== 50
) {
  throw new Error(
    "Negative outcome should reduce confidence and trigger review.",
  );
}

for (const result of [
  successful,
  neutral,
  review,
]) {
  if (
    result.learningScore < 0 ||
    result.learningScore > 100
  ) {
    throw new Error(
      "Learning score must remain between 0 and 100.",
    );
  }

  if (!result.summary.trim()) {
    throw new Error(
      "Reflection should always generate a summary.",
    );
  }
}

console.log(
  "Decision Reflection Engine test passed.",
);
