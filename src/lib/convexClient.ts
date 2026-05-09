import { ConvexReactClient } from "convex/react";

export const CONVEX_URL = import.meta.env.VITE_CONVEX_URL as string | undefined;

export const convexClient: ConvexReactClient | null = CONVEX_URL
  ? new ConvexReactClient(CONVEX_URL)
  : null;

export const isLiveMode = !!convexClient;
