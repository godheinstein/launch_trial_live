import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentType } from "../types";

export interface NarrationState {
  agentType: AgentType | null;
  text: string | null;
  durationMs: number;
  /** 0 → 1 progress, advanced via requestAnimationFrame. */
  progress: number;
  paused: boolean;
  /** True while a narration is in progress (text or audio). */
  active: boolean;
}

export interface AudioFetcherResult {
  audioUrl: string;
  cleanup: () => void;
}

interface AudioFetcher {
  (text: string): Promise<AudioFetcherResult | null>;
}

const INITIAL: NarrationState = {
  agentType: null,
  text: null,
  durationMs: 0,
  progress: 0,
  paused: false,
  active: false,
};

const MIN_MS = 4000;
const MAX_MS = 12000;
const MS_PER_CHAR = 60;
/** Quiet beat after a narration ends, before the next agent takes the stage. */
const TRAILING_PAUSE_MS = 500;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function estimateDurationMs(text: string): number {
  if (!text) return MIN_MS;
  return clamp(text.length * MS_PER_CHAR, MIN_MS, MAX_MS);
}

interface Options {
  /**
   * Optional async function that turns text into a playable audio URL.
   * Returning null causes the narrator to fall back to estimated text duration.
   */
  audioFetcher?: AudioFetcher;
}

/**
 * Holds the active agent on the stage long enough for its message to be read
 * (or, when an audio fetcher is supplied, until audio playback ends + a small
 * trailing pause). Exposes pause / resume / skip / replay so the user can
 * steer pacing during a demo.
 */
export function useNarrationController({ audioFetcher }: Options = {}) {
  const [state, setState] = useState<NarrationState>(INITIAL);

  // ---- refs that survive re-renders ----
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupAudioRef = useRef<(() => void) | null>(null);
  const rafRef = useRef<number | null>(null);
  const resolveRef = useRef<(() => void) | null>(null);
  // timing fields, in performance.now() coords
  const startTimeRef = useRef(0);
  const durationRef = useRef(0);
  const pausedAtRef = useRef<number | null>(null);
  const accumPauseRef = useRef(0);
  const isAudioRef = useRef(false);
  // last narration request, so replay can re-fire
  const lastTextRef = useRef<string | null>(null);
  const lastAgentRef = useRef<AgentType | null>(null);

  const cancelRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const detachAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {
        // ignore
      }
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    if (cleanupAudioRef.current) {
      try {
        cleanupAudioRef.current();
      } catch {
        // ignore
      }
      cleanupAudioRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    cancelRaf();
    detachAudio();
    pausedAtRef.current = null;
    accumPauseRef.current = 0;
    setState((prev) => ({ ...prev, progress: 1, active: false, paused: false }));
    const r = resolveRef.current;
    resolveRef.current = null;
    if (r) {
      // Honour the trailing pause so the next agent has breathing room.
      window.setTimeout(() => r(), TRAILING_PAUSE_MS);
    }
  }, [cancelRaf, detachAudio]);

  const tick = useCallback(() => {
    rafRef.current = requestAnimationFrame(tick);
    const now = performance.now();
    const pausedTotal =
      accumPauseRef.current +
      (pausedAtRef.current !== null ? now - pausedAtRef.current : 0);
    const elapsed = now - startTimeRef.current - pausedTotal;
    const total = durationRef.current || 1;
    const progress = clamp(elapsed / total, 0, 1);
    setState((prev) => (prev.active ? { ...prev, progress } : prev));
    // For text-driven narration, we also resolve when elapsed exceeds duration.
    if (!isAudioRef.current && elapsed >= total) {
      finish();
    }
  }, [finish]);

  const startTimer = useCallback(
    (durationMs: number) => {
      durationRef.current = durationMs;
      startTimeRef.current = performance.now();
      accumPauseRef.current = 0;
      pausedAtRef.current = null;
      cancelRaf();
      rafRef.current = requestAnimationFrame(tick);
    },
    [cancelRaf, tick],
  );

  const playAudio = useCallback(
    (url: string, cleanup: (() => void) | null) => {
      detachAudio();
      const audio = new Audio(url);
      audio.onended = () => finish();
      audio.onerror = () => {
        // Fall back to estimated duration if playback breaks midway.
        isAudioRef.current = false;
        const fallback = estimateDurationMs(lastTextRef.current ?? "");
        startTimer(fallback);
      };
      audioRef.current = audio;
      cleanupAudioRef.current = cleanup;
      void audio.play().catch(() => {
        // Browsers can block autoplay until user gesture; fall back gracefully.
        isAudioRef.current = false;
        const fallback = estimateDurationMs(lastTextRef.current ?? "");
        startTimer(fallback);
      });
    },
    [detachAudio, finish, startTimer],
  );

  /**
   * Begin narrating an agent's line. Resolves when the narration (audio or
   * estimated text duration) finishes plus a short trailing pause.
   */
  const narrate = useCallback(
    (agentType: AgentType, text: string): Promise<void> => {
      // Cancel any in-flight narration without waking up its waiters
      // (we'll start fresh below).
      cancelRaf();
      detachAudio();
      pausedAtRef.current = null;
      accumPauseRef.current = 0;
      const previousResolve = resolveRef.current;
      resolveRef.current = null;
      if (previousResolve) previousResolve();

      lastAgentRef.current = agentType;
      lastTextRef.current = text;

      const estimated = estimateDurationMs(text);
      isAudioRef.current = false;

      setState({
        agentType,
        text,
        durationMs: estimated,
        progress: 0,
        paused: false,
        active: true,
      });

      const promise = new Promise<void>((resolve) => {
        resolveRef.current = resolve;
      });

      // Fire timer immediately so the UI responds even if audio takes time.
      startTimer(estimated);

      // Optionally upgrade to audio-driven timing.
      if (audioFetcher) {
        void audioFetcher(text).then((result) => {
          // Make sure the user hasn't moved on while we were fetching audio.
          if (lastTextRef.current !== text) {
            result?.cleanup();
            return;
          }
          if (!result) return;
          isAudioRef.current = true;
          // Audio takes over duration tracking via onended.
          setState((prev) =>
            prev.active && prev.text === text
              ? { ...prev, durationMs: 0 }
              : prev,
          );
          playAudio(result.audioUrl, result.cleanup);
        });
      }

      return promise;
    },
    [audioFetcher, cancelRaf, detachAudio, startTimer, playAudio],
  );

  const skip = useCallback(() => {
    if (!state.active) return;
    finish();
  }, [finish, state.active]);

  const pause = useCallback(() => {
    if (!state.active || state.paused) return;
    pausedAtRef.current = performance.now();
    if (audioRef.current) {
      try {
        audioRef.current.pause();
      } catch {
        // ignore
      }
    }
    setState((prev) => ({ ...prev, paused: true }));
  }, [state.active, state.paused]);

  const resume = useCallback(() => {
    if (!state.active || !state.paused) return;
    if (pausedAtRef.current !== null) {
      accumPauseRef.current += performance.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    if (audioRef.current) {
      void audioRef.current.play().catch(() => {
        // ignore
      });
    }
    setState((prev) => ({ ...prev, paused: false }));
  }, [state.active, state.paused]);

  /**
   * Restart narration of the current agent without advancing the trial.
   * Useful when the user wants to re-listen to the active line.
   */
  const replay = useCallback(() => {
    const agent = lastAgentRef.current;
    const text = lastTextRef.current;
    if (!agent || !text) return;
    // Restart timing — don't resolve the existing waiter (the runner is still
    // gated on it, which is what we want: the agent stays on stage).
    cancelRaf();
    detachAudio();
    pausedAtRef.current = null;
    accumPauseRef.current = 0;
    isAudioRef.current = false;
    const estimated = estimateDurationMs(text);
    setState({
      agentType: agent,
      text,
      durationMs: estimated,
      progress: 0,
      paused: false,
      active: true,
    });
    startTimer(estimated);
    if (audioFetcher) {
      void audioFetcher(text).then((result) => {
        if (lastTextRef.current !== text) {
          result?.cleanup();
          return;
        }
        if (!result) return;
        isAudioRef.current = true;
        playAudio(result.audioUrl, result.cleanup);
      });
    }
  }, [audioFetcher, cancelRaf, detachAudio, playAudio, startTimer]);

  /** Stop everything and resolve waiter — useful on unmount or trial reset. */
  const cancel = useCallback(() => {
    cancelRaf();
    detachAudio();
    pausedAtRef.current = null;
    accumPauseRef.current = 0;
    setState(INITIAL);
    const r = resolveRef.current;
    resolveRef.current = null;
    if (r) r();
  }, [cancelRaf, detachAudio]);

  useEffect(
    () => () => {
      cancelRaf();
      detachAudio();
    },
    [cancelRaf, detachAudio],
  );

  return {
    state,
    narrate,
    skip,
    pause,
    resume,
    replay,
    cancel,
  };
}
