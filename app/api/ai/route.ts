import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(req: Request) {
  try {
    const { message, biometrics } = await req.json();

    const prompt = `You are the Apex State AI Fitness Coach. 
    Athlete Profile:
    - Sex: ${biometrics.sex}
    - Age: ${biometrics.age}
    - Weight: ${biometrics.weight} kg
    - Height: ${biometrics.height} cm
    - Goal: ${biometrics.goal}

    The athlete asks: "${message}"

    Provide an elite, highly actionable, motivating fitness and dietary coaching response tailored precisely to their goal and biometrics. Keep it concise and impactful.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const reply = response.text || "Execute your protocol, athlete.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ 
      reply: "Apex AI tactical fallback: Focus on progressive overload, hit your protein macro targets, and prioritize sleep recovery." 
    }, { status: 500 });
  }
}
