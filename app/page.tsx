"use client";

import { useEffect, useRef, useState } from "react";
import { useMicrophone, TranscriptEntry } from "./hooks/useMicrophone";

async function transcribeChunk(blob: Blob): Promise<string> {
  // Wrap blob in a File so the API route can read it
  const file = new File([blob], "audio.webm", { type: blob.type || "audio/webm" });
  const form = new FormData();
  form.append("audio", file);

  const res = await fetch("/api/transcribe", { method: "POST", body: form });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error ?? "Transcription failed.");
  return data.text as string;
}

export default function Home() {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest transcript entry
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const handleChunk = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const text = await transcribeChunk(blob);
      const timestamp = new Date().toLocaleTimeString();
      setTranscript((prev) => [...prev, { text, timestamp }]);
    } catch (err) {
      console.error("Transcription error:", err);
      const timestamp = new Date().toLocaleTimeString();
      setTranscript((prev) => [
        ...prev,
        { text: "[Transcription failed for this chunk]", timestamp },
      ]);
    } finally {
      setIsTranscribing(false);
    }
  };

  const { isRecording, error, start, stop } = useMicrophone({ onChunk: handleChunk });

  return (
    <div className="flex h-screen overflow-hidden bg-white text-gray-800">
      {/* Column 1 - Transcript */}
      <div className="flex flex-1 flex-col border-r border-gray-200">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Transcript</h2>
        </div>

        {/* Mic controls */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
          <button
            onClick={isRecording ? stop : start}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${
              isRecording ? "bg-red-500 hover:bg-red-600" : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>

          {isRecording && (
            <span className="flex items-center gap-1.5 text-sm text-red-500">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Recording...
            </span>
          )}

          {isTranscribing && (
            <span className="text-sm text-gray-400">Transcribing...</span>
          )}

          {error && <span className="text-sm text-red-400">{error}</span>}
        </div>

        {/* Transcript entries */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {transcript.length === 0 && (
            <p className="text-sm text-gray-400">Transcript will appear here...</p>
          )}
          {transcript.map((entry, i) => (
            <div key={i} className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-400 mb-1">{entry.timestamp}</p>
              <p className="text-sm text-gray-700">{entry.text}</p>
            </div>
          ))}
          <div ref={transcriptEndRef} />
        </div>
      </div>

      {/* Column 2 - Suggestions */}
      <div className="flex flex-1 flex-col border-r border-gray-200">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Suggestions</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Suggestion cards go here */}
        </div>
      </div>

      {/* Column 3 - Chat */}
      <div className="flex flex-1 flex-col">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Chat</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Chat messages go here */}
        </div>
        <div className="border-t border-gray-200 p-4">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>
      </div>
    </div>
  );
}
