import { motion } from "framer-motion";
import { Wrench, Zap, Check } from "lucide-react";
import type { RiskCard as RiskCardType, RiskCategory } from "../types";
import { AGENT_BY_TYPE } from "../lib/agents";
import { cn } from "../lib/cn";
import { RiskSeverityBadge } from "./RiskSeverityBadge";

const SEVERITY_BAR: Record<RiskCardType["severity"], string> = {
  critical: "bg-risk-critical",
  high: "bg-risk-high",
  medium: "bg-risk-medium",
  low: "bg-risk-low",
};

export const CATEGORY_LABEL: Record<RiskCategory, string> = {
  privacy: "Privacy",
  security: "Security",
  ux: "UX",
  business: "Business",
  trust: "Trust",
  compliance: "Compliance",
  prompt_injection: "Prompt injection",
  safety: "Safety",
};

interface Props {
  risk: RiskCardType;
  index?: number;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}

export function RiskCard({
  risk,
  index = 0,
  selectable,
  selected,
  onToggle,
}: Props) {
  const meta = AGENT_BY_TYPE[risk.agentType];
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      onClick={selectable ? onToggle : undefined}
      className={cn(
        "panel relative overflow-hidden p-4 transition-all",
        selectable && "cursor-pointer hover:border-border-strong",
        selected && "border-accent/60 shadow-glow",
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1",
          SEVERITY_BAR[risk.severity],
        )}
      />
      <div className="pl-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-snug">{risk.title}</h3>
            <div className="mt-1 flex items-center flex-wrap gap-2 text-[11px] text-slate-400">
              <span className="chip text-slate-300 normal-case tracking-normal">
                {CATEGORY_LABEL[risk.category]}
              </span>
              <span>
                raised by{" "}
                <span style={{ color: meta.accent }} className="font-medium">
                  {meta.name}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <RiskSeverityBadge severity={risk.severity} />
            {selectable && (
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded border",
                  selected
                    ? "bg-accent border-accent text-white"
                    : "border-border-strong",
                )}
              >
                {selected && <Check className="h-3.5 w-3.5" />}
              </span>
            )}
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-200 leading-relaxed">
          {risk.description}
        </p>

        <div className="mt-3 flex items-start gap-2 text-xs">
          <Zap className="h-3 w-3 mt-0.5 shrink-0 text-risk-high" />
          <span className="text-slate-300">
            <span className="text-risk-high font-medium">Impact: </span>
            {risk.impact}
          </span>
        </div>

        <div className="mt-2 flex items-start gap-2 text-xs">
          <Wrench className="h-3 w-3 mt-0.5 shrink-0 text-accent" />
          <span className="text-slate-300">
            <span className="text-accent-soft font-medium">Fix: </span>
            {risk.fix}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
