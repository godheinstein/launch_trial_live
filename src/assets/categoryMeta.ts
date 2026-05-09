type RiskCategory =
  | "privacy"
  | "security"
  | "ux"
  | "business"
  | "trust"
  | "compliance"
  | "prompt_injection"
  | "safety";

type CategoryMeta = {
  id: RiskCategory;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  iconName: string;
};

export const categoryMeta: CategoryMeta[] = [
  {
    id: "privacy",
    label: "Privacy",
    description: "Data access, consent, retention, deletion, and minimization.",
    color: "#047857",
    bgColor: "#D1FAE5",
    iconName: "LockKeyhole",
  },
  {
    id: "security",
    label: "Security",
    description: "Abuse, impersonation, account safety, and unauthorized actions.",
    color: "#B91C1C",
    bgColor: "#FEE2E2",
    iconName: "ShieldAlert",
  },
  {
    id: "ux",
    label: "UX",
    description: "User clarity, control, expectations, and recovery paths.",
    color: "#A16207",
    bgColor: "#FEF3C7",
    iconName: "MousePointerClick",
  },
  {
    id: "business",
    label: "Business",
    description: "Positioning, adoption, liability, pricing, and market proof.",
    color: "#1D4ED8",
    bgColor: "#DBEAFE",
    iconName: "ChartNoAxesCombined",
  },
  {
    id: "trust",
    label: "Trust",
    description: "Auditability, transparency, reliability, and user confidence.",
    color: "#334155",
    bgColor: "#E2E8F0",
    iconName: "BadgeCheck",
  },
  {
    id: "compliance",
    label: "Compliance",
    description: "Legal, regulated-topic, platform, and policy obligations.",
    color: "#7C2D12",
    bgColor: "#FFEDD5",
    iconName: "ScrollText",
  },
  {
    id: "prompt_injection",
    label: "Prompt Injection",
    description: "Hostile text that can manipulate model instructions or tools.",
    color: "#6D28D9",
    bgColor: "#EDE9FE",
    iconName: "Bug",
  },
  {
    id: "safety",
    label: "Safety",
    description: "Harmful outcomes, autonomy limits, escalation, and guardrails.",
    color: "#BE123C",
    bgColor: "#FFE4E6",
    iconName: "TriangleAlert",
  },
];

export const categoryMetaById = Object.fromEntries(
  categoryMeta.map((category) => [category.id, category]),
) as Record<RiskCategory, CategoryMeta>;
