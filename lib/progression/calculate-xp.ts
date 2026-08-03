export type ProgressionEvent = {
  type: string;
  payload: Record<
    string,
    string | number | boolean | null | string[] | number[]
  >;
};

export type ProgressionResult = {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  rankName: string;
};

const XP_BY_EVENT: Record<string, number> = {
  "readiness.check_in_saved": 15,
  "workout.completed": 50,
  "recovery.completed": 15,
  "hydration.target_reached": 10,
  "nutrition.target_completed": 25,
  "progress.personal_record": 200,
  "streak.seven_days": 100,
};

function getEventXp(event: ProgressionEvent) {
  let xp = XP_BY_EVENT[event.type] ?? 5;

  if (
    event.type === "readiness.check_in_saved" &&
    event.payload.workoutCompleted === true
  ) {
    xp += 20;
  }

  if (
    event.type === "readiness.check_in_saved" &&
    event.payload.recoveryCompleted === true
  ) {
    xp += 10;
  }

  if (
    event.type === "readiness.check_in_saved" &&
    event.payload.hydrationTargetReached === true
  ) {
    xp += 10;
  }

  return xp;
}

function xpRequiredForLevel(level: number) {
  return 100 + (level - 1) * 50;
}

function getRankName(level: number) {
  if (level >= 50) return "Apex Sovereign";
  if (level >= 40) return "Mythic Iron";
  if (level >= 30) return "Immortal";
  if (level >= 24) return "Warlord";
  if (level >= 18) return "Titan";
  if (level >= 13) return "Spartan";
  if (level >= 9) return "Centurion";
  if (level >= 6) return "Gladiator";
  if (level >= 3) return "Scout";
  return "Pawn";
}

export function calculateProgression(
  events: ProgressionEvent[],
): ProgressionResult {
  const totalXp = events.reduce(
    (sum, event) => sum + getEventXp(event),
    0,
  );

  let level = 1;
  let remainingXp = totalXp;

  while (remainingXp >= xpRequiredForLevel(level)) {
    remainingXp -= xpRequiredForLevel(level);
    level += 1;
  }

  const nextLevelXp = xpRequiredForLevel(level);

  return {
    totalXp,
    level,
    currentLevelXp: remainingXp,
    nextLevelXp,
    progressPercent: Math.round(
      (remainingXp / nextLevelXp) * 100,
    ),
    rankName: getRankName(level),
  };
}
