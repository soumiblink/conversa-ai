"use client";

import { useRef, useState } from "react";

export function useMicrophone() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = async () => {
    setError(null);

    // Check browser support
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Microphone not supported in this browser.");
      return;
    }

    try {
      // Request mic permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      // Log each audio chunk as it arrives
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          console.log("Audio chunk received:", e.data);
        }
      };

      // Start recording, emit a chunk every 30 seconds
      recorder.start(30000);
      setIsRecording(true);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone permission denied.");
      } else {
        setError("Failed to start recording.");
      }
    }
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    // Stop all tracks to release the mic
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
  };

  return { isRecording, error, start, stop };
}
