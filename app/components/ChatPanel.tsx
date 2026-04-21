"use client";

import { useEffect, useRef, useState } from "react";
import { TranscriptEntry } from "../hooks/useMicrophone";
import { AppSettings } from "../hooks/useSettings";

export type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  timestamp: string;
};

async function fetchChatResponse(
  message: string,
  transcript: TranscriptEntry[],
  chatHistory: ChatMessage[],
  settings: Pick<AppSettings, "apiKey" | "chatPrompt" | "chatContextWindow" | "chatHistoryLimit">
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      transcript,
      chatHistory,
      prompt: settings.chatPrompt,
      contextWindow: settings.chatContextWindow,
      chatHistoryLimit: settings.chatHistoryLimit,
      apiKey: settings.apiKey,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Chat failed.");
  return data.text as string;
}

type Props = {
  chat: ChatMessage[];
  onSend: (text: string) => void;
  isThinking: boolean;
};

export default function ChatPanel({ chat, onSend, isThinking }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;
    onSend(trimmed);
    setInput("");
  };

  return (
    <div className="flex flex-1 flex-col bg-neutral-900 rounded-xl border border-neutral-800 shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-800">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.length === 0 && (
          <p className="text-sm text-neutral-500">Click a suggestion or type a question.</p>
        )}

        {chat.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-0.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-800 text-neutral-100 border border-neutral-700"
              }`}
            >
              {msg.text.split("\n").map((line, li) => (
                <p key={li} className={li > 0 && line !== "" ? "mt-1" : undefined}>
                  {line}
                </p>
              ))}
            </div>
            <span className="text-xs text-neutral-500 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-start">
            <div className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-yellow-400 animate-pulse">
              Thinking...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-neutral-800 p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a question..."
          disabled={isThinking}
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-all"
        />
        <button
          type="submit"
          disabled={isThinking || !input.trim()}
          className="rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-2 text-sm font-medium hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export { fetchChatResponse };
