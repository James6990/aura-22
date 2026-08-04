import {
  buildCoachingConfidenceState,
} from "./build-coaching-confidence-state";
import type {
  AdaptiveConfidence,
} from "./calculate-adaptive-confidence";

const adaptive: AdaptiveConfidence = {
  progression: 34,
  recovery: 84,
  behaviour: 67,
  memory: 46,
  overall: 58,
  strongestDomain: "recovery",
  weakestDomain: "progression",
};

const state =
  buildCoachingConfidenceState(
    adaptive,
  );

if (
  state.progression.score !== 34 ||
  state.progression.level !== "low"
) {
  throw new Error(
    "A score below 35 should produce low progression confidence.",
  );
}

if (
  state.recovery.score !== 84 ||
  state.recovery.level !== "high"
) {
  throw new Error(
    "A score of 80 or above should produce high recovery confidence.",
  );
}

if (
  state.behaviour.score !== 67 ||
  state.behaviour.level !==
    "moderate"
) {
  throw new Error(
    "A score from 60 to 79 should produce moderate behaviour confidence.",
  );
}

if (
  state.memory.score !== 46 ||
  state.memory.level !==
    "developing"
) {
  throw new Error(
    "A score from 35 to 59 should produce developing memory confidence.",
  );
}

if (
  state.overall.score !== 58 ||
  state.overall.level !==
    "developing"
) {
  throw new Error(
    "Overall confidence should use the same confidence thresholds.",
  );
}

if (
  state.strongestDomain !==
    "recovery"
) {
  throw new Error(
    "The strongest adaptive-confidence domain should be preserved.",
  );
}

if (
  state.weakestDomain !==
    "progression"
) {
  throw new Error(
    "The weakest adaptive-confidence domain should be preserved.",
  );
}

if (
  state.summary !==
  "Overall coaching confidence is 58/100."
) {
  throw new Error(
    `Unexpected confidence summary: ${state.summary}`,
  );
}

const boundaryState =
  buildCoachingConfidenceState({
    progression: 35,
    recovery: 60,
    behaviour: 80,
    memory: 0,
    overall: 59.6,
    strongestDomain: "behaviour",
    weakestDomain: "memory",
  });

if (
  boundaryState.progression.level !==
    "developing"
) {
  throw new Error(
    "A score of exactly 35 should be developing.",
  );
}

if (
  boundaryState.recovery.level !==
    "moderate"
) {
  throw new Error(
    "A score of exactly 60 should be moderate.",
  );
}

if (
  boundaryState.behaviour.level !==
    "high"
) {
  throw new Error(
    "A score of exactly 80 should be high.",
  );
}

if (
  boundaryState.memory.level !==
    "low"
) {
  throw new Error(
    "A score of zero should be low.",
  );
}

if (
  boundaryState.overall.score !== 60 ||
  boundaryState.overall.level !==
    "moderate"
) {
  throw new Error(
    "Confidence scores should round before level assignment.",
  );
}

const clampedState =
  buildCoachingConfidenceState({
    progression: -20,
    recovery: 140,
    behaviour: 49.5,
    memory: 79.6,
    overall: 105,
    strongestDomain: "recovery",
    weakestDomain: "progression",
  });

if (
  clampedState.progression.score !== 0 ||
  clampedState.progression.level !==
    "low"
) {
  throw new Error(
    "Negative confidence should clamp to zero.",
  );
}

if (
  clampedState.recovery.score !== 100 ||
  clampedState.recovery.level !==
    "high"
) {
  throw new Error(
    "Confidence above 100 should clamp to 100.",
  );
}

if (
  clampedState.behaviour.score !== 50 ||
  clampedState.behaviour.level !==
    "developing"
) {
  throw new Error(
    "Decimal confidence should round correctly.",
  );
}

if (
  clampedState.memory.score !== 80 ||
  clampedState.memory.level !==
    "high"
) {
  throw new Error(
    "Rounded confidence should determine its final level.",
  );
}

if (
  clampedState.overall.score !== 100 ||
  clampedState.overall.level !==
    "high"
) {
  throw new Error(
    "Overall confidence should clamp safely.",
  );
}

console.log(
  "Coaching Confidence State test passed.",
);
