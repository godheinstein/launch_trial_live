import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { AGENT_TYPE } from "./schema";

/**
 * Return the latest generated image URL per agentType. The arena mapper
 * overlays these on top of the bundled CDN defaults.
 */
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("agentAssets").collect();
    return rows.map((r) => ({
      agentType: r.agentType,
      imageUrl: r.imageUrl,
      generatedAt: r.generatedAt,
    }));
  },
});

/**
 * Upsert one agent's generated image. Called from the Fal action.
 */
export const upsert = internalMutation({
  args: {
    agentType: AGENT_TYPE,
    imageUrl: v.string(),
    prompt: v.string(),
    sourceRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentAssets")
      .withIndex("by_agentType", (q) => q.eq("agentType", args.agentType))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        imageUrl: args.imageUrl,
        prompt: args.prompt,
        sourceRef: args.sourceRef,
        generatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("agentAssets", {
        ...args,
        generatedAt: Date.now(),
      });
    }
  },
});
