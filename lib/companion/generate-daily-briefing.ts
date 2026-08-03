import type { CompanionBrief } from "@/lib/companion/generate-companion-brief";

export type DailyBriefing = {
  greeting: string;
  opening: string;
  focus: string;
  win: string | null;
  nextAction: string;
  tone: CompanionBrief["tone"];
  isComeback: boolean;
  companion: CompanionBrief;
};

type BriefingContext = {
  preferredGreeting: string;
  companion: CompanionBrief;
};

function createStableSeed(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash =
      (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function chooseDailyTemplate(
  templates: string[],
  seedKey: string,
) {
  const seed = createStableSeed(seedKey);

  return templates[seed % templates.length];
}

function getLocalDayKey() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function getOpening({
  preferredGreeting,
  companion,
}: BriefingContext) {
  const priority = companion.decision.priority;

  const seedKey = [
    getLocalDayKey(),
    preferredGreeting,
    priority,
    companion.tone,
  ].join(":");

  if (companion.isComeback) {
    return chooseDailyTemplate(
      [
        "Your Journey has not been reset. We will continue from where you are today, without pressure to make up for lost time.",
        "You do not need to catch up all at once. Today is simply the next step in your Journey.",
        "Time away does not erase what you built. We will return gradually and focus on what feels achievable today.",
      ],
      seedKey,
    );
  }

  if (priority === "celebrate") {
    return chooseDailyTemplate(
      [
        "You completed meaningful work recently. Take a moment to recognise that progress before deciding what comes next.",
        "Your recent effort deserves to be acknowledged. Progress is easier to sustain when we notice it as well as measure it.",
        "Something went well recently. Let’s recognise that win and use it as a foundation for the next step.",
      ],
      seedKey,
    );
  }

  if (priority === "recover") {
    return chooseDailyTemplate(
      [
        "Your current signals suggest that recovery will support you more than unnecessary intensity today.",
        "Today is a chance to restore energy rather than spend more of it. Recovery is part of the work.",
        "A lighter day can protect the consistency you are building and improve the quality of your next demanding session.",
      ],
      seedKey,
    );
  }

  if (priority === "technique") {
    return chooseDailyTemplate(
      [
        "Today is about protecting your progress through comfortable movement, control and good technique.",
        "Quality matters more than load today. Comfortable, controlled movement should guide every decision.",
        "There is no benefit in forcing a movement that does not feel right. Technique and comfort come first.",
      ],
      seedKey,
    );
  }

  if (priority === "train") {
    return chooseDailyTemplate(
      [
        "Your current readiness supports a productive session. You do not need perfection—only purposeful work.",
        "You appear ready to train today. Follow the plan, stay controlled and leave enough capacity to recover well.",
        "Today offers a good opportunity to build. Focus on repeatable quality rather than chasing unnecessary intensity.",
      ],
      seedKey,
    );
  }

  if (priority === "build-consistency") {
    return chooseDailyTemplate(
      [
        "Today does not need to be dramatic. One achievable action is enough to keep your Journey moving.",
        "Momentum begins with something manageable. Choose one action you can complete with confidence.",
        "A smaller plan you complete is more valuable than a perfect plan you postpone.",
      ],
      seedKey,
    );
  }

  if (priority === "hydrate") {
    return chooseDailyTemplate(
      [
        "A simple hydration win is the clearest way to support your energy and recovery today.",
        "Hydration is today’s most useful opportunity. Start there before adding more demands.",
        "One realistic hydration target can make today’s recovery and training feel more manageable.",
      ],
      seedKey,
    );
  }

  return chooseDailyTemplate(
    [
      "I am still learning what works best for you. Every honest check-in and completed activity improves future guidance.",
      "Your early history is beginning to form a clearer picture. Consistent, honest entries will make future guidance more personal.",
      "There is no need to manufacture perfect data. Simply record what genuinely happened and Apex will learn over time.",
    ],
    seedKey,
  );
}

function refineNextAction(
  companion: CompanionBrief,
) {
  if (companion.isComeback) {
    return (
      "Choose a comfortable version of today’s plan and stop " +
      "before fatigue or discomfort begins to rise."
    );
  }

  if (
    companion.decision.priority === "recover"
  ) {
    return (
      companion.decision.action +
      " Give yourself permission to keep it simple."
    );
  }

  if (
    companion.decision.priority ===
    "build-consistency"
  ) {
    return (
      companion.decision.action +
      " Completing it is the win."
    );
  }

  return companion.decision.action;
}

export function generateDailyBriefing(
  companion: CompanionBrief,
): DailyBriefing {
  return {
    greeting: companion.greeting,

    opening: getOpening({
      preferredGreeting: companion.greeting,
      companion,
    }),

    focus: companion.todayFocus,
    win: companion.celebration,

    nextAction: refineNextAction(companion),

    tone: companion.tone,
    isComeback: companion.isComeback,
    companion,
  };
}
