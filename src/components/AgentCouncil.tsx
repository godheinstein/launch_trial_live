import { motion } from "framer-motion";
import type { AgentRunState, AgentType } from "../types";
import { AGENTS, AGENT_BY_TYPE } from "../lib/agents";
import { AgentAvatar } from "./AgentAvatar";
import { cn } from "../lib/cn";

interface Props {
  agents: AgentRunState[];
  activeAgent: AgentType | null;
  judgeActive?: boolean;
  onSelect?: (agentType: AgentType) => void;
}

const STATUS_LABEL: Record<AgentRunState["status"], string> = {
  pending: "Awaiting",
  running: "Speaking",
  complete: "Spoken",
  error: "Failed",
};

export function AgentCouncil({
  agents,
  activeAgent,
  judgeActive,
  onSelect,
}: Props) {
  const byType = new Map(agents.map((a) => [a.agentType, a]));

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-2">
      {AGENTS.map((meta, i) => {
        const state = byType.get(meta.type);
        const isJudge = meta.type === "final_judge";
        const isActive =
          activeAgent === meta.type || (isJudge && judgeActive);
        const status: AgentRunState["status"] =
          state?.status ?? (isJudge && judgeActive ? "running" : "pending");
        const dim = !isActive && status !== "complete";

        return (
          <motion.button
            type="button"
            key={meta.type}
            onClick={onSelect ? () => onSelect(meta.type) : undefined}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className={cn(
              "group flex flex-col items-center gap-2 rounded-xl border border-transparent px-2 py-3 transition-all",
              onSelect && "hover:border-border cursor-pointer",
              !onSelect && "cursor-default",
              isActive && "bg-white/5",
            )}
            aria-pressed={isActive}
          >
            <motion.div
              animate={{
                scale: isActive ? 1.1 : 1,
                y: isActive ? -2 : 0,
              }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <AgentAvatar
                agentType={meta.type}
                size="lg"
                active={isActive}
                dim={dim}
              />
            </motion.div>
            <div className="text-center min-w-0 w-full">
              <div className="text-xs font-semibold leading-tight truncate">
                {meta.name}
              </div>
              <div
                className={cn(
                  "mt-0.5 text-[10px] uppercase tracking-wider",
                  isActive
                    ? "text-accent-soft"
                    : status === "complete"
                      ? "text-risk-low"
                      : status === "error"
                        ? "text-risk-critical"
                        : "text-slate-500",
                )}
              >
                {STATUS_LABEL[status]}
              </div>
              {state?.message?.severity && status === "complete" && (
                <div
                  className="mt-0.5 inline-block rounded-full px-1.5 py-px text-[9px] uppercase tracking-wider"
                  style={{
                    color: AGENT_BY_TYPE[meta.type].accent,
                  }}
                >
                  {state.message.severity}
                </div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
