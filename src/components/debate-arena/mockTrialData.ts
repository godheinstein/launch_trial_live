/**
 * mockTrialData.ts
 * Mock data for the Debate Arena prototype.
 * Replace with real data from your backend (Convex, etc.) when integrating.
 */

export type AgentStatus = "waiting" | "speaking" | "spoken";
export type Severity = "low" | "medium" | "high" | "critical";

export interface ArenaAgent {
  id: string;
  name: string;
  role: string;
  colorClass: string;
  accentHex: string;
  imageUrl: string;
  status: AgentStatus;
  speechBubble: string;
  severity?: Severity;
}

export interface EvidenceChip {
  id: string;
  label: string;
  severity: Severity;
}

export interface ProductOnTrial {
  name: string;
  description: string;
  score: number;
  maxScore: number;
  verdict: string;
  currentAccusation: string;
  evidenceChips: EvidenceChip[];
}

export interface TrialStep {
  activeAgentId: string;
  accusation: string;
}

export const agents: ArenaAgent[] = [
  {
    id: "malicious_user",
    name: "Malicious User",
    role: "Adversarial Tester",
    colorClass: "agent-malicious",
    accentHex: "#dc2626",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663215354565/CTBkWPqtEAu5DpneJjeQ2P/malicious_user-S8PsmgaAGSWVWz93cHx3Ci.webp",
    status: "waiting",
    speechBubble: "What stops a bad actor from abusing this workflow at scale?",
    severity: "high",
  },
  {
    id: "privacy_auditor",
    name: "Privacy Auditor",
    role: "Compliance Inspector",
    colorClass: "agent-privacy",
    accentHex: "#06b6d4",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663215354565/CTBkWPqtEAu5DpneJjeQ2P/privacy_auditor-k9GkqA6wLQojsGYRJZuRoA.webp",
    status: "waiting",
    speechBubble: "What personal data leaves the product, and is consent explicit?",
    severity: "high",
  },
  {
    id: "confused_customer",
    name: "Confused Customer",
    role: "End-User Advocate",
    colorClass: "agent-confused",
    accentHex: "#eab308",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663215354565/CTBkWPqtEAu5DpneJjeQ2P/confused_customer-7MCvQZUjBmwrMhXcgDTAd6.webp",
    status: "waiting",
    speechBubble: "How will users know when the system acts automatically?",
    severity: "medium",
  },
  {
    id: "prompt_injection",
    name: "Prompt Injection Attacker",
    role: "Security Exploit Specialist",
    colorClass: "agent-injection",
    accentHex: "#a855f7",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663215354565/CTBkWPqtEAu5DpneJjeQ2P/prompt_injection_attacker-89iK5fjxcfS4PEBrKb79Wa.webp",
    status: "waiting",
    speechBubble: "Can untrusted text override the product's instructions?",
    severity: "critical",
  },
  {
    id: "skeptical_investor",
    name: "Skeptical Investor",
    role: "Market Viability Analyst",
    colorClass: "agent-investor",
    accentHex: "#22c55e",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663215354565/CTBkWPqtEAu5DpneJjeQ2P/skeptical_investor-W5jrmHdGt8JzjaYq5LDjnw.webp",
    status: "waiting",
    speechBubble: "Why is this not just a thin wrapper around existing tools?",
    severity: "medium",
  },
  {
    id: "final_judge",
    name: "Final Judge",
    role: "Supreme Arbiter",
    colorClass: "agent-judge",
    accentHex: "#c084fc",
    imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663215354565/CTBkWPqtEAu5DpneJjeQ2P/final_judge-6DhmD4ofqwvhHPyHby3Mb6.webp",
    status: "waiting",
    speechBubble: "This idea is promising, but it needs safeguards before launch.",
  },
];

export const productOnTrial: ProductOnTrial = {
  name: "Meeting Agent",
  description:
    "An AI meeting assistant that records calls, summarizes decisions, assigns action items, and sends follow-up emails to attendees automatically.",
  score: 42,
  maxScore: 100,
  verdict: "Needs fixes before launch",
  currentAccusation: "",
  evidenceChips: [
    { id: "ev1", label: "Meeting consent unclear", severity: "high" },
    { id: "ev2", label: "Auto-send follow-ups may misrepresent decisions", severity: "critical" },
    { id: "ev3", label: "Sensitive transcript retention risk", severity: "high" },
  ],
};

export const trialSteps: TrialStep[] = [
  { activeAgentId: "malicious_user", accusation: "What stops a bad actor from abusing this workflow at scale?" },
  { activeAgentId: "privacy_auditor", accusation: "What personal data leaves the product, and is consent explicit?" },
  { activeAgentId: "confused_customer", accusation: "How will users know when the system acts automatically?" },
  { activeAgentId: "prompt_injection", accusation: "Can untrusted text override the product's instructions?" },
  { activeAgentId: "skeptical_investor", accusation: "Why is this not just a thin wrapper around existing tools?" },
  { activeAgentId: "final_judge", accusation: "This idea is promising, but it needs safeguards before launch." },
];
