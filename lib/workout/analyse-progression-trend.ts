import type {
  ProgressionDecision,
  ProgressionDecisionResult,
} from "@/lib/workout/calculate-progression-decision";

export type ProgressionTrendEntry = {
  loadKg: number | null;
  plannedSets: number;
  completedSets: number;
  rpe: number | null;
  discomfortLevel: number | null;
  techniqueConfidence: number | null;
  completedAt: Date;
};

export type ProgressionRoute =
  | "increase-load"
  | "increase-repetitions"
  | "maintain"
  | "technique-focus"
  | "reduce"
  | "review";

export type ProgressionTrendResult = {
  route: ProgressionRoute;
  decision: ProgressionDecision;
  recommendedNextLoadKg: number | null;
  confidence: number;
  successfulSessions: number;
  reason: string;
};

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

function roundLoad(value: number) {
  return Math.round(value * 4) / 4;
}

function isSuccessfulSession(
  entry: ProgressionTrendEntry,
) {
  const discomfort =
    entry.discomfortLevel ?? 0;

  return (
    entry.completedSets >= entry.plannedSets &&
    (entry.rpe === null || entry.rpe <= 8) &&
    discomfort <= 2 &&
    (
      entry.techniqueConfidence === null ||
      entry.techniqueConfidence >= 75
    )
  );
}

export function analyseProgressionTrend({
  latestDecision,
  history,
}: {
  latestDecision: ProgressionDecisionResult;
  history: ProgressionTrendEntry[];
}): ProgressionTrendResult {
  const recent = [...history]
    .sort(
      (a, b) =>
        b.completedAt.getTime() -
        a.completedAt.getTime(),
    )
    .slice(0, 5);

  const latestLoad =
    recent[0]?.loadKg ??
    latestDecision.recommendedNextLoadKg;

  const successfulSessions =
    recent.filter(isSuccessfulSession).length;

  const discomfortSessions =
    recent.filter(
      (entry) =>
        (entry.discomfortLevel ?? 0) >= 4,
    ).length;

  const lowTechniqueSessions =
    recent.filter(
      (entry) =>
        entry.techniqueConfidence !== null &&
        entry.techniqueConfidence < 60,
    ).length;

  const veryHighEffortSessions =
    recent.filter(
      (entry) =>
        entry.rpe !== null &&
        entry.rpe >= 9,
    ).length;

  let confidence = 25;

  confidence += Math.min(
    recent.length * 10,
    40,
  );

  confidence += Math.min(
    successfulSessions * 8,
    24,
  );

  confidence = clamp(confidence);

  /*
   * Immediate safety signals always override
   * long-term progression trends.
   */
  if (
    latestDecision.decision === "review" ||
    discomfortSessions >= 2
  ) {
    return {
      route: "review",
      decision: "review",
      recommendedNextLoadKg:
        latestDecision.recommendedNextLoadKg ??
        latestLoad,
      confidence,
      successfulSessions,
      reason:
        "Recent discomfort or the latest safety assessment means this exercise should be reviewed before progressing.",
    };
  }

  if (lowTechniqueSessions >= 2) {
    return {
      route: "technique-focus",
      decision: "maintain",
      recommendedNextLoadKg: latestLoad,
      confidence,
      successfulSessions,
      reason:
        "Technique confidence has been low across multiple sessions, so Apex recommends maintaining the challenge and prioritising movement quality.",
    };
  }

  if (veryHighEffortSessions >= 2) {
    return {
      route: "maintain",
      decision: "maintain",
      recommendedNextLoadKg: latestLoad,
      confidence,
      successfulSessions,
      reason:
        "Effort has been very high across recent sessions, so the current challenge should be repeated before progressing.",
    };
  }

  if (
    latestDecision.decision === "increase" &&
    successfulSessions >= 2 &&
    latestLoad !== null &&
    latestLoad > 0
  ) {
    return {
      route: "increase-load",
      decision: "increase",
      recommendedNextLoadKg:
        roundLoad(latestLoad * 1.025),
      confidence,
      successfulSessions,
      reason:
        "Multiple recent sessions were completed with manageable effort, low discomfort and confident technique, supporting a small load increase.",
    };
  }

  if (
    latestDecision.decision === "increase" &&
    successfulSessions === 1
  ) {
    return {
      route: "increase-repetitions",
      decision: "maintain",
      recommendedNextLoadKg: latestLoad,
      confidence,
      successfulSessions,
      reason:
        "The latest result was successful, but Apex wants another repeatable performance before increasing load. Progress repetitions within the target range first.",
    };
  }

  if (latestDecision.decision === "reduce") {
    return {
      route: "reduce",
      decision: "reduce",
      recommendedNextLoadKg:
        latestDecision.recommendedNextLoadKg,
      confidence,
      successfulSessions,
      reason: latestDecision.reason,
    };
  }

  return {
    route: "maintain",
    decision: "maintain",
    recommendedNextLoadKg:
      latestDecision.recommendedNextLoadKg ??
      latestLoad,
    confidence,
    successfulSessions,
    reason:
      "Recent evidence supports maintaining the current challenge while Apex gathers another confident performance.",
  };
}
