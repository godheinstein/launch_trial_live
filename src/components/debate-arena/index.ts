/**
 * Debate Arena — Barrel export
 * Import the main DebateArena component from this module:
 *
 *   import { DebateArena } from "./components/debate-arena";
 */

export { DebateArena } from "./DebateArena";
export { AgentStandee } from "./AgentStandee";
export { ArenaSpeechBubble } from "./ArenaSpeechBubble";
export { ProductOnTrialCenter } from "./ProductOnTrialCenter";
export { ArenaEvidenceChips } from "./ArenaEvidenceChips";
export { ArenaControls } from "./ArenaControls";

// Types & mock data
export type { ArenaAgent, AgentStatus, EvidenceChip, ProductOnTrial, TrialStep, Severity } from "./mockTrialData";
export { agents, productOnTrial, trialSteps } from "./mockTrialData";
