export type RecoveryBehaviourEntry = {
  date: string;
  energy: number;
  readinessScore: number;
  readinessLevel: string;
  workoutCompleted: boolean;
  recoveryCompleted: boolean;
  hydrationTargetReached: boolean;
};

export type RecoveryBehaviourProfile = {
  recordedDays: number;
  averageReadiness: number | null;
  averageEnergy: number | null;
  readinessStability: number;

  hydrationAdherence: number;
  recoveryAdherence: number;

  hydratedReadinessAverage: number | null;
  nonHydratedReadinessAverage: number | null;
  hydrationReadinessDifference: number | null;

  confidence: number;
  summary: string;
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

function average(
  values: number[],
): number | null {
  if (values.length === 0) {
    return null;
  }

  return (
    values.reduce(
      (total, value) => total + value,
      0,
    ) / values.length
  );
}

function percentageTrue(
  values: boolean[],
) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    (
      values.filter(Boolean).length /
      values.length
    ) * 100,
  );
}

function calculateStability(
  values: number[],
) {
  if (values.length <= 1) {
    return values.length === 0
      ? 0
      : 50;
  }

  const mean = average(values) ?? 0;

  const variance =
    values.reduce(
      (total, value) =>
        total + (value - mean) ** 2,
      0,
    ) / values.length;

  const standardDeviation =
    Math.sqrt(variance);

  return Math.round(
    clamp(
      100 - standardDeviation * 4,
    ),
  );
}

export function analyseRecoveryBehaviour(
  entries: RecoveryBehaviourEntry[],
): RecoveryBehaviourProfile {
  const readinessValues =
    entries.map(
      (entry) => entry.readinessScore,
    );

  const energyValues =
    entries.map(
      (entry) => entry.energy,
    );

  const hydratedEntries =
    entries.filter(
      (entry) =>
        entry.hydrationTargetReached,
    );

  const nonHydratedEntries =
    entries.filter(
      (entry) =>
        !entry.hydrationTargetReached,
    );

  const hydratedReadinessAverage =
    average(
      hydratedEntries.map(
        (entry) =>
          entry.readinessScore,
      ),
    );

  const nonHydratedReadinessAverage =
    average(
      nonHydratedEntries.map(
        (entry) =>
          entry.readinessScore,
      ),
    );

  const hydrationReadinessDifference =
    hydratedReadinessAverage !== null &&
    nonHydratedReadinessAverage !== null
      ? Math.round(
          hydratedReadinessAverage -
            nonHydratedReadinessAverage,
        )
      : null;

  const confidence = Math.round(
    clamp(entries.length * 10),
  );

  const summary =
    entries.length === 0
      ? "Apex needs daily check-ins before it can learn recovery behaviour."
      : confidence < 50
        ? "Apex is beginning to learn recent recovery and hydration patterns."
        : "Apex has enough recent check-ins to begin adapting recovery guidance.";

  return {
    recordedDays: entries.length,
    averageReadiness:
      average(readinessValues),
    averageEnergy:
      average(energyValues),
    readinessStability:
      calculateStability(
        readinessValues,
      ),
    hydrationAdherence:
      percentageTrue(
        entries.map(
          (entry) =>
            entry.hydrationTargetReached,
        ),
      ),
    recoveryAdherence:
      percentageTrue(
        entries.map(
          (entry) =>
            entry.recoveryCompleted,
        ),
      ),
    hydratedReadinessAverage,
    nonHydratedReadinessAverage,
    hydrationReadinessDifference,
    confidence,
    summary,
  };
}
