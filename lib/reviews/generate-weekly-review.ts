export type WeeklyReviewEntry = {
  date: string;
  energy: number;
  readinessScore: number;
  workoutCompleted: boolean;
  recoveryCompleted: boolean;
  hydrationTargetReached: boolean;
};

export type WeeklyReview = {
  headline: string;
  summary: string;
  highlight: string;
  focus: string;
  averageReadiness: number;
  completedWorkouts: number;
  hydratedDays: number;
  recoveryDays: number;
};

function average(values: number[]) {
  if (values.length === 0) return 0;

  return (
    values.reduce((total, value) => total + value, 0) /
    values.length
  );
}

function pluralise(
  amount: number,
  singular: string,
  plural: string,
) {
  return amount === 1 ? singular : plural;
}

export function generateWeeklyReview(
  history: WeeklyReviewEntry[],
): WeeklyReview {
  const recent = history.slice(0, 7);

  if (recent.length === 0) {
    return {
      headline: "Your first weekly review is waiting",
      summary:
        "Complete daily check-ins so Apex can begin reviewing your readiness, recovery and consistency.",
      highlight: "No activity recorded yet.",
      focus: "Start with one daily check-in.",
      averageReadiness: 0,
      completedWorkouts: 0,
      hydratedDays: 0,
      recoveryDays: 0,
    };
  }

  const averageReadiness = Math.round(
    average(recent.map((entry) => entry.readinessScore)),
  );

  const averageEnergy = average(
    recent.map((entry) => entry.energy),
  );

  const completedWorkouts = recent.filter(
    (entry) => entry.workoutCompleted,
  ).length;

  const hydratedDays = recent.filter(
    (entry) => entry.hydrationTargetReached,
  ).length;

  const recoveryDays = recent.filter(
    (entry) => entry.recoveryCompleted,
  ).length;

  const strengths = [
    {
      label: "training consistency",
      value: completedWorkouts,
    },
    {
      label: "hydration",
      value: hydratedDays,
    },
    {
      label: "recovery",
      value: recoveryDays,
    },
  ].sort((a, b) => b.value - a.value);

  const weakest = [...strengths].sort(
    (a, b) => a.value - b.value,
  )[0];

  let headline = "A steady week";
  let summary =
    "Your recent data suggests a manageable week with room to build consistency.";

  if (averageReadiness >= 85) {
    headline = "A strong week";
    summary =
      "Your average readiness was high, suggesting you handled your recent activity well.";
  } else if (averageReadiness < 55) {
    headline = "A recovery-focused week";
    summary =
      "Your average readiness was lower this week, so Apex recommends prioritising recovery and manageable training.";
  } else if (averageReadiness >= 70) {
    headline = "A productive week";
    summary =
      "Your readiness stayed at a useful level for controlled progress and consistent training.";
  }

  const highlight =
    strengths[0].value > 0
      ? `${strengths[0].label} was your strongest recorded habit with ${strengths[0].value} ${pluralise(
          strengths[0].value,
          "day",
          "days",
        )}.`
      : "The most valuable step this week was continuing to record your data.";

  let focus =
    `Aim to improve ${weakest.label} with one additional successful day next week.`;

  if (averageEnergy < 5) {
    focus =
      "Energy was low on average. Prioritise sleep, hydration and reduced training fatigue next week.";
  }

  return {
    headline,
    summary,
    highlight,
    focus,
    averageReadiness,
    completedWorkouts,
    hydratedDays,
    recoveryDays,
  };
}
