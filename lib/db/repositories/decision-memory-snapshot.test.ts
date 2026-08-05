import type {
  ApexDecisionMemory,
} from "@/lib/apex-core/create-decision-memory";
import {
  hydrateDecisionMemory,
  serializeDecisionMemory,
} from "./decision-memory-snapshot";

const observedAt =
  new Date(
    "2026-08-05T08:00:00Z",
  );

const memory:
  ApexDecisionMemory = {
    id: "memory-1",
    userId: "user-1",

    decision: {
      id: "decision-1",
      userId: "user-1",
      decisionType:
        "daily-coaching",
      priority: "train",
      recommendation:
        "Complete a moderate session.",
      explanation:
        "Evidence supports training.",
      confidence: 76,
      rulesetVersion:
        "apex-rules-v1",
      coreReasons: [
        "Readiness supports training.",
      ],
      personalisedReasons: [],
      status: "completed",
      issuedAt: observedAt,
      validUntil:
        new Date(
          "2026-08-05T18:00:00Z",
        ),
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
        reasons: [],
        overriddenBy: null,
        evidenceRegistryVersion:
          "apex-evidence-v1",
        createdAt: observedAt,
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
        ],
        summary:
          "Evidence supports careful guidance.",
      },
    },

    outcome: {
      decisionId:
        "decision-1",
      userId: "user-1",
      decisionPriority:
        "train",
      status: "positive",
      evidence: {
        followedRecommendation:
          "yes",
        readinessChange: 4,
        recoveryChange: 2,
        workoutCompleted: true,
        sessionRpe: 7,
        discomfortChange: -1,
        progressionOccurred: true,
      },
      evidenceCount: 7,
      confidence: 92,
      occurredAt:
        new Date(
          "2026-08-05T12:00:00Z",
        ),
      schemaVersion: 1,
      summary:
        "The recorded outcome supports this decision.",
    },

    reflection: {
      outcome: "successful",
      learningScore: 86,
      recommendationReliability:
        "increase",
      summary:
        "The recommendation produced a better outcome.",
    },

    learningEntries: [
      {
        id: "learning-1",
        userId: "user-1",
        domain:
          "coaching-effectiveness",
        key:
          "moderate-training",
        title:
          "Moderate training response",
        conclusion:
          "Moderate training produced a positive response.",
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
          observedAt,
        lastUpdatedAt:
          new Date(
            "2026-08-05T13:00:00Z",
          ),
        schemaVersion: 1,
      },
    ],

    status:
      "learning-created",

    openedAt: observedAt,
    lastUpdatedAt:
      new Date(
        "2026-08-05T13:00:00Z",
      ),
    closedAt: null,

    schemaVersion: 1,
  };

const snapshot =
  serializeDecisionMemory(
    memory,
  );

if (
  typeof snapshot.openedAt !==
    "string" ||
  typeof snapshot.decision
    .issuedAt !== "string" ||
  typeof snapshot.learningEntries[0]
    ?.firstObservedAt !== "string"
) {
  throw new Error(
    "Decision Memory snapshot should serialize every Date.",
  );
}

const hydrated =
  hydrateDecisionMemory(
    snapshot,
  );

if (
  !(
    hydrated.openedAt
    instanceof Date
  ) ||
  !(
    hydrated.decision.issuedAt
    instanceof Date
  ) ||
  !(
    hydrated.outcome?.occurredAt
    instanceof Date
  ) ||
  !(
    hydrated.learningEntries[0]
      ?.lastUpdatedAt
    instanceof Date
  )
) {
  throw new Error(
    "Decision Memory snapshot should restore every Date.",
  );
}

if (
  hydrated.decision.id !==
    memory.decision.id ||
  hydrated.learningEntries[0]
    ?.id !== "learning-1"
) {
  throw new Error(
    "Decision Memory snapshot should preserve nested domain data.",
  );
}

let invalidDateRejected =
  false;

try {
  hydrateDecisionMemory({
    ...snapshot,
    openedAt:
      "not-a-date",
  });
} catch {
  invalidDateRejected = true;
}

if (!invalidDateRejected) {
  throw new Error(
    "Invalid stored dates should be rejected.",
  );
}

console.log(
  "Decision Memory Snapshot Mapper test passed.",
);
