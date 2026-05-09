import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";
import { cn } from "../lib/cn";

interface Props {
  active: boolean;
  paused: boolean;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onReplay: () => void;
  className?: string;
}

/**
 * Compact narration controls shown in the chamber header while an agent is on
 * the stand. Hidden entirely when no narration is in flight, so the header
 * stays clean before the trial starts.
 */
export function NarrationControls({
  active,
  paused,
  onPause,
  onResume,
  onSkip,
  onReplay,
  className,
}: Props) {
  if (!active) return null;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border bg-bg-elevated/70 px-1 py-1",
        className,
      )}
      role="group"
      aria-label="Narration controls"
    >
      {paused ? (
        <button
          type="button"
          onClick={onResume}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-slate-200 hover:text-white hover:bg-white/5"
          aria-label="Resume narration"
        >
          <Play className="h-3 w-3" />
          Resume
        </button>
      ) : (
        <button
          type="button"
          onClick={onPause}
          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-slate-200 hover:text-white hover:bg-white/5"
          aria-label="Pause narration"
        >
          <Pause className="h-3 w-3" />
          Pause
        </button>
      )}
      <button
        type="button"
        onClick={onReplay}
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-slate-300 hover:text-white hover:bg-white/5"
        aria-label="Replay current agent"
      >
        <RotateCcw className="h-3 w-3" />
        Replay
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-accent-soft hover:text-accent hover:bg-accent/10"
        aria-label="Skip to next agent"
      >
        <SkipForward className="h-3 w-3" />
        Next
      </button>
    </div>
  );
}
