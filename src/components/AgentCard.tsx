import { motion } from "framer-motion";
import {
  ShieldAlert,
  Eye,
  HelpCircle,
  Bug,
  TrendingDown,
  Scale,
  Loader2,
  CheckCircle2,
  Circle,
  AlertTriangle,
  HelpingHand,
  Wrench,
} from "lucide-react";
import type { AgentRunState, AgentType } from "../types";
import { AGENT_BY_TYPE } from "../lib/agents";
import { cn } from "../lib/cn";
import { RiskSeverityBadge } from "./RiskSeverityBadge";

const ICONS: Record<AgentType, typeof ShieldAlert> = {
  malicious_user: ShieldAlert,
  privacy_auditor: Eye,
  confused_customer: HelpCircle,
  prompt_injection_attacker: Bug,
  skeptical_investor: TrendingDown,
  final_judge: Scale,
};

interface Props {
  state: AgentRunState;
  index?: number;
}

export function AgentCard({ state, index = 0 }: Props) {
  const meta = AGENT_BY_TYPE[state.agentType];
  const Icon = ICONS[state.agentType];
  const isRunning = state.status === "running";
  const isComplete = state.status === "complete" && !!state.message;
  const isPending = state.status === "pending";

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={cn(
        "panel p-5 transition-all",
        isRunning && "border-accent/40 shadow-glow",
        isPending && "opacity-60",
      )}
    >
      <header className="flex items-start gap-3">
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{
            backgroundColor: `${meta.accent}1f`,
            color: meta.accent,
          }}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{meta.name}</h3>
            <StatusPill state={state} />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{meta.tagline}</p>
        </div>
      </header>

      {isComplete && state.message && (
        <>
          <h4 className="mt-4 text-sm font-semibold leading-snug text-slate-100">
            {state.message.headline}
          </h4>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed">
            {state.message.critique}
          </p>

          <div className="mt-3 flex items-start gap-2 text-xs">
            <HelpingHand className="h-3 w-3 mt-0.5 shrink-0 text-slate-400" />
            <span className="text-slate-300 italic">
              "{state.message.keyQuestion}"
            </span>
          </div>

          <div className="mt-2 flex items-start gap-2 text-xs">
            <Wrench className="h-3 w-3 mt-0.5 shrink-0 text-accent" />
            <span className="text-slate-300">
              <span className="text-accent-soft font-medium">Fix: </span>
              {state.message.suggestedFix}
            </span>
          </div>

          {state.riskIds.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <AlertTriangle className="h-3 w-3" />
              <span>
                {state.riskIds.length} risk
                {state.riskIds.length === 1 ? "" : "s"} raised
              </span>
            </div>
          )}
        </>
      )}

      {isRunning && (
        <div className="mt-4 space-y-2">
          <SkeletonLine width="80%" />
          <SkeletonLine width="95%" />
          <SkeletonLine width="60%" />
        </div>
      )}

      {state.status === "error" && (
        <p className="mt-4 text-sm text-risk-critical">
          This agent failed to respond.
        </p>
      )}
    </motion.article>
  );
}

function StatusPill({ state }: { state: AgentRunState }) {
  if (state.status === "running") {
    return (
      <span className="chip text-accent border-accent/40">
        <Loader2 className="h-3 w-3 animate-spin" />
        running
      </span>
    );
  }
  if (state.status === "complete" && state.message) {
    return <RiskSeverityBadge severity={state.message.severity} />;
  }
  if (state.status === "complete") {
    return (
      <span className="chip text-risk-low border-risk-low/40">
        <CheckCircle2 className="h-3 w-3" />
        complete
      </span>
    );
  }
  if (state.status === "error") {
    return (
      <span className="chip text-risk-critical border-risk-critical/40">
        <AlertTriangle className="h-3 w-3" />
        error
      </span>
    );
  }
  return (
    <span className="chip text-slate-400">
      <Circle className="h-3 w-3" />
      pending
    </span>
  );
}

function SkeletonLine({ width }: { width: string }) {
  return (
    <div
      className="h-2.5 rounded animate-shimmer"
      style={{
        width,
        backgroundImage:
          "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 100%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}
