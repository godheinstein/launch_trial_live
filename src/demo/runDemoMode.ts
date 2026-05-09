import sampleTrialResultJson from "./sampleTrialResult.json";
import type {
  AgentMessage,
  AgentType,
  RiskCard,
  TrialResult,
  Verdict,
} from "../types";
import { SPECIALIST_AGENT_TYPES } from "../lib/agents";

export const sampleTrialResult = sampleTrialResultJson as unknown as TrialResult;

export type DemoEvent =
  | { type: "trial-started"; phase: "initial" | "retrial" }
  | { type: "agent-running"; phase: "initial" | "retrial"; agentType: AgentType }
  | {
      type: "agent-complete";
      phase: "initial" | "retrial";
      message: AgentMessage;
      risks: RiskCard[];
    }
  | { type: "judge-running"; phase: "initial" | "retrial" }
  | { type: "verdict"; phase: "initial" | "retrial"; verdict: Verdict }
  | { type: "trial-complete"; phase: "initial" | "retrial" };

export interface DemoOptions {
  perAgentDelayMs?: number;
  judgeDelayMs?: number;
  startupDelayMs?: number;
  phase?: "initial" | "retrial";
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runDemoMode(
  onEvent: (event: DemoEvent) => void,
  options: DemoOptions = {},
): Promise<TrialResult> {
  const phase = options.phase ?? "initial";
  const startupDelay = options.startupDelayMs ?? 350;
  const perAgent = options.perAgentDelayMs ?? 950;
  const judgeDelay = options.judgeDelayMs ?? 900;

  const messages =
    phase === "initial"
      ? sampleTrialResult.initialMessages
      : sampleTrialResult.retrialMessages;
  const risks =
    phase === "initial"
      ? sampleTrialResult.initialRisks
      : sampleTrialResult.retrialRisks;
  const verdict =
    phase === "initial"
      ? sampleTrialResult.initialVerdict
      : sampleTrialResult.retrialVerdict;

  await sleep(startupDelay);
  onEvent({ type: "trial-started", phase });

  for (const agentType of SPECIALIST_AGENT_TYPES) {
    onEvent({ type: "agent-running", phase, agentType });
    await sleep(perAgent);
    const message = messages.find((m) => m.agentType === agentType);
    if (!message) continue;
    const matchedRisks = risks.filter((r) => r.agentType === agentType);
    onEvent({
      type: "agent-complete",
      phase,
      message,
      risks: matchedRisks,
    });
  }

  onEvent({ type: "judge-running", phase });
  await sleep(judgeDelay);
  if (verdict) {
    onEvent({ type: "verdict", phase, verdict });
  }
  onEvent({ type: "trial-complete", phase });

  return sampleTrialResult;
}
