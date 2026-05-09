import type { AgentRunState } from "../types";
import { SPECIALIST_AGENT_TYPES } from "../lib/agents";
import { AgentCard } from "./AgentCard";

interface Props {
  agents: AgentRunState[];
}

export function AgentTimeline({ agents }: Props) {
  const byType = new Map(agents.map((a) => [a.agentType, a] as const));
  const ordered: AgentRunState[] = SPECIALIST_AGENT_TYPES.map(
    (t) =>
      byType.get(t) ?? {
        agentType: t,
        status: "pending",
        riskIds: [],
      },
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {ordered.map((state, i) => (
        <AgentCard key={state.agentType} state={state} index={i} />
      ))}
    </div>
  );
}
