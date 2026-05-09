import { useEffect, useRef } from "react";
import { Mic, MicOff, Loader2, AlertTriangle } from "lucide-react";
import { useSpeechRecognition } from "../lib/useSpeechRecognition";
import { cn } from "../lib/cn";

interface Props {
  /** Current value of the field — voice transcript is appended to it. */
  value: string;
  /** Setter for the field — called with the merged text. */
  onChange: (next: string) => void;
  /** Optional className passthrough. */
  className?: string;
}

/**
 * Push-to-talk style mic button. Uses the browser Web Speech API only —
 * no audio leaves the device and no backend is involved. Falls back to
 * a friendly disabled state in browsers without the API (e.g. Firefox).
 */
export function VoiceInputButton({ value, onChange, className }: Props) {
  // Keep the latest value in a ref so the speech callback always appends to fresh text.
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const { supported, listening, error, start, stop } = useSpeechRecognition({
    onFinal: (text) => {
      const current = valueRef.current.trimEnd();
      const next = current ? `${current} ${text}` : text;
      onChange(next);
    },
  });

  if (!supported) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated/40 px-3 py-1.5 text-[11px] text-slate-500",
          className,
        )}
        title="Voice input is not supported in this browser. Please type instead."
      >
        <MicOff className="h-3 w-3" />
        Voice unavailable
      </span>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={listening ? stop : start}
        aria-pressed={listening}
        aria-label={listening ? "Stop voice input" : "Start voice input"}
        className={cn(
          "btn-secondary",
          listening && "border-accent/60 text-accent",
        )}
      >
        {listening ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Listening… tap to stop
          </>
        ) : (
          <>
            <Mic className="h-3.5 w-3.5" />
            Speak instead
          </>
        )}
      </button>
      {error && (
        <span className="inline-flex items-center gap-1 text-[11px] text-risk-critical">
          <AlertTriangle className="h-3 w-3" />
          {error === "not-allowed"
            ? "Mic permission denied"
            : error === "no-speech"
              ? "No speech detected"
              : "Voice failed"}
        </span>
      )}
    </div>
  );
}
