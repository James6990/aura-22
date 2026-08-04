import { analyseRecentTrainingLoad } from "./analyse-recent-training-load";

const now = new Date(
  "2026-08-04T10:00:00.000Z",
);

const load = analyseRecentTrainingLoad(
  [
    {
      exerciseId: "machine-chest-press",
      completedAt: new Date(
        "2026-08-04T02:00:00.000Z",
      ),
      completedSets: 4,
      rpe: 9,
      discomfortLevel: 1,
    },
    {
      exerciseId: "dumbbell-bench-press",
      completedAt: new Date(
        "2026-08-03T22:00:00.000Z",
      ),
      completedSets: 3,
      rpe: 8,
      discomfortLevel: 0,
    },
    {
      exerciseId: "goblet-squat",
      completedAt: new Date(
        "2026-07-30T10:00:00.000Z",
      ),
      completedSets: 3,
      rpe: 6,
      discomfortLevel: 0,
    },
  ],
  now,
);

if (
  !load.deprioritisedPatterns.includes(
    "horizontal-push",
  )
) {
  throw new Error(
    "Recently trained high-effort pushing should be deprioritised.",
  );
}

if (
  load.preferredPatterns[0] ===
  "horizontal-push"
) {
  throw new Error(
    "A recently overloaded pattern must not be the leading preference.",
  );
}

if (
  load.movementSignals[
    "horizontal-push"
  ].recentSets !== 7
) {
  throw new Error(
    "Recent sets were not aggregated correctly.",
  );
}

const emptyLoad =
  analyseRecentTrainingLoad([], now);

if (
  emptyLoad.deprioritisedPatterns.length !== 0
) {
  throw new Error(
    "An empty history must not block movement patterns.",
  );
}

console.log(
  "Recent Training Load Engine test passed.",
);
