import {
  analyseExerciseRotation,
  type ExerciseRotationAnalysis,
} from "@/lib/workout/analyse-exercise-rotation";
import {
  analyseRecentTrainingLoad,
  type RecentTrainingLoad,
} from "@/lib/workout/analyse-recent-training-load";
import {
  analyseRecoveryForecast,
  type RecoveryForecast,
} from "@/lib/workout/analyse-recovery-forecast";
import {
  analyseRecoveryStatus,
  type RecoveryIntelligence,
} from "@/lib/workout/analyse-recovery-status";
import type {
  TrainingBlockWeek,
} from "@/lib/planning/generate-training-block";
import type {
  DashboardData,
} from "@/lib/dashboard/get-dashboard";

export type TrainingIntelligenceState = {
  recentTrainingLoad: RecentTrainingLoad;
  exerciseRotation: ExerciseRotationAnalysis;
  recoveryIntelligence: RecoveryIntelligence;
  recoveryForecast: RecoveryForecast;
};

export type BuildTrainingIntelligenceInput = {
  data: DashboardData;
  readinessScore: number;
  adaptiveRecoveryScore: number;
  blockWeek: TrainingBlockWeek;
};

export function buildTrainingIntelligence({
  data,
  readinessScore,
  adaptiveRecoveryScore,
  blockWeek,
}: BuildTrainingIntelligenceInput): TrainingIntelligenceState {
  const recentTrainingLoad =
    analyseRecentTrainingLoad(
      data.recentTrainingPerformances,
    );

  const exerciseRotation =
    analyseExerciseRotation(
      data.recentTrainingPerformances,
    );

  const recoveryIntelligence =
    analyseRecoveryStatus({
      readinessScore,
      adaptiveRecoveryScore,
      recentTrainingLoad,
      exerciseRotation,
    });

  const recoveryForecast =
    analyseRecoveryForecast({
      recoveryIntelligence,
      recentTrainingLoad,
      blockWeek,
    });

  return {
    recentTrainingLoad,
    exerciseRotation,
    recoveryIntelligence,
    recoveryForecast,
  };
}
