import {
  calculateEvidenceWeight,
} from "./calculate-evidence-weight";
import {
  createLearningLedgerEntry,
} from "./create-learning-ledger-entry";

const limited =
  createLearningLedgerEntry({
    id: " learning-1 ",
    userId: " user-1 ",
    domain: "recovery",
    key: " hydration-readiness ",
    title:
      " Hydration may support readiness ",
    conclusion:
      " Readiness appears higher on hydrated days. ",
    evidenceWeight:
      calculateEvidenceWeight({
        sampleSize: 2,
        recencyScore: 35,
        consistencyScore: 30,
        directnessScore: 45,
      }),
    sources: [
      {
        sourceType:
          "behaviour-pattern",
        sourceId:
          " recovery-pattern-1 ",
        contribution: 35,
      },
    ],
  });

if (limited.status !== "observing") {
  throw new Error(
    "Limited evidence should remain observational.",
  );
}

if (limited.canInfluenceDecision) {
  throw new Error(
    "Observational learning must not influence decisions.",
  );
}

if (
  limited.id !== "learning-1" ||
  limited.userId !== "user-1" ||
  limited.key !== "hydration-readiness"
) {
  throw new Error(
    "Learning-ledger identifiers should be normalised.",
  );
}

if (
  limited.sources[0]?.sourceId !==
  "recovery-pattern-1"
) {
  throw new Error(
    "Learning sources should be normalised.",
  );
}

const moderate =
  createLearningLedgerEntry({
    id: "learning-2",
    userId: "user-1",
    domain: "training-behaviour",
    key: "preferred-training-window",
    title:
      "Morning training appears repeatable",
    conclusion:
      "Recent completed sessions most often occur in the morning.",
    evidenceWeight:
      calculateEvidenceWeight({
        sampleSize: 18,
        recencyScore: 80,
        consistencyScore: 72,
        directnessScore: 82,
      }),
    sources: [
      {
        sourceType:
          "behaviour-pattern",
        sourceId:
          "training-pattern-1",
        contribution: 70,
      },
    ],
  });

if (moderate.status !== "provisional") {
  throw new Error(
    `Expected moderate evidence to become provisional, received ${moderate.status}.`,
  );
}

if (!moderate.canInfluenceDecision) {
  throw new Error(
    "Provisional learning should be allowed to influence decisions cautiously.",
  );
}

const strong =
  createLearningLedgerEntry({
    id: "learning-3",
    userId: "user-1",
    domain:
      "coaching-effectiveness",
    key:
      "moderate-session-adherence",
    title:
      "Moderate sessions support adherence",
    conclusion:
      "Moderate sessions repeatedly produce strong completion and recovery outcomes.",
    evidenceWeight:
      calculateEvidenceWeight({
        sampleSize: 64,
        recencyScore: 95,
        consistencyScore: 92,
        directnessScore: 94,
      }),
    sources: [
      {
        sourceType:
          "decision-outcome",
        sourceId:
          "outcome-1",
        contribution: 90,
      },
      {
        sourceType: "reflection",
        sourceId:
          "reflection-1",
        contribution: 88,
      },
    ],
  });

if (strong.status !== "validated") {
  throw new Error(
    `Expected strong evidence to become validated, received ${strong.status}.`,
  );
}

if (!strong.canInfluenceDecision) {
  throw new Error(
    "Validated learning should influence decisions.",
  );
}

if (
  strong.confidence < 0 ||
  strong.confidence > 100
) {
  throw new Error(
    "Learning confidence must remain between 0 and 100.",
  );
}

const challenged =
  createLearningLedgerEntry({
    id: "learning-4",
    userId: "user-1",
    domain: "progression",
    key: "load-increase-response",
    title:
      "Previous progression pattern challenged",
    conclusion:
      "Recent outcomes no longer support the earlier progression conclusion.",
    evidenceWeight:
      calculateEvidenceWeight({
        sampleSize: 50,
        recencyScore: 90,
        consistencyScore: 88,
        directnessScore: 92,
      }),
    sources: [
      {
        sourceType:
          "decision-outcome",
        sourceId:
          "outcome-2",
        contribution: 85,
      },
    ],
    status: "challenged",
  });

if (
  challenged.canInfluenceDecision
) {
  throw new Error(
    "Challenged learning must not influence decisions even with strong evidence.",
  );
}

console.log(
  "Learning Ledger contract test passed.",
);
