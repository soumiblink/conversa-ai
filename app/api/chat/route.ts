import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const DEFAULT_SYSTEM_PROMPT = `You are an AI meeting assistant helping the user respond effectively in a live conversation.

Rules:
- Use the transcript and chat history for full context before answering.
- If this question or topic was already addressed in the chat history, briefly reference that answer instead of repeating it fully.
- Focus on what the user can say or do next — be practical and actionable.
- Be concise. Use bullet points only when listing multiple options or steps.
- Never pad responses. If the answer is short, keep it short.`;

export async function POST(req: NextRequest) {
  try {
    const { transcript, message, chatHistory, prompt, contextWindow, chatHistoryLimit, apiKey } =
      await req.json();

    if (!message) {
      return NextResponse.json({ error: "No message provided." }, { status: 400 });
    }

    const groq = new Groq({ apiKey: apiKey || process.env.GROQ_API_KEY });

    const txWindow = contextWindow ?? 5;
    const histLimit = chatHistoryLimit ?? 6;

    const recentTranscript = (transcript ?? [])
      .slice(-txWindow)
      .map((e: { text: string; timestamp: string }) => `[${e.timestamp}] ${e.text}`)
      .join("\n") || "(no transcript yet)";

    const historyMessages = (chatHistory ?? [])
      .slice(-histLimit)
      .map((m: { role: string; text: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.text,
      }));

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: prompt || DEFAULT_SYSTEM_PROMPT },
        { role: "user", content: `Meeting transcript (recent):\n${recentTranscript}` },
        ...historyMessages,
        { role: "user", content: message },
      ],
      temperature: 0.5,
    });

    const text = completion.choices[0]?.message?.content ?? "No response generated.";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("Chat error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to generate response: ${message}` }, { status: 500 });
  }
}
