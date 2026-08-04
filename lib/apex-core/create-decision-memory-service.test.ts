import {
  analyseDecisionReflection,
} from "./analyse-decision-reflection";
import {
  calculateEvidenceWeight,
} from "./calculate-evidence-weight";
import {
  createDecisionMemory,
  type ApexDecisionMemory,
} from "./create-decision-memory";
import {
  createDecisionMemoryService,
  type DecisionMemoryRepository,
} from "./create-decision-memory-service";
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

function cloneMemory(
  memory: ApexDecisionMemory,
): ApexDecisionMemory {
  return {
    ...memory,
    decision: {
      ...memory.decision,
      coreReasons: [
        ...memory.decision.coreReasons,
      ],
      personalisedReasons: [
        ...memory.decision
          .personalisedReasons,
      ],
    },
    reasoningTrace: {
      trace: {
        ...memory.reasoningTrace.trace,
        reasons:
          memory.reasoningTrace.trace
            .reasons.map(
              (reason) => ({
                ...reason,
              }),
            ),
      },
      reasoning: {
        ...memory.reasoningTrace
          .reasoning,
        checkedPriorities: [
          ...memory.reasoningTrace
            .reasoning
            .checkedPriorities,
        ],
      },
    },
    outcome:
      memory.outcome
        ? {
            ...memory.outcome,
            evidence: {
              ...memory.outcome
                .evidence,
            },
          }
        : null,
    reflection:
      memory.reflection
        ? {
            ...memory.reflection,
          }
        : null,
    learningEntries:
      memory.learningEntries.map(
        (learning) => ({
          ...learning,
          sources:
            learning.sources.map(
              (source) => ({
                ...source,
              }),
            ),
        }),
      ),
  };
}

function createRepository():
  DecisionMemoryRepository {
  const memories =
    new Map<
      string,
      ApexDecisionMemory
    >();

  function key({
    memoryId,
    userId,
  }: {
    memoryId: string;
    userId: string;
  }) {
    return `${userId}:${memoryId}`;
  }

  return {
    async getById({
      memoryId,
      userId,
    }) {
      const memory =
        memories.get(
          key({
            memoryId,
            userId,
          }),
        );

      return memory
        ? cloneMemory(memory)
        : null;
    },

    async save(memory) {
      const cloned =
        cloneMemory(memory);

      memories.set(
        key({
          memoryId:
            cloned.id,
          userId:
            cloned.userId,
        }),
        cloned,
      );

      return cloneMemory(cloned);
    },

    async listOpenByUser(
      userId,
    ) {
      return [
        ...memories.values(),
      ]
        .filter(
          (memory) =>
            memory.userId ===
              userId &&
            memory.status !==
              "closed",
        )
        .map(cloneMemory);
    },
  };
}

function createDecision({
  id,
  userId = "user-1",
  issuedAt,
}: {
  id: string;
  userId?: string;
  issuedAt: string;
}): ApexDecisionRecord {
  return {
    id,
    userId,
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
    issuedAt:
      new Date(issuedAt),
    validUntil: null,
    schemaVersion: 1,
  };
}

function createReasoningTrace(
  decision:
    ApexDecisionRecord,
): ApexReasoningDecisionTrace {
  return {
    trace: {
      decisionId: decision.id,
      decisionType:
        "apex-coaching",
      outcome:
        decision.priority,
      confidence: 76,
      reasons: [
        {
          code:
            "reasoning-support-1",
          label:
            "Supporting evidence",
          detail:
            "Readiness supports training.",
          influence:
            "positive",
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
      requiresMoreEvidence:
        false,
      strongestDomain:
        "recovery",
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
  };
}

async function main() {
const repository =
  createRepository();

const service =
  createDecisionMemoryService(
    repository,
  );

const decisionOne =
  createDecision({
    id: "decision-1",
    issuedAt:
      "2026-08-04T18:00:00Z",
  });

const memoryOne =
  createDecisionMemory({
    id: "memory-1",
    decision:
      decisionOne,
    reasoningTrace:
      createReasoningTrace(
        decisionOne,
      ),
  });

const created =
  await service.create(
    memoryOne,
  );

if (
  created.id !==
    memoryOne.id ||
  created.userId !==
    memoryOne.userId
) {
  throw new Error(
    "Service should create and return the decision memory.",
  );
}

created.learningEntries.push(
  {} as never,
);

const fetchedAfterMutation =
  await service.get({
    memoryId: " memory-1 ",
    userId: " user-1 ",
  });

if (
  !fetchedAfterMutation ||
  fetchedAfterMutation
    .learningEntries.length !== 0
) {
  throw new Error(
    "Repository boundaries should protect stored memory from caller mutation.",
  );
}

let duplicateRejected = false;

try {
  await service.create(
    memoryOne,
  );
} catch {
  duplicateRejected = true;
}

if (!duplicateRejected) {
  throw new Error(
    "Duplicate decision memory should be rejected.",
  );
}

const outcome =
  createDecisionOutcome({
    decision:
      decisionOne,
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
    "2026-08-05T09:00:00Z",
  );

const withOutcome =
  await service.recordOutcome({
    memoryId:
      memoryOne.id,
    userId:
      memoryOne.userId,
    outcome,
    updatedAt:
      outcomeUpdatedAt,
  });

if (
  withOutcome.status !==
    "ready-for-reflection" ||
  withOutcome.outcome
    ?.decisionId !==
    decisionOne.id ||
  withOutcome.lastUpdatedAt !==
    outcomeUpdatedAt
) {
  throw new Error(
    "Recording an outcome should advance and persist the memory lifecycle.",
  );
}

const reflection =
  analyseDecisionReflection({
    recommendation:
      decisionOne
        .recommendation,
    athleteOutcome: "better",
    confidence:
      decisionOne.confidence,
  });

const reflected =
  await service.recordReflection({
    memoryId:
      memoryOne.id,
    userId:
      memoryOne.userId,
    reflection,
  });

if (
  reflected.status !==
    "reflected" ||
  reflected.reflection
    ?.outcome !==
    "successful"
) {
  throw new Error(
    "Recording reflection should advance memory to reflected.",
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

const withLearning =
  await service.recordLearning({
    memoryId:
      memoryOne.id,
    userId:
      memoryOne.userId,
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
    "Recording learning should advance memory to learning-created.",
  );
}

const decisionTwo =
  createDecision({
    id: "decision-2",
    issuedAt:
      "2026-08-05T18:00:00Z",
  });

const memoryTwo =
  createDecisionMemory({
    id: "memory-2",
    decision:
      decisionTwo,
    reasoningTrace:
      createReasoningTrace(
        decisionTwo,
      ),
  });

await service.create(
  memoryTwo,
);

const openBeforeClose =
  await service.listOpen(
    " user-1 ",
  );

if (
  openBeforeClose.length !== 2 ||
  openBeforeClose[0]?.id !==
    "memory-2"
) {
  throw new Error(
    "Open decision memories should be returned newest first.",
  );
}

const closedAt =
  new Date(
    "2026-08-06T10:00:00Z",
  );

const closed =
  await service.close({
    memoryId:
      memoryOne.id,
    userId:
      memoryOne.userId,
    updatedAt:
      closedAt,
  });

if (
  closed.status !==
    "closed" ||
  closed.closedAt !==
    closedAt
) {
  throw new Error(
    "Service should close and persist decision memory.",
  );
}

const openAfterClose =
  await service.listOpen(
    "user-1",
  );

if (
  openAfterClose.length !== 1 ||
  openAfterClose[0]?.id !==
    "memory-2"
) {
  throw new Error(
    "Closed memory should be excluded from open-memory listings.",
  );
}

let closedUpdateRejected = false;

try {
  await service.recordReflection({
    memoryId:
      memoryOne.id,
    userId:
      memoryOne.userId,
    reflection,
  });
} catch {
  closedUpdateRejected = true;
}

if (!closedUpdateRejected) {
  throw new Error(
    "Service should reject updates to closed decision memory.",
  );
}

let notFoundRejected = false;

try {
  await service.recordOutcome({
    memoryId:
      "missing-memory",
    userId: "user-1",
    outcome,
  });
} catch {
  notFoundRejected = true;
}

if (!notFoundRejected) {
  throw new Error(
    "Service should reject updates when decision memory is missing.",
  );
}

let blankIdentifierRejected =
  false;

try {
  await service.get({
    memoryId: "   ",
    userId: "user-1",
  });
} catch {
  blankIdentifierRejected =
    true;
}

if (!blankIdentifierRejected) {
  throw new Error(
    "Service should reject blank identifiers.",
  );
}

const otherUserResult =
  await service.get({
    memoryId:
      memoryTwo.id,
    userId: "user-2",
  });

if (otherUserResult !== null) {
  throw new Error(
    "A user must not retrieve another user's decision memory.",
  );
}

console.log(
  "Decision Memory Service test passed.",
);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
