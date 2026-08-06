import {
  createDecisionMemoryEventAnalyticsSnapshot,
  type DecisionMemoryEventAnalyticsSnapshot,
} from "@/lib/analytics/events/contracts";

import type {
  EventAnalyticsSnapshotRow,
  EventAnalyticsSnapshotWrite,
} from "@/lib/analytics/events/repository";

export type PostgresEventAnalyticsSnapshotRow = {
  id:
    string;

  userId:
    string;

  windowStartAt:
    Date;

  windowEndAt:
    Date;

  generatedAt:
    Date;

  schemaVersion:
    number;

  snapshot:
    DecisionMemoryEventAnalyticsSnapshot;

  createdAt:
    Date;

  updatedAt:
    Date;
};

function requireValidDate(
  value: Date,
  label: string,
) {
  if (
    !(value instanceof Date) ||
    Number.isNaN(
      value.getTime(),
    )
  ) {
    throw new Error(
      `${label} is invalid.`,
    );
  }

  return value;
}

export function eventAnalyticsSnapshotRowFromPostgres(
  row:
    PostgresEventAnalyticsSnapshotRow,
): EventAnalyticsSnapshotRow {
  const snapshot =
    createDecisionMemoryEventAnalyticsSnapshot(
      row.snapshot,
    );

  const windowStartAt =
    requireValidDate(
      row.windowStartAt,
      "PostgreSQL Event Analytics windowStartAt",
    ).toISOString();

  const windowEndAt =
    requireValidDate(
      row.windowEndAt,
      "PostgreSQL Event Analytics windowEndAt",
    ).toISOString();

  const generatedAt =
    requireValidDate(
      row.generatedAt,
      "PostgreSQL Event Analytics generatedAt",
    ).toISOString();

  const createdAt =
    requireValidDate(
      row.createdAt,
      "PostgreSQL Event Analytics createdAt",
    ).toISOString();

  const updatedAt =
    requireValidDate(
      row.updatedAt,
      "PostgreSQL Event Analytics updatedAt",
    ).toISOString();

  if (
    row.id !==
    snapshot.id
  ) {
    throw new Error(
      "PostgreSQL Event Analytics row id does not match its snapshot.",
    );
  }

  if (
    row.userId !==
    snapshot.userId
  ) {
    throw new Error(
      "PostgreSQL Event Analytics row user does not match its snapshot.",
    );
  }

  if (
    windowStartAt !==
      snapshot.window.startAt ||
    windowEndAt !==
      snapshot.window.endAt
  ) {
    throw new Error(
      "PostgreSQL Event Analytics row window does not match its snapshot.",
    );
  }

  if (
    generatedAt !==
    snapshot.generatedAt
  ) {
    throw new Error(
      "PostgreSQL Event Analytics row generatedAt does not match its snapshot.",
    );
  }

  if (
    row.schemaVersion !==
    snapshot.schemaVersion
  ) {
    throw new Error(
      "PostgreSQL Event Analytics row schema version does not match its snapshot.",
    );
  }

  return {
    id:
      row.id,

    userId:
      row.userId,

    windowStartAt,

    windowEndAt,

    generatedAt,

    schemaVersion:
      row.schemaVersion,

    snapshot,

    createdAt,

    updatedAt,
  };
}

export function eventAnalyticsSnapshotWriteToPostgres(
  value:
    EventAnalyticsSnapshotWrite,
) {
  const snapshot =
    createDecisionMemoryEventAnalyticsSnapshot(
      value.snapshot,
    );

  return {
    id:
      value.id,

    userId:
      value.userId,

    windowStartAt:
      new Date(
        value.windowStartAt,
      ),

    windowEndAt:
      new Date(
        value.windowEndAt,
      ),

    generatedAt:
      new Date(
        value.generatedAt,
      ),

    schemaVersion:
      value.schemaVersion,

    snapshot,

    updatedAt:
      new Date(
        value.updatedAt,
      ),
  };
}
