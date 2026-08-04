import { normaliseTrainingSetup } from "./normalise-training-setup";

const repairedGymProfile =
  normaliseTrainingSetup({
    trainingEnvironment: "bodyweight-only",
    equipment: ["full-gym"],
    equipmentInventory: [],
  });

if (
  repairedGymProfile.trainingEnvironment !==
  "commercial-gym"
) {
  throw new Error(
    "Legacy full-gym profiles must be repaired to commercial-gym.",
  );
}

if (
  !repairedGymProfile.equipment.includes(
    "bodyweight",
  )
) {
  throw new Error(
    "Commercial-gym users must retain access to bodyweight exercises.",
  );
}

const noEquipmentProfile =
  normaliseTrainingSetup({
    trainingEnvironment: "bodyweight-only",
    equipment: ["full-gym"],
    equipmentInventory: [],
  });

if (
  noEquipmentProfile.equipment.length === 0
) {
  throw new Error(
    "Every normalised setup must provide a valid exercise environment.",
  );
}

const emptyHomeProfile =
  normaliseTrainingSetup({
    trainingEnvironment: "home-gym",
    equipment: [],
    equipmentInventory: [],
  });

if (
  !emptyHomeProfile.equipmentInventory.includes(
    "none",
  )
) {
  throw new Error(
    "Home profiles without inventory must safely default to no equipment.",
  );
}

console.log(
  "Training Setup Normaliser test passed.",
);
