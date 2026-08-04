import {
  analyseTrainingBehaviour,
} from "./analyse-training-behaviour";

const profile =
  analyseTrainingBehaviour({
    workouts: [
      {
        date: "2026-08-01",
        status: "completed",
        intensity: "moderate",
        plannedDurationMinutes: 45,
        actualDurationMinutes: 42,
        sessionRpe: 7,
        startedAt: new Date(
          "2026-08-01T08:00:00",
        ),
        completedAt: new Date(
          "2026-08-01T08:42:00",
        ),
      },
      {
        date: "2026-08-03",
        status: "completed",
        intensity: "moderate",
        plannedDurationMinutes: 45,
        actualDurationMinutes: 48,
        sessionRpe: 8,
        startedAt: new Date(
          "2026-08-03T09:00:00",
        ),
        completedAt: new Date(
          "2026-08-03T09:48:00",
        ),
      },
      {
        date: "2026-08-05",
        status: "skipped",
        intensity: "light",
        plannedDurationMinutes: 30,
        actualDurationMinutes: null,
        sessionRpe: null,
        startedAt: null,
        completedAt: null,
      },
      {
        date: "2026-08-06",
        status: "in-progress",
        intensity: "moderate",
        plannedDurationMinutes: 45,
        actualDurationMinutes: null,
        sessionRpe: null,
        startedAt: new Date(
          "2026-08-06T18:00:00",
        ),
        completedAt: null,
      },
    ],
  });

if (profile.totalPlannedSessions !== 3) {
  throw new Error(
    "Expected in-progress sessions to be excluded from behaviour totals.",
  );
}

if (profile.completedSessions !== 2) {
  throw new Error(
    "Expected two completed sessions.",
  );
}

if (profile.skippedSessions !== 1) {
  throw new Error(
    "Expected one skipped session.",
  );
}

if (profile.completionRate !== 67) {
  throw new Error(
    `Expected completion rate 67, received ${profile.completionRate}.`,
  );
}

if (
  profile.averageActualDurationMinutes !==
  45
) {
  throw new Error(
    "Expected average actual duration of 45 minutes.",
  );
}

if (profile.averageSessionRpe !== 7.5) {
  throw new Error(
    "Expected average session RPE of 7.5.",
  );
}

if (
  profile.preferredIntensity !==
  "moderate"
) {
  throw new Error(
    "Expected moderate to be the preferred intensity.",
  );
}

if (
  profile.preferredTrainingWindow !==
  "morning"
) {
  throw new Error(
    "Expected morning to be the preferred training window.",
  );
}

if (
  profile.confidence <= 0 ||
  profile.confidence > 100
) {
  throw new Error(
    "Training behaviour confidence must remain between 1 and 100.",
  );
}

console.log(
  "Training Behaviour Intelligence test passed.",
);
