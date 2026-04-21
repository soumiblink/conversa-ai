"use client";

import { TranscriptEntry } from "../hooks/useMicrophone";
import { AppSettings } from "../hooks/useSettings";

export type SuggestionItem = {
  type: "question" | "insight" | "clarification" | "next_step";
  text: string;
};

export type SuggestionBatch = {
  timestamp: string;
  items: SuggestionItem[];
};

const typeBadge: Record<string, string> = {
  question:      "bg-blue-100 text-blue-700",
  insight:       "bg-green-100 text-green-700",
  clarification: "bg-yellow-100 text-yellow-700",
  next_step:     "bg-purple-100 text-purple-700",
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
    <div className="flex flex-1 flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Suggestions</h2>
          {isAutoRefreshing && (
            <span className="flex items-center gap-1 text-xs text-green-500">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              Auto-updating
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          disabled={isSuggesting || isAutoRefreshing || transcript.length === 0}
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isSuggesting ? "Generating..." : "Refresh"}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {isSuggesting && (
          <p className="text-sm text-gray-400 animate-pulse">Generating suggestions...</p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!isSuggesting && suggestions.length === 0 && !error && (
          <p className="text-sm text-gray-400">Start speaking to get suggestions.</p>
        )}

        {suggestions.map((batch, bi) => (
          <div key={bi} className="space-y-2">
            <p className="text-xs text-gray-400">{batch.timestamp}</p>

            {batch.items.map((item, ii) => (
              <button
                key={ii}
                onClick={() => onSuggestionClick(item.text)}
                className="w-full text-left rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer"
              >
                <span className={`inline-block rounded-md px-1.5 py-0.5 text-xs font-medium mb-1.5 ${typeBadge[item.type] ?? "bg-gray-100 text-gray-500"}`}>
                  {item.type.replace("_", " ")}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">{item.text}</p>
              </button>
            ))}

            {bi < suggestions.length - 1 && <hr className="border-gray-100" />}
          </div>
        ))}
      </div>
    </div>
  );
}

export { fetchSuggestions };
