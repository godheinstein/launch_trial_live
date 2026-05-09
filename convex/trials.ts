import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { AUTONOMY, TRIAL_STATUS } from "./schema";

export const createTrial = mutation({
  args: {
    productName: v.string(),
    productDescription: v.string(),
    targetUsers: v.string(),
    aiActions: v.string(),
    dataAccessed: v.string(),
    autonomyLevel: AUTONOMY,
    additionalContext: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const trialId = await ctx.db.insert("trials", {
      ...args,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
    return { trialId };
  },
});

export const getTrial = query({
  args: { trialId: v.id("trials") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.trialId);
  },
});

export const getRecentTrials = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("trials")
      .withIndex("by_createdAt")
      .order("desc")
      .take(args.limit ?? 20);
  },
});

export const getTrialInternal = internalQuery({
  args: { trialId: v.id("trials") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.trialId);
  },
});

export const getSelectedRisks = internalQuery({
  args: { trialId: v.id("trials") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("riskCards")
      .withIndex("by_trial_phase", (q) =>
        q.eq("trialId", args.trialId).eq("phase", "initial"),
      )
      .collect();
    return all.filter((r) => r.selectedForFix);
  },
});

export const updateTrialStatus = internalMutation({
  args: {
    trialId: v.id("trials"),
    status: TRIAL_STATUS,
    initialScore: v.optional(v.number()),
    retrialScore: v.optional(v.number()),
    improvedSpec: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {
      status: args.status,
      updatedAt: Date.now(),
    };
    if (args.initialScore !== undefined) patch.initialScore = args.initialScore;
    if (args.retrialScore !== undefined) patch.retrialScore = args.retrialScore;
    if (args.improvedSpec !== undefined) patch.improvedSpec = args.improvedSpec;
    await ctx.db.patch(args.trialId, patch);
  },
});
