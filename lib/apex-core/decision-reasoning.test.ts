import {
  calculateDecisionConfidence,
} from "./calculate-decision-confidence";
import {
  createDecisionTrace,
} from "./create-decision-trace";
import {
  explainDecisionTrace,
} from "./explain-decision-trace";
import {
  evidenceRegistryVersion,
  getEvidenceRule,
  listEvidenceRules,
} from "@/lib/evidence/evidence-registry";

const safetyRule = getEvidenceRule(
  "safety-discomfort-overrides-progression",
);

if (!safetyRule) {
  throw new Error(
    "Expected the safety evidence rule to exist.",
  );
}

if (listEvidenceRules().length < 3) {
  throw new Error(
    "Expected the initial evidence registry to contain core rules.",
  );
}

const confidence =
  calculateDecisionConfidence({
    dataCompleteness: 80,
    signalAgreement: 90,
    historyDepth: 70,
    forecastCertainty: 75,
    safetyOverrideActive: true,
  });

if (
  confidence < 70 ||
  confidence > 100
) {
  throw new Error(
    "Decision confidence should be clamped and appropriately weighted.",
  );
}

const trace = createDecisionTrace({
  decisionId: " recovery-1 ",
  decisionType: "workout-adjustment",
  outcome: "postpone-push-session",
  confidence,
  reasons: [
    {
      code: "push-recovery-low",
      label: "Pressing recovery",
      detail:
        "Pressing patterns remain below the preferred recovery threshold.",
      influence: "strong-negative",
      evidenceRuleId: safetyRule.id,
      evidenceStrength:
        safetyRule.strength,
    },
    {
      code: "programme-order-preserved",
      label: "Programme continuity",
      detail:
        "The session remains next in programme order and will be reconsidered on a suitable day.",
      influence: "positive",
      evidenceRuleId: null,
      evidenceStrength:
        "personal-trend",
    },
  ],
  overriddenBy:
    "recovery-safety",
  evidenceRegistryVersion,
  createdAt: new Date(
    "2026-08-04T12:00:00.000Z",
  ),
});

if (trace.decisionId !== "recovery-1") {
  throw new Error(
    "Decision IDs should be normalised.",
  );
}

if (
  trace.overriddenBy !==
  "recovery-safety"
) {
  throw new Error(
    "The decision trace should preserve overrides.",
  );
}

const explanation =
  explainDecisionTrace(trace);

if (
  !explanation.includes(
    "postpone-push-session",
  ) ||
  !explanation.includes(
    "Pressing patterns",
  ) ||
  !explanation.includes(
    "recovery-safety",
  )
) {
  throw new Error(
    "The explanation should include outcome, reasons and overrides.",
  );
}

console.log(
  "Decision Evidence and Reasoning test passed.",
);
