export type WorkoutRecommendationInput = {
  readinessScore: number;
  consistency: number;
  recovery: number;
  trainingCapacity: number;
  primaryGoal: string;
  experienceLevel: string;
  equipment: string[];
};

export type WorkoutRecommendation = {
  intensity: "Recovery" | "Light" | "Moderate" | "High";
  durationMinutes: number;
  focus: string;
  volumeMultiplier: number;
  environment: string;
  explanation: string;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function getTrainingEnvironment(equipment: string[]) {
  if (equipment.includes("full-gym")) {
    return "Full gym";
  }

  if (equipment.includes("home-gym")) {
    return "Home equipment";
  }

  if (equipment.includes("bodyweight")) {
    return "Bodyweight";
  }

  if (equipment.includes("outdoors")) {
    return "Outdoor training";
  }

  return "Flexible equipment";
}

function getGoalFocus(primaryGoal: string) {
  switch (primaryGoal) {
    case "muscle":
      return "Hypertrophy strength";

    case "fat-loss":
      return "Strength and conditioning";

    case "recomposition":
      return "Balanced strength";

    case "performance":
      return "Athletic performance";

    case "health":
      return "Full-body health";

    default:
      return "Full-body training";
  }
}

export function generateWorkoutRecommendation(
  input: WorkoutRecommendationInput,
): WorkoutRecommendation {
  const readiness = clamp(input.readinessScore, 0, 100);
  const recovery = clamp(input.recovery, 0, 100);
  const trainingCapacity = clamp(
    input.trainingCapacity,
    0,
    100,
  );

  let intensity: WorkoutRecommendation["intensity"] =
    "Moderate";
  let durationMinutes = 45;
  let volumeMultiplier = 1;

  if (readiness < 50 || recovery < 45) {
    intensity = "Recovery";
    durationMinutes = 25;
    volumeMultiplier = 0.6;
  } else if (
    readiness < 70 ||
    recovery < 65 ||
    trainingCapacity < 60
  ) {
    intensity = "Light";
    durationMinutes = 35;
    volumeMultiplier = 0.8;
  } else if (
    readiness >= 85 &&
    recovery >= 75 &&
    trainingCapacity >= 75
  ) {
    intensity = "High";
    durationMinutes = 60;
    volumeMultiplier = 1.15;
  }

  if (input.experienceLevel === "beginner") {
    durationMinutes = Math.min(durationMinutes, 45);
    volumeMultiplier = Math.min(volumeMultiplier, 1);
  }

  if (input.consistency < 40) {
    durationMinutes = Math.min(durationMinutes, 35);
    volumeMultiplier = Math.min(volumeMultiplier, 0.85);
  }

  const focus = getGoalFocus(input.primaryGoal);
  const environment = getTrainingEnvironment(
    input.equipment,
  );

  let explanation =
    "A controlled session is recommended based on your current readiness and adaptive traits.";

  if (intensity === "Recovery") {
    explanation =
      "Your recovery signals suggest a lower-load session. Prioritise comfortable movement, mobility and technique.";
  } else if (intensity === "Light") {
    explanation =
      "A lighter session should support progress without creating unnecessary fatigue.";
  } else if (intensity === "High") {
    explanation =
      "Your readiness, recovery and training capacity support a demanding session today.";
  }

  return {
    intensity,
    durationMinutes,
    focus,
    volumeMultiplier,
    environment,
    explanation,
  };
}
