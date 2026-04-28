import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const DEFAULT_PROMPT = `You are a real-time meeting assistant helping the user respond effectively in an ongoing conversation.
Based on the recent transcript, generate exactly 3 suggestions focused on what the user can say or do next.

Transcript:
{transcript}

Rules:
- Suggestion 1 (type: "question"): A specific question the user can ask RIGHT NOW to move the conversation forward. Must be something not yet addressed.
- Suggestion 2 (type: "insight"): A talking point or angle the user can raise — a non-obvious implication or connection they can speak to.
- Suggestion 3 (type: "next_step"): A concrete response move — e.g. push back on an assumption, confirm a detail, or propose a clear next step the user can verbalize.
- Each suggestion must feel like something the user could actually say next, not just observe.
- Each under 20 words.
- Be specific to the conversation — no generic filler.
- All 3 must address different aspects of the conversation.

Output ONLY valid JSON in this exact format, no extra text:
[
  { "type": "question", "text": "..." },
  { "type": "insight", "text": "..." },
  { "type": "next_step", "text": "..." }
]`;

export async function POST(req: NextRequest) {
  try {
    const { transcript, prompt, contextWindow, apiKey } = await req.json();

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: "Transcript is empty." }, { status: 400 });
    }

    const groq = new Groq({ apiKey: apiKey || process.env.GROQ_API_KEY });

    const window = contextWindow ?? 5;
    const recent = transcript.slice(-window);
    const recentText = recent
      .map((e: { text: string; timestamp: string }) => `[${e.timestamp}] ${e.text}`)
      .join("\n");

    const activePrompt = (prompt || DEFAULT_PROMPT).replace("{transcript}", recentText);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: activePrompt }],
      temperature: 0.7,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) {
      return NextResponse.json({ error: "Invalid model response." }, { status: 500 });
    }

    const suggestions = JSON.parse(match[0]).map((item: { type: string; text: string }) => ({
      
      type: item.type === "clarification" ? "next_step" : item.type,
      text: item.text,
    }));
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("Suggest error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to generate suggestions: ${message}` }, { status: 500 });
  }
}
