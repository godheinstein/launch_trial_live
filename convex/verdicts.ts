import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { PHASE, VERDICT_LABEL } from "./schema";

export const insertVerdict = internalMutation({
  args: {
    trialId: v.id("trials"),
    phase: PHASE,
    launchReadinessScore: v.number(),
    verdictLabel: VERDICT_LABEL,
    summary: v.string(),
    topRisks: v.array(v.string()),
    recommendedFixes: v.array(v.string()),
    improvedPositioning: v.string(),
    judgeClosingStatement: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("verdicts", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getVerdict = query({
  args: { trialId: v.id("trials"), phase: PHASE },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("verdicts")
      .withIndex("by_trial_phase", (q) =>
        q.eq("trialId", args.trialId).eq("phase", args.phase),
      )
      .first();
  },
});
