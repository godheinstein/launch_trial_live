import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { AUTONOMY, TRIAL_STATUS } from "./schema";

/* Server-side length caps. Mirror the client form validators in
 * `src/components/TrialSetupForm.tsx` (do not trust the client). */
const MAX = {
  productName: 120,
  productDescription: 3000,
  targetUsers: 1000,
  aiActions: 1500,
  dataAccessed: 1500,
  additionalContext: 3000,
} as const;

function clip(value: string, max: number, field: string): string {
  if (typeof value !== "string") {
    throw new Error(`${field} must be a string`);
  }
  if (value.length > max) {
    throw new Error(
      `${field} is too long (${value.length} chars, max ${max}).`,
    );
  }
  return value.trim();
}

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
    // Per-deployment rate limit: 60 trial creations per hour. Keeps an
    // unauthenticated deployment from being filled up with junk records.
    const allowed = await ctx.runMutation(internal.rateLimit.tryConsume, {
      key: "createTrial:global",
      max: 60,
      windowMs: 60 * 60 * 1000,
    });
    if (!allowed) {
      throw new Error(
        "Too many trial creations right now. Please wait a moment and try again.",
      );
    }

    const productName = clip(args.productName, MAX.productName, "productName");
    if (productName.length === 0) {
      throw new Error("productName is required");
    }
    const productDescription = clip(
      args.productDescription,
      MAX.productDescription,
      "productDescription",
    );
    if (productDescription.length === 0) {
      throw new Error("productDescription is required");
    }
    const targetUsers = clip(args.targetUsers, MAX.targetUsers, "targetUsers");
    const aiActions = clip(args.aiActions, MAX.aiActions, "aiActions");
    const dataAccessed = clip(args.dataAccessed, MAX.dataAccessed, "dataAccessed");
    const additionalContext =
      args.additionalContext === undefined
        ? undefined
        : clip(args.additionalContext, MAX.additionalContext, "additionalContext");

    const now = Date.now();
    const trialId = await ctx.db.insert("trials", {
      productName,
      productDescription,
      targetUsers,
      aiActions,
      dataAccessed,
      autonomyLevel: args.autonomyLevel,
      additionalContext,
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
