type AgentType =
  | "malicious_user"
  | "privacy_auditor"
  | "confused_customer"
  | "prompt_injection_attacker"
  | "skeptical_investor"
  | "final_judge";

type TrialPhase = "initial" | "retrial";

type Severity = "low" | "medium" | "high" | "critical";

type RiskCategory =
  | "privacy"
  | "security"
  | "ux"
  | "business"
  | "trust"
  | "compliance"
  | "prompt_injection"
  | "safety";

type FallbackRisk = {
  id: string;
  category: RiskCategory;
  severity: Severity;
  title: string;
  impact: string;
  fix: string;
};

type FallbackTimelineEvent = {
  id: string;
  phase: TrialPhase;
  timestampMs: number;
  agentType: AgentType;
  agentName: string;
  headline: string;
  critique: string;
  keyQuestion: string;
  severity: Severity;
  risks: FallbackRisk[];
  suggestedFix: string;
};

type FallbackVerdict = {
  phase: TrialPhase;
  launchReadinessScore: number;
  verdictLabel: "safe_to_demo" | "needs_fixes" | "high_risk";
  summary: string;
  topRisks: string[];
  recommendedFixes: string[];
  judgeClosingStatement: string;
};

export const fallbackProductInput = {
  name: "Gmail Autopilot",
  category: "AI email assistant",
  riskySpec:
    "An AI email assistant that connects to Gmail, reads important emails, drafts replies, and can automatically send responses on behalf of the user.",
  improvedSpec:
    "An AI email assistant that drafts replies only after explicit user approval, explains importance decisions, logs every action, blocks financial/legal/medical auto-handling, and scans email content for prompt-injection attempts before drafting.",
};

export const fallbackAgentTypes: AgentType[] = [
  "malicious_user",
  "privacy_auditor",
  "confused_customer",
  "prompt_injection_attacker",
  "skeptical_investor",
  "final_judge",
];

export const fallbackInitialTimeline: FallbackTimelineEvent[] = [
  {
    id: "initial-malicious-user",
    phase: "initial",
    timestampMs: 1200,
    agentType: "malicious_user",
    agentName: "Malicious User Agent",
    headline: "Automatic replies create impersonation and spam risk.",
    critique:
      "A compromised sender or socially engineered thread could cause the assistant to send convincing messages as the user without meaningful review.",
    keyQuestion: "What stops the assistant from being used as a trusted spam or impersonation tool?",
    severity: "high",
    risks: [
      {
        id: "initial-risk-impersonation",
        category: "security",
        severity: "high",
        title: "Trusted identity abuse",
        impact: "The product can send messages from a real inbox, so abuse looks legitimate to recipients.",
        fix: "Require user approval for every outbound message and rate-limit repeated replies.",
      },
    ],
    suggestedFix: "Disable autonomous sending until approval, throttling, and recipient warnings exist.",
  },
  {
    id: "initial-privacy-auditor",
    phase: "initial",
    timestampMs: 2600,
    agentType: "privacy_auditor",
    agentName: "Privacy Auditor Agent",
    headline: "The assistant reads sensitive inbox content without a clear data boundary.",
    critique:
      "Gmail contains financial, legal, health, and personal data. The spec does not explain retention, model access, redaction, consent, or deletion.",
    keyQuestion: "Which email fields are stored, for how long, and who can inspect them?",
    severity: "critical",
    risks: [
      {
        id: "initial-risk-sensitive-email",
        category: "privacy",
        severity: "critical",
        title: "Sensitive email exposure",
        impact: "Users may unknowingly grant broad access to private inbox content.",
        fix: "Use least-privilege scopes, redact content, disclose retention, and let users delete processed data.",
      },
    ],
    suggestedFix: "Add explicit consent screens, data minimization, redaction, and retention controls.",
  },
  {
    id: "initial-confused-customer",
    phase: "initial",
    timestampMs: 4100,
    agentType: "confused_customer",
    agentName: "Confused Customer Agent",
    headline: "The word important is undefined.",
    critique:
      "Users cannot predict why one email is answered and another is ignored. That makes mistakes feel random and hard to correct.",
    keyQuestion: "How does the user see and tune the importance criteria?",
    severity: "medium",
    risks: [
      {
        id: "initial-risk-importance-criteria",
        category: "ux",
        severity: "medium",
        title: "Opaque importance decisions",
        impact: "Users may lose trust when the assistant acts on emails for reasons they cannot inspect.",
        fix: "Show the classification reason and allow per-sender and per-topic controls.",
      },
    ],
    suggestedFix: "Expose explainable labels and a review queue before any reply can be sent.",
  },
  {
    id: "initial-prompt-injection",
    phase: "initial",
    timestampMs: 5700,
    agentType: "prompt_injection_attacker",
    agentName: "Prompt Injection Attacker Agent",
    headline: "Incoming email text can become hostile instructions.",
    critique:
      "A malicious email can say to ignore previous rules, reveal calendar details, or reply with a payment link. The spec has no isolation between content and instructions.",
    keyQuestion: "How are untrusted email bodies separated from the assistant's operating instructions?",
    severity: "critical",
    risks: [
      {
        id: "initial-risk-injection",
        category: "prompt_injection",
        severity: "critical",
        title: "Email-borne prompt injection",
        impact: "A sender could manipulate the assistant into unsafe actions using plain email text.",
        fix: "Treat email content as untrusted data, scan for injection attempts, and block tool actions from email-supplied instructions.",
      },
    ],
    suggestedFix: "Add prompt-injection detection and strict tool-use policies before drafting or sending.",
  },
  {
    id: "initial-investor",
    phase: "initial",
    timestampMs: 7300,
    agentType: "skeptical_investor",
    agentName: "Skeptical Investor Agent",
    headline: "The value is clear, but the liability story is not.",
    critique:
      "Automatic sending is the hook and the biggest liability. The launch story needs a safer wedge that still proves productivity value.",
    keyQuestion: "Can this win as a supervised drafting product before becoming autonomous?",
    severity: "high",
    risks: [
      {
        id: "initial-risk-positioning",
        category: "business",
        severity: "high",
        title: "Unsafe launch positioning",
        impact: "The bold autonomy claim may scare users, partners, and reviewers before trust is earned.",
        fix: "Position the MVP as supervised drafting with audit trails and optional future automation.",
      },
    ],
    suggestedFix: "Launch with human approval and compliance-ready logs as the primary differentiator.",
  },
  {
    id: "initial-judge",
    phase: "initial",
    timestampMs: 8900,
    agentType: "final_judge",
    agentName: "Final Judge Agent",
    headline: "High-risk demo: useful concept, unsafe autonomy.",
    critique:
      "The product should not launch with autonomous sending. The top blockers are prompt injection, privacy boundaries, auditability, and unclear user consent.",
    keyQuestion: "Will the team remove autonomous sending and prove a controlled approval loop?",
    severity: "critical",
    risks: [],
    suggestedFix: "Move to approval-only replies, add injection screening, explain decisions, and log every action.",
  },
];

export const fallbackRetrialTimeline: FallbackTimelineEvent[] = [
  {
    id: "retrial-malicious-user",
    phase: "retrial",
    timestampMs: 1200,
    agentType: "malicious_user",
    agentName: "Malicious User Agent",
    headline: "Human approval blocks the main abuse path.",
    critique:
      "Requiring approval before send removes the easiest impersonation route. Abuse risk remains if users bulk-approve without context.",
    keyQuestion: "Can risky threads be slowed down before approval?",
    severity: "medium",
    risks: [
      {
        id: "retrial-risk-bulk-approval",
        category: "security",
        severity: "medium",
        title: "Careless bulk approval",
        impact: "Users could approve several risky replies without reading the warning context.",
        fix: "Add friction for external recipients, payment terms, attachments, and unusual sender domains.",
      },
    ],
    suggestedFix: "Keep approval mandatory and add friction for high-risk reply classes.",
  },
  {
    id: "retrial-privacy-auditor",
    phase: "retrial",
    timestampMs: 2500,
    agentType: "privacy_auditor",
    agentName: "Privacy Auditor Agent",
    headline: "Privacy risk drops with scope, logs, and blocked sensitive topics.",
    critique:
      "The improved spec names sensitive categories and action logging. It still needs retention limits and a visible deletion path.",
    keyQuestion: "Can users verify what was processed and remove it?",
    severity: "medium",
    risks: [
      {
        id: "retrial-risk-retention",
        category: "privacy",
        severity: "medium",
        title: "Retention still unspecified",
        impact: "Users and reviewers need a clear promise for processed email data.",
        fix: "Publish default retention, allow manual deletion, and avoid storing full message bodies when possible.",
      },
    ],
    suggestedFix: "Add a retention policy and user-visible deletion control.",
  },
  {
    id: "retrial-confused-customer",
    phase: "retrial",
    timestampMs: 3900,
    agentType: "confused_customer",
    agentName: "Confused Customer Agent",
    headline: "Explainable importance labels make the workflow understandable.",
    critique:
      "Showing why a message was classified as important gives users a correction loop and turns an opaque agent into a supervised assistant.",
    keyQuestion: "Can users edit future importance rules from the same screen?",
    severity: "low",
    risks: [],
    suggestedFix: "Let users adjust sender, keyword, and topic rules directly from the review queue.",
  },
  {
    id: "retrial-prompt-injection",
    phase: "retrial",
    timestampMs: 5300,
    agentType: "prompt_injection_attacker",
    agentName: "Prompt Injection Attacker Agent",
    headline: "Injection screening improves the posture, but policy enforcement matters.",
    critique:
      "Scanning incoming content is a strong addition. The system also needs a hard rule that email bodies can never authorize tool actions.",
    keyQuestion: "Is injection detection advisory, or does it actually block unsafe actions?",
    severity: "medium",
    risks: [
      {
        id: "retrial-risk-policy-enforcement",
        category: "prompt_injection",
        severity: "medium",
        title: "Detection without enforcement",
        impact: "Warnings are not enough if the assistant can still draft from hostile instructions.",
        fix: "Block drafting on detected injection and require a separate user decision to continue.",
      },
    ],
    suggestedFix: "Turn injection detection into an enforced gate, not only a label.",
  },
  {
    id: "retrial-investor",
    phase: "retrial",
    timestampMs: 6800,
    agentType: "skeptical_investor",
    agentName: "Skeptical Investor Agent",
    headline: "The safer wedge is now credible.",
    critique:
      "Supervised drafting with audit logs is easier to sell to teams and reviewers. The product still needs a measurable time-saved claim.",
    keyQuestion: "What metric proves this is more than a safer compose button?",
    severity: "low",
    risks: [],
    suggestedFix: "Track review time saved, edits per draft, and prevented risky sends.",
  },
  {
    id: "retrial-judge",
    phase: "retrial",
    timestampMs: 8200,
    agentType: "final_judge",
    agentName: "Final Judge Agent",
    headline: "Needs fixes, but now demo-ready with guardrails.",
    critique:
      "The revised product removes autonomous sending, adds explainability, blocks sensitive categories, and introduces injection screening. Remaining work is retention policy and enforcement detail.",
    keyQuestion: "Can the demo show the approval queue, injection block, and action log clearly?",
    severity: "medium",
    risks: [],
    suggestedFix: "Demo the guardrails as the product, not as footnotes.",
  },
];

export const fallbackInitialVerdict: FallbackVerdict = {
  phase: "initial",
  launchReadinessScore: 42,
  verdictLabel: "high_risk",
  summary:
    "The AI email assistant has a strong productivity premise, but autonomous sending from Gmail creates unacceptable prompt-injection, privacy, trust, and impersonation risks.",
  topRisks: [
    "Email-borne prompt injection can manipulate the assistant.",
    "Sensitive inbox data lacks a clear privacy boundary.",
    "Automatic sending can impersonate the user.",
    "Users cannot understand or tune importance decisions.",
    "The launch story over-indexes on risky autonomy.",
  ],
  recommendedFixes: [
    "Require explicit human approval before every send.",
    "Scan incoming email bodies for prompt-injection attempts.",
    "Block financial, legal, and medical auto-handling.",
    "Show why an email was classified as important.",
    "Log every AI action in a user-visible audit trail.",
  ],
  judgeClosingStatement:
    "Do not launch this as an autonomous email sender. Launch it as a supervised drafting assistant with clear guardrails.",
};

export const fallbackRetrialVerdict: FallbackVerdict = {
  phase: "retrial",
  launchReadinessScore: 78,
  verdictLabel: "needs_fixes",
  summary:
    "The improved assistant is much safer because it requires approval, explains decisions, logs actions, blocks sensitive categories, and scans for prompt injection.",
  topRisks: [
    "Retention and deletion policy still need to be explicit.",
    "Prompt-injection detection must enforce blocking behavior.",
    "High-risk approvals need extra friction.",
  ],
  recommendedFixes: [
    "Publish retention defaults and deletion controls.",
    "Make prompt-injection detection a hard gate.",
    "Add friction to risky external replies and unusual domains.",
  ],
  judgeClosingStatement:
    "The retrial moves the product from high-risk to demo-ready with remaining fixes. The score improves from 42 to 78.",
};

export const fallbackTrialScript = {
  product: fallbackProductInput,
  agentTypes: fallbackAgentTypes,
  initial: {
    timeline: fallbackInitialTimeline,
    verdict: fallbackInitialVerdict,
  },
  retrial: {
    timeline: fallbackRetrialTimeline,
    verdict: fallbackRetrialVerdict,
  },
};
