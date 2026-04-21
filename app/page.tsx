"use client";

import { useEffect, useRef, useState } from "react";
import { useMicrophone, TranscriptEntry } from "./hooks/useMicrophone";
import { useSettings } from "./hooks/useSettings";
import SuggestionsPanel, { SuggestionBatch, fetchSuggestions } from "./components/SuggestionsPanel";
import ChatPanel, { ChatMessage, fetchChatResponse } from "./components/ChatPanel";
import SettingsModal from "./components/SettingsModal";
import { exportSession } from "./utils/exportSession";

async function transcribeChunk(blob: Blob): Promise<string> {
  const file = new File([blob], "audio.webm", { type: blob.type || "audio/webm" });
  const form = new FormData();
  form.append("audio", file);
  const res = await fetch("/api/transcribe", { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "Transcription failed.");
  return data.text as string;
}

const SUGGEST_INTERVAL_MS = 30000;

export default function Home() {
  const { settings, save, reset, loaded } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionBatch[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const settingsRef = useRef(settings);
  const isSuggestingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);
  useEffect(() => {
    if (loaded && !settings.apiKey) setShowSettings(true);
  }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const runSuggestions = async (isAuto = false) => {
    if (isSuggestingRef.current) return;
    if (transcriptRef.current.length === 0) return;
    isSuggestingRef.current = true;
    setSuggestError(null);
    setIsSuggesting(true);
    try {
      const items = await fetchSuggestions(transcriptRef.current, settingsRef.current);
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setSuggestions((prev) => [{ timestamp, items }, ...prev]);
    } catch {
      if (!isAuto) setSuggestError("Could not generate suggestions.");
    } finally {
      isSuggestingRef.current = false;
      setIsSuggesting(false);
    }
  };

  const handleExport = () => {
    const err = exportSession({ transcript, suggestions, chat });
    setExportError(err);
    if (err) setTimeout(() => setExportError(null), 3000);
  };

  const handleSend = async (text: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setChat((prev) => [...prev, { role: "user", text, timestamp }]);
    setIsThinking(true);
    try {
      const response = await fetchChatResponse(text, transcriptRef.current, chat, settingsRef.current);
      const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setChat((prev) => [...prev, { role: "assistant", text: response, timestamp: ts }]);
    } catch {
      const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setChat((prev) => [...prev, { role: "assistant", text: "Something went wrong.", timestamp: ts }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleChunk = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const text = await transcribeChunk(blob);
      const timestamp = new Date().toLocaleTimeString();
      setTranscript((prev) => [...prev, { text, timestamp }]);
    } catch {
      const timestamp = new Date().toLocaleTimeString();
      setTranscript((prev) => [...prev, { text: "[Transcription failed, try again]", timestamp }]);
    } finally {
      setIsTranscribing(false);
    }
  };

  const { isRecording, error: micError, start, stop } = useMicrophone({ onChunk: handleChunk });

  useEffect(() => {
    if (isRecording) {
      setIsAutoRefreshing(true);
      intervalRef.current = setInterval(() => runSuggestions(true), SUGGEST_INTERVAL_MS);
    } else {
      setIsAutoRefreshing(false);
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRecording]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={(s) => { save(s); setShowSettings(false); }}
          onReset={reset}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-3 bg-neutral-900 border-b border-neutral-800 shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-white">Conversa AI</h1>
            <p className="text-xs text-neutral-400">Real-time conversation intelligence</p>
          </div>
          <div className="flex items-center gap-4">
            {exportError && <span className="text-xs text-red-400">{exportError}</span>}
            <button
              onClick={handleExport}
              disabled={!transcript.length && !suggestions.length && !chat.length}
              className="text-xs text-neutral-400 hover:text-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Export
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="text-xs text-neutral-400 hover:text-neutral-100 transition-colors"
            >
              Settings
            </button>
          </div>
        </header>

        {/* Columns */}
        <div className="flex flex-1 overflow-hidden gap-4 p-4">

          {/* Transcript */}
          <div className="flex flex-1 flex-col bg-neutral-900 rounded-xl border border-neutral-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Transcript</h2>
              <div className="flex items-center gap-2">
                {isTranscribing && <span className="text-xs text-yellow-400 animate-pulse">Transcribing...</span>}
                {micError && <span className="text-xs text-red-400">{micError}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
              <button
                onClick={isRecording ? stop : start}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isRecording
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                    : "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30"
                }`}
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </button>
              {isRecording && (
                <span className="flex items-center gap-1.5 text-xs text-red-400">
                  <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                  Recording...
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {transcript.length === 0 && (
                <p className="text-sm text-neutral-500">Transcript will appear here...</p>
              )}
              {transcript.map((entry, i) => (
                <div key={i} className="rounded-lg border border-neutral-800 bg-neutral-800/50 px-3 py-2">
                  <p className="text-xs text-neutral-500 mb-1">{entry.timestamp}</p>
                  <p className="text-sm text-neutral-200 leading-relaxed">{entry.text}</p>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>

          <SuggestionsPanel
            transcript={transcript}
            suggestions={suggestions}
            isSuggesting={isSuggesting}
            isAutoRefreshing={isAutoRefreshing}
            error={suggestError}
            onRefresh={() => runSuggestions(false)}
            onSuggestionClick={handleSend}
          />

          <ChatPanel
            chat={chat}
            onSend={handleSend}
            isThinking={isThinking}
          />
        </div>
      </div>
    </>
  );
}
