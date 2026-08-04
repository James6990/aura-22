import { generateSessionBlueprint } from "./generate-session-blueprint";

const strengthBlueprint =
  generateSessionBlueprint({
    primaryGoal: "muscle",
    programmeRole: "upper",
    blockPhase: "progression",
    currentPriority: "train",
    intensity: "High",
  });

if (
  !strengthBlueprint.sections.some(
    (section) =>
      section.type === "primary",
  )
) {
  throw new Error(
    "A training blueprint must contain a primary section.",
  );
}

if (
  !strengthBlueprint.sections.some(
    (section) =>
      section.type === "supporting",
  )
) {
  throw new Error(
    "A muscle-building blueprint must contain supporting work.",
  );
}

const recoveryBlueprint =
  generateSessionBlueprint({
    primaryGoal: "performance",
    programmeRole: "performance",
    blockPhase: "deload",
    currentPriority: "recover",
    intensity: "Recovery",
  });

if (
  recoveryBlueprint.sections.some(
    (section) =>
      section.type === "primary",
  )
) {
  throw new Error(
    "A recovery blueprint must not contain demanding primary work.",
  );
}

if (
  recoveryBlueprint.sections[0].type !==
  "preparation"
) {
  throw new Error(
    "Recovery sessions must begin with preparation.",
  );
}

console.log(
  "Session Blueprint Engine test passed.",
);
