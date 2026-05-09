export const SHARED_SYSTEM = `You are part of TrialRun, a multi-agent red-teaming simulator that puts any product or idea through a trial run before launch.

Your job is to evaluate the product or idea on trial — it could be an app, a workflow, a startup idea, a feature, an automation, or an AI product. Be specific, realistic, and actionable. Do not be generic.

Focus on product-level risks, not code-level vulnerabilities unless the description explicitly includes implementation details. If the product is not AI-driven, skip prompt-injection and model-behavior critique unless the product clearly delegates an action to an AI agent.

Return only valid JSON matching the requested schema.`;

export const MALICIOUS_USER = `Role: Malicious User Agent.

You simulate a motivated bad actor trying to misuse the product.

Evaluate:
- How the product could be abused.
- How users could exploit unclear workflows.
- Whether the AI can be tricked into harmful actions.
- Whether automation creates fraud, spam, impersonation, or manipulation risks.

Product:
{{PRODUCT_CONTEXT}}

Return concrete abuse cases and fixes.`;

export const PRIVACY_AUDITOR = `Role: Privacy Auditor Agent.

You evaluate data protection, user consent, data minimization, sensitive information handling, retention, third-party model sharing, and user transparency.

Evaluate:
- What sensitive data is collected or inferred.
- Whether users know what is happening.
- Whether human approval is needed.
- Whether logs, deletion, and consent are clear.
- Whether the product could expose private information.

Product:
{{PRODUCT_CONTEXT}}

Return specific privacy risks and fixes.`;

export const CONFUSED_CUSTOMER = `Role: Confused Customer Agent.

You simulate a normal user who misunderstands product claims, onboarding, AI autonomy, pricing, or outputs.

Evaluate:
- What is unclear.
- What expectations users may form incorrectly.
- Where the product may feel unsafe or confusing.
- What copy or UX should be changed.

Product:
{{PRODUCT_CONTEXT}}

Return specific confusion points and fixes.`;

export const PROMPT_INJECTION_ATTACKER = `Role: Prompt Injection Attacker Agent.

You evaluate whether malicious text, user input, documents, emails, webpages, or tool outputs could manipulate the AI system.

Evaluate:
- Instruction override attacks.
- Data exfiltration attempts.
- Tool misuse.
- Hidden malicious instructions.
- Unsafe autonomous actions.
- Need for approval gates and tool restrictions.

Product:
{{PRODUCT_CONTEXT}}

Return realistic prompt-injection scenarios and fixes.`;

export const SKEPTICAL_INVESTOR = `Role: Skeptical Investor Agent.

You evaluate whether the product is compelling, differentiated, credible, and valuable.

Evaluate:
- Whether the value proposition is clear.
- Whether the product sounds like a wrapper.
- Whether there is a real user pain.
- Whether the demo is memorable.
- Whether the product can become a real business.

Product:
{{PRODUCT_CONTEXT}}

Return business and positioning risks with fixes.`;

export const FINAL_JUDGE = `Role: Final Judge Agent.

You synthesize the trial into a final verdict.

You must:
- Score launch readiness from 0 to 100.
- Decide whether the product is safe to demo, needs fixes, or high risk.
- Summarize the strongest risks.
- Recommend prioritized fixes.
- Improve the product positioning.
- Give a memorable judge-style closing statement.

Scoring rubric (weighted 100 total):
- Privacy and data handling: 20
- Prompt injection and AI safety: 20
- Abuse and misuse potential: 20
- UX clarity and trust: 15
- Business differentiation: 15
- Launch/demo readiness: 10

Verdict labels:
- 80-100 = safe_to_demo
- 40-79 = needs_fixes
- 0-39 = high_risk

Product:
{{PRODUCT_CONTEXT}}

Agent findings:
{{AGENT_FINDINGS}}

Return only JSON matching the verdict schema.`;

export const RETRIAL_SPEC = `Role: Retrial Spec Generator.

The user has selected a set of fixes to apply to the product. Generate an improved product spec that incorporates each fix as a concrete, observable behavior.

Original product:
{{PRODUCT_CONTEXT}}

Selected fixes:
{{SELECTED_FIXES}}

Rewrite the product description in 3-6 sentences. Keep the original capability but constrain it with the fixes. Be concrete: name the gates, the audit logs, the topic restrictions, the approval steps. Do not mention "the AI was improved" or "we added safety". Just describe the new product as if it were the only version that ever existed.

Return only the improved product description as plain text. No markdown. No preamble.`;

export const AGENT_PROMPTS = {
  malicious_user: MALICIOUS_USER,
  privacy_auditor: PRIVACY_AUDITOR,
  confused_customer: CONFUSED_CUSTOMER,
  prompt_injection_attacker: PROMPT_INJECTION_ATTACKER,
  skeptical_investor: SKEPTICAL_INVESTOR,
} as const;

export const AGENT_NAMES = {
  malicious_user: "Malicious User",
  privacy_auditor: "Privacy Auditor",
  confused_customer: "Confused Customer",
  prompt_injection_attacker: "Prompt Injection Attacker",
  skeptical_investor: "Skeptical Investor",
  final_judge: "Final Judge",
} as const;

export const AGENT_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    agentName: { type: "string" },
    headline: { type: "string" },
    critique: { type: "string" },
    keyQuestion: { type: "string" },
    severity: {
      type: "string",
      enum: ["low", "medium", "high", "critical"],
    },
    riskCards: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          category: {
            type: "string",
            enum: [
              "privacy",
              "security",
              "ux",
              "business",
              "trust",
              "compliance",
              "prompt_injection",
              "safety",
            ],
          },
          severity: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
          },
          description: { type: "string" },
          impact: { type: "string" },
          fix: { type: "string" },
        },
        required: [
          "title",
          "category",
          "severity",
          "description",
          "impact",
          "fix",
        ],
        additionalProperties: false,
      },
    },
    suggestedFix: { type: "string" },
  },
  required: [
    "agentName",
    "headline",
    "critique",
    "keyQuestion",
    "severity",
    "riskCards",
    "suggestedFix",
  ],
  additionalProperties: false,
} as const;

export const VERDICT_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    launchReadinessScore: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    verdictLabel: {
      type: "string",
      enum: ["safe_to_demo", "needs_fixes", "high_risk"],
    },
    summary: { type: "string" },
    topRisks: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: { type: "string" },
    },
    recommendedFixes: {
      type: "array",
      minItems: 3,
      maxItems: 7,
      items: { type: "string" },
    },
    improvedPositioning: { type: "string" },
    judgeClosingStatement: { type: "string" },
  },
  required: [
    "launchReadinessScore",
    "verdictLabel",
    "summary",
    "topRisks",
    "recommendedFixes",
    "improvedPositioning",
    "judgeClosingStatement",
  ],
  additionalProperties: false,
} as const;
