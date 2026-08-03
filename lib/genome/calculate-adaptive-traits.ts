export type GenomeTraits = {
  consistency: number;
  recovery: number;
  hydration: number;
  trainingCapacity: number;
  confidence: number;
};

export type ReadinessEntry = {
  energy: number;
  readinessScore: number;
  workoutCompleted: boolean;
  recoveryCompleted: boolean;
  hydrationTargetReached: boolean;
};

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function calculateAdaptiveTraits(
  entries: ReadinessEntry[],
): GenomeTraits {
  if (entries.length === 0) {
    return {
      consistency: 0,
      recovery: 50,
      hydration: 50,
      trainingCapacity: 50,
      confidence: 0,
    };
  }

  const workoutRate =
    entries.filter(e => e.workoutCompleted).length / entries.length;

  const recoveryRate =
    entries.filter(e => e.recoveryCompleted).length / entries.length;

  const hydrationRate =
    entries.filter(e => e.hydrationTargetReached).length / entries.length;

  const readinessAverage =
    average(entries.map(e => e.readinessScore));

  return {
    consistency: Math.round(workoutRate * 100),
    recovery: Math.round((recoveryRate * 0.5 + readinessAverage / 200) * 100),
    hydration: Math.round(hydrationRate * 100),
    trainingCapacity: Math.round(readinessAverage),
    confidence: Math.min(entries.length * 10, 100),
  };
}
