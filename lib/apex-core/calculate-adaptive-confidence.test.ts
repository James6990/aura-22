import {
  calculateAdaptiveConfidence,
} from "./calculate-adaptive-confidence";

const confidence =
  calculateAdaptiveConfidence({
    progression: {
      sampleSize: 32,
      recencyScore: 90,
      consistencyScore: 88,
      directnessScore: 92,
    },
    recovery: {
      sampleSize: 14,
      recencyScore: 82,
      consistencyScore: 75,
      directnessScore: 85,
    },
    behaviour: {
      sampleSize: 8,
      recencyScore: 70,
      consistencyScore: 68,
      directnessScore: 72,
    },
    memory: {
      sampleSize: 3,
      recencyScore: 55,
      consistencyScore: 50,
      directnessScore: 60,
    },
  });

for (const value of [
  confidence.progression,
  confidence.recovery,
  confidence.behaviour,
  confidence.memory,
  confidence.overall,
]) {
  if (value < 0 || value > 100) {
    throw new Error(
      "Adaptive confidence values must remain between 0 and 100.",
    );
  }
}

const expectedOverall = Math.round(
  (
    confidence.progression +
    confidence.recovery +
    confidence.behaviour +
    confidence.memory
  ) / 4,
);

if (confidence.overall !== expectedOverall) {
  throw new Error(
    `Expected overall confidence ${expectedOverall}, received ${confidence.overall}.`,
  );
}

if (
  confidence.strongestDomain !==
  "progression"
) {
  throw new Error(
    `Expected progression to be strongest, received ${confidence.strongestDomain}.`,
  );
}

if (
  confidence.weakestDomain !==
  "memory"
) {
  throw new Error(
    `Expected memory to be weakest, received ${confidence.weakestDomain}.`,
  );
}

if (
  !(
    confidence.progression >
      confidence.recovery &&
    confidence.recovery >
      confidence.behaviour &&
    confidence.behaviour >
      confidence.memory
  )
) {
  throw new Error(
    "Expected confidence domains to follow the supplied evidence strength.",
  );
}

console.log(
  "Adaptive Confidence Engine test passed.",
);
