import {
  analyseDecisionReflection,
} from "./analyse-decision-reflection";
import {
  buildApexReasoningTrace,
  type ApexReasoningDecisionTrace,
} from "./build-apex-reasoning-trace";
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
  calculateEvidenceWeight,
} from "./calculate-evidence-weight";
import {
  createLearningLedgerEntry,
} from "./create-learning-ledger-entry";
import type {
  ApexDecisionOrchestration,
} from "./orchestrate-apex-decision";
import type {
  ApexReasoningState,
} from "./build-apex-reasoning-state";

function createDecision(
  status: ApexDecisionRecord["status"],
): ApexDecisionRecord {
  return {
    id: "decision-1",
    userId: "user-1",
    decisionType: "daily-coaching",
    priority: "train",
    recommendation:
      "Complete a moderate training session.",
    explanation:
      "Current signals support training.",
    confidence: 78,
    rulesetVersion:
      "apex-rules-v1",
    coreReasons: [
      "Readiness supports training.",
    ],
    personalisedReasons: [],
    status,
    issuedAt: new Date(
      "2026-08-04T18:00:00Z",
    ),
    validUntil: null,
    schemaVersion: 1,
  };
}

function createReasoningTrace(
  decision:
    ApexDecisionRecord,
): ApexReasoningDecisionTrace {
  const orchestration = {
    resolvedPriority:
      decision.priority,
    confidence: 78,
    consistency: {
      prioritiesAligned: true,
      checkedPriorities: [
        decision.priority,
        decision.priority,
        decision.priority,
        decision.priority,
      ],
    },
  } as unknown as ApexDecisionOrchestration;

  const reasoning: ApexReasoningState = {
    priority:
      decision.priority,
    confidence: 78,
    tone: "measured",
    evidenceSufficient: true,
    requiresMoreEvidence: false,
    strongestDomain: "recovery",
    weakestDomain:
      "progression",
    supportingReasons: [
      "Readiness supports training.",
    ],
    cautionReasons: [],
    summary:
      "Apex has enough evidence to guide today's decision carefully.",
  };

  return buildApexReasoningTrace({
    decisionId: decision.id,
    orchestration,
    reasoning,
    createdAt: new Date(
      "2026-08-04T18:00:00Z",
    ),
  });
}

const issuedDecision =
  createDecision("issued");

const issuedTrace =
  createReasoningTrace(
    issuedDecision,
  );

const awaitingResponse =
  createDecisionMemory({
    id: " memory-1 ",
    decision: issuedDecision,
    reasoningTrace: issuedTrace,
  });

if (
  awaitingResponse.id !==
    "memory-1" ||
  awaitingResponse.status !==
    "awaiting-response"
) {
  throw new Error(
    "An issued decision should create an awaiting-response memory.",
  );
}

if (
  awaitingResponse.openedAt !==
  issuedDecision.issuedAt
) {
  throw new Error(
    "Decision memory should default to the decision issue time.",
  );
}

const acceptedDecision =
  createDecision("accepted");

const awaitingOutcome =
  createDecisionMemory({
    id: "memory-2",
    decision:
      acceptedDecision,
    reasoningTrace:
      createReasoningTrace(
        acceptedDecision,
      ),
  });

if (
  awaitingOutcome.status !==
  "awaiting-outcome"
) {
  throw new Error(
    "An accepted decision should await outcome evidence.",
  );
}

const completedDecision =
  createDecision("completed");

const completedTrace =
  createReasoningTrace(
    completedDecision,
  );

const outcome =
  createDecisionOutcome({
    decision:
      completedDecision,
    evidence: {
      followedRecommendation: "yes",
      readinessChange: 6,
      recoveryChange: 4,
      workoutCompleted: true,
      sessionRpe: 7,
      discomfortChange: -1,
      progressionOccurred: true,
    },
  });

const readyForReflection =
  createDecisionMemory({
    id: "memory-3",
    decision:
      completedDecision,
    reasoningTrace:
      completedTrace,
    outcome,
  });

if (
  readyForReflection.status !==
  "ready-for-reflection"
) {
  throw new Error(
    "A usable outcome should make decision memory ready for reflection.",
  );
}

const reflection =
  analyseDecisionReflection({
    recommendation:
      completedDecision
        .recommendation,
    athleteOutcome: "better",
    confidence:
      completedDecision.confidence,
  });

const reflected =
  createDecisionMemory({
    id: "memory-4",
    decision:
      completedDecision,
    reasoningTrace:
      completedTrace,
    outcome,
    reflection,
  });

if (
  reflected.status !==
  "reflected"
) {
  throw new Error(
    "A memory with reflection should be marked reflected.",
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
      "Moderate training produced a positive recorded outcome.",
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

const learningCreated =
  createDecisionMemory({
    id: "memory-5",
    decision:
      completedDecision,
    reasoningTrace:
      completedTrace,
    outcome,
    reflection,
    learningEntries: [
      learning,
    ],
  });

if (
  learningCreated.status !==
  "learning-created" ||
  learningCreated
    .learningEntries.length !== 1
) {
  throw new Error(
    "A memory containing learning should be marked learning-created.",
  );
}

const closedAt = new Date(
  "2026-08-06T18:00:00Z",
);

const closed =
  createDecisionMemory({
    id: "memory-6",
    decision:
      completedDecision,
    reasoningTrace:
      completedTrace,
    outcome,
    reflection,
    learningEntries: [
      learning,
    ],
    status: "closed",
    closedAt,
  });

if (
  closed.status !== "closed" ||
  closed.closedAt !== closedAt
) {
  throw new Error(
    "Closed decision memory should preserve its closing timestamp.",
  );
}

let missingClosedAtRejected =
  false;

try {
  createDecisionMemory({
    id: "memory-invalid-close",
    decision:
      completedDecision,
    reasoningTrace:
      completedTrace,
    status: "closed",
  });
} catch {
  missingClosedAtRejected = true;
}

if (!missingClosedAtRejected) {
  throw new Error(
    "Closed decision memory without closedAt should be rejected.",
  );
}

let mismatchedTraceRejected =
  false;

try {
  createDecisionMemory({
    id: "memory-invalid-trace",
    decision:
      completedDecision,
    reasoningTrace: {
      ...completedTrace,
      trace: {
        ...completedTrace.trace,
        decisionId:
          "another-decision",
      },
    },
  });
} catch {
  mismatchedTraceRejected = true;
}

if (!mismatchedTraceRejected) {
  throw new Error(
    "A reasoning trace linked to another decision should be rejected.",
  );
}

let mismatchedPriorityRejected =
  false;

try {
  createDecisionMemory({
    id: "memory-invalid-priority",
    decision:
      completedDecision,
    reasoningTrace: {
      ...completedTrace,
      trace: {
        ...completedTrace.trace,
        outcome: "recover",
      },
    },
  });
} catch {
  mismatchedPriorityRejected = true;
}

if (!mismatchedPriorityRejected) {
  throw new Error(
    "A reasoning trace with another priority should be rejected.",
  );
}

let mismatchedOutcomeRejected =
  false;

try {
  createDecisionMemory({
    id: "memory-invalid-outcome",
    decision:
      completedDecision,
    reasoningTrace:
      completedTrace,
    outcome: {
      ...outcome,
      decisionId:
        "another-decision",
    },
  });
} catch {
  mismatchedOutcomeRejected = true;
}

if (!mismatchedOutcomeRejected) {
  throw new Error(
    "An outcome linked to another decision should be rejected.",
  );
}

let crossUserOutcomeRejected =
  false;

try {
  createDecisionMemory({
    id: "memory-invalid-user-outcome",
    decision:
      completedDecision,
    reasoningTrace:
      completedTrace,
    outcome: {
      ...outcome,
      userId: "user-2",
    },
  });
} catch {
  crossUserOutcomeRejected = true;
}

if (!crossUserOutcomeRejected) {
  throw new Error(
    "An outcome belonging to another user should be rejected.",
  );
}

let crossUserLearningRejected =
  false;

try {
  createDecisionMemory({
    id: "memory-invalid-learning",
    decision:
      completedDecision,
    reasoningTrace:
      completedTrace,
    learningEntries: [
      {
        ...learning,
        userId: "user-2",
      },
    ],
  });
} catch {
  crossUserLearningRejected = true;
}

if (!crossUserLearningRejected) {
  throw new Error(
    "Learning belonging to another user should be rejected.",
  );
}

for (const memory of [
  awaitingResponse,
  awaitingOutcome,
  readyForReflection,
  reflected,
  learningCreated,
  closed,
]) {
  if (memory.schemaVersion !== 1) {
    throw new Error(
      "Decision memory schema version should default to one.",
    );
  }

  if (
    memory.userId !==
    memory.decision.userId
  ) {
    throw new Error(
      "Decision memory user should always match the decision user.",
    );
  }
}

console.log(
  "Apex Decision Memory contract test passed.",
);
