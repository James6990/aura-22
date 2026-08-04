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
  generateWeeklyReview,
} from "@/lib/reviews/generate-weekly-review";
import {
  calculateProgression,
} from "@/lib/progression/calculate-xp";
import {
  calculateStreaks,
} from "@/lib/progression/calculate-streaks";
import type {
  DashboardData,
} from "@/lib/dashboard/get-dashboard";
import {
  buildDashboardViewState,
  type DashboardViewState,
} from "@/lib/dashboard/build-dashboard-view-state";

export type DashboardState = {
  data: DashboardData;
  view: DashboardViewState;
};

type CalculatedDashboardFields =
  | "coachInsight"
  | "adaptiveTraits"
  | "genomeMetrics"
  | "genomeInsights"
  | "weeklyReview"
  | "progression"
  | "streak";

export type BuildDashboardStateInput = {
  data: DashboardData;
  view: Omit<
    DashboardViewState,
    CalculatedDashboardFields
  >;
};

export function buildDashboardState({
  data,
  view,
}: BuildDashboardStateInput): DashboardState {
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
    data,
    view:
      buildDashboardViewState({
        ...view,
        coachInsight,
        adaptiveTraits,
        genomeMetrics,
        genomeInsights,
        weeklyReview,
        progression,
        streak,
      }),
  };
}
