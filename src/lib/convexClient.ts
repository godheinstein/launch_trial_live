import { ConvexReactClient } from "convex/react";

export const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string | undefined;

export const isLiveMode = !!CONVEX_URL;

/**
 * Always provide a ConvexReactClient so that useQuery / useMutation hooks
 * never throw "Could not find Convex client". In demo-only mode the URL is a
 * placeholder and no actual subscriptions fire (live-mode hooks pass `"skip"`
 * when `trialId` is null and mutations are never invoked).
 */
export const convexClient: ConvexReactClient = new ConvexReactClient(
  CONVEX_URL || "https://placeholder.convex.cloud",
);
