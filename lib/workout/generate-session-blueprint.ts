import type { CoachPriority } from "@/lib/companion/generate-coach-decision";
import type {
  ProgrammeSessionRole,
} from "@/lib/planning/generate-programme-structure";
import type {
  TrainingBlockPhase,
} from "@/lib/planning/generate-training-block";
import type {
  MovementPattern,
} from "@/lib/workout/exercise-library";

export type SessionSectionType =
  | "preparation"
  | "primary"
  | "supporting"
  | "conditioning"
  | "mobility"
  | "recovery";

export type SessionBlueprintSection = {
  order: number;
  type: SessionSectionType;
  title: string;
  purpose: string;
  movementPatterns: MovementPattern[];
  exerciseTarget: number;
  optional: boolean;
};

export type SessionBlueprintInput = {
  primaryGoal: string;
  programmeRole: ProgrammeSessionRole;
  blockPhase: TrainingBlockPhase;
  currentPriority: CoachPriority;
  intensity:
    | "Recovery"
    | "Light"
    | "Moderate"
    | "High";
};

export type SessionBlueprint = {
  title: string;
  explanation: string;
  sections: SessionBlueprintSection[];
};

function createSection(
  sections: SessionBlueprintSection[],
  input: Omit<SessionBlueprintSection, "order">,
) {
  sections.push({
    order: sections.length + 1,
    ...input,
  });
}

function getRolePatterns(
  role: ProgrammeSessionRole,
): MovementPattern[] {
  switch (role) {
    case "upper":
      return [
        "horizontal-push",
        "horizontal-pull",
        "vertical-push",
        "vertical-pull",
        "core",
      ];

    case "lower":
    case "legs":
      return [
        "squat",
        "hinge",
        "single-leg",
        "core",
      ];

    case "push":
      return [
        "horizontal-push",
        "vertical-push",
        "core",
      ];

    case "pull":
      return [
        "horizontal-pull",
        "vertical-pull",
        "hinge",
        "core",
      ];

    case "conditioning":
      return [
        "cardio",
        "core",
        "mobility",
      ];

    case "mobility":
    case "recovery":
      return [
        "mobility",
        "cardio",
        "core",
      ];

    case "performance":
      return [
        "squat",
        "hinge",
        "single-leg",
        "horizontal-push",
        "horizontal-pull",
        "core",
      ];

    case "strength":
    case "full-body":
    default:
      return [
        "horizontal-push",
        "horizontal-pull",
        "squat",
        "hinge",
        "core",
      ];
  }
}

export function generateSessionBlueprint({
  primaryGoal,
  programmeRole,
  blockPhase,
  currentPriority,
  intensity,
}: SessionBlueprintInput): SessionBlueprint {
  const sections: SessionBlueprintSection[] = [];
  const rolePatterns =
    getRolePatterns(programmeRole);

  const recoveryFocused =
    currentPriority === "recover" ||
    currentPriority === "hydrate" ||
    currentPriority === "celebrate" ||
    intensity === "Recovery" ||
    blockPhase === "deload";

  if (recoveryFocused) {
    createSection(sections, {
      type: "preparation",
      title: "Gentle preparation",
      purpose:
        "Ease into movement without creating unnecessary fatigue.",
      movementPatterns: [
        "mobility",
        "cardio",
      ],
      exerciseTarget: 1,
      optional: false,
    });

    createSection(sections, {
      type: "mobility",
      title: "Mobility and control",
      purpose:
        "Support comfortable range of motion and movement quality.",
      movementPatterns: [
        "mobility",
        "core",
      ],
      exerciseTarget: 2,
      optional: false,
    });

    createSection(sections, {
      type: "recovery",
      title: "Recovery finish",
      purpose:
        "Finish feeling better than when the session began.",
      movementPatterns: [
        "cardio",
        "mobility",
      ],
      exerciseTarget: 1,
      optional: true,
    });

    return {
      title: "Recovery-focused session",
      explanation:
        "Apex has reduced the session structure because recovery, hydration, recent workload or the current block phase takes priority.",
      sections,
    };
  }

  createSection(sections, {
    type: "preparation",
    title: "Preparation",
    purpose:
      "Prepare the joints, movement patterns and nervous system for the main work.",
    movementPatterns: [
      "mobility",
      "core",
    ],
    exerciseTarget: 1,
    optional: false,
  });

  if (
    currentPriority === "technique" ||
    currentPriority === "collect-data"
  ) {
    createSection(sections, {
      type: "primary",
      title: "Technique focus",
      purpose:
        "Practise controlled, repeatable movement with conservative difficulty.",
      movementPatterns: rolePatterns,
      exerciseTarget: 2,
      optional: false,
    });

    createSection(sections, {
      type: "supporting",
      title: "Supporting movement",
      purpose:
        "Reinforce movement quality without chasing fatigue.",
      movementPatterns: [
        ...rolePatterns,
        "mobility",
      ],
      exerciseTarget: 2,
      optional: true,
    });

    return {
      title: "Technique-focused session",
      explanation:
        "Apex is prioritising movement quality, useful feedback and confident execution over intensity.",
      sections,
    };
  }

  createSection(sections, {
    type: "primary",
    title:
      primaryGoal === "performance"
        ? "Primary performance work"
        : "Primary strength work",
    purpose:
      "Complete the most important goal-specific movements while energy and concentration are highest.",
    movementPatterns: rolePatterns,
    exerciseTarget:
      intensity === "High" ? 3 : 2,
    optional: false,
  });

  createSection(sections, {
    type: "supporting",
    title: "Supporting work",
    purpose:
      "Add balanced training volume and support the primary movements.",
    movementPatterns: rolePatterns,
    exerciseTarget:
      primaryGoal === "muscle" ||
      primaryGoal === "recomposition"
        ? 3
        : 2,
    optional: false,
  });

  if (
    primaryGoal === "fat-loss" ||
    primaryGoal === "performance" ||
    primaryGoal === "health" ||
    programmeRole === "conditioning"
  ) {
    createSection(sections, {
      type: "conditioning",
      title: "Conditioning",
      purpose:
        "Build sustainable work capacity without turning the session into punishment.",
      movementPatterns: [
        "cardio",
        "core",
      ],
      exerciseTarget: 1,
      optional:
        primaryGoal !== "fat-loss",
    });
  }

  createSection(sections, {
    type: "recovery",
    title: "Recovery finish",
    purpose:
      "Bring the session down gradually and support the next training opportunity.",
    movementPatterns: [
      "mobility",
      "cardio",
    ],
    exerciseTarget: 1,
    optional: true,
  });

  return {
    title: `${programmeRole
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1),
      )
      .join(" ")} session blueprint`,
    explanation:
      "Apex has organised the session into preparation, priority work, supporting work and recovery so each exercise has a clear role.",
    sections,
  };
}
