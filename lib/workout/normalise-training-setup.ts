import type {
  EquipmentInventoryItem,
  TrainingEnvironment,
} from "@/lib/workout/equipment-capabilities";
import type { ExerciseEquipment } from "@/lib/workout/exercise-library";

export type NormalisedTrainingSetup = {
  trainingEnvironment: TrainingEnvironment;
  equipment: ExerciseEquipment[];
  equipmentInventory: EquipmentInventoryItem[];
  repaired: boolean;
  repairReasons: string[];
};

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

export function normaliseTrainingSetup({
  trainingEnvironment,
  equipment,
  equipmentInventory,
}: {
  trainingEnvironment: string | null | undefined;
  equipment: string[] | null | undefined;
  equipmentInventory: string[] | null | undefined;
}): NormalisedTrainingSetup {
  const repairReasons: string[] = [];

  const validEnvironments: TrainingEnvironment[] = [
    "commercial-gym",
    "home-gym",
    "outdoors",
    "bodyweight-only",
    "mixed",
  ];

  const validInventory: EquipmentInventoryItem[] = [
    "adjustable-dumbbells",
    "fixed-dumbbells",
    "barbell",
    "bench",
    "squat-rack",
    "pull-up-bar",
    "kettlebells",
    "resistance-bands",
    "cable-machine",
    "exercise-bike",
    "treadmill",
    "rowing-machine",
    "yoga-mat",
    "none",
  ];

  const suppliedEquipment =
    equipment ?? [];

  const suppliedInventory =
    (equipmentInventory ?? []).filter(
      (item): item is EquipmentInventoryItem =>
        validInventory.includes(
          item as EquipmentInventoryItem,
        ),
    );

  let environment: TrainingEnvironment =
    validEnvironments.includes(
      trainingEnvironment as TrainingEnvironment,
    )
      ? (trainingEnvironment as TrainingEnvironment)
      : "bodyweight-only";

  /*
   * Repair older profiles where the broad equipment
   * value is trustworthy but the new environment field
   * still contains its migration default.
   */
  if (
    environment === "bodyweight-only" &&
    suppliedEquipment.includes("full-gym")
  ) {
    environment = "commercial-gym";
    repairReasons.push(
      "Commercial-gym access was recovered from the existing equipment profile.",
    );
  } else if (
    environment === "bodyweight-only" &&
    suppliedEquipment.includes("home-gym")
  ) {
    environment = "home-gym";
    repairReasons.push(
      "Home-gym access was recovered from the existing equipment profile.",
    );
  } else if (
    environment === "bodyweight-only" &&
    suppliedEquipment.includes("outdoors")
  ) {
    environment = "outdoors";
    repairReasons.push(
      "Outdoor training was recovered from the existing equipment profile.",
    );
  }

  let normalisedEquipment: ExerciseEquipment[];

  switch (environment) {
    case "commercial-gym":
      /*
       * Bodyweight movements remain available inside
       * a commercial gym.
       */
      normalisedEquipment = [
        "full-gym",
        "bodyweight",
      ];
      break;

    case "home-gym":
      normalisedEquipment =
        suppliedInventory.includes("none")
          ? ["bodyweight"]
          : ["home-gym", "bodyweight"];
      break;

    case "outdoors":
      normalisedEquipment = [
        "outdoors",
        "bodyweight",
      ];
      break;

    case "mixed":
      normalisedEquipment = [
        "full-gym",
        "home-gym",
        "outdoors",
        "bodyweight",
      ];
      break;

    case "bodyweight-only":
    default:
      normalisedEquipment = ["bodyweight"];
      break;
  }

  const inventory =
    environment === "home-gym" ||
    environment === "mixed"
      ? suppliedInventory
      : [];

  if (
    environment === "home-gym" &&
    inventory.length === 0
  ) {
    inventory.push("none");
    repairReasons.push(
      "Home training was safely defaulted to no equipment because no inventory was recorded.",
    );
  }

  const originalEquipment = unique(
    suppliedEquipment,
  ).sort();

  const finalEquipment = unique(
    normalisedEquipment,
  ).sort();

  const repaired =
    repairReasons.length > 0 ||
    originalEquipment.join("|") !==
      finalEquipment.join("|") ||
    trainingEnvironment !== environment ||
    suppliedInventory.length !==
      (equipmentInventory ?? []).length;

  return {
    trainingEnvironment: environment,
    equipment: finalEquipment,
    equipmentInventory: unique(inventory),
    repaired,
    repairReasons,
  };
}
