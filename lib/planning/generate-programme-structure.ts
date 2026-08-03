import type { SupportedTrainingGoal } from "@/lib/workout/training-goal-profile";

export type ProgrammeSplit =
  | "full-body"
  | "upper-lower"
  | "push-pull-legs"
  | "strength-conditioning"
  | "performance"
  | "health-mobility";

export type ProgrammeSessionRole =
  | "full-body"
  | "upper"
  | "lower"
  | "push"
  | "pull"
  | "legs"
  | "strength"
  | "conditioning"
  | "performance"
  | "mobility"
  | "recovery";

export type ProgrammeStructureInput = {
  primaryGoal: string;
  experienceLevel: string;
  trainingDaysPerWeek: number;
  trainingEnvironment: string;
  equipmentInventory: string[];

  accessibilityNeeds?: string[];
  movementConstraints?: string[];

  recentConsistency?: number;
  recentRecovery?: number;
};

export type ProgrammeSession = {
  order: number;
  role: ProgrammeSessionRole;
  title: string;
  purpose: string;
  optional: boolean;
};

export type ProgrammeStructure = {
  goal: SupportedTrainingGoal;
  split: ProgrammeSplit;
  title: string;
  explanation: string;
  sessions: ProgrammeSession[];
  confidence: {
    score: number;
    label: "Learning" | "Moderate" | "Strong" | "High";
    reasons: string[];
  };
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

function normaliseGoal(
  goal: string,
): SupportedTrainingGoal {
  if (
    goal === "muscle" ||
    goal === "fat-loss" ||
    goal === "recomposition" ||
    goal === "performance" ||
    goal === "health"
  ) {
    return goal;
  }

  return "health";
}

function chooseSplit({
  goal,
  experienceLevel,
  trainingDays,
}: {
  goal: SupportedTrainingGoal;
  experienceLevel: string;
  trainingDays: number;
}): ProgrammeSplit {
  if (goal === "performance") {
    return "performance";
  }

  if (goal === "health") {
    return "health-mobility";
  }

  if (goal === "fat-loss") {
    return trainingDays <= 3
      ? "full-body"
      : "strength-conditioning";
  }

  if (trainingDays <= 3) {
    return "full-body";
  }

  if (
    trainingDays === 4 ||
    experienceLevel === "beginner"
  ) {
    return "upper-lower";
  }

  return "push-pull-legs";
}

function createSessions(
  split: ProgrammeSplit,
  trainingDays: number,
): ProgrammeSession[] {
  const sessions: ProgrammeSession[] = [];

  function add(
    role: ProgrammeSessionRole,
    title: string,
    purpose: string,
    optional = false,
  ) {
    sessions.push({
      order: sessions.length + 1,
      role,
      title,
      purpose,
      optional,
    });
  }

  if (split === "full-body") {
    for (
      let index = 0;
      index < trainingDays;
      index += 1
    ) {
      add(
        "full-body",
        `Full Body ${String.fromCharCode(
          65 + index,
        )}`,
        "Train the major movement patterns with balanced, manageable volume.",
      );
    }

    return sessions;
  }

  if (split === "upper-lower") {
    const pattern = [
      {
        role: "upper" as const,
        title: "Upper Body A",
      },
      {
        role: "lower" as const,
        title: "Lower Body A",
      },
      {
        role: "upper" as const,
        title: "Upper Body B",
      },
      {
        role: "lower" as const,
        title: "Lower Body B",
      },
    ];

    for (
      let index = 0;
      index < trainingDays;
      index += 1
    ) {
      const session =
        pattern[index % pattern.length];

      add(
        session.role,
        session.title,
        "Build balanced strength while giving major muscle groups recovery between sessions.",
      );
    }

    return sessions;
  }

  if (split === "push-pull-legs") {
    const pattern = [
      {
        role: "push" as const,
        title: "Push",
      },
      {
        role: "pull" as const,
        title: "Pull",
      },
      {
        role: "legs" as const,
        title: "Legs",
      },
    ];

    for (
      let index = 0;
      index < trainingDays;
      index += 1
    ) {
      const session =
        pattern[index % pattern.length];

      add(
        session.role,
        session.title,
        "Use focused volume while spacing repeated muscle-group demands.",
      );
    }

    return sessions;
  }

  if (split === "strength-conditioning") {
    const pattern = [
      {
        role: "strength" as const,
        title: "Full-Body Strength",
        purpose:
          "Use resistance training to support strength and muscle retention.",
      },
      {
        role: "conditioning" as const,
        title: "Conditioning",
        purpose:
          "Build sustainable cardiovascular work without punishment-based intensity.",
      },
    ];

    for (
      let index = 0;
      index < trainingDays;
      index += 1
    ) {
      const session =
        pattern[index % pattern.length];

      add(
        session.role,
        session.title,
        session.purpose,
      );
    }

    return sessions;
  }

  if (split === "performance") {
    const pattern = [
      {
        role: "performance" as const,
        title: "Strength and Power",
        purpose:
          "Develop high-quality force production with suitable recovery.",
      },
      {
        role: "conditioning" as const,
        title: "Athletic Conditioning",
        purpose:
          "Develop stamina and work capacity relevant to performance.",
      },
      {
        role: "mobility" as const,
        title: "Movement Quality",
        purpose:
          "Support mobility, control and durable athletic movement.",
      },
    ];

    for (
      let index = 0;
      index < trainingDays;
      index += 1
    ) {
      const session =
        pattern[index % pattern.length];

      add(
        session.role,
        session.title,
        session.purpose,
      );
    }

    return sessions;
  }

  const healthPattern = [
    {
      role: "full-body" as const,
      title: "Full-Body Strength",
      purpose:
        "Support everyday strength with manageable full-body work.",
    },
    {
      role: "conditioning" as const,
      title: "Cardiovascular Health",
      purpose:
        "Build sustainable aerobic fitness using accessible movement.",
    },
    {
      role: "mobility" as const,
      title: "Mobility and Balance",
      purpose:
        "Support movement quality, confidence and long-term independence.",
    },
  ];

  for (
    let index = 0;
    index < trainingDays;
    index += 1
  ) {
    const session =
      healthPattern[index % healthPattern.length];

    add(
      session.role,
      session.title,
      session.purpose,
    );
  }

  return sessions;
}

function calculateConfidence({
  trainingDays,
  equipmentInventory,
  accessibilityNeeds,
  movementConstraints,
  recentConsistency,
  recentRecovery,
}: {
  trainingDays: number;
  equipmentInventory: string[];
  accessibilityNeeds: string[];
  movementConstraints: string[];
  recentConsistency: number;
  recentRecovery: number;
}) {
  const reasons: string[] = [];

  let score = 35;

  if (trainingDays >= 1) {
    score += 15;
    reasons.push(
      "A weekly training-day target is available.",
    );
  }

  if (equipmentInventory.length > 0) {
    score += 12;
    reasons.push(
      "Available equipment can shape the programme.",
    );
  }

  if (
    accessibilityNeeds.length > 0 ||
    movementConstraints.length > 0
  ) {
    score += 8;
    reasons.push(
      "Accessibility or movement information is available.",
    );
  }

  if (recentConsistency > 0) {
    score += 12;
    reasons.push(
      "Recent consistency helps Apex choose a realistic structure.",
    );
  }

  if (recentRecovery > 0) {
    score += 12;
    reasons.push(
      "Recovery history helps Apex control weekly demand.",
    );
  }

  const finalScore = clamp(score, 0, 100);

  return {
    score: finalScore,
    label:
      finalScore >= 85
        ? ("High" as const)
        : finalScore >= 70
          ? ("Strong" as const)
          : finalScore >= 50
            ? ("Moderate" as const)
            : ("Learning" as const),
    reasons,
  };
}

export function generateProgrammeStructure(
  input: ProgrammeStructureInput,
): ProgrammeStructure {
  const goal = normaliseGoal(
    input.primaryGoal,
  );

  const trainingDays = clamp(
    input.trainingDaysPerWeek,
    1,
    input.experienceLevel === "beginner"
      ? 4
      : 6,
  );

  const split = chooseSplit({
    goal,
    experienceLevel:
      input.experienceLevel,
    trainingDays,
  });

  const titleMap: Record<
    ProgrammeSplit,
    string
  > = {
    "full-body": "Full-Body Programme",
    "upper-lower": "Upper / Lower Programme",
    "push-pull-legs":
      "Push / Pull / Legs Programme",
    "strength-conditioning":
      "Strength and Conditioning Programme",
    performance:
      "Athletic Performance Programme",
    "health-mobility":
      "Health, Strength and Mobility Programme",
  };

  return {
    goal,
    split,
    title: titleMap[split],
    explanation:
      "Apex selected this structure from the user’s goal, experience and realistic weekly availability. Daily readiness and recovery can still modify individual sessions.",
    sessions: createSessions(
      split,
      trainingDays,
    ),
    confidence: calculateConfidence({
      trainingDays,
      equipmentInventory:
        input.equipmentInventory,
      accessibilityNeeds:
        input.accessibilityNeeds ?? [],
      movementConstraints:
        input.movementConstraints ?? [],
      recentConsistency:
        input.recentConsistency ?? 0,
      recentRecovery:
        input.recentRecovery ?? 0,
    }),
  };
}
