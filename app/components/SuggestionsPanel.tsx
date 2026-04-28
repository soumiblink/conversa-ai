"use client";

import { TranscriptEntry } from "../hooks/useMicrophone";
import { AppSettings } from "../hooks/useSettings";

export type SuggestionItem = {
  type: "question" | "insight" | "next_step";
  text: string;
};

export type SuggestionBatch = {
  timestamp: string;
  items: SuggestionItem[];
};

const typeBadge: Record<string, string> = {
  question:  "bg-blue-500/10 text-blue-400",
  insight:   "bg-green-500/10 text-green-400",
  next_step: "bg-purple-500/10 text-purple-400",
};

async function fetchSuggestions(
  transcript: TranscriptEntry[],
  settings: Pick<AppSettings, "apiKey" | "suggestPrompt" | "suggestContextWindow">
): Promise<SuggestionItem[]> {
  const res = await fetch("/api/suggest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transcript,
      prompt: settings.suggestPrompt,
      contextWindow: settings.suggestContextWindow,
      apiKey: settings.apiKey,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Suggestions failed.");
  return data.suggestions as SuggestionItem[];
}

type Props = {
  transcript: TranscriptEntry[];
  suggestions: SuggestionBatch[];
  isSuggesting: boolean;
  isAutoRefreshing: boolean;
  error: string | null;
  onRefresh: () => void;
  onSuggestionClick: (text: string) => void;
};

export default function SuggestionsPanel({
  transcript,
  suggestions,
  isSuggesting,
  isAutoRefreshing,
  error,
  onRefresh,
  onSuggestionClick,
}: Props) {
  return (
    <div className="flex flex-1 flex-col bg-neutral-900 rounded-xl border border-neutral-800 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Suggestions</h2>
          {isAutoRefreshing && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Auto-updating
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={isSuggesting || transcript.length === 0}
          className="rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 text-xs font-medium hover:bg-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isSuggesting ? "Generating..." : "Refresh"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {isSuggesting && (
          <p className="text-sm text-yellow-400 animate-pulse">Generating suggestions...</p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!isSuggesting && suggestions.length === 0 && !error && (
          <p className="text-sm text-neutral-500">Start speaking to get suggestions.</p>
        )}

        {suggestions.map((batch, bi) => (
          <div key={bi} className="space-y-2">
            <p className="text-xs text-neutral-500">{batch.timestamp}</p>

            {batch.items.map((item, ii) => (
              <button
                key={ii}
                onClick={() => onSuggestionClick(item.text)}
                className="w-full text-left rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2.5 hover:bg-neutral-700 hover:shadow-md transition-all cursor-pointer"
              >
                <span className={`inline-block rounded-md px-1.5 py-0.5 text-xs font-medium mb-1.5 ${typeBadge[item.type] ?? "bg-neutral-700 text-neutral-400"}`}>
                  {item.type.replace("_", " ")}
                </span>
                <p className="text-sm text-neutral-200 leading-relaxed">{item.text}</p>
              </button>
            ))}

            {bi < suggestions.length - 1 && <hr className="border-neutral-800" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export { fetchSuggestions };
