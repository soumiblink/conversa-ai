# Conversa AI

> Real-time AI meeting copilot that listens, understands, and suggests what to say next.

---

## Demo

- **Live app:** _coming soon_
- **Demo video:** _coming soon_

---

## Features

- **Real-time transcription** — audio chunked every 30s and transcribed via Groq Whisper Large V3
- **Live suggestions** — 3 context-aware suggestions generated per batch, each serving a distinct purpose
- **Suggestion batching** — newest batch always on top, older batches preserved for reference
- **Click-to-chat** — click any suggestion to expand it into a detailed AI response in the chat panel
- **Context-aware chat** — full conversation memory using recent transcript + chat history
- **Auto-refresh** — suggestions regenerate automatically every 30 seconds while recording
- **Settings panel** — customize prompts, context window size, and API key without redeploying
- **Session export** — download full session as structured JSON (transcript + suggestions + chat)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS v4 |
| Backend | Next.js API Routes (Edge-compatible) |
| Transcription | Groq Whisper Large V3 |
| Suggestions + Chat | Groq `llama-3.3-70b-versatile` |
| Storage | None (stateless, localStorage for settings only) |

---

## How It Works

```
Microphone
  └─ MediaRecorder (30s chunks)
       └─ /api/transcribe  →  Whisper Large V3
            └─ Transcript state (displayed + stored in ref)
                 └─ /api/suggest  →  LLM  →  3 structured suggestions
                      └─ Click suggestion
                           └─ /api/chat  →  LLM  →  detailed response
```

1. Browser captures audio via `MediaRecorder` in 30-second chunks
2. Each chunk is sent as `multipart/form-data` to `/api/transcribe`
3. Whisper returns text which is appended to the transcript with a timestamp
4. Every 30 seconds (or on manual refresh), recent transcript entries are sent to `/api/suggest`
5. The model returns exactly 3 typed suggestions as JSON
6. Clicking a suggestion sends it + transcript context + chat history to `/api/chat`
7. The model returns a detailed, actionable response

---

## Prompt Engineering Strategy

### Why exactly 3 suggestions

Three is the minimum number that covers meaningfully different response strategies without overwhelming the user mid-conversation. More than three creates decision fatigue; fewer than three limits perspective.

### Why each suggestion has a distinct role

| Type | Purpose |
|---|---|
| `question` | Moves the conversation forward — something not yet addressed |
| `insight` | Adds a non-obvious angle or reframing the user can raise |
| `next_step` | Concrete action — push back, confirm a detail, or propose what happens next |

Each type is explicitly defined in the prompt with a different behavioral contract. This prevents the model from generating three variations of the same idea.

### How prompts enforce quality

- **Non-generic outputs** — the prompt explicitly bans phrases like "consider following up" and "make sure to clarify"
- **Brevity** — each suggestion capped at 18 words, enforced in the prompt rules
- **Actionability** — every suggestion must sound like something a human would actually say, not an observation
- **Differentiation** — all 3 must address different aspects of the conversation

### Context window decisions

- **Transcript:** last 5 entries only — recent context is more relevant than full history, and shorter prompts reduce latency and cost
- **Chat history:** last 6 messages — enough for continuity without overloading the context window
- Both limits are configurable in the Settings panel

---

## Key Design Decisions & Tradeoffs

**Last N transcript entries instead of full transcript**
Sending the full transcript grows unbounded and increases latency. The last 5 entries capture the active thread of conversation, which is what matters for real-time suggestions.

**No database**
Stateless design means zero infrastructure overhead. Session data lives in React state and can be exported as JSON. This is intentional — the app is a real-time tool, not a record-keeping system.

**Manual + auto refresh**
Auto-refresh (every 30s while recording) gives a real-time feel. Manual refresh gives the user control when they want suggestions on-demand. Both coexist without conflict via a concurrency lock (`isSuggestingRef`).

**Prompt configurability**
Prompts are editable in the Settings panel and stored in localStorage. This allows rapid iteration on prompt strategy without touching code or redeploying.

**Stale closure prevention**
The interval callback uses `transcriptRef.current` instead of the `transcript` state variable directly. This is a critical implementation detail — without it, the auto-refresh would always use the transcript from when recording started.

---

## UX Considerations

- **Real-time feel** — batching + auto-refresh creates a continuous feed without WebSockets
- **Loading states** — "Transcribing...", "Generating suggestions...", "Thinking..." keep the user informed
- **Auto-scroll** — transcript and chat panels scroll to the latest entry automatically
- **Minimal UI** — three-column layout with no sidebars or modals in the main flow
- **Dark mode** — reduces eye strain for extended meeting use

---

## Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd conversa-ai

# 2. Install dependencies
npm install

# 3. Add your Groq API key
echo "GROQ_API_KEY=gsk_your_key_here" > .env.local

# 4. Start the dev server
npm run dev
```

Get a free API key at [console.groq.com](https://console.groq.com).

Alternatively, paste your API key directly in the app via **Settings** — it will be stored in localStorage and sent with each request.

---

## Deployment

The app deploys to Vercel with zero configuration.

```bash
vercel deploy
```

Add `GROQ_API_KEY` as an environment variable in the Vercel dashboard, or let users supply their own key via the Settings panel.

---

## Session Export

Clicking **Export** downloads a JSON file with the full session:

```json
{
  "metadata": {
    "app": "Conversa AI",
    "version": "1.0",
    "generatedAt": "2025-04-21T10:30:00.000Z"
  },
  "transcript": [
    { "text": "...", "timestamp": "10:00 AM" }
  ],
  "suggestions": [
    {
      "timestamp": "10:01 AM",
      "items": [
        { "type": "question", "text": "..." },
        { "type": "insight", "text": "..." },
        { "type": "next_step", "text": "..." }
      ]
    }
  ],
  "chat": [
    { "role": "user", "text": "...", "timestamp": "10:02 AM" },
    { "role": "assistant", "text": "...", "timestamp": "10:02 AM" }
  ]
}
```

Useful for post-meeting review, prompt evaluation, and fine-tuning data collection.

---

## Future Improvements

- **Conversation-type detection** — adapt suggestion strategy based on whether it's a sales call, interview, or brainstorm
- **Smarter suggestion ranking** — score suggestions by relevance before displaying
- **Multi-language support** — Whisper supports 99 languages; the suggestion/chat prompts can be localized
- **Voice response** — read out suggestions via Web Speech API for hands-free use
- **Persistent sessions** — optional local storage or export-on-stop for longer meetings

---

## License

MIT
