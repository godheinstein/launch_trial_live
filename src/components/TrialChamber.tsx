import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gavel } from "lucide-react";
import type {
  AgentMessage,
  AgentRunState,
  AgentType,
  RiskCard,
  TrialStatus,
  Verdict,
} from "../types";
import { AgentCouncil } from "./AgentCouncil";
import { AgentStage } from "./AgentStage";
import { EvidenceBoard } from "./EvidenceBoard";
import { VoiceVerdictButton } from "./VoiceVerdictButton";
import { verdictLabelText, verdictTone } from "../lib/scoring";
import { cn } from "../lib/cn";

interface Props {
  agents: AgentRunState[];
  risks: RiskCard[];
  status: TrialStatus;
  verdict?: Verdict;
  phase: "initial" | "retrial";
}

export function TrialChamber({
  agents,
  risks,
  status,
  verdict,
  phase,
}: Props) {
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
      // While running, show the most recent completed message as context
      return lastCompleted?.message ?? null;
    }
    return lastCompleted?.message ?? null;
  }, [pinnedAgent, runningAgent, agents, lastCompleted]);

  const tone = verdict ? verdictTone(verdict.verdictLabel) : null;

  return (
    <section className="rounded-3xl border border-border-strong bg-bg-panel/40 p-4 md:p-6 backdrop-blur-md">
      <header className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <span className="chip text-[10px] uppercase tracking-[0.18em]">
            <Gavel className="h-3 w-3" />
            {phase === "retrial" ? "Retrial chamber" : "Trial chamber"}
          </span>
          {verdict && tone && (
            <motion.span
              key={`${phase}-${verdict.launchReadinessScore}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "chip uppercase tracking-wide",
                tone.color,
              )}
            >
              {verdictLabelText(verdict.verdictLabel)} · {verdict.launchReadinessScore}/100
            </motion.span>
          )}
        </div>
        {verdict && (
          <VoiceVerdictButton text={verdict.judgeClosingStatement} />
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <AgentStage
          activeAgent={activeAgent}
          latestMessage={focusMessage}
          status={status}
          verdict={verdict}
          judgeSpotlight={judgeShouldSpotlight}
        />

        <EvidenceBoard risks={risks} />
      </div>

      <div className="mt-4">
        <AgentCouncil
          agents={agents}
          activeAgent={activeAgent}
          judgeActive={judgeShouldSpotlight}
          onSelect={(t) =>
            setPinnedAgent((prev) => (prev === t ? null : t))
          }
        />
      </div>

      <AnimatePresence>
        {pinnedAgent && (
          <motion.p
            key="pinned-hint"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 text-center text-[11px] text-slate-500"
          >
            Pinned to a juror. Click again to unpin.
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}
