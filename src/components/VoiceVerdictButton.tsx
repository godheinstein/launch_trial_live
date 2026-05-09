import { useEffect, useRef, useState } from "react";
import { Volume2, Loader2, AlertTriangle, Pause, Play } from "lucide-react";
import {
  hasAnyVoiceProvider,
  synthesizeWithFallback,
  type VoiceProviderId,
} from "../lib/voice";
import { cn } from "../lib/cn";

interface Props {
  text: string;
  className?: string;
}

type Status = "idle" | "loading" | "ready" | "playing" | "error";

const PROVIDER_LABELS: Record<VoiceProviderId, string> = {
  gemini: "Gemini",
  elevenlabs: "ElevenLabs",
};

export function VoiceVerdictButton({ text, className }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [providerLabel, setProviderLabel] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const configured = hasAnyVoiceProvider();

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAudio = (url: string) => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.addEventListener("ended", () => setStatus("ready"));
    } else {
      audioRef.current.src = url;
    }
    void audioRef.current.play();
    setStatus("playing");
  };

  const handleClick = async () => {
    if (status === "playing") {
      audioRef.current?.pause();
      setStatus("ready");
      return;
    }
    if (status === "ready" && audioRef.current) {
      void audioRef.current.play();
      setStatus("playing");
      return;
    }

    setStatus("loading");
    setErrorMessage(null);
    setProviderLabel(null);

    const outcome = await synthesizeWithFallback(text);
    if (outcome.result) {
      cleanupRef.current?.();
      cleanupRef.current = outcome.result.cleanup;
      setProviderLabel(PROVIDER_LABELS[outcome.result.provider]);
      playAudio(outcome.result.audioUrl);
      return;
    }

    const realFailures = outcome.attempts.filter(
      (a) => a.error && a.error !== "not configured",
    );
    if (realFailures.length === 0) {
      setErrorMessage(
        "Voice unavailable — set VITE_ELEVENLABS_API_KEY in .env.local to enable.",
      );
    } else {
      const last = realFailures[realFailures.length - 1];
      setErrorMessage(
        `${PROVIDER_LABELS[last.provider]} failed: ${last.error?.slice(0, 120) ?? "unknown"}`,
      );
    }
    setStatus("error");
  };

  if (!configured && status === "idle") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated/40 px-3 py-1.5 text-xs text-slate-500",
          className,
        )}
        title="Add VITE_ELEVENLABS_API_KEY to .env.local to enable"
      >
        <Volume2 className="h-3 w-3" />
        Voice verdict (configure key)
      </span>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        className={cn(
          "btn-secondary",
          status === "error" && "border-risk-critical/40 text-risk-critical",
        )}
      >
        {status === "loading" ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Synthesizing…
          </>
        ) : status === "playing" ? (
          <>
            <Pause className="h-3.5 w-3.5" />
            Pause verdict
          </>
        ) : status === "ready" ? (
          <>
            <Play className="h-3.5 w-3.5" />
            Replay verdict
          </>
        ) : status === "error" ? (
          <>
            <AlertTriangle className="h-3.5 w-3.5" />
            Retry voice verdict
          </>
        ) : (
          <>
            <Volume2 className="h-3.5 w-3.5" />
            Play voice verdict
          </>
        )}
      </button>
      {providerLabel && status !== "error" && (
        <span className="text-[11px] text-slate-500">via {providerLabel}</span>
      )}
      {status === "error" && errorMessage && (
        <span className="text-[11px] text-risk-critical max-w-xs">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
