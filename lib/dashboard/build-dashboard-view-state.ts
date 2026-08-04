import type {
  ApexCoachingState,
  ApexCoreResult,
} from "@/lib/apex-core";
import type {
  AdaptivePlan,
} from "@/lib/planning/generate-adaptive-plan";
import type {
  WorkoutRecommendation,
} from "@/lib/workout/generate-workout-recommendation";
import type {
  WorkoutSession,
} from "@/lib/workout/generate-workout-session";
import type {
  generateCoachInsight,
} from "@/lib/coach/generate-coach-insight";
import type {
  calculateAdaptiveTraits,
} from "@/lib/genome/calculate-adaptive-traits";
import type {
  calculateGenomeMetrics,
} from "@/lib/genome/calculate-genome-metrics";
import type {
  generateGenomeInsights,
} from "@/lib/genome/generate-genome-insights";
import type {
  generateWeeklyReview,
} from "@/lib/reviews/generate-weekly-review";
import type {
  calculateProgression,
} from "@/lib/progression/calculate-xp";
import type {
  calculateStreaks,
} from "@/lib/progression/calculate-streaks";

export type DashboardViewState = {
  preferredName: string;
  primaryGoal: string;

  apex: ApexCoreResult;
  coachingState: ApexCoachingState;

  workoutRecommendation:
    WorkoutRecommendation;
  workoutSession: WorkoutSession;
  adaptivePlan: AdaptivePlan;

  coachInsight:
    ReturnType<typeof generateCoachInsight>;

  adaptiveTraits:
    ReturnType<typeof calculateAdaptiveTraits>;

  genomeMetrics:
    ReturnType<typeof calculateGenomeMetrics>;

  genomeInsights:
    ReturnType<typeof generateGenomeInsights>;

  weeklyReview:
    ReturnType<typeof generateWeeklyReview>;

  progression:
    ReturnType<typeof calculateProgression>;

  streak:
    ReturnType<typeof calculateStreaks>;
};

export function buildDashboardViewState(
  state: DashboardViewState,
): DashboardViewState {
  return {
    ...state,
    preferredName:
      state.preferredName.trim() ||
      "Athlete",
    primaryGoal:
      state.primaryGoal.trim() ||
      "Build consistent progress",
  };
}
