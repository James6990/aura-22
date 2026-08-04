import {
  buildLearningIntegrationState,
} from "./build-learning-integration-state";
import {
  calculateEvidenceWeight,
} from "./calculate-evidence-weight";
import {
  createKnowledgeRelationship,
} from "./create-knowledge-relationship";
import {
  createLearningLedgerEntry,
  type LearningLedgerEntry,
} from "./create-learning-ledger-entry";

function createLearning({
  id,
  domain,
  key,
  evidence,
  status,
  sourceIds,
}: {
  id: string;
  domain:
    LearningLedgerEntry["domain"];
  key: string;
  evidence:
    | "limited"
    | "moderate"
    | "strong";
  status?:
    LearningLedgerEntry["status"];
  sourceIds: string[];
}) {
  const evidenceWeight =
    evidence === "strong"
      ? calculateEvidenceWeight({
          sampleSize: 64,
          recencyScore: 95,
          consistencyScore: 92,
          directnessScore: 94,
        })
      : evidence === "moderate"
        ? calculateEvidenceWeight({
            sampleSize: 18,
            recencyScore: 80,
            consistencyScore: 72,
            directnessScore: 82,
          })
        : calculateEvidenceWeight({
            sampleSize: 2,
            recencyScore: 30,
            consistencyScore: 25,
            directnessScore: 40,
          });

  return createLearningLedgerEntry({
    id,
    userId: "user-1",
    domain,
    key,
    title: key,
    conclusion:
      `Apex has learned ${key}.`,
    evidenceWeight,
    sources:
      sourceIds.map(
        (sourceId) => ({
          sourceType:
            "behaviour-pattern",
          sourceId,
          contribution:
            evidenceWeight.score,
        }),
      ),
    status,
  });
}

const validatedRecovery =
  createLearning({
    id: "learning-recovery",
    domain: "recovery",
    key: "hydration-readiness",
    evidence: "strong",
    sourceIds: [
      "source-shared",
      "source-recovery",
    ],
  });

const provisionalTraining =
  createLearning({
    id: "learning-training",
    domain: "training-behaviour",
    key: "preferred-training-window",
    evidence: "moderate",
    sourceIds: [
      "source-shared",
      "source-training",
    ],
  });

const validatedProgression =
  createLearning({
    id: "learning-progression",
    domain: "progression",
    key: "repeatable-load-increase",
    evidence: "strong",
    sourceIds: [
      "source-progression",
    ],
  });

const observational =
  createLearning({
    id: "learning-observing",
    domain: "nutrition",
    key: "meal-timing",
    evidence: "limited",
    sourceIds: [
      "source-observing",
    ],
  });

const challenged =
  createLearning({
    id: "learning-challenged",
    domain: "exercise-preference",
    key: "preferred-row",
    evidence: "strong",
    status: "challenged",
    sourceIds: [
      "source-challenged",
    ],
  });

const retired =
  createLearning({
    id: "learning-retired",
    domain: "accessibility",
    key: "old-movement-constraint",
    evidence: "strong",
    status: "retired",
    sourceIds: [
      "source-retired",
    ],
  });

const activeRelationship =
  createKnowledgeRelationship({
    id: "relationship-active",
    userId: "user-1",
    source:
      provisionalTraining,
    target:
      validatedProgression,
    type: "contributes-to",
    confidence: 78,
    explanation:
      "Training-window consistency may support progression.",
    supportingSourceIds: [
      "source-relationship",
    ],
  });

const inactiveRelationship =
  createKnowledgeRelationship({
    id: "relationship-inactive",
    userId: "user-1",
    source:
      validatedRecovery,
    target: challenged,
    type: "supports",
    confidence: 85,
    explanation:
      "This should be excluded because one learning is challenged.",
  });

const state =
  buildLearningIntegrationState({
    learnings: [
      validatedRecovery,
      provisionalTraining,
      validatedProgression,
      observational,
      challenged,
      retired,
    ],
    relationships: [
      activeRelationship,
      inactiveRelationship,
    ],
  });

if (
  state.activeLearnings.length !== 3
) {
  throw new Error(
    `Expected three active learnings, received ${state.activeLearnings.length}.`,
  );
}

if (
  state.activeLearnings.some(
    (learning) =>
      learning.id ===
        observational.id ||
      learning.id ===
        challenged.id ||
      learning.id === retired.id,
  )
) {
  throw new Error(
    "Observational, challenged and retired learning must be excluded.",
  );
}

if (
  state.activeRelationships.length !==
    1 ||
  state.activeRelationships[0]?.id !==
    activeRelationship.id
) {
  throw new Error(
    "Only relationships connecting active learning should remain.",
  );
}

if (state.domains.length !== 3) {
  throw new Error(
    `Expected three active domains, received ${state.domains.length}.`,
  );
}

if (
  state.strongestDomain !==
    "progression" &&
  state.strongestDomain !==
    "recovery"
) {
  throw new Error(
    `Expected a strong-evidence domain to rank first, received ${state.strongestDomain}.`,
  );
}

if (
  state.weakestDomain !==
    "training-behaviour"
) {
  throw new Error(
    `Expected training behaviour to be weakest, received ${state.weakestDomain}.`,
  );
}

if (
  state.evidenceSourceIds
    .filter(
      (sourceId) =>
        sourceId === "source-shared",
    ).length !== 1
) {
  throw new Error(
    "Evidence source ids should be deduplicated.",
  );
}

if (
  state.evidenceSourceIds.includes(
    "source-observing",
  ) ||
  state.evidenceSourceIds.includes(
    "source-challenged",
  ) ||
  state.evidenceSourceIds.includes(
    "source-retired",
  )
) {
  throw new Error(
    "Evidence sources from inactive learning must be excluded.",
  );
}

const expectedConfidence =
  Math.round(
    (
      validatedRecovery.confidence +
      provisionalTraining.confidence +
      validatedProgression.confidence
    ) / 3,
  );

if (
  state.confidence !==
    expectedConfidence
) {
  throw new Error(
    `Expected confidence ${expectedConfidence}, received ${state.confidence}.`,
  );
}

if (
  !state.summary.includes(
    "3 active learning conclusions",
  )
) {
  throw new Error(
    "Expected the summary to report active learning count.",
  );
}

const emptyState =
  buildLearningIntegrationState({
    learnings: [
      observational,
      challenged,
      retired,
    ],
    relationships: [
      inactiveRelationship,
    ],
  });

if (
  emptyState.activeLearnings.length !==
    0 ||
  emptyState.activeRelationships.length !==
    0 ||
  emptyState.domains.length !== 0 ||
  emptyState.strongestDomain !== null ||
  emptyState.weakestDomain !== null ||
  emptyState.confidence !== 0
) {
  throw new Error(
    "Inactive knowledge should produce a safe empty integration state.",
  );
}

console.log(
  "Learning Integration Engine test passed.",
);
