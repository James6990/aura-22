import {
  generateCoachInsight,
} from "@/lib/coach/generate-coach-insight";
import {
  calculateAdaptiveTraits,
} from "@/lib/genome/calculate-adaptive-traits";
import {
  calculateGenomeMetrics,
} from "@/lib/genome/calculate-genome-metrics";
import {
  generateGenomeInsights,
} from "@/lib/genome/generate-genome-insights";
import {
  calculateProgression,
} from "@/lib/progression/calculate-xp";
import {
  calculateStreaks,
} from "@/lib/progression/calculate-streaks";
import {
  generateWeeklyReview,
} from "@/lib/reviews/generate-weekly-review";
import type {
  DashboardData,
} from "@/lib/dashboard/get-dashboard";

export type DerivedAthleteState = {
  coachInsight:
    ReturnType<typeof generateCoachInsight>;

  genomeMetrics:
    ReturnType<typeof calculateGenomeMetrics>;

  adaptiveTraits:
    ReturnType<typeof calculateAdaptiveTraits>;

  genomeInsights:
    ReturnType<typeof generateGenomeInsights>;

  weeklyReview:
    ReturnType<typeof generateWeeklyReview>;

  progression:
    ReturnType<typeof calculateProgression>;

  streak:
    ReturnType<typeof calculateStreaks>;
};

export function buildDerivedAthleteState(
  data: DashboardData,
): DerivedAthleteState {
  const coachInsight =
    generateCoachInsight(
      data.readinessHistory,
    );

  const genomeMetrics =
    calculateGenomeMetrics(
      data.readinessHistory,
    );

  const adaptiveTraits =
    calculateAdaptiveTraits(
      data.readinessHistory,
    );

  const genomeInsights =
    generateGenomeInsights(
      data.readinessHistory,
      adaptiveTraits,
    );

  const weeklyReview =
    generateWeeklyReview(
      data.readinessHistory,
    );

  const progression =
    calculateProgression(
      data.recentEvents,
    );

  const streak =
    calculateStreaks(
      data.checkInDates,
    );

  return {
    coachInsight,
    genomeMetrics,
    adaptiveTraits,
    genomeInsights,
    weeklyReview,
    progression,
    streak,
  };
}
