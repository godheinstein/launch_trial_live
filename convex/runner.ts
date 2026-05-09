"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  AGENT_NAMES,
  AGENT_PROMPTS,
  AGENT_RESPONSE_SCHEMA,
  FINAL_JUDGE,
  RETRIAL_SPEC,
  SHARED_SYSTEM,
  VERDICT_RESPONSE_SCHEMA,
} from "./prompts";
import { callPlainText, callStructured } from "./openai";

type AgentType =
  | "malicious_user"
  | "privacy_auditor"
  | "confused_customer"
  | "prompt_injection_attacker"
  | "skeptical_investor";

type Severity = "low" | "medium" | "high" | "critical";

type Category =
  | "privacy"
  | "security"
  | "ux"
  | "business"
  | "trust"
  | "compliance"
  | "prompt_injection"
  | "safety";

type VerdictLabel = "safe_to_demo" | "needs_fixes" | "high_risk";

type Phase = "initial" | "retrial";

interface AgentJsonResponse {
  agentName: string;
  headline: string;
  critique: string;
  keyQuestion: string;
  severity: Severity;
  suggestedFix: string;
  riskCards: Array<{
    title: string;
    category: Category;
    severity: Severity;
    description: string;
    impact: string;
    fix: string;
  }>;
}

interface VerdictJsonResponse {
  launchReadinessScore: number;
  verdictLabel: VerdictLabel;
  summary: string;
  topRisks: string[];
  recommendedFixes: string[];
  improvedPositioning: string;
  judgeClosingStatement: string;
}

const SPECIALIST_AGENTS: AgentType[] = [
  "malicious_user",
  "privacy_auditor",
  "confused_customer",
  "prompt_injection_attacker",
  "skeptical_investor",
];

function buildProductContext(trial: {
  productName: string;
  productDescription: string;
  targetUsers: string;
  aiActions: string;
  dataAccessed: string;
  autonomyLevel: string;
  additionalContext?: string;
  improvedSpec?: string;
}): string {
  const description = trial.improvedSpec ?? trial.productDescription;
  const lines = [
    `Product name: ${trial.productName}`,
    `Description: ${description}`,
    `Target users: ${trial.targetUsers}`,
    `AI actions: ${trial.aiActions}`,
    `Data accessed: ${trial.dataAccessed}`,
    `Autonomy level: ${trial.autonomyLevel}`,
  ];
  if (trial.additionalContext) {
    lines.push(`Additional context: ${trial.additionalContext}`);
  }
  return lines.join("\n");
}

async function runOneAgent(
  ctx: any,
  trialId: Id<"trials">,
  phase: Phase,
  agentType: AgentType,
  productContext: string,
) {
  const prompt = AGENT_PROMPTS[agentType].replace(
    "{{PRODUCT_CONTEXT}}",
    productContext,
  );
  const json = await callStructured<AgentJsonResponse>({
    schemaName: "agent_response",
    schema: AGENT_RESPONSE_SCHEMA,
    messages: [
      { role: "system", content: SHARED_SYSTEM },
      { role: "user", content: prompt },
    ],
  });

  await ctx.runMutation(internal.messages.insertAgentMessage, {
    trialId,
    phase,
    agentType,
    agentName: json.agentName || AGENT_NAMES[agentType],
    headline: json.headline,
    critique: json.critique,
    keyQuestion: json.keyQuestion,
    suggestedFix: json.suggestedFix,
    severity: json.severity,
  });

  for (const risk of json.riskCards) {
    await ctx.runMutation(internal.risks.insertRiskCard, {
      trialId,
      phase,
      title: risk.title,
      category: risk.category,
      severity: risk.severity,
      description: risk.description,
      impact: risk.impact,
      fix: risk.fix,
      agentType,
    });
  }

  return json;
}

async function runJudge(
  ctx: any,
  trialId: Id<"trials">,
  phase: Phase,
  productContext: string,
  findings: AgentJsonResponse[],
) {
  const findingsText = findings
    .map(
      (f) =>
        `### ${f.agentName}\nHeadline: ${f.headline}\nSeverity: ${f.severity}\nCritique: ${f.critique}\nKey question: ${f.keyQuestion}\nSuggested fix: ${f.suggestedFix}\nRisk cards:\n${f.riskCards
          .map(
            (r) =>
              `- [${r.severity}] ${r.title} (${r.category}): ${r.description} | impact: ${r.impact} | fix: ${r.fix}`,
          )
          .join("\n")}`,
    )
    .join("\n\n");

  const prompt = FINAL_JUDGE.replace("{{PRODUCT_CONTEXT}}", productContext)
    .replace("{{AGENT_FINDINGS}}", findingsText);

  const verdict = await callStructured<VerdictJsonResponse>({
    schemaName: "verdict",
    schema: VERDICT_RESPONSE_SCHEMA,
    messages: [
      { role: "system", content: SHARED_SYSTEM },
      { role: "user", content: prompt },
    ],
  });

  await ctx.runMutation(internal.verdicts.insertVerdict, {
    trialId,
    phase,
    launchReadinessScore: verdict.launchReadinessScore,
    verdictLabel: verdict.verdictLabel,
    summary: verdict.summary,
    topRisks: verdict.topRisks,
    recommendedFixes: verdict.recommendedFixes,
    improvedPositioning: verdict.improvedPositioning,
    judgeClosingStatement: verdict.judgeClosingStatement,
  });

  return verdict;
}

export const runTrial = action({
  args: { trialId: v.id("trials") },
  handler: async (ctx, args) => {
    const trial = await ctx.runQuery(internal.trials.getTrialInternal, {
      trialId: args.trialId,
    });
    if (!trial) throw new Error("trial not found");

    await ctx.runMutation(internal.trials.updateTrialStatus, {
      trialId: args.trialId,
      status: "running",
    });

    const productContext = buildProductContext(trial);
    const findings: AgentJsonResponse[] = [];
    try {
      for (const agentType of SPECIALIST_AGENTS) {
        const f = await runOneAgent(
          ctx,
          args.trialId,
          "initial",
          agentType,
          productContext,
        );
        findings.push(f);
      }
      const verdict = await runJudge(
        ctx,
        args.trialId,
        "initial",
        productContext,
        findings,
      );
      await ctx.runMutation(internal.trials.updateTrialStatus, {
        trialId: args.trialId,
        status: "completed",
        initialScore: verdict.launchReadinessScore,
      });
    } catch (err) {
      await ctx.runMutation(internal.trials.updateTrialStatus, {
        trialId: args.trialId,
        status: "error",
      });
      throw err;
    }
  },
});

export const runRetrial = action({
  args: { trialId: v.id("trials") },
  handler: async (ctx, args) => {
    const trial = await ctx.runQuery(internal.trials.getTrialInternal, {
      trialId: args.trialId,
    });
    if (!trial) throw new Error("trial not found");

    const initialRisks = await ctx.runQuery(internal.trials.getSelectedRisks, {
      trialId: args.trialId,
    });
    if (initialRisks.length === 0) {
      throw new Error("Select at least one risk to fix before retrial");
    }

    await ctx.runMutation(internal.trials.updateTrialStatus, {
      trialId: args.trialId,
      status: "retrial_running",
    });

    try {
      const baseContext = buildProductContext({
        ...trial,
        improvedSpec: undefined,
      });

      const fixesText = initialRisks
        .map(
          (r: any, i: number) =>
            `${i + 1}. [${r.severity}] ${r.title} — apply fix: ${r.fix}`,
        )
        .join("\n");

      const retrialPrompt = RETRIAL_SPEC.replace(
        "{{PRODUCT_CONTEXT}}",
        baseContext,
      ).replace("{{SELECTED_FIXES}}", fixesText);

      const improvedSpec = await callPlainText([
        { role: "system", content: SHARED_SYSTEM },
        { role: "user", content: retrialPrompt },
      ]);

      await ctx.runMutation(internal.trials.updateTrialStatus, {
        trialId: args.trialId,
        status: "retrial_running",
        improvedSpec,
      });

      const productContext = buildProductContext({
        ...trial,
        improvedSpec,
      });

      const findings: AgentJsonResponse[] = [];
      for (const agentType of SPECIALIST_AGENTS) {
        const f = await runOneAgent(
          ctx,
          args.trialId,
          "retrial",
          agentType,
          productContext,
        );
        findings.push(f);
      }
      const verdict = await runJudge(
        ctx,
        args.trialId,
        "retrial",
        productContext,
        findings,
      );
      await ctx.runMutation(internal.trials.updateTrialStatus, {
        trialId: args.trialId,
        status: "retrial_completed",
        retrialScore: verdict.launchReadinessScore,
      });
    } catch (err) {
      await ctx.runMutation(internal.trials.updateTrialStatus, {
        trialId: args.trialId,
        status: "error",
      });
      throw err;
    }
  },
});
