import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { AGENT_TYPE, CATEGORY, PHASE, SEVERITY } from "./schema";

export const insertRiskCard = internalMutation({
  args: {
    trialId: v.id("trials"),
    phase: PHASE,
    title: v.string(),
    category: CATEGORY,
    severity: SEVERITY,
    description: v.string(),
    impact: v.string(),
    fix: v.string(),
    agentType: AGENT_TYPE,
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("riskCards", {
      ...args,
      selectedForFix: false,
      createdAt: Date.now(),
    });
  },
});

export const getRiskCards = query({
  args: { trialId: v.id("trials"), phase: PHASE },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("riskCards")
      .withIndex("by_trial_phase", (q) =>
        q.eq("trialId", args.trialId).eq("phase", args.phase),
      )
      .order("asc")
      .collect();
  },
});

export const toggleRiskFix = mutation({
  args: {
    riskCardId: v.id("riskCards"),
    selectedForFix: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.riskCardId, {
      selectedForFix: args.selectedForFix,
    });
  },
});
