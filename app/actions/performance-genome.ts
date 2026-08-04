"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { performanceGenome } from "@/lib/db/schema";
import { normaliseTrainingSetup } from "@/lib/workout/normalise-training-setup";

export type PerformanceGenomeInput = {
  preferredName: string;
  age: number;
  heightCm: number;
  weightKg: number;
  unitSystem: "metric" | "imperial";
  primaryGoal:
    | "muscle"
    | "fat-loss"
    | "recomposition"
    | "performance"
    | "health";
  experienceLevel:
    | "beginner"
    | "intermediate"
    | "advanced";
  equipment: string[];

  trainingEnvironment:
    | "commercial-gym"
    | "home-gym"
    | "outdoors"
    | "bodyweight-only"
    | "mixed";

  equipmentInventory: string[];

  dietaryPreference:
    | "standard"
    | "vegetarian"
    | "vegan"
    | "pescatarian"
    | "other";
  allergiesAndAvoidances: string;
  coachStyle:
    | "encouraging"
    | "scientific"
    | "competitive"
    | "calm";
  focusMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  largerText: boolean;
};

export type SavePerformanceGenomeResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

async function getCurrentUserId(): Promise<string | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user?.id ?? null;
}

function isPositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export async function savePerformanceGenome(
  input: PerformanceGenomeInput,
): Promise<SavePerformanceGenomeResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return {
      success: false,
      error: "You must be signed in before creating your Apex profile.",
    };
  }

  if (!input.preferredName.trim()) {
    return {
      success: false,
      error: "Please enter your preferred name.",
    };
  }

  if (
    !isPositiveNumber(input.age) ||
    !isPositiveNumber(input.heightCm) ||
    !isPositiveNumber(input.weightKg)
  ) {
    return {
      success: false,
      error: "Age, height and weight must all be valid positive numbers.",
    };
  }

  if (!input.primaryGoal) {
    return {
      success: false,
      error: "Please select a primary goal.",
    };
  }

  if (!input.experienceLevel) {
    return {
      success: false,
      error: "Please select your experience level.",
    };
  }

  const validTrainingEnvironments = new Set([
    "commercial-gym",
    "home-gym",
    "outdoors",
    "bodyweight-only",
    "mixed",
  ]);

  if (
    !validTrainingEnvironments.has(
      input.trainingEnvironment,
    )
  ) {
    return {
      success: false,
      error: "Please select a valid training environment.",
    };
  }

  if (input.equipment.length === 0) {
    return {
      success: false,
      error: "Please select at least one training option.",
    };
  }

  if (
    input.trainingEnvironment === "home-gym" &&
    input.equipmentInventory.length === 0
  ) {
    return {
      success: false,
      error:
        "Please select your home equipment or choose no equipment.",
    };
  }

  const trainingSetup =
    normaliseTrainingSetup({
      trainingEnvironment:
        input.trainingEnvironment,
      equipment: input.equipment,
      equipmentInventory:
        input.equipmentInventory,
    });

  try {
    await db
      .insert(performanceGenome)
      .values({
        userId,
        preferredName: input.preferredName.trim(),
        age: input.age,
        heightCm: Math.round(input.heightCm * 100) / 100,
        weightKg: Math.round(input.weightKg * 100) / 100,
        unitSystem: input.unitSystem,
        primaryGoal: input.primaryGoal,
        experienceLevel: input.experienceLevel,
        equipment:
          trainingSetup.equipment,
        trainingEnvironment:
          trainingSetup.trainingEnvironment,
        equipmentInventory:
          trainingSetup.equipmentInventory,
        dietaryPreference: input.dietaryPreference,
        allergiesAndAvoidances:
          input.allergiesAndAvoidances.trim(),
        coachStyle: input.coachStyle,
        focusMode: input.focusMode,
        highContrast: input.highContrast,
        reducedMotion: input.reducedMotion,
        largerText: input.largerText,
        onboardingCompleted: true,
        genomeVersion: 1,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: performanceGenome.userId,
        set: {
          preferredName: input.preferredName.trim(),
          age: input.age,
          heightCm: Math.round(input.heightCm * 100) / 100,
          weightKg: Math.round(input.weightKg * 100) / 100,
          unitSystem: input.unitSystem,
          primaryGoal: input.primaryGoal,
          experienceLevel: input.experienceLevel,
          equipment:
            trainingSetup.equipment,
          trainingEnvironment:
            trainingSetup.trainingEnvironment,
          equipmentInventory:
            trainingSetup.equipmentInventory,
          dietaryPreference: input.dietaryPreference,
          allergiesAndAvoidances:
            input.allergiesAndAvoidances.trim(),
          coachStyle: input.coachStyle,
          focusMode: input.focusMode,
          highContrast: input.highContrast,
          reducedMotion: input.reducedMotion,
          largerText: input.largerText,
          onboardingCompleted: true,
          genomeVersion: 1,
          updatedAt: new Date(),
        },
      });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to save Performance Genome:", error);

    return {
      success: false,
      error:
        "Apex could not save your profile. Please try again.",
    };
  }
}
