import {
  calculateEvidenceWeight,
} from "./calculate-evidence-weight";

export type AdaptiveConfidenceInput = {
  progression: Parameters<
    typeof calculateEvidenceWeight
  >[0];

  recovery: Parameters<
    typeof calculateEvidenceWeight
  >[0];

  behaviour: Parameters<
    typeof calculateEvidenceWeight
  >[0];

  memory: Parameters<
    typeof calculateEvidenceWeight
  >[0];
};

export type AdaptiveConfidence = {
  progression: number;
  recovery: number;
  behaviour: number;
  memory: number;

  overall: number;

  strongestDomain:
    | "progression"
    | "recovery"
    | "behaviour"
    | "memory";

  weakestDomain:
    | "progression"
    | "recovery"
    | "behaviour"
    | "memory";
};

export function calculateAdaptiveConfidence(
  input: AdaptiveConfidenceInput,
): AdaptiveConfidence {

  const progression =
    calculateEvidenceWeight(
      input.progression,
    ).score;

  const recovery =
    calculateEvidenceWeight(
      input.recovery,
    ).score;

  const behaviour =
    calculateEvidenceWeight(
      input.behaviour,
    ).score;

  const memory =
    calculateEvidenceWeight(
      input.memory,
    ).score;

  const entries = [
    ["progression", progression],
    ["recovery", recovery],
    ["behaviour", behaviour],
    ["memory", memory],
  ] as const;

  const strongest =
    [...entries].sort(
      (a, b) => b[1] - a[1],
    )[0];

  const weakest =
    [...entries].sort(
      (a, b) => a[1] - b[1],
    )[0];

  return {
    progression,
    recovery,
    behaviour,
    memory,

    overall: Math.round(
      (
        progression +
        recovery +
        behaviour +
        memory
      ) / 4,
    ),

    strongestDomain: strongest[0],
    weakestDomain: weakest[0],
  };
}
