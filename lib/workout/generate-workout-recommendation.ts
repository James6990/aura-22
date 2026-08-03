import type { CoachPriority } from "@/lib/companion/generate-coach-decision";

export type WorkoutRecommendationInput = {
  readinessScore: number;
  consistency: number;
  recovery: number;
  trainingCapacity: number;
  primaryGoal: string;
  experienceLevel: string;
  equipment: string[];

  /*
   * When supplied, this becomes the authoritative
   * Apex Core priority. The numerical signals still
   * help shape the session within that priority.
   */
  decisionPriority?: CoachPriority;
};

export type WorkoutRecommendation = {
  intensity:
    | "Recovery"
    | "Light"
    | "Moderate"
    | "High";
  durationMinutes: number;
  focus: string;
  volumeMultiplier: number;
  environment: string;
  explanation: string;
  decisionPriority: CoachPriority | null;
};

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

function getTrainingEnvironment(
  equipment: string[],
) {
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

function getSignalBasedRecommendation({
  readiness,
  recovery,
  trainingCapacity,
}: {
  readiness: number;
  recovery: number;
  trainingCapacity: number;
}) {
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

  return {
    intensity,
    durationMinutes,
    volumeMultiplier,
  };
}

function applyApexPriority({
  priority,
  signalIntensity,
  signalDuration,
  signalVolume,
  goalFocus,
}: {
  priority: CoachPriority;
  signalIntensity:
    WorkoutRecommendation["intensity"];
  signalDuration: number;
  signalVolume: number;
  goalFocus: string;
}) {
  switch (priority) {
    case "recover":
      return {
        intensity: "Recovery" as const,
        durationMinutes: Math.min(
          signalDuration,
          25,
        ),
        volumeMultiplier: Math.min(
          signalVolume,
          0.6,
        ),
        focus: "Recovery and mobility",
        explanation:
          "Apex Core has prioritised recovery today. This session should use comfortable movement, low fatigue and no pressure to train intensely.",
      };

    case "technique":
      return {
        intensity: "Light" as const,
        durationMinutes: Math.min(
          signalDuration,
          35,
        ),
        volumeMultiplier: Math.min(
          signalVolume,
          0.75,
        ),
        focus: "Technique and movement quality",
        explanation:
          "Apex Core has prioritised comfort and technique. Use controlled repetitions, conservative loads and suitable substitutions.",
      };

    case "build-consistency":
      return {
        intensity: "Light" as const,
        durationMinutes: Math.min(
          signalDuration,
          30,
        ),
        volumeMultiplier: Math.min(
          signalVolume,
          0.75,
        ),
        focus: "An achievable full-body session",
        explanation:
          "Apex Core has prioritised consistency. The goal is to complete a manageable session and leave enough capacity to return again.",
      };

    case "hydrate":
      return {
        intensity:
          signalIntensity === "High"
            ? ("Moderate" as const)
            : signalIntensity,
        durationMinutes: Math.min(
          signalDuration,
          45,
        ),
        volumeMultiplier: Math.min(
          signalVolume,
          1,
        ),
        focus: goalFocus,
        explanation:
          "Hydration is Apex Core’s leading priority. Address hydration before training and keep today’s session controlled.",
      };

    case "collect-data":
      return {
        intensity:
          signalIntensity === "High"
            ? ("Moderate" as const)
            : signalIntensity,
        durationMinutes: Math.min(
          signalDuration,
          40,
        ),
        volumeMultiplier: Math.min(
          signalVolume,
          0.9,
        ),
        focus: "Controlled baseline training",
        explanation:
          "Apex is still learning your patterns. This controlled session will provide useful information without creating unnecessary fatigue.",
      };

    case "celebrate":
      return {
        intensity:
          signalIntensity === "Recovery"
            ? ("Recovery" as const)
            : ("Light" as const),
        durationMinutes: Math.min(
          signalDuration,
          35,
        ),
        volumeMultiplier: Math.min(
          signalVolume,
          0.8,
        ),
        focus: "Recognise progress and recover",
        explanation:
          "Apex Core is recognising recently completed work. There is no need to force another demanding session before recovery is complete.",
      };

    case "train":
    default:
      return {
        intensity: signalIntensity,
        durationMinutes: signalDuration,
        volumeMultiplier: signalVolume,
        focus: goalFocus,
        explanation:
          signalIntensity === "High"
            ? "Apex Core supports training today, and your readiness, recovery and capacity support a demanding session."
            : signalIntensity === "Light"
              ? "Apex Core supports training, while your current signals favour a lighter and controlled session."
              : signalIntensity === "Recovery"
                ? "Apex supports movement today, but your current signals require a recovery-focused session."
                : "Apex Core supports a controlled, productive session based on your current readiness and adaptive traits.",
      };
  }
}

export function generateWorkoutRecommendation(
  input: WorkoutRecommendationInput,
): WorkoutRecommendation {
  const readiness = clamp(
    input.readinessScore,
    0,
    100,
  );

  const recovery = clamp(
    input.recovery,
    0,
    100,
  );

  const trainingCapacity = clamp(
    input.trainingCapacity,
    0,
    100,
  );

  const signalRecommendation =
    getSignalBasedRecommendation({
      readiness,
      recovery,
      trainingCapacity,
    });

  const goalFocus = getGoalFocus(
    input.primaryGoal,
  );

  const priorityRecommendation =
    input.decisionPriority
      ? applyApexPriority({
          priority: input.decisionPriority,
          signalIntensity:
            signalRecommendation.intensity,
          signalDuration:
            signalRecommendation.durationMinutes,
          signalVolume:
            signalRecommendation.volumeMultiplier,
          goalFocus,
        })
      : {
          ...signalRecommendation,
          focus: goalFocus,
          explanation:
            signalRecommendation.intensity ===
            "Recovery"
              ? "Your recovery signals suggest a lower-load session. Prioritise comfortable movement, mobility and technique."
              : signalRecommendation.intensity ===
                  "Light"
                ? "A lighter session should support progress without creating unnecessary fatigue."
                : signalRecommendation.intensity ===
                    "High"
                  ? "Your readiness, recovery and training capacity support a demanding session today."
                  : "A controlled session is recommended based on your current readiness and adaptive traits.",
        };

  let durationMinutes =
    priorityRecommendation.durationMinutes;

  let volumeMultiplier =
    priorityRecommendation.volumeMultiplier;

  if (input.experienceLevel === "beginner") {
    durationMinutes = Math.min(
      durationMinutes,
      45,
    );

    volumeMultiplier = Math.min(
      volumeMultiplier,
      1,
    );
  }

  if (input.consistency < 40) {
    durationMinutes = Math.min(
      durationMinutes,
      35,
    );

    volumeMultiplier = Math.min(
      volumeMultiplier,
      0.85,
    );
  }

  return {
    intensity:
      priorityRecommendation.intensity,
    durationMinutes,
    focus: priorityRecommendation.focus,
    volumeMultiplier,
    environment: getTrainingEnvironment(
      input.equipment,
    ),
    explanation:
      priorityRecommendation.explanation,
    decisionPriority:
      input.decisionPriority ?? null,
  };
}
