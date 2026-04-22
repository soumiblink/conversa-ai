# Conversa AI

**Real-time AI meeting copilot that listens, understands, and suggests what to say next.**

---

## 🚀 Demo

🔗 Live App: https://conversa-ai-three.vercel.app/

---

## ✨ Overview

Conversa AI is a real-time meeting assistant that listens to conversations, transcribes them, and continuously generates intelligent suggestions to help users respond more effectively.

The system is designed to surface the **right information at the right time**, making conversations more productive, insightful, and actionable.

---


## 📸 Screenshots

![Main Interface](./public/screenshots/Screenshot%202026-04-22%20203407.png)

![Suggestions Panel](./public/screenshots/Screenshot%202026-04-22%20203421.png)

![Chat Response](./public/screenshots/Screenshot%202026-04-22%20203458.png)

---


## ⚡ Key Features

### 🎤 Real-Time Transcription

* Captures mic input using MediaRecorder
* Processes audio in chunks (~30 seconds)
* Uses **Whisper Large V3 (via Groq)** for fast and accurate transcription

### 💡 Live Suggestions Engine

* Generates **exactly 3 suggestions per cycle**
* Each suggestion has a distinct role:

  * Smart question
  * Insight or reframing
  * Clarification or next step
* Suggestions update automatically and are batched (newest first)

### 🔄 Real-Time Experience

* Auto-refresh every ~30 seconds
* Manual refresh option
* Continuous suggestion feed with history

### 💬 Context-Aware Chat

* Click any suggestion → expands into detailed response
* Users can also ask custom questions
* Chat uses:

  * Recent transcript
  * Recent chat history
* Maintains context across multiple turns

### ⚙️ Custom Settings Panel

* User-provided Groq API key
* Editable prompts for:

  * Suggestions
  * Chat
* Adjustable context windows:

  * Transcript length
  * Chat memory

### 📤 Export Session

* Download full session as JSON:

  * Transcript
  * All suggestion batches
  * Chat history
* Includes timestamps for evaluation

---

## 🧠 How It Works

```
User speaks → Audio captured → Transcription → Context extraction  
→ Suggestions generated → User clicks → Chat response generated
```

### Flow:

1. Audio is captured via mic and chunked (~30s)
2. Sent to `/api/transcribe` → Whisper model
3. Transcript stored and displayed
4. Recent transcript sent to `/api/suggest`
5. AI returns 3 structured suggestions
6. On click → `/api/chat` generates detailed response

---

## 🧪 Prompt Engineering Strategy

This project focuses heavily on **prompt quality**, as it directly determines output usefulness.

### 🎯 Why exactly 3 suggestions?

* Reduces cognitive overload
* Forces prioritization
* Ensures clarity and usability

### 🧩 Structured Suggestion Types

Each batch enforces diversity:

* **Question** → drives conversation forward
* **Insight** → adds value or reframing
* **Next Step** → enables action

### ⚡ Constraints for Quality

Prompts enforce:

* Brevity (<18 words)
* Context-awareness
* Non-generic outputs
* Actionable phrasing

### 🧠 Context Strategy

* Only **recent transcript** is used → improves relevance + reduces latency
* Limited **chat history (last 4–6 messages)** → avoids noise
* Timestamp formatting improves temporal understanding

---

## ⚖️ Key Design Decisions & Tradeoffs

| Decision                | Reason                                         |
| ----------------------- | ---------------------------------------------- |
| Limited context window  | Faster response + more relevant suggestions    |
| No database             | Simpler architecture, faster iteration         |
| Batch-based suggestions | Feels real-time without overloading UI         |
| Prompt configurability  | Enables rapid experimentation without redeploy |
| Manual + auto refresh   | Balance between control and automation         |

---

## 🎨 UX Considerations

* Real-time feel via batching + auto-refresh
* Clear loading states:

  * “Transcribing…”
  * “Generating suggestions…”
  * “Thinking…”
* Auto-scroll for transcript and chat
* Minimal UI to reduce cognitive load
* Dark mode for better long-session usability

---

## 🛠️ Tech Stack

**Frontend:**

* Next.js
* React
* Tailwind CSS

**Backend:**

* Next.js API Routes

**AI / Models (via Groq):**

* Whisper Large V3 → Transcription
* GPT-OSS 120B → Suggestions + Chat

---

## ⚙️ Setup Instructions

```bash
git clone <your-repo>
cd conversa-ai
npm install
```

Create `.env.local`:

```
GROQ_API_KEY=your_api_key_here
```

Run the app:

```bash
npm run dev
```

---

## 🌐 Deployment

* Deployed on Vercel
* Works with user-provided API key
* No backend persistence required

---

## 📤 Export Format

```json
{
  "metadata": {
    "app": "Conversa AI",
    "version": "1.0",
    "generatedAt": "timestamp"
  },
  "transcript": [...],
  "suggestions": [...],
  "chat": [...]
}
```

---

## 🔮 Future Improvements

* Conversation type detection (planning, Q&A, brainstorming)
* Smarter suggestion ranking
* Multi-language transcription + suggestions
* Voice-based AI responses
* Real-time streaming suggestions (lower latency)

---

## 💡 Final Note

This project focuses not just on building features, but on designing an AI system that is **useful in real-time conversations**.

The biggest challenge—and key differentiator—was:

> **Generating the right suggestions at the right moment, not just any suggestions.**

---
