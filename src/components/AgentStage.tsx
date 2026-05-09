import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Mic, Quote, Sparkles } from "lucide-react";
import type { AgentMessage, AgentType, TrialStatus, Verdict } from "../types";
import { AGENT_BY_TYPE } from "../lib/agents";
import { AgentAvatar } from "./AgentAvatar";
import { cn } from "../lib/cn";

interface Props {
  activeAgent: AgentType | null;
  latestMessage: AgentMessage | null;
  status: TrialStatus;
  verdict?: Verdict;
  judgeSpotlight?: boolean;
}

function statusLine(status: TrialStatus): string {
  switch (status) {
    case "running":
      return "Trial in session";
    case "retrial_running":
      return "Retrial in session";
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

export function AgentStage({
  activeAgent,
  latestMessage,
  status,
  verdict,
  judgeSpotlight,
}: Props) {
  const showJudge = judgeSpotlight && verdict;
  const focusType: AgentType | null = showJudge
    ? "final_judge"
    : activeAgent ??
      (latestMessage?.agentType ?? null);
  const focusMeta = focusType ? AGENT_BY_TYPE[focusType] : null;
  const isRunning =
    status === "running" || status === "retrial_running" || !!activeAgent;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border-strong bg-gradient-to-b from-bg-elevated/60 via-bg-panel/80 to-bg-panel/40 p-6 md:p-8">
      {/* Backdrop spotlights */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-700",
          showJudge ? "opacity-100" : "opacity-60",
        )}
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(124,92,255,0.18), transparent 60%), radial-gradient(45% 60% at 50% 100%, rgba(255,138,61,0.06), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 transition-opacity duration-1000",
          showJudge ? "opacity-100" : "opacity-0",
        )}
        style={{
          background:
            "radial-gradient(40% 50% at 50% 0%, rgba(165,148,255,0.35), transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center text-center">
        <span className="chip text-[10px] uppercase tracking-[0.18em]">
          <Mic className="h-3 w-3" />
          {statusLine(status)}
        </span>

        <div className="relative mt-4 mb-3 grid place-items-center">
          <AnimatePresence mode="wait">
            {focusType ? (
              <motion.div
                key={focusType}
                initial={{ scale: 0.85, opacity: 0, y: 8 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="grid place-items-center"
              >
                <AgentAvatar
                  agentType={focusType}
                  size="xl"
                  active
                  showIcon
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-32 w-32 rounded-full border border-border bg-bg-elevated/50"
              />
            )}
          </AnimatePresence>

          {isRunning && !showJudge && (
            <motion.div
              aria-hidden
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              className="absolute h-44 w-44 rounded-full border border-accent/15"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(124,92,255,0.4), transparent 25%, transparent 75%, rgba(124,92,255,0.4))",
                WebkitMask:
                  "radial-gradient(circle, transparent 48%, black 50%)",
                mask: "radial-gradient(circle, transparent 48%, black 50%)",
              }}
            />
          )}
        </div>

        {focusMeta && (
          <div className="space-y-0.5">
            <h2 className="text-lg md:text-xl font-semibold tracking-tight">
              {focusMeta.name}
            </h2>
            <p className="text-xs text-slate-400">{focusMeta.tagline}</p>
          </div>
        )}

        <div className="mt-5 w-full max-w-2xl min-h-[110px]">
          <AnimatePresence mode="wait">
            {showJudge && verdict ? (
              <motion.div
                key={`judge-${verdict.phase}-${verdict.launchReadinessScore}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
                className="rounded-2xl border border-accent/30 bg-accent/5 px-5 py-4"
              >
                <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.18em] text-accent-soft">
                  <Sparkles className="h-3 w-3" />
                  Closing statement
                </div>
                <p className="mt-2 text-sm md:text-base leading-relaxed text-slate-100 italic">
                  "{verdict.judgeClosingStatement}"
                </p>
              </motion.div>
            ) : latestMessage ? (
              <motion.div
                key={latestMessage.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-border bg-bg-elevated/60 px-5 py-4"
              >
                <div className="flex items-start gap-2">
                  <Quote className="h-4 w-4 mt-0.5 shrink-0 text-slate-500" />
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                      {latestMessage.headline}
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
                      {latestMessage.critique}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : isRunning ? (
              <motion.div
                key="thinking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-elevated/60 px-3 py-1.5 text-xs text-slate-400"
              >
                <Loader2 className="h-3 w-3 animate-spin" />
                The jury is forming its opening statement…
              </motion.div>
            ) : (
              <motion.div
                key="awaiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs text-slate-500"
              >
                Start the trial to convene the jury.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
