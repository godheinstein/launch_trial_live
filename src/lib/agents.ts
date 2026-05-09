import type { AgentMeta, AgentType } from "../types";

export const AGENTS: AgentMeta[] = [
  {
    type: "malicious_user",
    name: "Malicious User",
    tagline: "Tries to weaponize the product against itself or others.",
    accent: "#ff4d6d",
  },
  {
    type: "privacy_auditor",
    name: "Privacy Auditor",
    tagline: "Hunts for data leakage, retention abuse, and consent gaps.",
    accent: "#7c5cff",
  },
  {
    type: "confused_customer",
    name: "Confused Customer",
    tagline: "Misuses the product the way real users will on day one.",
    accent: "#f5c451",
  },
  {
    type: "prompt_injection_attacker",
    name: "Prompt Injection Attacker",
    tagline: "Breaks system prompts and exfiltrates instructions.",
    accent: "#ff8a3d",
  },
  {
    type: "skeptical_investor",
    name: "Skeptical Investor",
    tagline: "Stress tests the moat, the unit economics, and the pitch.",
    accent: "#7be0a4",
  },
  {
    type: "final_judge",
    name: "Final Judge",
    tagline: "Synthesizes a verdict and a launch readiness score.",
    accent: "#a594ff",
  },
];

export const SPECIALIST_AGENT_TYPES: AgentType[] = [
  "malicious_user",
  "privacy_auditor",
  "confused_customer",
  "prompt_injection_attacker",
  "skeptical_investor",
];

export const AGENT_BY_TYPE: Record<AgentType, AgentMeta> = AGENTS.reduce(
  (acc, agent) => {
    acc[agent.type] = agent;
    return acc;
  },
  {} as Record<AgentType, AgentMeta>,
);
