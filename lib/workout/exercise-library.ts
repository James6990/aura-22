export type MovementPattern =
  | "horizontal-push"
  | "horizontal-pull"
  | "vertical-push"
  | "vertical-pull"
  | "squat"
  | "hinge"
  | "single-leg"
  | "core"
  | "cardio"
  | "mobility";

export type ExerciseEquipment =
  | "full-gym"
  | "home-gym"
  | "bodyweight"
  | "outdoors";

export type ExerciseAccessibility =
  | "standing"
  | "seated"
  | "wheelchair-friendly"
  | "low-impact"
  | "limited-balance"
  | "one-handed-adaptable";

export type ExerciseDifficulty =
  | "beginner"
  | "intermediate"
  | "advanced";

export type ExerciseDefinition = {
  id: string;
  name: string;
  movementPattern: MovementPattern;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: ExerciseEquipment[];
  accessibility: ExerciseAccessibility[];
  difficulty: ExerciseDifficulty;
  fatigueScore: number;
  estimatedSecondsPerSet: number;
  substitutions: string[];
};

export const exerciseLibrary: ExerciseDefinition[] = [
  {
    id: "machine-chest-press",
    name: "Machine Chest Press",
    movementPattern: "horizontal-push",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front-deltoids"],
    equipment: ["full-gym"],
    accessibility: [
      "seated",
      "wheelchair-friendly",
      "limited-balance",
      "one-handed-adaptable",
    ],
    difficulty: "beginner",
    fatigueScore: 4,
    estimatedSecondsPerSet: 45,
    substitutions: [
      "dumbbell-bench-press",
      "incline-push-up",
      "resistance-band-chest-press",
    ],
  },
  {
    id: "dumbbell-bench-press",
    name: "Dumbbell Bench Press",
    movementPattern: "horizontal-push",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front-deltoids"],
    equipment: ["full-gym", "home-gym"],
    accessibility: ["limited-balance", "one-handed-adaptable"],
    difficulty: "intermediate",
    fatigueScore: 6,
    estimatedSecondsPerSet: 55,
    substitutions: [
      "machine-chest-press",
      "incline-push-up",
      "resistance-band-chest-press",
    ],
  },
  {
    id: "incline-push-up",
    name: "Incline Push-Up",
    movementPattern: "horizontal-push",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front-deltoids"],
    equipment: ["bodyweight", "home-gym"],
    accessibility: ["standing", "low-impact"],
    difficulty: "beginner",
    fatigueScore: 3,
    estimatedSecondsPerSet: 40,
    substitutions: [
      "machine-chest-press",
      "wall-push-up",
      "resistance-band-chest-press",
    ],
  },
  {
    id: "wall-push-up",
    name: "Wall Push-Up",
    movementPattern: "horizontal-push",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front-deltoids"],
    equipment: ["bodyweight"],
    accessibility: [
      "standing",
      "low-impact",
      "limited-balance",
    ],
    difficulty: "beginner",
    fatigueScore: 2,
    estimatedSecondsPerSet: 35,
    substitutions: [
      "incline-push-up",
      "resistance-band-chest-press",
    ],
  },
  {
    id: "resistance-band-chest-press",
    name: "Resistance Band Chest Press",
    movementPattern: "horizontal-push",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["triceps", "front-deltoids"],
    equipment: ["home-gym"],
    accessibility: [
      "standing",
      "seated",
      "wheelchair-friendly",
      "one-handed-adaptable",
    ],
    difficulty: "beginner",
    fatigueScore: 3,
    estimatedSecondsPerSet: 40,
    substitutions: [
      "machine-chest-press",
      "incline-push-up",
    ],
  },
  {
    id: "seated-cable-row",
    name: "Seated Cable Row",
    movementPattern: "horizontal-pull",
    primaryMuscles: ["upper-back", "lats"],
    secondaryMuscles: ["biceps", "rear-deltoids"],
    equipment: ["full-gym"],
    accessibility: [
      "seated",
      "wheelchair-friendly",
      "limited-balance",
      "one-handed-adaptable",
    ],
    difficulty: "beginner",
    fatigueScore: 4,
    estimatedSecondsPerSet: 45,
    substitutions: [
      "one-arm-dumbbell-row",
      "resistance-band-row",
    ],
  },
  {
    id: "one-arm-dumbbell-row",
    name: "One-Arm Dumbbell Row",
    movementPattern: "horizontal-pull",
    primaryMuscles: ["upper-back", "lats"],
    secondaryMuscles: ["biceps", "rear-deltoids"],
    equipment: ["full-gym", "home-gym"],
    accessibility: ["limited-balance", "one-handed-adaptable"],
    difficulty: "intermediate",
    fatigueScore: 5,
    estimatedSecondsPerSet: 55,
    substitutions: [
      "seated-cable-row",
      "resistance-band-row",
    ],
  },
  {
    id: "resistance-band-row",
    name: "Resistance Band Row",
    movementPattern: "horizontal-pull",
    primaryMuscles: ["upper-back", "lats"],
    secondaryMuscles: ["biceps", "rear-deltoids"],
    equipment: ["home-gym"],
    accessibility: [
      "standing",
      "seated",
      "wheelchair-friendly",
      "one-handed-adaptable",
    ],
    difficulty: "beginner",
    fatigueScore: 3,
    estimatedSecondsPerSet: 40,
    substitutions: [
      "seated-cable-row",
      "one-arm-dumbbell-row",
    ],
  },
  {
    id: "seated-dumbbell-shoulder-press",
    name: "Seated Dumbbell Shoulder Press",
    movementPattern: "vertical-push",
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["triceps"],
    equipment: ["full-gym", "home-gym"],
    accessibility: [
      "seated",
      "limited-balance",
      "one-handed-adaptable",
    ],
    difficulty: "intermediate",
    fatigueScore: 5,
    estimatedSecondsPerSet: 50,
    substitutions: [
      "machine-shoulder-press",
      "resistance-band-overhead-press",
    ],
  },
  {
    id: "machine-shoulder-press",
    name: "Machine Shoulder Press",
    movementPattern: "vertical-push",
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["triceps"],
    equipment: ["full-gym"],
    accessibility: [
      "seated",
      "wheelchair-friendly",
      "limited-balance",
      "one-handed-adaptable",
    ],
    difficulty: "beginner",
    fatigueScore: 4,
    estimatedSecondsPerSet: 45,
    substitutions: [
      "seated-dumbbell-shoulder-press",
      "resistance-band-overhead-press",
    ],
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    movementPattern: "vertical-pull",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "upper-back"],
    equipment: ["full-gym"],
    accessibility: [
      "seated",
      "wheelchair-friendly",
      "limited-balance",
      "one-handed-adaptable",
    ],
    difficulty: "beginner",
    fatigueScore: 4,
    estimatedSecondsPerSet: 45,
    substitutions: [
      "assisted-pull-up",
      "resistance-band-pulldown",
    ],
  },
  {
    id: "leg-press",
    name: "Leg Press",
    movementPattern: "squat",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings"],
    equipment: ["full-gym"],
    accessibility: ["seated", "limited-balance", "low-impact"],
    difficulty: "beginner",
    fatigueScore: 6,
    estimatedSecondsPerSet: 60,
    substitutions: [
      "goblet-squat",
      "sit-to-stand",
    ],
  },
  {
    id: "goblet-squat",
    name: "Goblet Squat",
    movementPattern: "squat",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    equipment: ["full-gym", "home-gym"],
    accessibility: ["standing"],
    difficulty: "beginner",
    fatigueScore: 6,
    estimatedSecondsPerSet: 55,
    substitutions: [
      "leg-press",
      "sit-to-stand",
    ],
  },
  {
    id: "sit-to-stand",
    name: "Sit-to-Stand",
    movementPattern: "squat",
    primaryMuscles: ["quadriceps", "glutes"],
    secondaryMuscles: ["core"],
    equipment: ["bodyweight", "home-gym"],
    accessibility: [
      "low-impact",
      "limited-balance",
    ],
    difficulty: "beginner",
    fatigueScore: 3,
    estimatedSecondsPerSet: 40,
    substitutions: [
      "leg-press",
      "supported-squat",
    ],
  },
  {
    id: "dumbbell-romanian-deadlift",
    name: "Dumbbell Romanian Deadlift",
    movementPattern: "hinge",
    primaryMuscles: ["hamstrings", "glutes"],
    secondaryMuscles: ["lower-back", "core"],
    equipment: ["full-gym", "home-gym"],
    accessibility: ["standing"],
    difficulty: "intermediate",
    fatigueScore: 6,
    estimatedSecondsPerSet: 55,
    substitutions: [
      "cable-pull-through",
      "glute-bridge",
    ],
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    movementPattern: "hinge",
    primaryMuscles: ["glutes"],
    secondaryMuscles: ["hamstrings", "core"],
    equipment: ["bodyweight", "home-gym"],
    accessibility: ["low-impact", "limited-balance"],
    difficulty: "beginner",
    fatigueScore: 3,
    estimatedSecondsPerSet: 40,
    substitutions: [
      "dumbbell-romanian-deadlift",
      "cable-pull-through",
    ],
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    movementPattern: "core",
    primaryMuscles: ["core"],
    secondaryMuscles: ["hip-flexors"],
    equipment: ["bodyweight"],
    accessibility: ["low-impact", "limited-balance"],
    difficulty: "beginner",
    fatigueScore: 2,
    estimatedSecondsPerSet: 40,
    substitutions: [
      "seated-knee-lift",
      "pallof-press",
    ],
  },
  {
    id: "seated-knee-lift",
    name: "Seated Knee Lift",
    movementPattern: "core",
    primaryMuscles: ["core", "hip-flexors"],
    secondaryMuscles: [],
    equipment: ["bodyweight"],
    accessibility: [
      "seated",
      "wheelchair-friendly",
      "low-impact",
      "limited-balance",
    ],
    difficulty: "beginner",
    fatigueScore: 2,
    estimatedSecondsPerSet: 35,
    substitutions: [
      "dead-bug",
      "pallof-press",
    ],
  },
  {
    id: "brisk-walk",
    name: "Brisk Walk",
    movementPattern: "cardio",
    primaryMuscles: ["lower-body"],
    secondaryMuscles: ["cardiovascular-system"],
    equipment: ["outdoors", "bodyweight"],
    accessibility: ["standing", "low-impact"],
    difficulty: "beginner",
    fatigueScore: 3,
    estimatedSecondsPerSet: 600,
    substitutions: [
      "seated-march",
      "stationary-bike",
    ],
  },
  {
    id: "seated-march",
    name: "Seated March",
    movementPattern: "cardio",
    primaryMuscles: ["hip-flexors", "core"],
    secondaryMuscles: ["cardiovascular-system"],
    equipment: ["bodyweight"],
    accessibility: [
      "seated",
      "wheelchair-friendly",
      "low-impact",
      "limited-balance",
    ],
    difficulty: "beginner",
    fatigueScore: 2,
    estimatedSecondsPerSet: 120,
    substitutions: [
      "brisk-walk",
      "arm-ergometer",
    ],
  },
];
