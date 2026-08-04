import {
  analyseDecisionReflection,
} from "./analyse-decision-reflection";
import {
  calculateEvidenceWeight,
} from "./calculate-evidence-weight";
import {
  createDecisionMemory,
} from "./create-decision-memory";
import {
  createDecisionOutcome,
} from "./create-decision-outcome";
import type {
  ApexDecisionRecord,
} from "./create-decision-record";
import {
  createLearningLedgerEntry,
} from "./create-learning-ledger-entry";
import type {
  ApexReasoningDecisionTrace,
} from "./build-apex-reasoning-trace";
import {
  updateDecisionMemory,
} from "./update-decision-memory";

const decision: ApexDecisionRecord = {
  id: "decision-1",
  userId: "user-1",
  decisionType:
    "daily-coaching",
  priority: "train",
  recommendation:
    "Complete a moderate training session.",
  explanation:
    "Current evidence supports training.",
  confidence: 76,
  rulesetVersion:
    "apex-rules-v1",
  coreReasons: [
    "Readiness supports training.",
  ],
  personalisedReasons: [],
  status: "completed",
  issuedAt: new Date(
    "2026-08-04T18:00:00Z",
  ),
  validUntil: null,
  schemaVersion: 1,
};

const reasoningTrace = {
  trace: {
    decisionId: decision.id,
    decisionType:
      "apex-coaching",
    outcome: decision.priority,
    confidence: 76,
    reasons: [
      {
        code:
          "reasoning-support-1",
        label:
          "Supporting evidence",
        detail:
          "Readiness supports training.",
        influence: "positive",
        evidenceRuleId: null,
        evidenceStrength: null,
      },
    ],
    overriddenBy: null,
    evidenceRegistryVersion:
      "apex-evidence-v1",
    createdAt:
      decision.issuedAt,
  },

  reasoning: {
    tone: "measured",
    evidenceSufficient: true,
    requiresMoreEvidence: false,
    strongestDomain: "recovery",
    weakestDomain:
      "progression",
    prioritiesAligned: true,
    checkedPriorities: [
      "train",
      "train",
      "train",
      "train",
    ],
    summary:
      "Apex has enough evidence to guide this decision carefully.",
  },
} satisfies ApexReasoningDecisionTrace;

const initial =
  createDecisionMemory({
    id: "memory-1",
    decision,
    reasoningTrace,
  });

const outcome =
  createDecisionOutcome({
    decision,
    evidence: {
      followedRecommendation:
        "yes",
      readinessChange: 6,
      recoveryChange: 4,
      workoutCompleted: true,
      sessionRpe: 7,
      discomfortChange: -1,
      progressionOccurred: true,
    },
  });

const outcomeUpdatedAt =
  new Date(
    "2026-08-05T10:00:00Z",
  );

const withOutcome =
  updateDecisionMemory({
    memory: initial,
    outcome,
    updatedAt:
      outcomeUpdatedAt,
  });

if (
  withOutcome.status !==
    "ready-for-reflection" ||
  withOutcome.outcome !== outcome
) {
  throw new Error(
    "A usable outcome should move memory to ready-for-reflection.",
  );
}

if (
  withOutcome.lastUpdatedAt !==
  outcomeUpdatedAt
) {
  throw new Error(
    "Outcome update should preserve its supplied timestamp.",
  );
}

const reflection =
  analyseDecisionReflection({
    recommendation:
      decision.recommendation,
    athleteOutcome: "better",
    confidence:
      decision.confidence,
  });

const reflected =
  updateDecisionMemory({
    memory: withOutcome,
    reflection,
  });

if (
  reflected.status !==
    "reflected" ||
  reflected.reflection !==
    reflection ||
  reflected.outcome !== outcome
) {
  throw new Error(
    "Adding reflection should preserve the outcome and mark memory reflected.",
  );
}

const learning =
  createLearningLedgerEntry({
    id: "learning-1",
    userId: "user-1",
    domain:
      "coaching-effectiveness",
    key:
      "moderate-training-response",
    title:
      "Moderate training supported a positive response",
    conclusion:
      "A recorded moderate session produced a positive outcome.",
    evidenceWeight:
      calculateEvidenceWeight({
        sampleSize: 18,
        recencyScore: 90,
        consistencyScore: 76,
        directnessScore: 92,
      }),
    sources: [
      {
        sourceType:
          "decision-outcome",
        sourceId:
          outcome.decisionId,
        contribution: 80,
      },
    ],
  });

const withLearning =
  updateDecisionMemory({
    memory: reflected,
    learningEntries: [
      learning,
    ],
  });

if (
  withLearning.status !==
    "learning-created" ||
  withLearning
    .learningEntries.length !== 1
) {
  throw new Error(
    "Adding learning should move memory to learning-created.",
  );
}

const closedAt =
  new Date(
    "2026-08-06T10:00:00Z",
  );

const closed =
  updateDecisionMemory({
    memory: withLearning,
    closed: true,
    updatedAt: closedAt,
  });

if (
  closed.status !== "closed" ||
  closed.closedAt !== closedAt ||
  closed.lastUpdatedAt !==
    closedAt
) {
  throw new Error(
    "Closing memory should record its closing and update timestamps.",
  );
}

let closedUpdateRejected = false;

try {
  updateDecisionMemory({
    memory: closed,
    reflection,
  });
} catch {
  closedUpdateRejected = true;
}

if (!closedUpdateRejected) {
  throw new Error(
    "Closed decision memory should not be reopened or updated.",
  );
}

let mismatchedOutcomeRejected =
  false;

try {
  updateDecisionMemory({
    memory: initial,
    outcome: {
      ...outcome,
      decisionId:
        "another-decision",
    },
  });
} catch {
  mismatchedOutcomeRejected =
    true;
}

if (!mismatchedOutcomeRejected) {
  throw new Error(
    "Outcome linked to another decision should be rejected.",
  );
}

let crossUserOutcomeRejected =
  false;

try {
  updateDecisionMemory({
    memory: initial,
    outcome: {
      ...outcome,
      userId: "user-2",
    },
  });
} catch {
  crossUserOutcomeRejected =
    true;
}

if (!crossUserOutcomeRejected) {
  throw new Error(
    "Outcome belonging to another user should be rejected.",
  );
}

let crossUserLearningRejected =
  false;

try {
  updateDecisionMemory({
    memory: initial,
    learningEntries: [
      {
        ...learning,
        userId: "user-2",
      },
    ],
  });
} catch {
  crossUserLearningRejected =
    true;
}

if (!crossUserLearningRejected) {
  throw new Error(
    "Learning belonging to another user should be rejected.",
  );
}

if (
  initial.outcome !== null ||
  initial.reflection !== null ||
  initial.learningEntries.length !==
    0
) {
  throw new Error(
    "Updating decision memory must not mutate the original object.",
  );
}

console.log(
  "Decision Memory Manager test passed.",
);
