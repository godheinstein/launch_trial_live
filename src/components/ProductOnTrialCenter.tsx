import { motion } from "framer-motion";
import { Crosshair, Scale, ScrollText } from "lucide-react";
import type {
  AgentType,
  RiskCard,
  Severity,
  TrialStatus,
  Verdict,
} from "../types";
import { AGENT_BY_TYPE } from "../lib/agents";
import { verdictTone } from "../lib/scoring";
import { cn } from "../lib/cn";

const SEVERITY_DOT: Record<Severity, string> = {
  critical: "bg-risk-critical",
  high: "bg-risk-high",
  medium: "bg-risk-medium",
  low: "bg-risk-low",
};

interface Props {
  productName: string;
  productDescription: string;
  status: TrialStatus;
  activeAgent: AgentType | null;
  judgeOnStand: boolean;
  verdict?: Verdict;
  /** Latest accusation/question text from the active agent. */
  currentAccusation: string | null;
  /** Top-of-mind risks. Up to 3 are shown as compact chips. */
  risks: RiskCard[];
}

function statusLine(status: TrialStatus): string {
  switch (status) {
    case "running":
      return "Under interrogation";
    case "retrial_running":
      return "Under retrial";
    case "completed":
      return "Verdict reached";
    case "retrial_completed":
      return "Retrial verdict reached";
    case "error":
      return "Trial halted";
    default:
      return "Awaiting opening statements";
  }
}

export function ProductOnTrialCenter({
  productName,
  productDescription,
  status,
  activeAgent,
  judgeOnStand,
  verdict,
  currentAccusation,
  risks,
}: Props) {
  const tone = verdict ? verdictTone(verdict.verdictLabel) : null;
  const score = verdict?.launchReadinessScore;
  const accusingMeta = activeAgent ? AGENT_BY_TYPE[activeAgent] : null;
  const accusingLabel = judgeOnStand
    ? "The Final Judge"
    : accusingMeta?.name ?? null;

  const compactRisks = [...risks]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 3);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative h-full w-full overflow-hidden rounded-2xl border border-border-strong bg-bg-panel/80 backdrop-blur-md flex flex-col p-4"
      style={{
        boxShadow:
          "0 24px 60px -16px rgba(124,92,255,0.32), inset 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      {/* Stage spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -10%, rgba(124,92,255,0.18), transparent 65%)",
        }}
      />

      <div className="relative flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated/70 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.16em] text-slate-300">
            <Crosshair className="h-3 w-3" />
            On trial
          </span>
          <span className="text-[9.5px] uppercase tracking-[0.16em] text-slate-400">
            {statusLine(status)}
          </span>
        </div>

        <h2 className="mt-2 text-base md:text-lg lg:text-xl font-bold tracking-tight text-balance line-clamp-2">
          {productName}
        </h2>
        <p className="mt-1 text-[12px] text-slate-300 leading-snug line-clamp-2">
          {productDescription}
        </p>

        {accusingLabel && (
          <motion.div
            key={accusingLabel}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-accent/30 bg-accent/10 px-2 py-1 self-start max-w-full"
          >
            <span className="h-1 w-1 rounded-full bg-accent animate-pulse shrink-0" />
            <span className="text-[10.5px] text-slate-200 min-w-0 truncate">
              <span
                className="font-medium"
                style={{ color: accusingMeta?.accent ?? "#a594ff" }}
              >
                {accusingLabel}
              </span>
              {currentAccusation ? `: "${currentAccusation}"` : " has the floor"}
            </span>
          </motion.div>
        )}

        {/* Compact evidence chips, max 3 */}
        {compactRisks.length > 0 && (
          <div className="mt-auto pt-2">
            <div className="flex items-center gap-1.5 mb-1">
              <ScrollText className="h-3 w-3 text-slate-400" />
              <span className="text-[9.5px] uppercase tracking-[0.16em] text-slate-400">
                Latest exhibits
              </span>
              {risks.length > 3 && (
                <span className="text-[9.5px] text-slate-500 ml-auto">
                  +{risks.length - 3} more below
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {compactRisks.map((risk) => (
                <div
                  key={risk.id}
                  title={risk.title}
                  className="flex items-center gap-1.5 rounded-md border border-border bg-bg-elevated/60 px-2 py-1 text-[10.5px] text-slate-200"
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full shrink-0",
                      SEVERITY_DOT[risk.severity],
                    )}
                  />
                  <span className="truncate flex-1">{risk.title}</span>
                  <span
                    className="text-[9px] uppercase tracking-wider shrink-0"
                    style={{ color: AGENT_BY_TYPE[risk.agentType].accent }}
                  >
                    {risk.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {score !== undefined && tone && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 self-start rounded-md border bg-bg-elevated/60 px-2 py-1",
              tone.color.replace("text-", "border-").replace("/40", "/30"),
            )}
          >
            <Scale className="h-3 w-3" />
            <span className="text-[9.5px] uppercase tracking-wider text-slate-400">
              Score
            </span>
            <span
              className={cn("text-xs font-bold tabular-nums", tone.color)}
            >
              {score}
            </span>
            <span className="text-[9.5px] text-slate-500">/ 100</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
