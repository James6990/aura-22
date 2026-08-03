import type { GenomeTraits } from "@/lib/genome/calculate-adaptive-traits";

export type GenomeInsightEntry = {
  date: string;
  energy: number;
  readinessScore: number;
  workoutCompleted: boolean;
  recoveryCompleted: boolean;
  hydrationTargetReached: boolean;
};

export type GenomeInsight = {
  id: string;
  title: string;
  message: string;
  type:
    | "positive"
    | "attention"
    | "trend"
    | "learning";
};

function average(values: number[]) {
  if (values.length === 0) return 0;

  return (
    values.reduce((total, value) => total + value, 0) /
    values.length
  );
}

export function generateGenomeInsights(
  history: GenomeInsightEntry[],
  traits: GenomeTraits,
): GenomeInsight[] {
  if (history.length === 0) {
    return [
      {
        id: "first-data",
        title: "Apex is ready to learn",
        message:
          "Complete your first daily check-in to begin building personalised patterns.",
        type: "learning",
      },
    ];
  }

  const recent = history.slice(0, 7);
  const insights: GenomeInsight[] = [];

  const traitValues = [
    {
      label: "training consistency",
      value: traits.consistency,
    },
    {
      label: "recovery",
      value: traits.recovery,
    },
    {
      label: "hydration",
      value: traits.hydration,
    },
    {
      label: "training capacity",
      value: traits.trainingCapacity,
    },
  ];

  const strongest = [...traitValues].sort(
    (a, b) => b.value - a.value,
  )[0];

  const weakest = [...traitValues].sort(
    (a, b) => a.value - b.value,
  )[0];

  if (strongest.value >= 70) {
    insights.push({
      id: "strongest-trait",
      title: `Strong ${strongest.label}`,
      message:
        `Your ${strongest.label} is currently your strongest adaptive trait at ${strongest.value}%.`,
      type: "positive",
    });
  }

  if (weakest.value < 60) {
    insights.push({
      id: "support-area",
      title: `${weakest.label} needs support`,
      message:
        `Your recent data suggests ${weakest.label} is the clearest area for gradual improvement.`,
      type: "attention",
    });
  }

  if (recent.length >= 4) {
    const newestHalf = recent.slice(
      0,
      Math.ceil(recent.length / 2),
    );

    const olderHalf = recent.slice(
      Math.ceil(recent.length / 2),
    );

    const newestAverage = average(
      newestHalf.map((entry) => entry.readinessScore),
    );

    const olderAverage = average(
      olderHalf.map((entry) => entry.readinessScore),
    );

    const difference = Math.round(
      newestAverage - olderAverage,
    );

    if (difference >= 5) {
      insights.push({
        id: "readiness-up",
        title: "Readiness is improving",
        message:
          `Your recent readiness average is approximately ${difference} points higher than earlier in this period.`,
        type: "trend",
      });
    } else if (difference <= -5) {
      insights.push({
        id: "readiness-down",
        title: "Readiness is trending down",
        message:
          "Recent readiness has declined. Apex will prioritise manageable training and stronger recovery habits.",
        type: "attention",
      });
    }
  }

  const hydratedEntries = recent.filter(
    (entry) => entry.hydrationTargetReached,
  );

  const missedHydrationEntries = recent.filter(
    (entry) => !entry.hydrationTargetReached,
  );

  if (
    hydratedEntries.length >= 2 &&
    missedHydrationEntries.length >= 2
  ) {
    const hydratedAverage = average(
      hydratedEntries.map(
        (entry) => entry.readinessScore,
      ),
    );

    const missedAverage = average(
      missedHydrationEntries.map(
        (entry) => entry.readinessScore,
      ),
    );

    const difference = Math.round(
      hydratedAverage - missedAverage,
    );

    if (difference >= 5) {
      insights.push({
        id: "hydration-correlation",
        title: "Hydration may support readiness",
        message:
          `Your readiness has averaged about ${difference} points higher on recorded hydration-target days. More data will strengthen this pattern.`,
        type: "trend",
      });
    }
  }

  if (traits.confidence < 50) {
    insights.push({
      id: "low-confidence",
      title: "Genome still learning",
      message:
        `Learning confidence is ${traits.confidence}%. Continue regular check-ins before treating early patterns as established.`,
      type: "learning",
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "steady-pattern",
      title: "Your pattern is currently steady",
      message:
        "No major change has been detected yet. Continue checking in so Apex can identify meaningful trends.",
      type: "learning",
    });
  }

  return insights.slice(0, 4);
}
