"use client";

import { useState } from "react";
import { AppSettings, DEFAULT_SETTINGS } from "../hooks/useSettings";

type Props = {
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
  onReset: () => void;
  onClose: () => void;
};

export default function SettingsModal({ settings, onSave, onReset, onClose }: Props) {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!draft.apiKey.trim()) {
      setError("API key is required.");
      return;
    }
    setError(null);
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setDraft(DEFAULT_SETTINGS);
    onReset();
    setSaved(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* API Key */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">API Key</h3>
            <input
              type="password"
              value={draft.apiKey}
              onChange={(e) => set("apiKey", e.target.value)}
              placeholder="gsk_..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
            <p className="text-xs text-gray-400">Stored in localStorage only. Never sent to any server except Groq.</p>
          </section>

          {/* Prompts */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Prompts</h3>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Live Suggestions Prompt</label>
              <textarea
                rows={8}
                value={draft.suggestPrompt}
                onChange={(e) => set("suggestPrompt", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-mono outline-none focus:border-gray-400 resize-y"
              />
              <p className="text-xs text-gray-400">Use <code className="bg-gray-100 px-1 rounded">{"{transcript}"}</code> as the placeholder for injected transcript text.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500">Chat System Prompt</label>
              <textarea
                rows={6}
                value={draft.chatPrompt}
                onChange={(e) => set("chatPrompt", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-mono outline-none focus:border-gray-400 resize-y"
              />
            </div>
          </section>

          {/* Context Settings */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Context Settings</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Suggestion context (entries)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={draft.suggestContextWindow}
                  onChange={(e) => set("suggestContextWindow", Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Chat context (entries)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={draft.chatContextWindow}
                  onChange={(e) => set("chatContextWindow", Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-500">Chat history limit</label>
                <input
                  type="number"
                  min={2}
                  max={20}
                  value={draft.chatHistoryLimit}
                  onChange={(e) => set("chatHistoryLimit", Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          <button
            onClick={handleReset}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Reset to defaults
          </button>
          <div className="flex items-center gap-3">
            {error && <span className="text-sm text-red-400">{error}</span>}
            {saved && <span className="text-sm text-green-500">Settings saved</span>}
            <button
              onClick={handleSave}
              className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
