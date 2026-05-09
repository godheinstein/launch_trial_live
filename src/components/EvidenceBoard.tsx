import { AnimatePresence, motion } from "framer-motion";
import { FileText, ScrollText } from "lucide-react";
import type { RiskCard, Severity } from "../types";
import { AGENT_BY_TYPE } from "../lib/agents";
import { cn } from "../lib/cn";

const SEVERITY_BAR: Record<Severity, string> = {
  critical: "bg-risk-critical",
  high: "bg-risk-high",
  medium: "bg-risk-medium",
  low: "bg-risk-low",
};

const SEVERITY_TEXT: Record<Severity, string> = {
  critical: "text-risk-critical",
  high: "text-risk-high",
  medium: "text-risk-medium",
  low: "text-risk-low",
};

interface Props {
  risks: RiskCard[];
  limit?: number;
}

export function EvidenceBoard({ risks, limit = 4 }: Props) {
  const recent = [...risks]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);

  return (
    <div className="rounded-2xl border border-border bg-bg-panel/70 p-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-400">
          <ScrollText className="h-3 w-3" />
          Evidence board
        </div>
        <span className="text-[10px] text-slate-500 tabular-nums">
          {risks.length} {risks.length === 1 ? "exhibit" : "exhibits"}
        </span>
      </div>

      <div className="mt-3 flex-1 min-h-[180px] flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {recent.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 grid place-items-center text-center text-xs text-slate-500"
            >
              <div>
                <FileText className="h-5 w-5 mx-auto opacity-40" />
                <p className="mt-2">No exhibits filed yet.</p>
              </div>
            </motion.div>
          ) : (
            recent.map((risk) => {
              const meta = AGENT_BY_TYPE[risk.agentType];
              return (
                <motion.div
                  key={risk.id}
                  layout
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative overflow-hidden rounded-xl border border-border bg-bg-elevated/70 p-3"
                >
                  <span
                    className={cn(
                      "absolute left-0 top-0 h-full w-1",
                      SEVERITY_BAR[risk.severity],
                    )}
                  />
                  <div className="pl-2">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold leading-snug line-clamp-2">
                        {risk.title}
                      </h4>
                      <span
                        className={cn(
                          "text-[9px] uppercase tracking-wider shrink-0",
                          SEVERITY_TEXT[risk.severity],
                        )}
                      >
                        {risk.severity}
                      </span>
                    </div>
                    <div
                      className="mt-1 text-[10px]"
                      style={{ color: meta.accent }}
                    >
                      {meta.name}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {risks.length > limit && (
        <p className="mt-2 text-[10px] text-slate-500 text-center">
          + {risks.length - limit} more in the full risk list below
        </p>
      )}
    </div>
  );
}
