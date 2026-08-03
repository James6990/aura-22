export type GenomeHistoryEntry = {
  energy: number;
  readinessScore: number;
  workoutCompleted: boolean;
  recoveryCompleted: boolean;
  hydrationTargetReached: boolean;
};

export type GenomeMetrics = {
  readinessBaseline: number;
  energyStability: number;
  hydrationReliability: number;
  recoveryConsistency: number;
  confidence: number;
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function average(values: number[]) {
  if (values.length === 0) return 0;

  return (
    values.reduce((total, value) => total + value, 0) /
    values.length
  );
}

function percentageTrue(values: boolean[]) {
  if (values.length === 0) return 0;

  return (
    values.filter(Boolean).length /
    values.length
  ) * 100;
}

function calculateStability(values: number[], maximumRange: number) {
  if (values.length <= 1) return 50;

  const mean = average(values);

  const variance = average(
    values.map((value) => (value - mean) ** 2),
  );

  const standardDeviation = Math.sqrt(variance);
  const instability = (standardDeviation / maximumRange) * 100;

  return clamp(100 - instability);
}

export function calculateGenomeMetrics(
  history: GenomeHistoryEntry[],
): GenomeMetrics {
  if (history.length === 0) {
    return {
      readinessBaseline: 0,
      energyStability: 0,
      hydrationReliability: 0,
      recoveryConsistency: 0,
      confidence: 0,
    };
  }

  const recent = history.slice(0, 30);

  const readinessBaseline = clamp(
    average(recent.map((entry) => entry.readinessScore)),
  );

  const energyStability = calculateStability(
    recent.map((entry) => entry.energy),
    10,
  );

  const hydrationReliability = clamp(
    percentageTrue(
      recent.map((entry) => entry.hydrationTargetReached),
    ),
  );

  const recoveryConsistency = clamp(
    percentageTrue(
      recent.map((entry) => entry.recoveryCompleted),
    ),
  );

  const confidence = clamp(
    Math.min(recent.length / 14, 1) * 100,
  );

  return {
    readinessBaseline,
    energyStability,
    hydrationReliability,
    recoveryConsistency,
    confidence,
  };
}
