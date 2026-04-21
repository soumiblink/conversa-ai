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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Settings</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-100 text-lg leading-none transition-colors">✕</button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* API Key */}
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">API Key</h3>
            <input
              type="password"
              value={draft.apiKey}
              onChange={(e) => set("apiKey", e.target.value)}
              placeholder="gsk_..."
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-neutral-500">Stored in localStorage only. Never sent anywhere except Groq.</p>
          </section>

          {/* Prompts */}
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Prompts</h3>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Live Suggestions Prompt</label>
              <textarea
                rows={8}
                value={draft.suggestPrompt}
                onChange={(e) => set("suggestPrompt", e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-mono text-neutral-100 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
              <p className="text-xs text-neutral-500">Use <code className="bg-neutral-800 px-1 rounded text-neutral-300">{"{transcript}"}</code> as the placeholder for injected transcript text.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Chat System Prompt</label>
              <textarea
                rows={6}
                value={draft.chatPrompt}
                onChange={(e) => set("chatPrompt", e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-mono text-neutral-100 placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
          </section>

          {/* Context Settings */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Context Settings</h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Suggestion context (entries)", key: "suggestContextWindow" },
                { label: "Chat context (entries)", key: "chatContextWindow" },
                { label: "Chat history limit", key: "chatHistoryLimit" },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs text-neutral-400">{label}</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={draft[key as keyof AppSettings] as number}
                    onChange={(e) => set(key as keyof AppSettings, Number(e.target.value) as AppSettings[keyof AppSettings])}
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-800 px-6 py-4">
          <button
            onClick={handleReset}
            className="text-sm text-neutral-500 hover:text-neutral-300 underline transition-colors"
          >
            Reset to defaults
          </button>
          <div className="flex items-center gap-3">
            {error && <span className="text-sm text-red-400">{error}</span>}
            {saved && <span className="text-sm text-green-400">Settings saved</span>}
            <button
              onClick={handleSave}
              className="rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-2 text-sm font-medium hover:bg-blue-500/30 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
