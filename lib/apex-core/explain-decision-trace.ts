import type {
  DecisionTrace,
} from "@/lib/apex-core/create-decision-trace";

function getConfidenceLabel(
  confidence: number,
) {
  if (confidence >= 85) {
    return "high confidence";
  }

  if (confidence >= 65) {
    return "moderate confidence";
  }

  return "developing confidence";
}

export function explainDecisionTrace(
  trace: DecisionTrace,
) {
  const leadingReasons =
    trace.reasons
      .slice(0, 3)
      .map((reason) => reason.detail);

  const reasonText =
    leadingReasons.length > 0
      ? leadingReasons.join(" ")
      : "Apex did not record enough structured reasons for a detailed explanation.";

  const overrideText =
    trace.overriddenBy
      ? ` A safety or policy rule overrode other signals: ${trace.overriddenBy}.`
      : "";

  return (
    `Apex selected "${trace.outcome}" with ` +
    `${getConfidenceLabel(
      trace.confidence,
    )}. ${reasonText}${overrideText}`
  );
}
