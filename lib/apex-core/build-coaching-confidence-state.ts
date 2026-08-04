import type {
  AdaptiveConfidence,
} from "./calculate-adaptive-confidence";

export type CoachingConfidenceLevel =
  | "low"
  | "developing"
  | "moderate"
  | "high";

export type CoachingConfidenceDomain = {
  score: number;
  level: CoachingConfidenceLevel;
};

export type CoachingConfidenceState = {
  progression: CoachingConfidenceDomain;
  recovery: CoachingConfidenceDomain;
  behaviour: CoachingConfidenceDomain;
  memory: CoachingConfidenceDomain;

  overall: CoachingConfidenceDomain;

  strongestDomain:
    AdaptiveConfidence["strongestDomain"];

  weakestDomain:
    AdaptiveConfidence["weakestDomain"];

  summary: string;
};

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.max(
    minimum,
    Math.min(maximum, value),
  );
}

function getLevel(
  score: number,
): CoachingConfidenceLevel {
  if (score >= 80) {
    return "high";
  }

  if (score >= 60) {
    return "moderate";
  }

  if (score >= 35) {
    return "developing";
  }

  return "low";
}

function createDomain(
  score: number,
): CoachingConfidenceDomain {
  const resolved =
    Math.round(clamp(score));

  return {
    score: resolved,
    level: getLevel(resolved),
  };
}

export function buildCoachingConfidenceState(
  adaptive: AdaptiveConfidence,
): CoachingConfidenceState {
  return {
    progression:
      createDomain(
        adaptive.progression,
      ),

    recovery:
      createDomain(
        adaptive.recovery,
      ),

    behaviour:
      createDomain(
        adaptive.behaviour,
      ),

    memory:
      createDomain(
        adaptive.memory,
      ),

    overall:
      createDomain(
        adaptive.overall,
      ),

    strongestDomain:
      adaptive.strongestDomain,

    weakestDomain:
      adaptive.weakestDomain,

    summary:
      `Overall coaching confidence is ${Math.round(
        adaptive.overall,
      )}/100.`,
  };
}
