import { generateTrainingBlock } from "./generate-training-block";

const block = generateTrainingBlock({
  primaryGoal: "muscle",
  experienceLevel: "intermediate",
  blockLengthWeeks: 8,
  trainingDaysPerWeek: 4,
  currentWeek: 2,
  recentConsistency: 35,
  recentRecovery: 42,
  missedSessions: 1,
});

if (block.weeks.length !== 8) {
  throw new Error(
    "The block must contain eight weeks.",
  );
}

if (
  block.weeks[block.weeks.length - 1]
    .phase !== "deload"
) {
  throw new Error(
    "The final week must be a deload week.",
  );
}

if (
  block.weeks[1].trainingDaysTarget >= 4
) {
  throw new Error(
    "Low consistency and recovery should reduce the current-week target.",
  );
}

if (
  block.weeks[0].phase !== "foundation"
) {
  throw new Error(
    "The first week must begin with a foundation phase.",
  );
}

if (
  !block.weeks.some(
    (week) =>
      week.phase === "progression" &&
      week.progressionAllowed,
  )
) {
  throw new Error(
    "Progression weeks must allow progression.",
  );
}

console.log(
  "Training Block Engine test passed.",
);
