import { TranscriptEntry } from "../hooks/useMicrophone";
import { SuggestionBatch } from "../components/SuggestionsPanel";
import { ChatMessage } from "../components/ChatPanel";

type ExportPayload = {
  transcript: TranscriptEntry[];
  suggestions: SuggestionBatch[];
  chat: ChatMessage[];
};

export function exportSession({ transcript, suggestions, chat }: ExportPayload): string | null {
  if (!transcript.length && !suggestions.length && !chat.length) {
    return "No data to export.";
  }

  const data = {
    metadata: {
      app: "Conversa AI",
      version: "1.0",
      generatedAt: new Date().toISOString(),
    },
    transcript,
    suggestions,
    chat,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

 
  const ts = new Date().toISOString().replace(/:/g, "-").split(".")[0];
  const filename = `conversa-session-${ts}.json`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  
  a.remove();
  URL.revokeObjectURL(url);

  return null;
}
