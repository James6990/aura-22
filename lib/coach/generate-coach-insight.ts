export type CoachHistoryEntry = {
  date: string;
  energy: number;
  readinessScore: number;
  readinessLevel: string;
  workoutCompleted: boolean;
  recoveryCompleted: boolean;
  hydrationTargetReached: boolean;
};

export type CoachInsight = {
  title: string;
  message: string;
  priority: "training" | "recovery" | "hydration" | "consistency";
};

function average(values: number[]) {
  if (values.length === 0) return 0;

  return values.reduce((total, value) => total + value, 0) /
    values.length;
}

export function generateCoachInsight(
  history: CoachHistoryEntry[],
): CoachInsight {
  if (history.length === 0) {
    return {
      title: "Complete your first check-in",
      message:
        "Log today's energy, recovery and hydration so Apex can begin personalising your guidance.",
      priority: "consistency",
    };
  }

  const today = history[0];
  const recent = history.slice(0, 7);

  const averageReadiness = average(
    recent.map((entry) => entry.readinessScore),
  );

  const averageEnergy = average(
    recent.map((entry) => entry.energy),
  );

  const hydrationMisses = recent.filter(
    (entry) => !entry.hydrationTargetReached,
  ).length;

  const recoveryMisses = recent.filter(
    (entry) => !entry.recoveryCompleted,
  ).length;

  const completedWorkouts = recent.filter(
    (entry) => entry.workoutCompleted,
  ).length;

  if (today.readinessScore < 50) {
    return {
      title: "Prioritise recovery today",
      message:
        "Your readiness is low. Reduce training intensity, avoid failure sets and focus on mobility, hydration and rest.",
      priority: "recovery",
    };
  }

  if (hydrationMisses >= 3) {
    return {
      title: "Hydration needs attention",
      message:
        "You have missed your hydration target several times recently. Complete your water target before a demanding workout.",
      priority: "hydration",
    };
  }

  if (recoveryMisses >= 3 || averageEnergy < 5) {
    return {
      title: "Reduce accumulated fatigue",
      message:
        "Your recent recovery signals suggest fatigue is building. Consider reducing training volume by around 20% today.",
      priority: "recovery",
    };
  }

  if (
    today.readinessScore >= 85 &&
    averageReadiness >= 75
  ) {
    return {
      title: "Strong training day",
      message:
        "Your readiness and recent trend are strong. Follow your planned session and consider a small progressive overload increase on your main lift.",
      priority: "training",
    };
  }

  if (completedWorkouts === 0 && recent.length >= 3) {
    return {
      title: "Rebuild training momentum",
      message:
        "You have not recorded a completed workout recently. Choose a manageable session today and focus on rebuilding consistency.",
      priority: "consistency",
    };
  }

  return {
    title: "Stay consistent",
    message:
      "Your readiness is suitable for a controlled session. Follow your plan, keep technique sharp and avoid adding unnecessary fatigue.",
    priority: "training",
  };
}
