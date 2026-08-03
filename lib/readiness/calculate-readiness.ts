export type ReadinessInput = {
  energy: number;
  workout: boolean;
  recovery: boolean;
  water: boolean;
};

export type ReadinessResult = {
  score: number;
  level: "Low" | "Moderate" | "High" | "Peak";
};

export function calculateReadiness(
  input: ReadinessInput,
): ReadinessResult {
  const energy = Math.max(0, Math.min(input.energy, 10));

  let score = energy * 4;

  if (input.workout) score += 25;
  if (input.recovery) score += 20;
  if (input.water) score += 15;

  score = Math.min(100, Math.round(score));

  let level: ReadinessResult["level"];

  if (score >= 90) {
    level = "Peak";
  } else if (score >= 75) {
    level = "High";
  } else if (score >= 50) {
    level = "Moderate";
  } else {
    level = "Low";
  }

  return {
    score,
    level,
  };
}
