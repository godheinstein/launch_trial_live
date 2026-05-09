import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Atomic sliding-window rate-limit consumer. Returns true if the call was
 * allowed and recorded; false if the window's quota is already exhausted.
 *
 * Designed for low-write-volume protected actions (a few requests per second
 * at most). For higher throughput, swap to a token-bucket on a dedicated
 * service.
 *
 * Usage from an action:
 *   const ok = await ctx.runMutation(internal.rateLimit.tryConsume, {
 *     key: "runTrial:global", max: 30, windowMs: 60 * 60 * 1000,
 *   });
 *   if (!ok) throw new Error("Too many requests. Please wait and try again.");
 */
export const tryConsume = internalMutation({
  args: {
    key: v.string(),
    max: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const now = Date.now();
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (!existing) {
      await ctx.db.insert("rateLimits", {
        key: args.key,
        windowStart: now,
        count: 1,
      });
      return true;
    }

    const expired = now - existing.windowStart >= args.windowMs;
    if (expired) {
      await ctx.db.patch(existing._id, { windowStart: now, count: 1 });
      return true;
    }

    if (existing.count >= args.max) {
      return false;
    }

    await ctx.db.patch(existing._id, { count: existing.count + 1 });
    return true;
  },
});
