import { useCallback, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type {
  AgentRunState,
  AgentType,
  ProductInput,
  RiskCard,
  Trial,
  TrialResult,
  TrialStatus,
  Verdict,
} from "../types";
import { SPECIALIST_AGENT_TYPES } from "./agents";

interface ConvexTrial {
  _id: Id<"trials">;
  productName: string;
  productDescription: string;
  targetUsers: string;
  aiActions: string;
  dataAccessed: string;
  autonomyLevel: ProductInput["autonomyLevel"];
  additionalContext?: string;
  improvedSpec?: string;
  status: TrialStatus;
  initialScore?: number;
  retrialScore?: number;
  createdAt: number;
  updatedAt: number;
}

interface ConvexAgentMessage {
  _id: Id<"agentMessages">;
  trialId: Id<"trials">;
  phase: "initial" | "retrial";
  agentType: AgentType;
  agentName: string;
  headline: string;
  critique: string;
  keyQuestion: string;
  suggestedFix: string;
  severity: RiskCard["severity"];
  createdAt: number;
}

interface ConvexRiskCard {
  _id: Id<"riskCards">;
  trialId: Id<"trials">;
  phase: "initial" | "retrial";
  title: string;
  category: RiskCard["category"];
  severity: RiskCard["severity"];
  description: string;
  impact: string;
  fix: string;
  agentType: AgentType;
  selectedForFix: boolean;
  createdAt: number;
}

interface ConvexVerdict {
  _id: Id<"verdicts">;
  trialId: Id<"trials">;
  phase: "initial" | "retrial";
  launchReadinessScore: number;
  verdictLabel: Verdict["verdictLabel"];
  summary: string;
  topRisks: string[];
  recommendedFixes: string[];
  improvedPositioning: string;
  judgeClosingStatement: string;
  createdAt: number;
}

function trialFromConvex(t: ConvexTrial): Trial {
  return {
    id: t._id,
    productName: t.productName,
    productDescription: t.productDescription,
    targetUsers: t.targetUsers,
    aiActions: t.aiActions,
    dataAccessed: t.dataAccessed,
    autonomyLevel: t.autonomyLevel,
    additionalContext: t.additionalContext,
    status: t.status,
    initialScore: t.initialScore,
    retrialScore: t.retrialScore,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

function messageFromConvex(m: ConvexAgentMessage) {
  return {
    id: m._id,
    trialId: m.trialId,
    phase: m.phase,
    agentType: m.agentType,
    agentName: m.agentName,
    headline: m.headline,
    critique: m.critique,
    keyQuestion: m.keyQuestion,
    suggestedFix: m.suggestedFix,
    severity: m.severity,
    createdAt: m.createdAt,
  };
}

function riskFromConvex(r: ConvexRiskCard): RiskCard {
  return {
    id: r._id,
    trialId: r.trialId,
    phase: r.phase,
    title: r.title,
    category: r.category,
    severity: r.severity,
    description: r.description,
    impact: r.impact,
    fix: r.fix,
    agentType: r.agentType,
    selectedForFix: r.selectedForFix,
    createdAt: r.createdAt,
  };
}

function verdictFromConvex(v: ConvexVerdict): Verdict {
  return {
    trialId: v.trialId,
    phase: v.phase,
    launchReadinessScore: v.launchReadinessScore,
    verdictLabel: v.verdictLabel,
    summary: v.summary,
    topRisks: v.topRisks,
    recommendedFixes: v.recommendedFixes,
    improvedPositioning: v.improvedPositioning,
    judgeClosingStatement: v.judgeClosingStatement,
    createdAt: v.createdAt,
  };
}

function buildAgents(
  messages: ConvexAgentMessage[] | undefined,
  risks: ConvexRiskCard[] | undefined,
  isRunning: boolean,
): AgentRunState[] {
  const safeMessages = messages ?? [];
  const safeRisks = risks ?? [];
  const order = SPECIALIST_AGENT_TYPES;

  const completed = new Set(safeMessages.map((m) => m.agentType));
  // The next agent in order that doesn't yet have a message is "running" when we know the trial is still active.
  const nextAgent = order.find((t) => !completed.has(t));

  return order.map<AgentRunState>((agentType) => {
    const message = safeMessages.find((m) => m.agentType === agentType);
    const matchedRisks = safeRisks
      .filter((r) => r.agentType === agentType)
      .map((r) => r._id as string);
    if (message) {
      return {
        agentType,
        status: "complete",
        message: messageFromConvex(message),
        riskIds: matchedRisks,
      };
    }
    if (isRunning && agentType === nextAgent) {
      return { agentType, status: "running", riskIds: [] };
    }
    return { agentType, status: "pending", riskIds: [] };
  });
}

export function useLiveTrial(trialId: Id<"trials"> | null) {
  const trial = useQuery(
    api.trials.getTrial,
    trialId ? { trialId } : "skip",
  ) as ConvexTrial | null | undefined;
  const initialMessages = useQuery(
    api.messages.getAgentMessages,
    trialId ? { trialId, phase: "initial" } : "skip",
  ) as ConvexAgentMessage[] | undefined;
  const retrialMessages = useQuery(
    api.messages.getAgentMessages,
    trialId ? { trialId, phase: "retrial" } : "skip",
  ) as ConvexAgentMessage[] | undefined;
  const initialRisks = useQuery(
    api.risks.getRiskCards,
    trialId ? { trialId, phase: "initial" } : "skip",
  ) as ConvexRiskCard[] | undefined;
  const retrialRisks = useQuery(
    api.risks.getRiskCards,
    trialId ? { trialId, phase: "retrial" } : "skip",
  ) as ConvexRiskCard[] | undefined;
  const initialVerdict = useQuery(
    api.verdicts.getVerdict,
    trialId ? { trialId, phase: "initial" } : "skip",
  ) as ConvexVerdict | null | undefined;
  const retrialVerdict = useQuery(
    api.verdicts.getVerdict,
    trialId ? { trialId, phase: "retrial" } : "skip",
  ) as ConvexVerdict | null | undefined;

  const toggleRiskFix = useMutation(api.risks.toggleRiskFix);
  const startInitial = useAction(api.runner.runTrial);
  const startRetrial = useAction(api.runner.runRetrial);

  const [actionError, setActionError] = useState<string | null>(null);

  const status: TrialStatus = trial?.status ?? "draft";
  const isRunning =
    status === "running" || status === "retrial_running";
  const showRetrial = !!retrialVerdict;

  const initialAgents = useMemo(
    () => buildAgents(initialMessages, initialRisks, status === "running"),
    [initialMessages, initialRisks, status],
  );
  const retrialAgents = useMemo(
    () => buildAgents(retrialMessages, retrialRisks, status === "retrial_running"),
    [retrialMessages, retrialRisks, status],
  );

  const result = useMemo<TrialResult | null>(() => {
    if (!trial) return null;
    return {
      trial: trialFromConvex(trial),
      initialMessages: (initialMessages ?? []).map(messageFromConvex),
      initialRisks: (initialRisks ?? []).map(riskFromConvex),
      initialVerdict: initialVerdict ? verdictFromConvex(initialVerdict) : undefined,
      retrialMessages: (retrialMessages ?? []).map(messageFromConvex),
      retrialRisks: (retrialRisks ?? []).map(riskFromConvex),
      retrialVerdict: retrialVerdict ? verdictFromConvex(retrialVerdict) : undefined,
    };
  }, [
    trial,
    initialMessages,
    initialRisks,
    initialVerdict,
    retrialMessages,
    retrialRisks,
    retrialVerdict,
  ]);

  const runTrial = useCallback(
    async (phase: "initial" | "retrial") => {
      if (!trialId) return;
      setActionError(null);
      try {
        if (phase === "initial") {
          await startInitial({ trialId });
        } else {
          await startRetrial({ trialId });
        }
      } catch (err) {
        setActionError(err instanceof Error ? err.message : String(err));
      }
    },
    [trialId, startInitial, startRetrial],
  );

  const toggleRisk = useCallback(
    async (riskId: string, selected: boolean) => {
      await toggleRiskFix({
        riskCardId: riskId as Id<"riskCards">,
        selectedForFix: selected,
      });
    },
    [toggleRiskFix],
  );

  return {
    isReady: trial !== undefined,
    trial,
    state: {
      status,
      initialAgents,
      retrialAgents,
      initialRisks: (initialRisks ?? []).map(riskFromConvex),
      retrialRisks: (retrialRisks ?? []).map(riskFromConvex),
      initialVerdict: initialVerdict ? verdictFromConvex(initialVerdict) : undefined,
      retrialVerdict: retrialVerdict ? verdictFromConvex(retrialVerdict) : undefined,
    },
    result,
    runTrial,
    toggleRisk,
    isRunning,
    showRetrial,
    actionError,
  };
}
