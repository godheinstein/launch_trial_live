/*
 * Live-mode hook stub.
 *
 * After `npx convex dev` generates `convex/_generated/api.ts`, replace this
 * file with a hook that reads the trial state from Convex and exposes the same
 * shape as `useTrialEngine`. Reference implementation:
 *
 *   import { useMutation, useQuery } from "convex/react";
 *   import { api } from "../../convex/_generated/api";
 *   import type { Id } from "../../convex/_generated/dataModel";
 *
 *   export function useLiveTrial(trialId: Id<"trials">) {
 *     const trial = useQuery(api.trials.getTrial, { trialId });
 *     const initialMessages = useQuery(api.messages.getAgentMessages, {
 *       trialId,
 *       phase: "initial",
 *     });
 *     const initialRisks = useQuery(api.risks.getRiskCards, {
 *       trialId,
 *       phase: "initial",
 *     });
 *     const initialVerdict = useQuery(api.verdicts.getVerdict, {
 *       trialId,
 *       phase: "initial",
 *     });
 *     const retrialMessages = useQuery(api.messages.getAgentMessages, {
 *       trialId,
 *       phase: "retrial",
 *     });
 *     const retrialRisks = useQuery(api.risks.getRiskCards, {
 *       trialId,
 *       phase: "retrial",
 *     });
 *     const retrialVerdict = useQuery(api.verdicts.getVerdict, {
 *       trialId,
 *       phase: "retrial",
 *     });
 *     const toggleRiskFix = useMutation(api.risks.toggleRiskFix);
 *     const startTrial = useAction(api.runner.runTrial);
 *     const startRetrial = useAction(api.runner.runRetrial);
 *     // ...assemble into the same TrialResult shape consumed by TrialDashboard.
 *   }
 *
 * The Convex client is already provided by `<ConvexProvider>` in main.tsx
 * whenever `VITE_CONVEX_URL` is set in `.env.local`.
 */

export const LIVE_MODE_README = "See useLiveTrial.ts for the wiring stub.";
