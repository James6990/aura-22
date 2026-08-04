export type DecisionConfidenceInput = {
  dataCompleteness: number;
  signalAgreement: number;
  historyDepth: number;
  forecastCertainty?: number;
  safetyOverrideActive?: boolean;
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

export function calculateDecisionConfidence({
  dataCompleteness,
  signalAgreement,
  historyDepth,
  forecastCertainty = 100,
  safetyOverrideActive = false,
}: DecisionConfidenceInput) {
  const base =
    clamp(dataCompleteness) * 0.3 +
    clamp(signalAgreement) * 0.35 +
    clamp(historyDepth) * 0.2 +
    clamp(forecastCertainty) * 0.15;

  /*
   * A safety override increases confidence in the
   * conservative action, not in a medical claim.
   */
  const safetyAdjustment =
    safetyOverrideActive ? 8 : 0;

  return Math.round(
    clamp(base + safetyAdjustment),
  );
}
