import type {
  AgentRunState,
  AgentType,
  ProductInput,
  RiskCard,
  Severity as DomainSeverity,
  Verdict,
  VerdictLabel,
} from "../types";
import { agents as ARENA_AGENT_DEFAULTS } from "../components/debate-arena/mockTrialData";
import type {
  ArenaAgent,
  AgentStatus as ArenaStatus,
  EvidenceChip,
  ProductOnTrial,
  Severity as ArenaSeverity,
  TrialStep,
} from "../components/debate-arena/mockTrialData";
import { getBubbleText } from "./bubbleText";
import { SPECIALIST_AGENT_TYPES } from "./agents";

/* Severity is identical between the two type systems — keep a tiny adapter. */
function severityAdapter(s: DomainSeverity): ArenaSeverity {
  return s;
}

const ARENA_DEFAULTS_BY_ID = ARENA_AGENT_DEFAULTS.reduce<Record<string, ArenaAgent>>(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {},
);

/** The arena module uses "prompt_injection" as its id; our domain uses
 *  "prompt_injection_attacker". This translates between them. */
function toArenaId(t: AgentType): string {
  if (t === "prompt_injection_attacker") return "prompt_injection";
  return t;
}
function toDomainType(arenaId: string): AgentType {
  if (arenaId === "prompt_injection") return "prompt_injection_attacker";
  return arenaId as AgentType;
}

function statusAdapter(
  agentType: AgentType,
  agentRunStates: AgentRunState[],
  activeAgent: AgentType | null,
  judgeOnStand: boolean,
): ArenaStatus {
  if (agentType === "final_judge" && judgeOnStand) return "speaking";
  if (activeAgent === agentType) return "speaking";
  const me = agentRunStates.find((a) => a.agentType === agentType);
  if (me?.status === "complete") return "spoken";
  if (me?.status === "running") return "speaking";
  return "waiting";
}

/**
 * Build the six ArenaAgents from live trial state. Each agent's visual
 * config (image, color, name) comes from the bundled defaults; we only
 * override `status`, `speechBubble`, and `severity`.
 */
export function mapAgents(
  agentRunStates: AgentRunState[],
  activeAgent: AgentType | null,
  judgeOnStand: boolean,
  verdict: Verdict | undefined,
): ArenaAgent[] {
  return Object.values(ARENA_DEFAULTS_BY_ID).map((defaults) => {
    const domainType = toDomainType(defaults.id);
    const me = agentRunStates.find((a) => a.agentType === domainType);
    const message = me?.message;
    const isJudge = domainType === "final_judge";

    const speech =
      isJudge && verdict
        ? verdict.judgeClosingStatement ?? verdict.summary ?? defaults.speechBubble
        : message
          ? getBubbleText(message, domainType, undefined) ?? message.headline ?? defaults.speechBubble
          : defaults.speechBubble;

    return {
      ...defaults,
      status: statusAdapter(domainType, agentRunStates, activeAgent, judgeOnStand),
      speechBubble: speech,
      severity: message?.severity
        ? severityAdapter(message.severity)
        : defaults.severity,
    };
  });
}

/** A short, punchy verdict label suitable for the arena top-strip. */
function verdictLabelText(label?: VerdictLabel): string {
  if (label === "safe_to_demo") return "Safe to demo";
  if (label === "needs_fixes") return "Needs fixes before launch";
  if (label === "high_risk") return "High risk — do not ship";
  return "Awaiting verdict";
}

export function mapProduct(
  product: ProductInput,
  initialRisks: RiskCard[],
  verdict: Verdict | undefined,
  currentAccusation: string,
): ProductOnTrial {
  const score = verdict?.launchReadinessScore ?? 0;
  const evidenceChips: EvidenceChip[] = [...initialRisks]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 4)
    .map((r) => ({
      id: r.id,
      label: r.title,
      severity: severityAdapter(r.severity),
    }));

  return {
    name: product.productName,
    description: product.productDescription,
    score,
    maxScore: 100,
    verdict: verdictLabelText(verdict?.verdictLabel),
    currentAccusation,
    evidenceChips,
  };
}

/**
 * Build the trial-step script from completed messages, with a final
 * judge-step appended once the verdict lands. Steps are ordered by the
 * canonical specialist order so prev/next walks through them naturally.
 */
export function mapTrialSteps(
  agentRunStates: AgentRunState[],
  verdict: Verdict | undefined,
): TrialStep[] {
  const steps: TrialStep[] = [];
  for (const t of SPECIALIST_AGENT_TYPES) {
    const me = agentRunStates.find((a) => a.agentType === t);
    const message = me?.message;
    if (!message) continue;
    steps.push({
      activeAgentId: toArenaId(t),
      accusation:
        getBubbleText(message, t, undefined) ??
        message.keyQuestion ??
        message.headline ??
        "",
    });
  }
  if (verdict) {
    steps.push({
      activeAgentId: "final_judge",
      accusation: verdict.judgeClosingStatement ?? verdict.summary ?? "",
    });
  }
  return steps;
}

/** Find the step index that matches the currently-active agent. */
export function activeStepIndex(
  steps: TrialStep[],
  activeAgent: AgentType | null,
  judgeOnStand: boolean,
): number {
  if (judgeOnStand) {
    const idx = steps.findIndex((s) => s.activeAgentId === "final_judge");
    if (idx >= 0) return idx;
  }
  if (activeAgent) {
    const arenaId = toArenaId(activeAgent);
    const idx = steps.findIndex((s) => s.activeAgentId === arenaId);
    if (idx >= 0) return idx;
  }
  return Math.max(0, steps.length - 1);
}
