import { useCallback, useMemo, useRef, useState } from "react";
import type {
  AgentMessage,
  AgentRunState,
  AgentType,
  ProductInput,
  RiskCard,
  Trial,
  TrialPhase,
  TrialResult,
  TrialStatus,
  Verdict,
} from "../types";
import { SPECIALIST_AGENT_TYPES } from "./agents";
import { runDemoMode, sampleTrialResult } from "../demo/runDemoMode";

type Phase = TrialPhase;

interface EngineState {
  status: TrialStatus;
  phase: Phase;
  initialAgents: AgentRunState[];
  retrialAgents: AgentRunState[];
  initialRisks: RiskCard[];
  retrialRisks: RiskCard[];
  initialVerdict?: Verdict;
  retrialVerdict?: Verdict;
}

const INITIAL_PENDING: AgentRunState[] = SPECIALIST_AGENT_TYPES.map((t) => ({
  agentType: t,
  status: "pending",
  riskIds: [],
}));

function applyAgentRunning(
  list: AgentRunState[],
  agentType: AgentType,
): AgentRunState[] {
  return list.map((a) =>
    a.agentType === agentType ? { ...a, status: "running" } : a,
  );
}

function applyAgentComplete(
  list: AgentRunState[],
  agentType: AgentType,
  message: AgentRunState["message"],
  riskIds: string[],
): AgentRunState[] {
  return list.map((a) =>
    a.agentType === agentType
      ? { ...a, status: "complete", message, riskIds }
      : a,
  );
}

export interface TrialEngineOptions {
  /** Async hook called after each specialist message lands. Used to gate
   *  progression on speech / narration duration. */
  waitAfterAgent?: (message: AgentMessage) => Promise<void>;
  /** Async hook called after the judge verdict lands. */
  waitAfterJudge?: (verdict: Verdict) => Promise<void>;
}

export function useTrialEngine(
  trialId: string,
  product: ProductInput,
  options?: TrialEngineOptions,
) {
  const optsRef = useRef(options);
  optsRef.current = options;
  const [state, setState] = useState<EngineState>({
    status: "draft",
    phase: "initial",
    initialAgents: INITIAL_PENDING,
    retrialAgents: INITIAL_PENDING,
    initialRisks: [],
    retrialRisks: [],
  });

  const runningRef = useRef(false);

  const runTrial = useCallback(
    async (phase: Phase = "initial") => {
      if (runningRef.current) return;
      runningRef.current = true;
      setState((prev) => ({
        ...prev,
        status: phase === "initial" ? "running" : "retrial_running",
        phase,
        ...(phase === "initial"
          ? {
              initialAgents: INITIAL_PENDING,
              initialRisks: [],
              initialVerdict: undefined,
            }
          : {
              retrialAgents: INITIAL_PENDING,
              retrialRisks: [],
              retrialVerdict: undefined,
            }),
      }));

      try {
        await runDemoMode(
          (event) => {
            if (event.type === "agent-running") {
              setState((prev) => ({
                ...prev,
                ...(event.phase === "initial"
                  ? {
                      initialAgents: applyAgentRunning(
                        prev.initialAgents,
                        event.agentType,
                      ),
                    }
                  : {
                      retrialAgents: applyAgentRunning(
                        prev.retrialAgents,
                        event.agentType,
                      ),
                    }),
              }));
            }
            if (event.type === "agent-complete") {
              setState((prev) => {
                const newRiskList =
                  event.phase === "initial"
                    ? [...prev.initialRisks, ...event.risks]
                    : [...prev.retrialRisks, ...event.risks];
                const updatedAgents =
                  event.phase === "initial"
                    ? applyAgentComplete(
                        prev.initialAgents,
                        event.message.agentType,
                        event.message,
                        event.risks.map((r) => r.id),
                      )
                    : applyAgentComplete(
                        prev.retrialAgents,
                        event.message.agentType,
                        event.message,
                        event.risks.map((r) => r.id),
                      );
                return {
                  ...prev,
                  ...(event.phase === "initial"
                    ? {
                        initialAgents: updatedAgents,
                        initialRisks: newRiskList,
                      }
                    : {
                        retrialAgents: updatedAgents,
                        retrialRisks: newRiskList,
                      }),
                };
              });
            }
            if (event.type === "verdict") {
              setState((prev) => ({
                ...prev,
                ...(event.phase === "initial"
                  ? { initialVerdict: event.verdict }
                  : { retrialVerdict: event.verdict }),
              }));
            }
            if (event.type === "trial-complete") {
              setState((prev) => ({
                ...prev,
                status:
                  event.phase === "initial" ? "completed" : "retrial_completed",
              }));
            }
          },
          {
            phase,
            waitAfterAgent: (m) => optsRef.current?.waitAfterAgent?.(m) ?? Promise.resolve(),
            waitAfterJudge: (v) => optsRef.current?.waitAfterJudge?.(v) ?? Promise.resolve(),
          },
        );
      } finally {
        runningRef.current = false;
      }
    },
    [],
  );

  const result = useMemo<TrialResult>(() => {
    const trial: Trial = {
      id: trialId,
      productName: product.productName,
      productDescription: product.productDescription,
      targetUsers: product.targetUsers,
      aiActions: product.aiActions,
      dataAccessed: product.dataAccessed,
      autonomyLevel: product.autonomyLevel,
      additionalContext: product.additionalContext,
      status: state.status,
      initialScore: state.initialVerdict?.launchReadinessScore,
      retrialScore: state.retrialVerdict?.launchReadinessScore,
      createdAt: sampleTrialResult.trial.createdAt,
      updatedAt: Date.now(),
    };
    return {
      trial,
      initialMessages: state.initialAgents
        .map((a) => a.message)
        .filter((m): m is NonNullable<typeof m> => !!m),
      initialRisks: state.initialRisks,
      initialVerdict: state.initialVerdict,
      retrialMessages: state.retrialAgents
        .map((a) => a.message)
        .filter((m): m is NonNullable<typeof m> => !!m),
      retrialRisks: state.retrialRisks,
      retrialVerdict: state.retrialVerdict,
    };
  }, [trialId, product, state]);

  return {
    state,
    result,
    runTrial,
    isRunning:
      state.status === "running" || state.status === "retrial_running",
  };
}
