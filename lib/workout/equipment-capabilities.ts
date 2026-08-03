export type TrainingEnvironment =
  | "commercial-gym"
  | "home-gym"
  | "outdoors"
  | "bodyweight-only"
  | "mixed";

export type EquipmentInventoryItem =
  | "adjustable-dumbbells"
  | "fixed-dumbbells"
  | "barbell"
  | "bench"
  | "squat-rack"
  | "pull-up-bar"
  | "kettlebells"
  | "resistance-bands"
  | "cable-machine"
  | "exercise-bike"
  | "treadmill"
  | "rowing-machine"
  | "yoga-mat"
  | "none";

type ExerciseEquipmentRequirement = {
  allOf?: EquipmentInventoryItem[];
  anyOf?: EquipmentInventoryItem[];
};

const dumbbellOptions: EquipmentInventoryItem[] = [
  "adjustable-dumbbells",
  "fixed-dumbbells",
];

export const exerciseEquipmentRequirements: Record<
  string,
  ExerciseEquipmentRequirement
> = {
  "machine-chest-press": {
    allOf: ["cable-machine"],
  },

  "dumbbell-bench-press": {
    allOf: ["bench"],
    anyOf: dumbbellOptions,
  },

  "incline-push-up": {},
  "wall-push-up": {},

  "resistance-band-chest-press": {
    allOf: ["resistance-bands"],
  },

  "seated-cable-row": {
    allOf: ["cable-machine"],
  },

  "one-arm-dumbbell-row": {
    anyOf: dumbbellOptions,
  },

  "resistance-band-row": {
    allOf: ["resistance-bands"],
  },

  "seated-dumbbell-shoulder-press": {
    anyOf: dumbbellOptions,
  },

  "machine-shoulder-press": {
    allOf: ["cable-machine"],
  },

  "lat-pulldown": {
    allOf: ["cable-machine"],
  },

  "leg-press": {
    allOf: ["cable-machine"],
  },

  "goblet-squat": {
    anyOf: [
      ...dumbbellOptions,
      "kettlebells",
    ],
  },

  "sit-to-stand": {},

  "dumbbell-romanian-deadlift": {
    anyOf: dumbbellOptions,
  },

  "glute-bridge": {},
  "dead-bug": {},
  "seated-knee-lift": {},
  "brisk-walk": {},
  "seated-march": {},
};

function hasRequirement(
  inventory: Set<EquipmentInventoryItem>,
  requirement: ExerciseEquipmentRequirement,
) {
  const hasAllRequired =
    requirement.allOf?.every((item) =>
      inventory.has(item),
    ) ?? true;

  const hasOneAlternative =
    requirement.anyOf?.some((item) =>
      inventory.has(item),
    ) ?? true;

  return hasAllRequired && hasOneAlternative;
}

export function canUseExerciseEquipment({
  exerciseId,
  trainingEnvironment,
  equipmentInventory,
}: {
  exerciseId: string;
  trainingEnvironment: TrainingEnvironment;
  equipmentInventory: EquipmentInventoryItem[];
}) {
  /*
   * Commercial-gym users are initially assumed to
   * have access to common gym equipment.
   */
  if (
    trainingEnvironment === "commercial-gym" ||
    trainingEnvironment === "mixed"
  ) {
    return true;
  }

  const requirement =
    exerciseEquipmentRequirements[exerciseId];

  /*
   * Unknown exercises are not blocked yet. As the
   * exercise library grows, new entries should be
   * deliberately added to the capability map.
   */
  if (!requirement) {
    return true;
  }

  const inventory = new Set(equipmentInventory);

  if (
    trainingEnvironment === "bodyweight-only" ||
    inventory.has("none")
  ) {
    return (
      !requirement.allOf?.length &&
      !requirement.anyOf?.length
    );
  }

  if (trainingEnvironment === "outdoors") {
    return (
      !requirement.allOf?.length &&
      !requirement.anyOf?.length
    );
  }

  return hasRequirement(
    inventory,
    requirement,
  );
}
