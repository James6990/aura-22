import {
  analyseDecisionHistory,
} from "./analyse-decision-history";
import type {
  ApexDecisionRecord,
} from "./create-decision-record";

const now = new Date(
  "2026-08-04T18:00:00Z",
);

function createRecord({
  id,
  priority,
  status,
  issuedAt,
  validUntil = null,
}: {
  id: string;
  priority:
    ApexDecisionRecord["priority"];
  status:
    ApexDecisionRecord["status"];
  issuedAt: string;
  validUntil?: string | null;
}): ApexDecisionRecord {
  return {
    id,
    userId: "user-1",
    decisionType: "daily-coaching",
    priority,
    recommendation:
      "Follow today's recommendation.",
    explanation:
      "This recommendation reflects current evidence.",
    confidence: 75,
    rulesetVersion:
      "apex-rules-v1",
    coreReasons: [
      "Current readiness supports this decision.",
    ],
    personalisedReasons: [],
    status,
    issuedAt: new Date(issuedAt),
    validUntil:
      validUntil === null
        ? null
        : new Date(validUntil),
    schemaVersion: 1,
  };
}

const records: ApexDecisionRecord[] = [
  createRecord({
    id: "decision-1",
    priority: "recover",
    status: "issued",
    issuedAt:
      "2026-08-04T10:00:00Z",
    validUntil:
      "2026-08-05T10:00:00Z",
  }),
  createRecord({
    id: "decision-2",
    priority: "recover",
    status: "accepted",
    issuedAt:
      "2026-08-03T10:00:00Z",
    validUntil:
      "2026-08-04T22:00:00Z",
  }),
  createRecord({
    id: "decision-3",
    priority: "recover",
    status: "completed",
    issuedAt:
      "2026-08-02T10:00:00Z",
  }),
  createRecord({
    id: "decision-4",
    priority: "train",
    status: "declined",
    issuedAt:
      "2026-08-01T10:00:00Z",
  }),
  createRecord({
    id: "decision-5",
    priority: "train",
    status: "issued",
    issuedAt:
      "2026-07-31T10:00:00Z",
    validUntil:
      "2026-08-01T10:00:00Z",
  }),
  createRecord({
    id: "decision-6",
    priority: "hydrate",
    status: "expired",
    issuedAt:
      "2026-07-30T10:00:00Z",
  }),
];

const history =
  analyseDecisionHistory({
    records,
    now,
    repetitionThreshold: 3,
  });

if (history.totalDecisions !== 6) {
  throw new Error(
    `Expected six decisions, received ${history.totalDecisions}.`,
  );
}

if (history.activeDecisions !== 2) {
  throw new Error(
    `Expected two active decisions, received ${history.activeDecisions}.`,
  );
}

if (
  history.completedDecisions !== 1
) {
  throw new Error(
    "Expected one completed decision.",
  );
}

if (
  history.declinedDecisions !== 1
) {
  throw new Error(
    "Expected one declined decision.",
  );
}

if (history.expiredDecisions !== 2) {
  throw new Error(
    `Expected two expired decisions, received ${history.expiredDecisions}.`,
  );
}

if (
  history.latestDecision?.id !==
  "decision-1"
) {
  throw new Error(
    "Expected the newest issued decision to be latest.",
  );
}

if (
  history.awaitingOutcomeDecisionIds
    .join(",") !==
  "decision-1,decision-2"
) {
  throw new Error(
    "Expected active decisions to await outcomes in newest-first order.",
  );
}

const repeatedRecovery =
  history.repeatedPriorities.find(
    (entry) =>
      entry.priority === "recover",
  );

if (repeatedRecovery?.count !== 3) {
  throw new Error(
    "Expected recovery to be detected as a repeated priority.",
  );
}

if (
  !history.repetitionWarning?.includes(
    '"recover" 3 times',
  )
) {
  throw new Error(
    "Expected a repetition warning for recovery guidance.",
  );
}

const emptyHistory =
  analyseDecisionHistory({
    records: [],
    now,
  });

if (
  emptyHistory.totalDecisions !== 0 ||
  emptyHistory.latestDecision !== null ||
  emptyHistory.repetitionWarning !== null
) {
  throw new Error(
    "Empty history should return a safe empty summary.",
  );
}

console.log(
  "Decision History Engine test passed.",
);
