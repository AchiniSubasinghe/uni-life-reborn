import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are UniBot, a friendly and knowledgeable AI assistant built for university students in Sri Lanka. Your purpose is to help students discover and navigate essential services near their campus.

You assist with:
- Finding nearby hostels, restaurants, supermarkets, pharmacies, salons, and other services
- Answering questions about university life in Sri Lanka
- Providing tips about budgeting, accommodation, and daily student needs
- Helping students understand how to use the UniLife platform

Universities currently served: NSBM Green University, University of Colombo, University of Sri Jayewardenepura.

Keep your replies concise, warm, and helpful. Use simple language. If you don't know something specific (like real-time prices), acknowledge that and guide the student to check the platform listings.`;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 768,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "Sorry, I could not generate a response.";
    return NextResponse.json({ message: reply });
  } catch (error) {
    console.error("Groq API error:", error);
    return NextResponse.json(
      { error: "Failed to get a response. Please try again." },
      { status: 500 }
    );
  }
}
