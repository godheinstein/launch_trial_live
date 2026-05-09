import { motion } from "framer-motion";
import type { AgentType, Severity } from "../types";
import { AGENT_BY_TYPE } from "../lib/agents";
import { cn } from "../lib/cn";

const SEVERITY_DOT: Record<Severity, string> = {
  critical: "bg-risk-critical",
  high: "bg-risk-high",
  medium: "bg-risk-medium",
  low: "bg-risk-low",
};

interface Props {
  agentType: AgentType;
  agentName: string;
  text: string;
  severity?: Severity;
  isJudge?: boolean;
  className?: string;
}

/**
 * Compact in-tile speech panel. Stays within the agent tile's bounds —
 * no floating, no overlap with neighbouring grid cells.
 */
export function ArenaSpeechBubble({
  agentType,
  agentName,
  text,
  severity,
  isJudge,
  className,
}: Props) {
  const meta = AGENT_BY_TYPE[agentType];
  const accent = isJudge ? "#d4af37" : meta.accent;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.96 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "rounded-lg backdrop-blur-md px-2.5 py-1.5",
        className,
      )}
      style={{
        background: "rgba(20, 20, 32, 0.82)",
        border: `1px solid ${accent}66`,
        boxShadow: `0 0 0 1px ${accent}22, 0 8px 18px -8px ${accent}66`,
      }}
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-1.5">
        <span
          className="text-[8.5px] uppercase tracking-[0.16em] font-semibold truncate"
          style={{ color: accent }}
        >
          {agentName} {isJudge ? "rules" : "says"}
        </span>
        {severity && (
          <span className="inline-flex items-center gap-1 text-[8px] uppercase tracking-wider text-slate-300 shrink-0">
            <span
              className={cn("h-1.5 w-1.5 rounded-full", SEVERITY_DOT[severity])}
            />
            {severity}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[11.5px] leading-snug text-slate-100 line-clamp-3">
        {text}
      </p>
    </motion.div>
  );
}
