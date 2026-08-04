import type {
  ApexDecisionMemory,
} from "./create-decision-memory";
import {
  createDecisionMemoryEventPublisher,
  type DecisionMemoryDomainEvent,
  type DecisionMemoryEventSink,
} from "./create-decision-memory-event-publisher";

function createMemory():
  ApexDecisionMemory {
  const issuedAt = new Date(
    "2026-08-04T18:00:00Z",
  );

  return {
    id: "memory-1",
    userId: "user-1",

    decision: {
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
      status: "issued",
      issuedAt,
      validUntil: null,
      schemaVersion: 1,
    },

    reasoningTrace: {
      trace: {
        decisionId:
          "decision-1",
        decisionType:
          "apex-coaching",
        outcome: "train",
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
        createdAt: issuedAt,
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
    },

    outcome: null,
    reflection: null,
    learningEntries: [],

    status:
      "awaiting-response",

    openedAt: issuedAt,
    lastUpdatedAt: issuedAt,
    closedAt: null,

    schemaVersion: 1,
  };
}

async function main() {
  const published:
    DecisionMemoryDomainEvent[] = [];

  const sink:
    DecisionMemoryEventSink = {
      async publish(event) {
        published.push(event);
      },
    };

  const publisher =
    createDecisionMemoryEventPublisher(
      sink,
    );

  const memory =
    createMemory();

  const createdAt = new Date(
    "2026-08-04T18:05:00Z",
  );

  const created =
    await publisher.publishCreated({
      memory,
      metadata: {
        eventId:
          " event-created-1 ",
        correlationId:
          " correlation-1 ",
        causationId:
          " command-1 ",
        occurredAt:
          createdAt,
      },
    });

  if (
    created.type !==
      "decision-memory.created" ||
    created.userId !== "user-1" ||
    created.category !== "system" ||
    created.source !==
      "apex-decision-memory"
  ) {
    throw new Error(
      "Created event should use the decision-memory event identity.",
    );
  }

  if (
    created.payload.eventId !==
      "event-created-1" ||
    created.payload.correlationId !==
      "correlation-1" ||
    created.payload.causationId !==
      "command-1"
  ) {
    throw new Error(
      "Event metadata should be normalised and preserved.",
    );
  }

  if (
    created.payload.memoryId !==
      memory.id ||
    created.payload.decisionId !==
      memory.decision.id ||
    created.payload.priority !==
      memory.decision.priority
  ) {
    throw new Error(
      "Created event should identify its memory and decision.",
    );
  }

  if (
    created.occurredAt !==
    createdAt
  ) {
    throw new Error(
      "Publisher should preserve the supplied occurrence time.",
    );
  }

  const outcomeMemory = {
    ...memory,

    decision: {
      ...memory.decision,
      status: "completed",
    },

    outcome: {
      decisionId:
        memory.decision.id,
      userId: memory.userId,
      decisionPriority:
        memory.decision.priority,
      status: "positive",
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
      evidenceCount: 7,
      confidence: 92,
      occurredAt:
        new Date(
          "2026-08-05T09:00:00Z",
        ),
      schemaVersion: 1,
      summary:
        "The recorded outcome supports this decision.",
    },

    status:
      "ready-for-reflection",
  } satisfies ApexDecisionMemory;

  const outcomeEvent =
    await publisher
      .publishOutcomeRecorded({
        memory: outcomeMemory,
        metadata: {
          eventId:
            "event-outcome-1",
        },
      });

  if (
    outcomeEvent.payload
      .outcomeStatus !== "positive"
  ) {
    throw new Error(
      "Outcome event should expose its outcome status.",
    );
  }

  const reflectedMemory = {
    ...outcomeMemory,

    reflection: {
      outcome: "successful",
      learningScore: 86,
      recommendationReliability:
        "increase",
      summary:
        "The recommendation produced a better outcome.",
    },

    status: "reflected",
  } satisfies ApexDecisionMemory;

  const reflectionEvent =
    await publisher
      .publishReflectionRecorded({
        memory:
          reflectedMemory,
        metadata: {
          eventId:
            "event-reflection-1",
        },
      });

  if (
    reflectionEvent.payload
      .reflectionOutcome !==
    "successful"
  ) {
    throw new Error(
      "Reflection event should expose the reflection outcome.",
    );
  }

  const learningMemory = {
    ...reflectedMemory,

    learningEntries: [
      {
        id: "learning-1",
        userId: "user-1",
        domain:
          "coaching-effectiveness",
        key:
          "moderate-training-response",
        title:
          "Moderate training response",
        conclusion:
          "Moderate training produced a positive result.",
        status: "provisional",
        confidence: 72,
        evidenceLevel:
          "moderate",
        canInfluenceDecision:
          true,
        sources: [
          {
            sourceType:
              "decision-outcome",
            sourceId:
              "decision-1",
            contribution: 72,
          },
        ],
        firstObservedAt:
          createdAt,
        lastUpdatedAt:
          createdAt,
        schemaVersion: 1,
      },
    ],

    status:
      "learning-created",
  } satisfies ApexDecisionMemory;

  const learningEvent =
    await publisher
      .publishLearningCreated({
        memory:
          learningMemory,
        metadata: {
          eventId:
            "event-learning-1",
        },
      });

  if (
    learningEvent.payload
      .learningCount !== 1
  ) {
    throw new Error(
      "Learning event should expose the learning count.",
    );
  }

  const learningEntryIds =
    learningEvent.payload
      .learningEntryIds;

  if (
    !Array.isArray(
      learningEntryIds,
    ) ||
    learningEntryIds[0] !==
      "learning-1"
  ) {
    throw new Error(
      "Learning event should expose learning entry identifiers.",
    );
  }

  const closedAt = new Date(
    "2026-08-06T10:00:00Z",
  );

  const closedMemory = {
    ...learningMemory,
    status: "closed",
    closedAt,
    lastUpdatedAt:
      closedAt,
  } satisfies ApexDecisionMemory;

  const closedEvent =
    await publisher.publishClosed({
      memory: closedMemory,
      metadata: {
        eventId:
          "event-closed-1",
      },
    });

  if (
    closedEvent.payload
      .memoryStatus !== "closed"
  ) {
    throw new Error(
      "Closed event should expose the closed memory status.",
    );
  }

  if (published.length !== 5) {
    throw new Error(
      `Expected five published events, received ${published.length}.`,
    );
  }

  let missingOutcomeRejected =
    false;

  try {
    await publisher
      .publishOutcomeRecorded({
        memory,
        metadata: {
          eventId:
            "invalid-outcome",
        },
      });
  } catch {
    missingOutcomeRejected =
      true;
  }

  if (!missingOutcomeRejected) {
    throw new Error(
      "Outcome event without an outcome should be rejected.",
    );
  }

  let missingLearningRejected =
    false;

  try {
    await publisher
      .publishLearningCreated({
        memory,
        metadata: {
          eventId:
            "invalid-learning",
        },
      });
  } catch {
    missingLearningRejected =
      true;
  }

  if (!missingLearningRejected) {
    throw new Error(
      "Learning event without learning entries should be rejected.",
    );
  }

  let openMemoryCloseRejected =
    false;

  try {
    await publisher
      .publishClosed({
        memory,
        metadata: {
          eventId:
            "invalid-close",
        },
      });
  } catch {
    openMemoryCloseRejected =
      true;
  }

  if (!openMemoryCloseRejected) {
    throw new Error(
      "Closed event for an open memory should be rejected.",
    );
  }

  let crossUserRejected = false;

  try {
    await publisher
      .publishCreated({
        memory: {
          ...memory,
          userId: "user-2",
        },
        metadata: {
          eventId:
            "invalid-user",
        },
      });
  } catch {
    crossUserRejected = true;
  }

  if (!crossUserRejected) {
    throw new Error(
      "Cross-user decision memory events should be rejected.",
    );
  }

  let blankEventIdRejected =
    false;

  try {
    await publisher
      .publishCreated({
        memory,
        metadata: {
          eventId: "   ",
        },
      });
  } catch {
    blankEventIdRejected =
      true;
  }

  if (!blankEventIdRejected) {
    throw new Error(
      "Blank event identifiers should be rejected.",
    );
  }

  console.log(
    "Decision Memory Event Publisher test passed.",
  );
}

main().catch(
  (error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  },
);
