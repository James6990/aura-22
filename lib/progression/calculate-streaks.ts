export type StreakResult = {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  nextMilestone: number;
  daysToMilestone: number;
};

const MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365];

function toUtcDayNumber(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return Math.floor(
    Date.UTC(year, month - 1, day) / 86_400_000,
  );
}

export function calculateStreaks(
  dates: string[],
  today = new Date(),
): StreakResult {
  const uniqueDates = [...new Set(dates)]
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a));

  if (uniqueDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      nextMilestone: 3,
      daysToMilestone: 3,
    };
  }

  const dayNumbers = uniqueDates
    .map(toUtcDayNumber)
    .sort((a, b) => b - a);

  const todayDay = Math.floor(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    ) / 86_400_000,
  );

  const latestDay = dayNumbers[0];

  // A streak remains active if the latest check-in was today or yesterday.
  let currentStreak = 0;

  if (latestDay === todayDay || latestDay === todayDay - 1) {
    currentStreak = 1;

    for (let index = 1; index < dayNumbers.length; index += 1) {
      if (dayNumbers[index - 1] - dayNumbers[index] === 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  let longestStreak = 1;
  let runningStreak = 1;

  for (let index = 1; index < dayNumbers.length; index += 1) {
    if (dayNumbers[index - 1] - dayNumbers[index] === 1) {
      runningStreak += 1;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 1;
    }
  }

  const nextMilestone =
    MILESTONES.find((milestone) => milestone > currentStreak) ??
    Math.ceil((currentStreak + 1) / 100) * 100;

  return {
    currentStreak,
    longestStreak,
    totalActiveDays: uniqueDates.length,
    nextMilestone,
    daysToMilestone: Math.max(0, nextMilestone - currentStreak),
  };
}
