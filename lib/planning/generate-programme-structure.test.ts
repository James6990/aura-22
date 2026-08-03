import { generateProgrammeStructure } from "./generate-programme-structure";

const programme =
  generateProgrammeStructure({
    primaryGoal: "muscle",
    experienceLevel: "intermediate",
    trainingDaysPerWeek: 4,
    trainingEnvironment:
      "commercial-gym",
    equipmentInventory: [
      "adjustable-dumbbells",
      "bench",
    ],
    recentConsistency: 72,
    recentRecovery: 80,
  });

if (
  programme.split !== "upper-lower"
) {
  throw new Error(
    "A four-day muscle programme should use an upper/lower structure.",
  );
}

if (programme.sessions.length !== 4) {
  throw new Error(
    "The programme must contain four sessions.",
  );
}

if (
  programme.sessions[0].role !== "upper" ||
  programme.sessions[1].role !== "lower"
) {
  throw new Error(
    "Upper/lower sequencing is incorrect.",
  );
}

const healthProgramme =
  generateProgrammeStructure({
    primaryGoal: "health",
    experienceLevel: "beginner",
    trainingDaysPerWeek: 3,
    trainingEnvironment:
      "bodyweight-only",
    equipmentInventory: [],
  });

if (
  healthProgramme.split !==
  "health-mobility"
) {
  throw new Error(
    "Health goals should use the health and mobility structure.",
  );
}

console.log(
  "Programme Structure Engine test passed.",
);
