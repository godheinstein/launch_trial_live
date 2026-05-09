import { forwardRef, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Activity, Gavel } from "lucide-react";
import type {
  AgentMessage,
  AgentRunState,
  AgentType,
  RiskCard,
  TrialStatus,
  Verdict,
} from "../types";
import { DebateArena } from "./DebateArena";
import { VoiceVerdictButton } from "./VoiceVerdictButton";
import { verdictLabelText, verdictTone } from "../lib/scoring";
import { cn } from "../lib/cn";

interface Props {
  productName: string;
  productDescription: string;
  agents: AgentRunState[];
  risks: RiskCard[];
  status: TrialStatus;
  verdict?: Verdict;
  phase: "initial" | "retrial";
  /** Optional run/rerun control rendered in the chamber header. */
  runControl?: ReactNode;
  /** Optional alert (e.g. live-mode action error) rendered below the header. */
  alert?: ReactNode;
  /** Fullscreen toggle button rendered in header. */
  fullscreenControl?: ReactNode;
  /** Whether the chamber is currently fullscreen (drives height + chrome). */
  isFullscreen?: boolean;
  /** Optional hint banner shown above the arena (e.g. "go fullscreen"). */
  hint?: ReactNode;
  /** Currently-narrating agent (drives the per-tile progress bar). */
  narratingAgent?: AgentType | null;
  narrationProgress?: number;
  narrationPaused?: boolean;
  /** Narration controls rendered next to voice + run + fullscreen. */
  narrationControl?: ReactNode;
}

function statusLabel(status: TrialStatus): string {
  switch (status) {
    case "running":
      return "Trial in progress";
    case "retrial_running":
      return "Retrial in progress";
    case "completed":
      return "Trial complete";
    case "retrial_completed":
      return "Retrial complete";
    case "error":
      return "Trial halted";
    default:
      return "Awaiting opening statements";
  }
}

export const TrialChamber = forwardRef<HTMLElement, Props>(function TrialChamber(
  {
    productName,
    productDescription,
    agents,
    risks,
    status,
    verdict,
    phase,
    runControl,
    alert,
    fullscreenControl,
    isFullscreen = false,
    hint,
    narratingAgent,
    narrationProgress,
    narrationPaused,
    narrationControl,
  },
  ref,
) {
  const [pinnedAgent, setPinnedAgent] = useState<AgentType | null>(null);

  const runningAgent = agents.find((a) => a.status === "running")?.agentType;
  const lastCompleted = [...agents]
    .reverse()
    .find((a) => a.status === "complete" && a.message);
  const judgeShouldSpotlight =
    !!verdict &&
    (status === "completed" || status === "retrial_completed");

  const activeAgent: AgentType | null = pinnedAgent ?? runningAgent ?? null;

  const focusMessage: AgentMessage | null = useMemo(() => {
    if (pinnedAgent) {
      const pinned = agents.find((a) => a.agentType === pinnedAgent);
      return pinned?.message ?? null;
    }
    if (runningAgent) {
      return lastCompleted?.message ?? null;
    }
    return lastCompleted?.message ?? null;
  }, [pinnedAgent, runningAgent, agents, lastCompleted]);

  const tone = verdict ? verdictTone(verdict.verdictLabel) : null;
  const isRunning =
    status === "running" || status === "retrial_running";

  const onSelectAgent = (t: AgentType) =>
    setPinnedAgent((prev) => (prev === t ? null : t));

  return (
    <section
      ref={ref}
      className={cn(
        "relative flex flex-col bg-bg-panel/40 backdrop-blur-md overflow-hidden",
        isFullscreen
          ? "h-screen w-screen rounded-none border-0"
          : "rounded-3xl border border-border-strong h-[calc(100vh-150px)] min-h-[560px] max-h-[820px]",
      )}
      style={{
        boxShadow: isFullscreen
          ? undefined
          : "0 30px 90px -30px rgba(124,92,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.04)",
      }}
    >
      {/* Header */}
      <header
        className={cn(
          "relative flex items-start justify-between gap-3 flex-wrap border-b border-border/60 shrink-0",
          isFullscreen ? "px-6 md:px-10 py-3" : "px-5 md:px-7 py-4",
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-elevated/60 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-300">
              <Gavel className="h-3 w-3" />
              {phase === "retrial" ? "Retrial Arena" : "TrialRun Arena"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-300">
              <Activity
                className={cn(
                  "h-3 w-3",
                  isRunning
                    ? "text-accent animate-pulse"
                    : status === "completed" ||
                        status === "retrial_completed"
                      ? "text-risk-low"
                      : "text-slate-500",
                )}
              />
              {statusLabel(status)}
            </span>
            {verdict && tone && (
              <motion.span
                key={`${phase}-${verdict.launchReadinessScore}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-wider bg-bg-elevated/60",
                  tone.color,
                )}
                style={{ borderColor: "currentColor" }}
              >
                {verdictLabelText(verdict.verdictLabel)}
                <span className="text-slate-200 font-semibold tabular-nums">
                  {verdict.launchReadinessScore}/100
                </span>
              </motion.span>
            )}
          </div>
          <h2 className="mt-1.5 text-lg md:text-xl font-semibold tracking-tight truncate">
            {productName}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {narrationControl}
          {runControl}
          {verdict && (
            <VoiceVerdictButton text={verdict.judgeClosingStatement} />
          )}
          {fullscreenControl}
        </div>
      </header>

      {alert && (
        <div className={cn(isFullscreen ? "px-6 md:px-10 pt-3" : "px-5 md:px-7 pt-4")}>
          {alert}
        </div>
      )}

      {hint && !isFullscreen && (
        <div className="px-5 md:px-7 pt-3">{hint}</div>
      )}

      <div
        className={cn(
          "flex-1 min-h-0",
          isFullscreen ? "px-3 md:px-6 py-3" : "px-3 md:px-5 py-4",
        )}
      >
        <DebateArena
          productName={productName}
          productDescription={productDescription}
          agents={agents}
          risks={risks}
          status={status}
          verdict={verdict}
          activeAgent={activeAgent}
          judgeSpotlight={judgeShouldSpotlight}
          focusMessage={focusMessage}
          onSelectAgent={onSelectAgent}
          narratingAgent={narratingAgent}
          narrationProgress={narrationProgress}
          narrationPaused={narrationPaused}
        />

        {pinnedAgent && (
          <p className="mt-2 text-center text-[11px] text-slate-500">
            Pinned to a juror. Click again to release the bench.
          </p>
        )}
      </div>
    </section>
  );
});
