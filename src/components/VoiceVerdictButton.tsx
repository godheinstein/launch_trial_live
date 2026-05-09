import { useEffect, useRef, useState } from "react";
import { Volume2, Loader2, AlertTriangle, Pause, Play } from "lucide-react";
import { useAction } from "convex/react";
import {
  hasAnyVoiceProvider,
  synthesizeWithFallback,
  convexVoiceResultToProviderResult,
  type VoiceProviderId,
  type VoiceProviderResult,
  type ConvexVoiceResponse,
} from "../lib/voice";
import { isLiveMode } from "../lib/convexClient";
import { api } from "../../convex/_generated/api";
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
  const [providerSource, setProviderSource] = useState<
    "convex" | "browser" | null
  >(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // useAction is safe to call here — main.tsx always provides a ConvexProvider
  // (placeholder client when not in live mode). The action is only invoked
  // below when isLiveMode is true.
  const synthesizeViaConvex = useAction(
    api.voiceActions.synthesizeVerdictVoice,
  );

  const browserConfigured = hasAnyVoiceProvider();
  const anyConfigured = isLiveMode || browserConfigured;

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playAudio = (result: VoiceProviderResult) => {
    if (!audioRef.current) {
      audioRef.current = new Audio(result.audioUrl);
      audioRef.current.addEventListener("ended", () => setStatus("ready"));
    } else {
      audioRef.current.src = result.audioUrl;
    }
    void audioRef.current.play();
    cleanupRef.current?.();
    cleanupRef.current = result.cleanup;
    setProviderLabel(PROVIDER_LABELS[result.provider]);
    setProviderSource(result.source);
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
    setProviderSource(null);

    // Prefer Convex (server-side keys). Fall back to browser providers.
    if (isLiveMode) {
      try {
        const payload = (await synthesizeViaConvex({ text })) as ConvexVoiceResponse;
        playAudio(convexVoiceResultToProviderResult(payload));
        return;
      } catch (err) {
        if (!browserConfigured) {
          setErrorMessage(
            err instanceof Error
              ? `Convex voice failed: ${err.message.slice(0, 200)}`
              : "Convex voice failed.",
          );
          setStatus("error");
          return;
        }
        // fall through to browser path
      }
    }

    const outcome = await synthesizeWithFallback(text);
    if (outcome.result) {
      playAudio(outcome.result);
      return;
    }

    const realFailures = outcome.attempts.filter(
      (a) => a.error && a.error !== "not configured",
    );
    if (realFailures.length === 0) {
      setErrorMessage(
        "Voice unavailable — set ELEVENLABS_API_KEY in Convex env (or VITE_ELEVENLABS_API_KEY locally) to enable.",
      );
    } else {
      const last = realFailures[realFailures.length - 1];
      setErrorMessage(
        `${PROVIDER_LABELS[last.provider]} failed: ${last.error?.slice(0, 120) ?? "unknown"}`,
      );
    }
    setStatus("error");
  };

  if (!anyConfigured && status === "idle") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated/40 px-3 py-1.5 text-xs text-slate-500",
          className,
        )}
        title="Set ELEVENLABS_API_KEY in Convex env or VITE_ELEVENLABS_API_KEY locally to enable"
      >
        <Volume2 className="h-3 w-3" />
        Voice verdict (configure key)
      </span>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-2 flex-wrap", className)}>
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
        <span className="text-[11px] text-slate-500">
          via {providerLabel}
          {providerSource === "convex" ? " · Convex" : ""}
        </span>
      )}
      {status === "error" && errorMessage && (
        <span className="text-[11px] text-risk-critical max-w-xs">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
