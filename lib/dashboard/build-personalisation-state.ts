import {
  analyseExercisePreferences,
  type ExercisePersonalisationProfile,
} from "@/lib/personalisation/analyse-exercise-preferences";
import {
  analyseRecoveryBehaviour,
  type RecoveryBehaviourProfile,
} from "@/lib/personalisation/analyse-recovery-behaviour";
import {
  analyseTrainingBehaviour,
  type TrainingBehaviourProfile,
} from "@/lib/personalisation/analyse-training-behaviour";
import type {
  DashboardData,
} from "@/lib/dashboard/get-dashboard";

export type PersonalisationState = {
  exercise: ExercisePersonalisationProfile;
  training: TrainingBehaviourProfile;
  recovery: RecoveryBehaviourProfile;
};

export function buildPersonalisationState(
  data: DashboardData,
): PersonalisationState {
  return {
    exercise:
      analyseExercisePreferences({
        recentPerformances:
          data.recentTrainingPerformances,
        progressionHistory:
          data.exerciseProgressionHistory,
      }),

    training:
      analyseTrainingBehaviour({
        workouts:
          data.recentWorkouts,
      }),

    recovery:
      analyseRecoveryBehaviour(
        data.readinessHistory,
      ),
  };
}
