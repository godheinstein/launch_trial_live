type AgentAvatar = {
  agentType:
    | "malicious_user"
    | "privacy_auditor"
    | "confused_customer"
    | "prompt_injection_attacker"
    | "skeptical_investor"
    | "final_judge";
  name: string;
  shortName: string;
  role: string;
  color: string;
  accentColor: string;
  initials: string;
  iconName: string;
};

export const agentAvatars: AgentAvatar[] = [
  {
    agentType: "malicious_user",
    name: "Malicious User Agent",
    shortName: "Abuse",
    role: "Finds fraud, spam, impersonation, and misuse paths.",
    color: "#991B1B",
    accentColor: "#FCA5A5",
    initials: "MU",
    iconName: "ShieldAlert",
  },
  {
    agentType: "privacy_auditor",
    name: "Privacy Auditor Agent",
    shortName: "Privacy",
    role: "Checks data scope, consent, retention, and deletion risk.",
    color: "#065F46",
    accentColor: "#6EE7B7",
    initials: "PA",
    iconName: "LockKeyhole",
  },
  {
    agentType: "confused_customer",
    name: "Confused Customer Agent",
    shortName: "UX",
    role: "Tests clarity, expectations, control, and recovery paths.",
    color: "#92400E",
    accentColor: "#FCD34D",
    initials: "CC",
    iconName: "CircleHelp",
  },
  {
    agentType: "prompt_injection_attacker",
    name: "Prompt Injection Attacker Agent",
    shortName: "Injection",
    role: "Looks for hostile text that can override agent instructions.",
    color: "#6D28D9",
    accentColor: "#C4B5FD",
    initials: "PI",
    iconName: "Bug",
  },
  {
    agentType: "skeptical_investor",
    name: "Skeptical Investor Agent",
    shortName: "Market",
    role: "Challenges positioning, adoption, liability, and proof points.",
    color: "#1D4ED8",
    accentColor: "#93C5FD",
    initials: "SI",
    iconName: "ChartNoAxesCombined",
  },
  {
    agentType: "final_judge",
    name: "Final Judge Agent",
    shortName: "Judge",
    role: "Synthesizes verdict, score, top risks, and next fixes.",
    color: "#111827",
    accentColor: "#D1D5DB",
    initials: "FJ",
    iconName: "Gavel",
  },
];

export const agentAvatarByType = Object.fromEntries(
  agentAvatars.map((agent) => [agent.agentType, agent]),
) as Record<AgentAvatar["agentType"], AgentAvatar>;
