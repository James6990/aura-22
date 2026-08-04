export type EvidenceWeightInput = {
  sampleSize: number;
  recencyScore: number;
  consistencyScore: number;
  directnessScore: number;
  safetyCritical?: boolean;
};

export type EvidenceWeight = {
  score: number;
  level:
    | "limited"
    | "developing"
    | "moderate"
    | "strong";
  canInfluenceDecision: boolean;
  explanation: string;
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

function getSampleConfidence(
  sampleSize: number,
) {
  if (sampleSize <= 0) {
    return 0;
  }

  return clamp(
    Math.log2(sampleSize + 1) * 18,
  );
}

function getLevel(
  score: number,
): EvidenceWeight["level"] {
  if (score >= 80) {
    return "strong";
  }

  if (score >= 60) {
    return "moderate";
  }

  if (score >= 35) {
    return "developing";
  }

  return "limited";
}

export function calculateEvidenceWeight({
  sampleSize,
  recencyScore,
  consistencyScore,
  directnessScore,
  safetyCritical = false,
}: EvidenceWeightInput): EvidenceWeight {
  const sampleConfidence =
    getSampleConfidence(
      Math.max(
        0,
        Math.floor(sampleSize),
      ),
    );

  const baseScore =
    sampleConfidence * 0.35 +
    clamp(recencyScore) * 0.2 +
    clamp(consistencyScore) * 0.3 +
    clamp(directnessScore) * 0.15;

  /*
   * Safety-critical evidence may influence a
   * conservative action sooner, but this does not
   * increase confidence in a medical conclusion.
   */
  const safetyAdjustment =
    safetyCritical ? 8 : 0;

  const score = Math.round(
    clamp(
      baseScore + safetyAdjustment,
    ),
  );

  const level = getLevel(score);

  const canInfluenceDecision =
    safetyCritical
      ? score >= 30
      : score >= 50;

  const explanation =
    score >= 80
      ? "This pattern has strong, recent and repeatable evidence."
      : score >= 60
        ? "This pattern has enough evidence to influence recommendations carefully."
        : score >= 35
          ? "This pattern is still developing and should influence recommendations only cautiously."
          : "This pattern does not yet have enough evidence to influence recommendations.";

  return {
    score,
    level,
    canInfluenceDecision,
    explanation,
  };
}
