import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { AGENT_TYPE, PHASE, SEVERITY } from "./schema";

export const insertAgentMessage = internalMutation({
  args: {
    trialId: v.id("trials"),
    phase: PHASE,
    agentType: AGENT_TYPE,
    agentName: v.string(),
    headline: v.string(),
    critique: v.string(),
    keyQuestion: v.string(),
    suggestedFix: v.string(),
    severity: SEVERITY,
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agentMessages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getAgentMessages = query({
  args: { trialId: v.id("trials"), phase: PHASE },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agentMessages")
      .withIndex("by_trial_phase", (q) =>
        q.eq("trialId", args.trialId).eq("phase", args.phase),
      )
      .order("asc")
      .collect();
  },
});
