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
  userId = "user-1",
  key,
  score,
}: {
  id: string;
  userId?: string;
  key: string;
  score: "moderate" | "strong";
}): LearningLedgerEntry {
  const evidenceWeight =
    score === "strong"
      ? calculateEvidenceWeight({
          sampleSize: 64,
          recencyScore: 95,
          consistencyScore: 92,
          directnessScore: 94,
        })
      : calculateEvidenceWeight({
          sampleSize: 18,
          recencyScore: 80,
          consistencyScore: 72,
          directnessScore: 82,
        });

  return createLearningLedgerEntry({
    id,
    userId,
    domain: "training-behaviour",
    key,
    title: key,
    conclusion:
      `Apex has learned ${key}.`,
    evidenceWeight,
    sources: [
      {
        sourceType:
          "behaviour-pattern",
        sourceId:
          `${id}-source`,
        contribution:
          evidenceWeight.score,
      },
    ],
  });
}

const morningTraining =
  createLearning({
    id: "learning-morning",
    key: "morning-training",
    score: "strong",
  });

const adherence =
  createLearning({
    id: "learning-adherence",
    key: "higher-adherence",
    score: "moderate",
  });

const relationship =
  createKnowledgeRelationship({
    id: " relationship-1 ",
    userId: " user-1 ",
    source: morningTraining,
    target: adherence,
    type: "correlates-with",
    confidence: 76,
    explanation:
      "Morning training is associated with higher adherence.",
    supportingSourceIds: [
      " behaviour-1 ",
      "behaviour-1",
      " outcome-1 ",
      "",
    ],
  });

if (
  relationship.id !==
  "relationship-1"
) {
  throw new Error(
    "Relationship id should be normalised.",
  );
}

if (
  relationship.status !==
  "provisional"
) {
  throw new Error(
    `Expected provisional relationship, received ${relationship.status}.`,
  );
}

if (
  !relationship.canInfluenceDecision
) {
  throw new Error(
    "A provisional relationship between influential learnings should influence decisions cautiously.",
  );
}

if (
  relationship.supportingSourceIds
    .join(",") !==
  "behaviour-1,outcome-1"
) {
  throw new Error(
    "Supporting source ids should be trimmed, filtered and deduplicated.",
  );
}

const observingRelationship =
  createKnowledgeRelationship({
    id: "relationship-2",
    userId: "user-1",
    source: morningTraining,
    target: adherence,
    type: "supports",
    confidence: 40,
    explanation:
      "This relationship is still emerging.",
  });

if (
  observingRelationship.status !==
    "observing" ||
  observingRelationship
    .canInfluenceDecision
) {
  throw new Error(
    "Low-confidence relationships must remain observational.",
  );
}

const challengedRelationship =
  createKnowledgeRelationship({
    id: "relationship-3",
    userId: "user-1",
    source: morningTraining,
    target: adherence,
    type: "supports",
    confidence: 90,
    explanation:
      "Recent evidence challenges this link.",
    status: "challenged",
  });

if (
  challengedRelationship
    .canInfluenceDecision
) {
  throw new Error(
    "Challenged relationships must not influence decisions.",
  );
}

let selfLinkRejected = false;

try {
  createKnowledgeRelationship({
    id: "relationship-self",
    userId: "user-1",
    source: morningTraining,
    target: morningTraining,
    type: "supports",
    confidence: 90,
    explanation:
      "Invalid self-link.",
  });
} catch {
  selfLinkRejected = true;
}

if (!selfLinkRejected) {
  throw new Error(
    "Self-referencing knowledge relationships should be rejected.",
  );
}

const otherUserLearning =
  createLearning({
    id: "learning-other-user",
    userId: "user-2",
    key: "other-user-pattern",
    score: "strong",
  });

let crossUserRejected = false;

try {
  createKnowledgeRelationship({
    id: "relationship-cross-user",
    userId: "user-1",
    source: morningTraining,
    target: otherUserLearning,
    type: "supports",
    confidence: 90,
    explanation:
      "Invalid cross-user link.",
  });
} catch {
  crossUserRejected = true;
}

if (!crossUserRejected) {
  throw new Error(
    "Cross-user knowledge relationships should be rejected.",
  );
}

console.log(
  "Knowledge Relationship contract test passed.",
);
