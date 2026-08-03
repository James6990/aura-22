import type { GenomeTraits } from "@/lib/genome/calculate-adaptive-traits";
import type { LatestWorkoutSummary } from "@/lib/workout/get-latest-workout-summary";

import {
  generateCompanionBrief,
  type CompanionBrief,
  type CompanionMemory,
} from "@/lib/companion/generate-companion-brief";

import {
  generateDailyBriefing,
  type DailyBriefing,
} from "@/lib/companion/generate-daily-briefing";

import {
  getApexState,
  type ApexState,
} from "@/lib/apex-core/get-apex-state";

import {
  generateDecision,
  type ApexDecision,
} from "@/lib/apex-core/generate-decision";

export type GenerateApexCoreInput = {
  preferredName: string;
  readinessScore: number;
  traits: GenomeTraits;
  currentStreak: number;
  latestWorkout: LatestWorkoutSummary | null;
  recentMemories?: CompanionMemory[];
};

export type ApexCoreResult = {
  state: ApexState;
  decision: ApexDecision;
  companion: CompanionBrief;
  dailyBriefing: DailyBriefing;
};

export function generateApexCore({
  preferredName,
  readinessScore,
  traits,
  currentStreak,
  latestWorkout,
  recentMemories = [],
}: GenerateApexCoreInput): ApexCoreResult {
  const companion = generateCompanionBrief({
    preferredName,
    readinessScore,
    traits,
    currentStreak,
    latestWorkout,
    recentMemories,
  });

  const decision = generateDecision({
    readinessScore,
    currentStreak,
    recovery: traits.recovery,
    consistency: traits.consistency,
    coachDecision: companion.decision,
  });

  const state = getApexState({
    readinessScore,
    traits,
    currentStreak,
    latestWorkout,
    coachDecision: companion.decision,
  });

  const dailyBriefing =
    generateDailyBriefing(companion);

  const priorities = new Set([
    state.todayPriority,
    decision.priority,
    companion.decision.priority,
  ]);

  if (priorities.size !== 1) {
    throw new Error(
      "Apex Core produced conflicting priorities.",
    );
  }

  return {
    state,
    decision,
    companion,
    dailyBriefing,
  };
}
