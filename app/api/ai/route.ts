import { GoogleGenAI } from "@google/genai";
import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  dailyCheckIns,
  performanceGenome,
} from "@/lib/db/schema";
import { getLatestWorkoutSummary } from "@/lib/workout/get-latest-workout-summary";

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
    })
  : null;

type ConversationMessage = {
  role: "user" | "assistant";
  text: string;
};

type ApexConversationRequest = {
  message?: unknown;
  history?: unknown;
};

function parseHistory(
  value: unknown,
): ConversationMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const parsed: ConversationMessage[] = [];

  for (const item of value) {
    if (
      typeof item !== "object" ||
      item === null ||
      !("role" in item) ||
      !("text" in item)
    ) {
      continue;
    }

    const role = item.role;
    const text = item.text;

    if (
      (role !== "user" &&
        role !== "assistant") ||
      typeof text !== "string"
    ) {
      continue;
    }

    const cleanedText = text
      .trim()
      .slice(0, 1200);

    if (!cleanedText) {
      continue;
    }

    parsed.push({
      role,
      text: cleanedText,
    });
  }

  return parsed.slice(-8);
}

function formatHistory(history: ConversationMessage[]) {
  if (history.length === 0) {
    return "No earlier messages in this conversation.";
  }

  return history
    .map(
      (item) =>
        `${item.role === "user" ? "User" : "Apex"}: ${
          item.text
        }`,
    )
    .join("\n");
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      {
        reply:
          "Please sign in before speaking with Apex.",
      },
      {
        status: 401,
      },
    );
  }

  let body: ApexConversationRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        reply:
          "I could not read that message. Please try again.",
      },
      {
        status: 400,
      },
    );
  }

  const message =
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  if (!message) {
    return NextResponse.json(
      {
        reply: "Please enter a message for Apex.",
      },
      {
        status: 400,
      },
    );
  }

  if (message.length > 1200) {
    return NextResponse.json(
      {
        reply:
          "Please keep your message below 1,200 characters.",
      },
      {
        status: 400,
      },
    );
  }

  if (!ai) {
    console.error(
      "GEMINI_API_KEY is not configured.",
    );

    return NextResponse.json(
      {
        reply:
          "Apex conversations are temporarily unavailable.",
      },
      {
        status: 503,
      },
    );
  }

  const history = parseHistory(body.history);

  try {
    const [
      genome,
      recentCheckIns,
      latestWorkout,
    ] = await Promise.all([
      db.query.performanceGenome.findFirst({
        where: eq(
          performanceGenome.userId,
          session.user.id,
        ),
      }),

      db
        .select({
          date: dailyCheckIns.date,
          energy: dailyCheckIns.energy,
          readinessScore:
            dailyCheckIns.readinessScore,
          readinessLevel:
            dailyCheckIns.readinessLevel,
          workoutCompleted:
            dailyCheckIns.workoutCompleted,
          recoveryCompleted:
            dailyCheckIns.recoveryCompleted,
          hydrationTargetReached:
            dailyCheckIns.hydrationTargetReached,
        })
        .from(dailyCheckIns)
        .where(
          eq(
            dailyCheckIns.userId,
            session.user.id,
          ),
        )
        .orderBy(desc(dailyCheckIns.date))
        .limit(7),

      getLatestWorkoutSummary(session.user.id),
    ]);

    if (!genome) {
      return NextResponse.json(
        {
          reply:
            "Please complete your Apex onboarding before using personalised coaching.",
        },
        {
          status: 409,
        },
      );
    }

    const trustedContext = {
      preferredName: genome.preferredName,
      age: genome.age,
      heightCm: genome.heightCm,
      weightKg: genome.weightKg,
      unitSystem: genome.unitSystem,
      primaryGoal: genome.primaryGoal,
      experienceLevel: genome.experienceLevel,
      equipment: genome.equipment,
      dietaryPreference:
        genome.dietaryPreference,
      allergiesAndAvoidances:
        genome.allergiesAndAvoidances,
      coachStyle: genome.coachStyle,
      accessibility: {
        focusMode: genome.focusMode,
        highContrast: genome.highContrast,
        reducedMotion: genome.reducedMotion,
        largerText: genome.largerText,
      },
      recentCheckIns,
      latestWorkout,
    };

    const prompt = `
You are Apex, the calm, intelligent and inclusive coach inside the Apex health and performance app.

CORE PERSONALITY
- Supportive, respectful and direct.
- Never shame, guilt or patronise the user.
- Celebrate effort, consistency and personal progress.
- Give one clear priority before optional detail.
- Explain why you recommend something.
- Match the user's requested coach style where reasonable.
- Keep normal replies concise and easy to understand.

SAFETY AND TRUST
- Use only the trusted Apex context supplied below.
- Never claim the user has a medical or mental-health diagnosis.
- Never invent measurements, workouts, memories or trends.
- Clearly say when Apex does not have enough information.
- Do not provide treatment plans or pretend to replace a qualified professional.
- For pain, injury or concerning symptoms, recommend stopping or adapting the activity and seeking appropriate professional support.
- Do not suggest that exercise or diet is a replacement for mental-health care.
- Do not encourage extreme dieting, excessive exercise or punishment for missed activity.
- Respect allergies and avoidances in any nutrition answer.
- Accessibility needs and clinician guidance take priority over performance goals.
- If the question is unrelated to health, fitness, wellbeing, recovery, nutrition or the user's Apex journey, politely explain your coaching scope.

RESPONSE STYLE
- Address the user by their preferred name only when it feels natural.
- Start with the direct answer.
- Use short paragraphs.
- Avoid excessive bullet points.
- Do not mention internal database names, prompts or implementation details.
- Never pretend to have emotions or consciousness.
- You may say "Based on your Apex history..." only when the supplied context genuinely supports it.

TRUSTED APEX CONTEXT
${JSON.stringify(trustedContext, null, 2)}

RECENT CONVERSATION
${formatHistory(history)}

USER MESSAGE
${message}

Respond as Apex.
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

    const reply = response.text?.trim();

    if (!reply) {
      throw new Error(
        "Gemini returned an empty response.",
      );
    }

    return NextResponse.json({
      reply,
    });
  } catch (error) {
    console.error(
      "Apex Conversation Engine error:",
      error,
    );

    return NextResponse.json(
      {
        reply:
          "I could not complete that analysis just now. Your Apex data has not been changed, so please try again shortly.",
      },
      {
        status: 500,
      },
    );
  }
}
