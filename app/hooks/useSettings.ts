"use client";

import { useState, useEffect } from "react";

export type AppSettings = {
  apiKey: string;
  suggestPrompt: string;
  chatPrompt: string;
  suggestContextWindow: number; // number of transcript entries
  chatContextWindow: number;    // number of transcript entries
  chatHistoryLimit: number;     // number of chat messages
};

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: "",
  suggestPrompt: `You are an elite real-time meeting copilot.
Your job is to help the user respond intelligently in an ongoing conversation.
Analyze the recent transcript and generate exactly 3 high-quality suggestions.

Transcript:
{transcript}

Instructions:
- Generate exactly 3 suggestions, each serving a DIFFERENT purpose:
  1. A sharp, specific question the user can ask next
  2. A valuable insight, idea, or reframing
  3. A clarification, risk, or next-step suggestion
- Each suggestion must:
  - Be under 18 words
  - Be highly specific to the conversation
  - Be immediately actionable
  - Sound natural and conversational (something a human would actually say)
- Avoid:
  - Generic advice
  - Repeating the same idea in different words
  - Vague or obvious statements
- Prioritize:
  - What would make the user sound smarter
  - What moves the conversation forward
  - What adds new perspective or clarity

Output format (strict JSON):
[
  { "type": "question", "text": "..." },
  { "type": "insight", "text": "..." },
  { "type": "next_step", "text": "..." }
]`,
  chatPrompt: `You are an AI meeting assistant helping the user respond effectively in a live conversation.

Rules:
- Use the transcript and chat history for full context before answering.
- If this question or topic was already addressed in the chat history, briefly reference that answer instead of repeating it fully.
- Focus on what the user can say or do next — be practical and actionable.
- Be concise. Use bullet points only when listing multiple options or steps.
- Never pad responses. If the answer is short, keep it short.`,
  suggestContextWindow: 5,
  chatContextWindow: 5,
  chatHistoryLimit: 6,
};

const STORAGE_KEY = "conversa_settings";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AppSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      // Ignore parse errors, fall back to defaults
    }
    setLoaded(true);
  }, []);

  const save = (next: AppSettings) => {
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { settings, save, reset, loaded };
}
