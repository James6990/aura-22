import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const { message, biometrics } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback if environment key is missing yet
      return NextResponse.json({ 
        reply: "⚠️ GEMINI_API_KEY is not set in your environment variables. Please add it to enable live global AI knowledge." 
      });
    }

    // Initialize the official Google Gen AI client
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      You are Apex AI, an elite world-class fitness, sports science, and clinical nutrition coach.
      Analyze the following user profile:
      - Biological Sex: ${biometrics?.sex || 'Not specified'}
      - Age: ${biometrics?.age || '25'} years
      - Weight: ${biometrics?.weight || '75'} kg
      - Height: ${biometrics?.height || '175'} cm
      - Goal: ${biometrics?.goal || 'General Fitness'}

      The user is asking: "${message}"

      Provide a precise, highly actionable, science-backed protocol tailored strictly to their biometrics, including estimated caloric needs or macro targets if relevant. Keep formatting clean, sharp, and structured.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return NextResponse.json({ reply: response.text });

  } catch (error) {
    console.error('AI Route Error:', error);
    return NextResponse.json({ error: 'Failed to process live AI request' }, { status: 500 });
  }
}
