import type {
  ApexDecisionRecord,
} from "@/lib/apex-core/create-decision-record";

export type DecisionHistorySummary = {
  totalDecisions: number;
  activeDecisions: number;
  completedDecisions: number;
  declinedDecisions: number;
  expiredDecisions: number;

  awaitingOutcomeDecisionIds: string[];
  repeatedPriorities: {
    priority: ApexDecisionRecord["priority"];
    count: number;
  }[];

  latestDecision:
    ApexDecisionRecord | null;

  repetitionWarning: string | null;
  summary: string;
};

export type AnalyseDecisionHistoryInput = {
  records: ApexDecisionRecord[];
  now?: Date;
  repetitionThreshold?: number;
};

function isExpired(
  record: ApexDecisionRecord,
  now: Date,
) {
  return (
    record.status === "expired" ||
    (
      record.validUntil !== null &&
      record.validUntil.getTime() <
        now.getTime()
    )
  );
}

export function analyseDecisionHistory({
  records,
  now = new Date(),
  repetitionThreshold = 3,
}: AnalyseDecisionHistoryInput): DecisionHistorySummary {
  const sortedRecords =
    [...records].sort(
      (a, b) =>
        b.issuedAt.getTime() -
        a.issuedAt.getTime(),
    );

  const expiredDecisionIds =
    new Set(
      sortedRecords
        .filter(
          (record) =>
            isExpired(record, now),
        )
        .map(
          (record) => record.id,
        ),
    );

  const activeRecords =
    sortedRecords.filter(
      (record) =>
        !expiredDecisionIds.has(record.id) &&
        (
          record.status === "issued" ||
          record.status === "accepted" ||
          record.status ===
            "partially-followed"
        ),
    );

  const completedRecords =
    sortedRecords.filter(
      (record) =>
        record.status === "completed",
    );

  const declinedRecords =
    sortedRecords.filter(
      (record) =>
        record.status === "declined",
    );

  const awaitingOutcomeDecisionIds =
    activeRecords.map(
      (record) => record.id,
    );

  const priorityCounts =
    new Map<
      ApexDecisionRecord["priority"],
      number
    >();

  for (
    const record of
    sortedRecords.slice(0, 7)
  ) {
    priorityCounts.set(
      record.priority,
      (
        priorityCounts.get(
          record.priority,
        ) ?? 0
      ) + 1,
    );
  }

  const repeatedPriorities =
    [...priorityCounts.entries()]
      .filter(
        ([, count]) =>
          count >= repetitionThreshold,
      )
      .map(
        ([priority, count]) => ({
          priority,
          count,
        }),
      )
      .sort(
        (a, b) =>
          b.count - a.count ||
          a.priority.localeCompare(
            b.priority,
          ),
      );

  const strongestRepetition =
    repeatedPriorities[0] ?? null;

  const repetitionWarning =
    strongestRepetition
      ? `Apex has recommended "${strongestRepetition.priority}" ${strongestRepetition.count} times across the most recent decisions. Review whether repetition is still justified.`
      : null;

  return {
    totalDecisions:
      sortedRecords.length,

    activeDecisions:
      activeRecords.length,

    completedDecisions:
      completedRecords.length,

    declinedDecisions:
      declinedRecords.length,

    expiredDecisions:
      expiredDecisionIds.size,

    awaitingOutcomeDecisionIds,
    repeatedPriorities,

    latestDecision:
      sortedRecords[0] ?? null,

    repetitionWarning,

    summary:
      sortedRecords.length === 0
        ? "Apex has no recorded coaching decisions yet."
        : repetitionWarning ??
          `Apex reviewed ${sortedRecords.length} recorded coaching decision${
            sortedRecords.length === 1
              ? ""
              : "s"
          }.`,
  };
}
