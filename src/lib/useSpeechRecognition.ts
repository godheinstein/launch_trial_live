import { useCallback, useEffect, useRef, useState } from "react";

/* Minimal type shape for the Web Speech API. The API isn't in lib.dom.d.ts
 * by default; we declare just what we need here. */
type SR = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult:
    | ((event: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
};

type SRConstructor = new () => SR;

function getRecognitionCtor(): SRConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SRConstructor;
    webkitSpeechRecognition?: SRConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface Options {
  /** Fired when the user finishes speaking and the final transcript is in. */
  onFinal?: (text: string) => void;
  /** Fired with intermediate text as the user speaks (if interim results enabled). */
  onInterim?: (text: string) => void;
  lang?: string;
}

/**
 * Browser-native speech-to-text. No backend, no audio leaves the device.
 * Returns `supported: false` on browsers without the Web Speech API
 * (Firefox, some mobile) so the caller can render a typed-input fallback.
 */
export function useSpeechRecognition({
  onFinal,
  onInterim,
  lang = "en-US",
}: Options = {}) {
  const Ctor = getRecognitionCtor();
  const supported = Ctor !== null;
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<SR | null>(null);

  // Keep callbacks in refs so we can update them without rebuilding the recognizer.
  const onFinalRef = useRef(onFinal);
  const onInterimRef = useRef(onInterim);
  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);
  useEffect(() => {
    onInterimRef.current = onInterim;
  }, [onInterim]);

  useEffect(() => {
    return () => {
      try {
        ref.current?.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  const start = useCallback(() => {
    if (!Ctor) return;
    if (ref.current) {
      try {
        ref.current.abort();
      } catch {
        // ignore
      }
    }
    const rec = new Ctor();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = lang;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = (event) => {
      setError(event?.error ?? "speech-error");
      setListening(false);
    };
    rec.onresult = (event) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (result.isFinal) finalChunk += transcript;
        else interimChunk += transcript;
      }
      if (interimChunk && onInterimRef.current) {
        onInterimRef.current(interimChunk);
      }
      if (finalChunk && onFinalRef.current) {
        onFinalRef.current(finalChunk.trim());
      }
    };
    ref.current = rec;
    setError(null);
    try {
      rec.start();
    } catch (err) {
      // Calling start() while already running throws; surface a friendlier message.
      setError(err instanceof Error ? err.message : "speech-start-failed");
      setListening(false);
    }
  }, [Ctor, lang]);

  const stop = useCallback(() => {
    try {
      ref.current?.stop();
    } catch {
      // ignore
    }
  }, []);

  const abort = useCallback(() => {
    try {
      ref.current?.abort();
    } catch {
      // ignore
    }
    setListening(false);
  }, []);

  return { supported, listening, error, start, stop, abort };
}
