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
  /** Time the "running" state shows before the message arrives. */
  preMessageDelayMs?: number;
  /** Beat between the last specialist and the judge. */
  judgeDelayMs?: number;
  /** Beat before the trial-started event. */
  startupDelayMs?: number;
  phase?: "initial" | "retrial";
  /**
   * Called after each specialist message lands. The runner waits for the
   * returned promise before progressing to the next agent. Use this to
   * gate progression on speech narration / TTS playback duration.
   */
  waitAfterAgent?: (message: AgentMessage) => Promise<void>;
  /**
   * Called after the judge verdict lands. Same gating semantics as
   * `waitAfterAgent` but for the closing statement.
   */
  waitAfterJudge?: (verdict: Verdict) => Promise<void>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runDemoMode(
  onEvent: (event: DemoEvent) => void,
  options: DemoOptions = {},
): Promise<TrialResult> {
  const phase = options.phase ?? "initial";
  const startupDelay = options.startupDelayMs ?? 350;
  const preMessage = options.preMessageDelayMs ?? 600;
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
    await sleep(preMessage);
    const message = messages.find((m) => m.agentType === agentType);
    if (!message) continue;
    const matchedRisks = risks.filter((r) => r.agentType === agentType);
    onEvent({
      type: "agent-complete",
      phase,
      message,
      risks: matchedRisks,
    });

    // Hold this agent on stage until narration finishes (or the user skips).
    if (options.waitAfterAgent) {
      await options.waitAfterAgent(message);
    }
  }

  onEvent({ type: "judge-running", phase });
  await sleep(judgeDelay);
  if (verdict) {
    onEvent({ type: "verdict", phase, verdict });
    if (options.waitAfterJudge) {
      await options.waitAfterJudge(verdict);
    }
  }
  onEvent({ type: "trial-complete", phase });

  return sampleTrialResult;
}
