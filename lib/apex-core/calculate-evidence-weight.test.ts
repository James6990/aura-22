import {
  calculateEvidenceWeight,
} from "./calculate-evidence-weight";

const weakEvidence =
  calculateEvidenceWeight({
    sampleSize: 1,
    recencyScore: 30,
    consistencyScore: 20,
    directnessScore: 40,
  });

if (
  weakEvidence.level !== "limited" ||
  weakEvidence.canInfluenceDecision
) {
  throw new Error(
    "Weak evidence should remain limited and should not influence decisions.",
  );
}

const strongEvidence =
  calculateEvidenceWeight({
    sampleSize: 64,
    recencyScore: 95,
    consistencyScore: 90,
    directnessScore: 90,
  });

if (
  strongEvidence.level !== "strong" ||
  !strongEvidence.canInfluenceDecision
) {
  throw new Error(
    "Strong evidence should be allowed to influence decisions.",
  );
}

const cautiousSafetyEvidence =
  calculateEvidenceWeight({
    sampleSize: 2,
    recencyScore: 55,
    consistencyScore: 45,
    directnessScore: 65,
    safetyCritical: true,
  });

if (
  !cautiousSafetyEvidence
    .canInfluenceDecision
) {
  throw new Error(
    "Safety-critical evidence should be able to trigger conservative guidance earlier.",
  );
}

if (
  cautiousSafetyEvidence.score <=
  weakEvidence.score
) {
  throw new Error(
    "Safety weighting should raise conservative-action priority.",
  );
}

for (const result of [
  weakEvidence,
  strongEvidence,
  cautiousSafetyEvidence,
]) {
  if (
    result.score < 0 ||
    result.score > 100
  ) {
    throw new Error(
      "Evidence weight must remain between 0 and 100.",
    );
  }

  if (!result.explanation.trim()) {
    throw new Error(
      "Evidence weight should include an explanation.",
    );
  }
}

console.log(
  "Evidence Weighting Engine test passed.",
);
