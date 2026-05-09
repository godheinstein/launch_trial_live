import { AnimatePresence, motion } from "framer-motion";
import { Loader2, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import type {
  AgentRunState,
  AgentType,
  Severity,
  Verdict,
} from "../types";
import { AGENT_BY_TYPE } from "../lib/agents";
import { AgentImageOrSilhouette } from "./AgentImageOrSilhouette";
import { ArenaSpeechBubble } from "./ArenaSpeechBubble";
import { getBubbleText } from "../lib/bubbleText";
import { cn } from "../lib/cn";

const STATUS_LABEL: Record<AgentRunState["status"], string> = {
  pending: "Awaiting",
  running: "Speaking",
  complete: "Spoken",
  error: "Failed",
};

const SEVERITY_DOT: Record<Severity, string> = {
  critical: "bg-risk-critical",
  high: "bg-risk-high",
  medium: "bg-risk-medium",
  low: "bg-risk-low",
};

interface Props {
  agentType: AgentType;
  state: AgentRunState | undefined;
  active?: boolean;
  judgeSpotlight?: boolean;
  variant?: "regular" | "judge";
  /** When true, render the in-tile speech bubble. */
  showBubble?: boolean;
  /** Verdict — used for the Final Judge bubble. */
  verdict?: Verdict;
  /** 0–1 narration progress to render under the active tile. */
  narrationProgress?: number;
  /** True if the narrator is paused for this tile. */
  narrationPaused?: boolean;
  onClick?: () => void;
}

/**
 * One agent in the debate arena. The whole tile lives inside its grid cell
 * and never overflows — speech bubble, glow, and label all respect the
 * tile bounds.
 */
export function AgentTile({
  agentType,
  state,
  active,
  judgeSpotlight,
  variant = "regular",
  showBubble,
  verdict,
  narrationProgress,
  narrationPaused,
  onClick,
}: Props) {
  const meta = AGENT_BY_TYPE[agentType];
  const status: AgentRunState["status"] = state?.status ?? "pending";
  const isJudge = variant === "judge";
  const isActive = !!active || (isJudge && !!judgeSpotlight);
  const isCompleted = status === "complete";
  const dim = !isActive && status === "pending";
  const severity = state?.message?.severity;

  const bubbleText = showBubble
    ? getBubbleText(state?.message ?? null, agentType, verdict)
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "group relative h-full w-full flex flex-col items-stretch text-left rounded-2xl border bg-transparent overflow-hidden",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        dim && "opacity-60",
        isActive
          ? "border-white/20"
          : isCompleted
            ? "border-border-strong"
            : "border-border/60",
        onClick ? "cursor-pointer" : "cursor-default",
      )}
      style={{
        background: isActive
          ? `linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)`
          : "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.35) 100%)",
        boxShadow: isActive
          ? `0 0 0 1px rgba(255,255,255,0.08), 0 0 32px -4px ${meta.accent}66, inset 0 0 0 1px rgba(255,255,255,0.04)`
          : "inset 0 0 0 1px rgba(255,255,255,0.03)",
      }}
    >
      {/* Spotlight wash for active agent */}
      {isActive && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(60% 50% at 50% -10%, ${meta.accent}55, transparent 60%)`,
          }}
        />
      )}

      {/* Character / silhouette area */}
      <div className="relative flex-1 min-h-0 grid place-items-end overflow-hidden px-1.5 pt-1.5">
        <div className="h-full w-full grid place-items-end">
          <AgentImageOrSilhouette agentType={agentType} />
        </div>

        {/* On-the-stand pip */}
        {isActive && (
          <span className="absolute top-1 right-1 inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-white backdrop-blur-sm">
            <span
              className={cn(
                "h-1 w-1 rounded-full bg-white",
                !narrationPaused && "animate-pulse",
              )}
            />
            {narrationPaused ? "Paused" : "Speaking"}
          </span>
        )}

        {/* Judge bench cartouche */}
        {isJudge && (
          <span
            aria-hidden
            className="absolute top-1 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/60 px-1.5 py-px text-[8px] uppercase tracking-[0.18em]"
            style={{ color: "#d4af37" }}
          >
            Bench
          </span>
        )}

        {/* In-tile speech bubble — never escapes the tile, never overlaps neighbors. */}
        <AnimatePresence>
          {showBubble && bubbleText && (
            <motion.div
              key={`${agentType}-${state?.message?.id ?? "judge"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute top-1.5 left-1.5 right-1.5 z-10"
            >
              <ArenaSpeechBubble
                agentType={agentType}
                agentName={meta.name}
                text={bubbleText}
                severity={severity}
                isJudge={isJudge}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Narration progress bar (active tile only) */}
      {isActive && typeof narrationProgress === "number" && (
        <div
          aria-hidden
          className="relative h-0.5 w-full bg-white/5"
        >
          <div
            className="absolute inset-y-0 left-0 transition-[width] duration-100 ease-linear"
            style={{
              width: `${Math.max(0, Math.min(1, narrationProgress)) * 100}%`,
              background: `linear-gradient(90deg, ${meta.accent} 0%, rgba(255,255,255,0.9) 100%)`,
              boxShadow: `0 0 8px ${meta.accent}`,
            }}
          />
        </div>
      )}

      {/* Compact nameplate footer */}
      <div
        className="relative px-2 py-1.5 shrink-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center justify-between gap-1.5">
          <div className="min-w-0">
            <h3 className="text-[12px] font-semibold leading-tight truncate text-white">
              {meta.name}
            </h3>
            {!isActive && (
              <p
                className="text-[9.5px] leading-tight truncate"
                style={{ color: meta.accent }}
              >
                {isJudge ? "Honorable" : "Juror"}
              </p>
            )}
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[8.5px] uppercase tracking-wider shrink-0",
              isActive
                ? "border-white/30 bg-white/10 text-white"
                : isCompleted
                  ? "border-risk-low/40 bg-risk-low/10 text-risk-low"
                  : status === "error"
                    ? "border-risk-critical/40 bg-risk-critical/10 text-risk-critical"
                    : "border-white/10 bg-white/5 text-slate-300",
            )}
          >
            {status === "running" ? (
              <Loader2 className="h-2 w-2 animate-spin" />
            ) : status === "complete" ? (
              <CheckCircle2 className="h-2 w-2" />
            ) : status === "error" ? (
              <AlertTriangle className="h-2 w-2" />
            ) : (
              <Circle className="h-2 w-2" />
            )}
            {STATUS_LABEL[status]}
          </span>
        </div>
        {severity && isCompleted && !isActive && (
          <div className="mt-0.5 inline-flex items-center gap-1 text-[8.5px] uppercase tracking-wider text-slate-400">
            <span
              className={cn("h-1 w-1 rounded-full", SEVERITY_DOT[severity])}
            />
            {severity}
          </div>
        )}
      </div>
    </button>
  );
}
