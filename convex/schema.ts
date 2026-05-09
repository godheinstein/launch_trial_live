import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const SEVERITY = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
  v.literal("critical"),
);

export const AUTONOMY = v.union(
  v.literal("none"),
  v.literal("suggests_only"),
  v.literal("requires_approval"),
  v.literal("acts_automatically"),
);

export const TRIAL_STATUS = v.union(
  v.literal("draft"),
  v.literal("running"),
  v.literal("completed"),
  v.literal("retrial_running"),
  v.literal("retrial_completed"),
  v.literal("error"),
);

export const PHASE = v.union(v.literal("initial"), v.literal("retrial"));

export const AGENT_TYPE = v.union(
  v.literal("malicious_user"),
  v.literal("privacy_auditor"),
  v.literal("confused_customer"),
  v.literal("prompt_injection_attacker"),
  v.literal("skeptical_investor"),
  v.literal("final_judge"),
);

export const CATEGORY = v.union(
  v.literal("privacy"),
  v.literal("security"),
  v.literal("ux"),
  v.literal("business"),
  v.literal("trust"),
  v.literal("compliance"),
  v.literal("prompt_injection"),
  v.literal("safety"),
);

export const VERDICT_LABEL = v.union(
  v.literal("safe_to_demo"),
  v.literal("needs_fixes"),
  v.literal("high_risk"),
);

export default defineSchema({
  trials: defineTable({
    productName: v.string(),
    productDescription: v.string(),
    targetUsers: v.string(),
    aiActions: v.string(),
    dataAccessed: v.string(),
    autonomyLevel: AUTONOMY,
    additionalContext: v.optional(v.string()),
    improvedSpec: v.optional(v.string()),
    status: TRIAL_STATUS,
    initialScore: v.optional(v.number()),
    retrialScore: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),

  agentMessages: defineTable({
    trialId: v.id("trials"),
    phase: PHASE,
    agentType: AGENT_TYPE,
    agentName: v.string(),
    headline: v.string(),
    critique: v.string(),
    keyQuestion: v.string(),
    suggestedFix: v.string(),
    severity: SEVERITY,
    createdAt: v.number(),
  })
    .index("by_trial_phase", ["trialId", "phase"])
    .index("by_trial_phase_agent", ["trialId", "phase", "agentType"]),

  riskCards: defineTable({
    trialId: v.id("trials"),
    phase: PHASE,
    title: v.string(),
    category: CATEGORY,
    severity: SEVERITY,
    description: v.string(),
    impact: v.string(),
    fix: v.string(),
    agentType: AGENT_TYPE,
    selectedForFix: v.boolean(),
    createdAt: v.number(),
  }).index("by_trial_phase", ["trialId", "phase"]),

  verdicts: defineTable({
    trialId: v.id("trials"),
    phase: PHASE,
    launchReadinessScore: v.number(),
    verdictLabel: VERDICT_LABEL,
    summary: v.string(),
    topRisks: v.array(v.string()),
    recommendedFixes: v.array(v.string()),
    improvedPositioning: v.string(),
    judgeClosingStatement: v.string(),
    createdAt: v.number(),
  }).index("by_trial_phase", ["trialId", "phase"]),

  reports: defineTable({
    trialId: v.id("trials"),
    markdown: v.string(),
    createdAt: v.number(),
  }).index("by_trial", ["trialId"]),

  /**
   * Sliding-window rate limits keyed by `key` (e.g. "runTrial:global" or
   * "fal:generateAll:global"). One row per key; mutations atomically
   * increment within the active window or reset when expired. Lets us
   * cap expensive provider calls without an external Redis.
   */
  rateLimits: defineTable({
    key: v.string(),
    /** Window start in epoch ms. */
    windowStart: v.number(),
    /** Calls in this window. */
    count: v.number(),
  }).index("by_key", ["key"]),

  /**
   * Optional Fal-generated character images, one row per agentType. Used by
   * the Debate Arena to upgrade the bundled CDN/silhouette default. Falls
   * back gracefully when missing.
   */
  agentAssets: defineTable({
    agentType: AGENT_TYPE,
    imageUrl: v.string(),
    /** Prompt used at generation time, useful for debugging. */
    prompt: v.string(),
    /** Optional Fal request id / model id for traceability. */
    sourceRef: v.optional(v.string()),
    generatedAt: v.number(),
  }).index("by_agentType", ["agentType"]),
});
