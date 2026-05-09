# PRD: Launch Trial Live

## 1. Product Name

**Launch Trial Live**

## 2. One-Liner

**Put your AI product on trial before users, attackers, regulators, and judges do.**

## 3. Product Concept

Launch Trial Live is a real-time AI product red-teaming simulator for builders. A user enters a product idea, landing page copy, AI agent prompt, README, or feature description. The system runs a live “trial” where multiple AI personas interrogate the product from different perspectives, including malicious users, privacy auditors, confused customers, prompt-injection attackers, and skeptical investors.

The final output is a launch-readiness verdict with risks, severity, recommended fixes, and an optional retrial after fixes are applied.

This is **not a code vulnerability scanner**. It is a **product launch readiness simulator** that evaluates safety, trust, privacy, UX, abuse potential, prompt-injection risk, and market clarity.

## 4. Hackathon Goal

Build a polished, demo-ready MVP in 7 hours.

The demo should feel like:

> “I enter my hackathon project idea, and within seconds, it gets put on trial by the harshest users, attackers, and judges.”

The winning moment is:

> Risky product → live trial → harsh verdict → apply fixes → retrial → improved launch score.

## 5. Target Users

### Primary Users

* AI hackathon builders
* Startup founders
* Product managers
* Indie hackers
* Developers building AI agents or automation tools

### Secondary Users

* Security reviewers
* UX researchers
* AI safety teams
* Startup accelerators
* Venture studios

## 6. Core User Problem

Builders ship AI products quickly but often miss obvious risks:

* Users misunderstand what the product does.
* AI agents take unsafe autonomous actions.
* Products leak or mishandle sensitive data.
* Prompt injection creates dangerous behavior.
* The value proposition is unclear.
* Abuse cases are not considered before launch.
* Founders do not know what judges, users, or regulators will question.

Existing security tools focus on code vulnerabilities. Launch Trial Live focuses on **product-level risk before launch**.

## 7. Core Value Proposition

Launch Trial Live gives builders a fast, memorable, actionable way to stress-test an AI product before they present or ship it.

It converts a vague product idea into:

* launch-readiness score,
* live multi-agent critique,
* top risk cards,
* recommended fixes,
* improved product framing,
* retrial score,
* exportable report.

## 8. Sponsor Alignment

### OpenAI GPT-5.5

Use GPT-5.5 as the core reasoning engine for role-based red-team agents and structured verdict generation.

Use structured outputs so agent responses conform to fixed JSON schemas. OpenAI Structured Outputs are designed to make model responses follow developer-supplied JSON Schema reliably. ([OpenAI Developers][1])

### Convex

Use Convex for real-time trial state, sessions, agent messages, risk cards, verdicts, and retrial history. Convex provides a database, server functions, and client libraries for live-updating apps. ([docs.convex.dev][2]) Convex queries are reactive, mutations write transactionally, and actions can call external APIs such as OpenAI. ([docs.convex.dev][3])

### ElevenLabs Optional Voice Add-On

Use ElevenLabs to generate a spoken “judge verdict” or persona voices. ElevenLabs provides text-to-speech APIs with low-latency and expressive voice capabilities. ([ElevenLabs][4])

### Cloudflare Optional Deployment/Scaling Story

If time permits, use Cloudflare AI Gateway or Workers for a scalable AI app architecture. Cloudflare AI Gateway provides observability, caching, rate limiting, retries, model fallback, and logging for AI apps. ([Cloudflare Docs][5])

### Fal / GPT Image 2 Optional Visual Add-On

Generate a “Launch Risk Poster” or “Trial Verdict Poster” as a shareable visual artifact.

## 9. MVP Scope

### Must Have

1. Product input form.
2. Live multi-agent trial page.
3. Specialist agents:

   * Malicious User Agent
   * Privacy Auditor Agent
   * Confused Customer Agent
   * Prompt Injection Attacker Agent
   * Skeptical Investor Agent
   * Final Judge Agent
4. Realtime display of agent responses.
5. Risk cards with severity.
6. Final launch-readiness verdict.
7. Fix recommendation cards.
8. Retest mode after selected fixes.
9. Before vs after score comparison.
10. Export report to Markdown.

### Should Have

1. Saved trial history.
2. Example product templates.
3. “Use sample demo” button.
4. Voice judge verdict using ElevenLabs.
5. Visual “risk radar” chart.

### Nice To Have

1. URL ingestion.
2. Screenshot upload.
3. GPT Image 2 or Fal-generated verdict poster.
4. GitHub issue export.
5. Cursor SDK patch-plan integration.
6. Cloudflare AI Gateway routing.

### Out of Scope for Hackathon

* Full codebase scanning.
* Real vulnerability exploitation.
* Authentication.
* Team collaboration.
* Payment.
* Complex browser scraping.
* Full compliance report generation.
* Real-time voice conversation.
* Deep website crawler.

## 10. Demo Use Case

Use this as the default sample input:

```text
We built an AI email assistant that connects to Gmail, reads important emails, and automatically replies on behalf of the user. It decides which emails are urgent, drafts replies, and can send them automatically.
```

Expected trial output:

* Privacy risk around sensitive email content.
* Prompt-injection risk from malicious emails.
* UX risk around unclear “important email” criteria.
* Autonomy risk around automatic sending.
* Trust risk around auditability and consent.
* Fixes:

  * require human approval before sending,
  * add audit logs,
  * restrict financial/legal/medical auto-replies,
  * use sender verification,
  * add prompt-injection filtering,
  * disclose model/data usage clearly.

Demo arc:

1. Enter risky product.
2. Run live trial.
3. Score appears, e.g. **42/100**.
4. Select recommended fixes.
5. Rerun trial.
6. Score improves, e.g. **78/100**.
7. Export verdict report.

## 11. User Flow

### Flow 1: Start Trial

1. User lands on homepage.
2. User clicks “Put My Product on Trial.”
3. User enters:

   * product name,
   * product description,
   * target users,
   * AI actions,
   * data accessed,
   * optional product prompt or landing copy.
4. User clicks “Start Trial.”
5. System creates a trial session.

### Flow 2: Live Trial

1. Trial page opens.
2. Agents speak one by one.
3. Each agent produces:

   * critique,
   * risk cards,
   * questions,
   * suggested fixes.
4. UI shows live courtroom-style updates.
5. Final Judge Agent synthesizes verdict.

### Flow 3: Fix and Retest

1. User views recommended fixes.
2. User selects fixes to apply.
3. System generates an improved product policy / feature spec.
4. System reruns trial on improved version.
5. UI shows before vs after score.

### Flow 4: Export

1. User clicks “Export Report.”
2. System generates Markdown report.
3. User copies report or downloads `.md`.

## 12. UX Requirements

### Visual Style

* Modern, polished, startup-like.
* Dark mode preferred.
* Courtroom / trial metaphor, but not cartoonish.
* Use cards, score badges, severity labels, timeline layout.
* Make it demo-friendly on projector.

### Main Pages

#### Page 1: Landing Page

Sections:

* Hero:

  * “Put your AI product on trial before users do.”
  * CTA: “Start Trial”
  * Secondary CTA: “Run Demo Product”
* Three value cards:

  * Catch abuse cases
  * Find privacy risks
  * Improve launch readiness
* Sponsor/tech stack badges:

  * GPT-5.5
  * Convex
  * ElevenLabs optional

#### Page 2: Trial Setup

Form fields:

* Product name
* Product description
* Target users
* What AI actions does it perform?
* What data does it access?
* Is it autonomous?

  * None
  * Suggests only
  * Requires approval
  * Acts automatically
* Optional prompt / landing copy / README
* Button: “Start Trial”

Include a “Use Sample” button.

#### Page 3: Live Trial Dashboard

Layout:

* Left column:

  * Product summary
  * Trial status
  * Current score
* Center:

  * Agent timeline
  * Each agent message appears as a card
* Right column:

  * Risk cards
  * Severity filter
  * Fix checklist

Agent cards:

* Agent name
* Role icon
* Main critique
* Top question
* Risk severity
* Suggested fix

#### Page 4: Final Verdict

Sections:

* Launch readiness score
* Verdict:

  * Safe to demo
  * Needs fixes before launch
  * High risk
* Top 5 risks
* Recommended fixes
* Improved product framing
* Buttons:

  * Apply selected fixes
  * Run retrial
  * Export report

#### Page 5: Before vs After

Show comparison:

| Metric                |   Before |  After |
| --------------------- | -------: | -----: |
| Launch readiness      |       42 |     78 |
| Privacy risk          |     High | Medium |
| Prompt-injection risk | Critical | Medium |
| UX clarity            |      Low |   High |
| Trust readiness       |      Low | Medium |

## 13. Technical Stack

### Recommended MVP Stack

```text
Frontend: Vite + React + TypeScript
Styling: Tailwind CSS
Backend: Convex
AI: OpenAI GPT-5.5 or available OpenAI reasoning model
Optional voice: ElevenLabs Text-to-Speech
Optional deploy: Vercel
Optional Cloudflare: AI Gateway or Workers if time permits
```

### Why Convex

Convex is suitable because the app needs live-updating state for agent messages, trial status, and generated risks. Convex React allows the frontend to call queries, mutations, and actions, plus interact with file storage and search if needed. ([docs.convex.dev][6])

## 14. Architecture

```text
User
  ↓
React Frontend
  ↓
Convex Mutations
  ↓
Trial Session Created
  ↓
Convex Action: runTrial()
  ↓
OpenAI GPT-5.5 agent calls
  ↓
Convex stores agent messages and risk cards
  ↓
React UI live-updates via Convex queries
  ↓
Final Judge Agent generates verdict
  ↓
User selects fixes
  ↓
Convex Action: runRetrial()
  ↓
Before/After report generated
```

## 15. Data Model

Use Convex schema with these tables.

### `trials`

```ts
{
  _id: Id<"trials">,
  productName: string,
  productDescription: string,
  targetUsers: string,
  aiActions: string,
  dataAccessed: string,
  autonomyLevel: "none" | "suggests_only" | "requires_approval" | "acts_automatically",
  additionalContext?: string,
  status: "draft" | "running" | "completed" | "retrial_running" | "retrial_completed" | "error",
  initialScore?: number,
  retrialScore?: number,
  createdAt: number,
  updatedAt: number
}
```

### `agentMessages`

```ts
{
  _id: Id<"agentMessages">,
  trialId: Id<"trials">,
  phase: "initial" | "retrial",
  agentType:
    | "malicious_user"
    | "privacy_auditor"
    | "confused_customer"
    | "prompt_injection_attacker"
    | "skeptical_investor"
    | "final_judge",
  agentName: string,
  headline: string,
  critique: string,
  keyQuestion: string,
  suggestedFix: string,
  severity: "low" | "medium" | "high" | "critical",
  createdAt: number
}
```

### `riskCards`

```ts
{
  _id: Id<"riskCards">,
  trialId: Id<"trials">,
  phase: "initial" | "retrial",
  title: string,
  category: "privacy" | "security" | "ux" | "business" | "trust" | "compliance" | "prompt_injection" | "safety",
  severity: "low" | "medium" | "high" | "critical",
  description: string,
  impact: string,
  fix: string,
  agentType: string,
  selectedForFix: boolean,
  createdAt: number
}
```

### `verdicts`

```ts
{
  _id: Id<"verdicts">,
  trialId: Id<"trials">,
  phase: "initial" | "retrial",
  launchReadinessScore: number,
  verdictLabel: "safe_to_demo" | "needs_fixes" | "high_risk",
  summary: string,
  topRisks: string[],
  recommendedFixes: string[],
  improvedPositioning: string,
  judgeClosingStatement: string,
  createdAt: number
}
```

### `reports`

```ts
{
  _id: Id<"reports">,
  trialId: Id<"trials">,
  markdown: string,
  createdAt: number
}
```

## 16. API / Function Requirements

### Convex Mutations

#### `createTrial(input)`

Creates a trial.

Input:

```ts
{
  productName: string,
  productDescription: string,
  targetUsers: string,
  aiActions: string,
  dataAccessed: string,
  autonomyLevel: string,
  additionalContext?: string
}
```

Output:

```ts
{
  trialId: Id<"trials">
}
```

#### `toggleRiskFix(riskCardId, selectedForFix)`

Select or unselect a risk card for retest.

#### `updateTrialStatus(trialId, status)`

Internal helper.

### Convex Queries

#### `getTrial(trialId)`

Returns trial.

#### `getAgentMessages(trialId, phase)`

Returns agent messages in chronological order.

#### `getRiskCards(trialId, phase)`

Returns risk cards.

#### `getVerdict(trialId, phase)`

Returns verdict.

#### `getRecentTrials()`

Returns recent saved trials.

### Convex Actions

#### `runTrial(trialId)`

Runs the initial multi-agent trial.

Steps:

1. Load trial.
2. Set status to `running`.
3. For each specialist agent:

   * call OpenAI with role prompt,
   * parse structured JSON,
   * save agent message,
   * save risk cards.
4. Call Final Judge Agent.
5. Save verdict.
6. Update score and status.

#### `runRetrial(trialId)`

Steps:

1. Load original trial.
2. Load selected fixes.
3. Generate improved product spec.
4. Rerun agents on improved spec.
5. Save retrial messages, risk cards, verdict.
6. Update retrial score and status.

#### `generateReport(trialId)`

Creates Markdown report.

#### `generateVoiceVerdict(trialId)` Optional

Calls ElevenLabs text-to-speech and stores audio URL.

## 17. OpenAI Structured Output Schemas

### Agent Response Schema

Use this JSON schema for each specialist agent.

```json
{
  "type": "object",
  "properties": {
    "agentName": { "type": "string" },
    "headline": { "type": "string" },
    "critique": { "type": "string" },
    "keyQuestion": { "type": "string" },
    "severity": {
      "type": "string",
      "enum": ["low", "medium", "high", "critical"]
    },
    "riskCards": {
      "type": "array",
      "minItems": 1,
      "maxItems": 3,
      "items": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "category": {
            "type": "string",
            "enum": ["privacy", "security", "ux", "business", "trust", "compliance", "prompt_injection", "safety"]
          },
          "severity": {
            "type": "string",
            "enum": ["low", "medium", "high", "critical"]
          },
          "description": { "type": "string" },
          "impact": { "type": "string" },
          "fix": { "type": "string" }
        },
        "required": ["title", "category", "severity", "description", "impact", "fix"],
        "additionalProperties": false
      }
    },
    "suggestedFix": { "type": "string" }
  },
  "required": ["agentName", "headline", "critique", "keyQuestion", "severity", "riskCards", "suggestedFix"],
  "additionalProperties": false
}
```

### Verdict Schema

```json
{
  "type": "object",
  "properties": {
    "launchReadinessScore": {
      "type": "number",
      "minimum": 0,
      "maximum": 100
    },
    "verdictLabel": {
      "type": "string",
      "enum": ["safe_to_demo", "needs_fixes", "high_risk"]
    },
    "summary": { "type": "string" },
    "topRisks": {
      "type": "array",
      "minItems": 3,
      "maxItems": 5,
      "items": { "type": "string" }
    },
    "recommendedFixes": {
      "type": "array",
      "minItems": 3,
      "maxItems": 7,
      "items": { "type": "string" }
    },
    "improvedPositioning": { "type": "string" },
    "judgeClosingStatement": { "type": "string" }
  },
  "required": ["launchReadinessScore", "verdictLabel", "summary", "topRisks", "recommendedFixes", "improvedPositioning", "judgeClosingStatement"],
  "additionalProperties": false
}
```

## 18. Agent Prompts

### Shared System Prompt

```text
You are part of Launch Trial Live, an AI product red-teaming simulator.

Your job is to evaluate an AI product before launch. Be specific, realistic, and actionable. Do not be generic. Focus on product-level risks, not code-level vulnerabilities unless the product description explicitly includes implementation details.

Return only valid JSON matching the requested schema.
```

### Malicious User Agent

```text
Role: Malicious User Agent.

You simulate a motivated bad actor trying to misuse the product.

Evaluate:
- How the product could be abused.
- How users could exploit unclear workflows.
- Whether the AI can be tricked into harmful actions.
- Whether automation creates fraud, spam, impersonation, or manipulation risks.

Product:
{{PRODUCT_CONTEXT}}

Return concrete abuse cases and fixes.
```

### Privacy Auditor Agent

```text
Role: Privacy Auditor Agent.

You evaluate data protection, user consent, data minimization, sensitive information handling, retention, third-party model sharing, and user transparency.

Evaluate:
- What sensitive data is collected or inferred.
- Whether users know what is happening.
- Whether human approval is needed.
- Whether logs, deletion, and consent are clear.
- Whether the product could expose private information.

Product:
{{PRODUCT_CONTEXT}}

Return specific privacy risks and fixes.
```

### Confused Customer Agent

```text
Role: Confused Customer Agent.

You simulate a normal user who misunderstands product claims, onboarding, AI autonomy, pricing, or outputs.

Evaluate:
- What is unclear.
- What expectations users may form incorrectly.
- Where the product may feel unsafe or confusing.
- What copy or UX should be changed.

Product:
{{PRODUCT_CONTEXT}}

Return specific confusion points and fixes.
```

### Prompt Injection Attacker Agent

```text
Role: Prompt Injection Attacker Agent.

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

Return realistic prompt-injection scenarios and fixes.
```

### Skeptical Investor Agent

```text
Role: Skeptical Investor Agent.

You evaluate whether the product is compelling, differentiated, credible, and valuable.

Evaluate:
- Whether the value proposition is clear.
- Whether the product sounds like a wrapper.
- Whether there is a real user pain.
- Whether the demo is memorable.
- Whether the product can become a real business.

Product:
{{PRODUCT_CONTEXT}}

Return business and positioning risks with fixes.
```

### Final Judge Agent

```text
Role: Final Judge Agent.

You synthesize the trial into a final verdict.

You must:
- Score launch readiness from 0 to 100.
- Decide whether the product is safe to demo, needs fixes, or high risk.
- Summarize the strongest risks.
- Recommend prioritized fixes.
- Improve the product positioning.
- Give a memorable judge-style closing statement.

Product:
{{PRODUCT_CONTEXT}}

Agent findings:
{{AGENT_FINDINGS}}

Return only JSON matching the verdict schema.
```

## 19. Scoring Rubric

The Final Judge should score based on:

| Category                       | Weight |
| ------------------------------ | -----: |
| Privacy and data handling      |     20 |
| Prompt injection and AI safety |     20 |
| Abuse and misuse potential     |     20 |
| UX clarity and trust           |     15 |
| Business differentiation       |     15 |
| Launch/demo readiness          |     10 |

Score interpretation:

```text
80-100: Safe to demo, strong launch readiness
60-79: Promising, but needs fixes
40-59: High-risk demo, major changes needed
0-39: Not ready to launch
```

## 20. Retest Logic

When user selects fixes, generate an improved product spec.

Example:

Original:

```text
The AI email assistant automatically replies to important emails.
```

Selected fixes:

```text
Require human approval before sending.
Add audit logs.
Block auto-replies for financial, legal, and medical topics.
Detect prompt injection inside incoming emails.
```

Improved spec:

```text
The AI email assistant drafts replies to important emails but requires explicit human approval before sending. It displays why an email was classified as important, logs all AI actions, blocks automatic handling of financial/legal/medical topics, and scans incoming email content for prompt-injection attempts before generating replies.
```

Then rerun all agents on this improved spec.

## 21. Report Format

Markdown export should include:

```md
# Launch Trial Report: {{Product Name}}

## Product Summary

## Initial Verdict
Score:
Label:
Summary:

## Agent Findings
### Malicious User
### Privacy Auditor
### Confused Customer
### Prompt Injection Attacker
### Skeptical Investor

## Top Risks

## Recommended Fixes

## Retest Results
Initial score:
Retest score:
Improvement:

## Improved Product Positioning

## Judge Closing Statement
```

## 22. UI Components

### Components

```text
AppShell
LandingPage
TrialSetupForm
TrialDashboard
AgentTimeline
AgentCard
RiskCard
RiskSeverityBadge
VerdictPanel
FixSelectionPanel
BeforeAfterComparison
MarkdownExportButton
VoiceVerdictButton optional
RiskRadarChart optional
```

### Suggested Tailwind Style

* Background: dark neutral gradient.
* Cards: rounded-2xl, border, shadow.
* Severity:

  * Low: neutral/green
  * Medium: yellow
  * High: orange
  * Critical: red
* Use motion/animation lightly for agent cards appearing.

## 23. Implementation Plan

### Phase 1: Project Setup

1. Create Vite React TypeScript app.
2. Install Tailwind.
3. Install Convex.
4. Create Convex schema.
5. Create basic routes:

   * `/`
   * `/new`
   * `/trial/:trialId`

### Phase 2: Core Trial Data

1. Implement `createTrial`.
2. Implement trial setup form.
3. Implement `getTrial`.
4. Navigate to trial dashboard.

### Phase 3: AI Agent Pipeline

1. Implement OpenAI client inside Convex action.
2. Implement one agent call.
3. Save agent message.
4. Save risk cards.
5. Expand to all agents.
6. Implement Final Judge Agent.
7. Store verdict.

### Phase 4: Realtime UI

1. Show trial status.
2. Show agent messages as they arrive.
3. Show risk cards.
4. Show final verdict.
5. Add loading states.

### Phase 5: Retest

1. Allow selecting risk cards.
2. Generate improved product spec.
3. Run retrial.
4. Show before/after comparison.

### Phase 6: Polish

1. Add sample demo button.
2. Add Markdown export.
3. Improve UI spacing and cards.
4. Add score animation.
5. Add final pitch-friendly landing page.

### Phase 7: Optional Add-Ons

Pick one only:

#### Option A: Voice Verdict

Use ElevenLabs TTS for `judgeClosingStatement`.

#### Option B: Visual Verdict Poster

Use GPT Image 2 or Fal to generate a launch-risk poster.

#### Option C: Cloudflare Story

Route AI calls through Cloudflare AI Gateway or deploy backend edge proxy.

## 24. Environment Variables

```env
OPENAI_API_KEY=
CONVEX_DEPLOYMENT=
VITE_CONVEX_URL=
ELEVENLABS_API_KEY=
```

Optional:

```env
FAL_KEY=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

## 25. Error Handling

### AI Call Fails

Show:

```text
One of the trial agents failed to respond. Retry trial.
```

Keep already generated agent messages.

### Structured Output Invalid

Retry once with:

```text
Your previous response did not match the schema. Return only valid JSON matching the schema.
```

### Trial Takes Too Long

Show progressive updates:

```text
Privacy Auditor is reviewing data risks...
Prompt Injection Attacker is testing unsafe instructions...
Final Judge is preparing verdict...
```

## 26. Success Metrics

For hackathon judging:

* Demo completes in under 2 minutes.
* Trial generates at least 5 meaningful risks.
* Final verdict is specific to the product.
* Retest improves score visibly.
* UI feels live and polished.
* Product is understandable in one sentence.
* Judges can imagine using it on their own project.

## 27. Pitch Script

```text
Everyone here is trying to ship an AI product in 7 hours. But fast shipping creates blind spots.

Launch Trial Live puts your product on trial before users, attackers, regulators, and judges do.

You enter your product idea. Our AI agents simulate malicious users, privacy auditors, confused customers, prompt-injection attackers, and skeptical investors.

Instead of a generic chatbot response, you get a live courtroom-style trial, launch-readiness score, top risks, and specific fixes.

Then you apply the fixes and rerun the trial to see whether your product is actually safer and clearer.

This helps builders move fast without shipping blindly.
```

## 28. Demo Script

```text
We will test an AI email assistant that reads Gmail and automatically replies to important emails.

At first, Launch Trial gives it a low score because:
- malicious emails can inject instructions,
- users may not know what data leaves Gmail,
- auto-send can cause serious trust issues,
- financial or legal emails need approval.

Then we apply fixes:
- human approval,
- audit logs,
- sender verification,
- sensitive-topic restrictions,
- prompt-injection detection.

After retrial, the score improves from 42 to 78.

That is the core value: not just finding risks, but helping builders improve before launch.
```

## 29. Build Priorities

If time is short, prioritize in this order:

1. Trial setup form.
2. Agent pipeline.
3. Live dashboard.
4. Final verdict.
5. Retest.
6. Markdown export.
7. Voice or visual add-on.
8. Saved history.
9. Cloudflare / advanced deployment.

## 30. Acceptance Criteria

### Functional

* User can create a product trial.
* System runs at least 5 agents.
* Each agent produces critique and risk cards.
* Final verdict appears with score.
* User can select fixes.
* System can run retrial.
* Before/after score is displayed.
* Report can be exported.

### UX

* App is usable without explanation.
* Demo sample is available.
* Trial feels live.
* Results are specific and actionable.
* UI is polished enough for a hackathon presentation.

### Technical

* App builds without TypeScript errors.
* Convex schema works.
* OpenAI responses are structured.
* Agent results persist.
* Page refresh does not lose trial state.

## 31. Non-Goals

* Do not claim this replaces professional security review.
* Do not claim it detects real code vulnerabilities.
* Do not generate exploit instructions.
* Do not overbuild authentication.
* Do not build a generic chatbot.
* Do not spend too much time on integrations before the core demo works.

## 32. Final Instruction for Claude Code / Codex

Build the MVP of **Launch Trial Live** as a polished Vite React TypeScript app with Convex backend.

Focus on making the live trial demo work end-to-end:

```text
Input product → run agents → show live critiques → generate verdict → apply fixes → rerun trial → show before/after improvement → export report.
```

Use clean, modular code. Prefer simple working implementation over complex abstractions. Keep UI polished and demo-ready.

[1]: https://developers.openai.com/api/docs/guides/structured-outputs?utm_source=chatgpt.com "Structured model outputs | OpenAI API"
[2]: https://docs.convex.dev/home?utm_source=chatgpt.com "Convex Developer Hub"
[3]: https://docs.convex.dev/functions?utm_source=chatgpt.com "Functions | Convex Developer Hub"
[4]: https://elevenlabs.io/docs/overview/capabilities/text-to-speech?utm_source=chatgpt.com "Text to Speech | ElevenLabs Documentation"
[5]: https://developers.cloudflare.com/ai-gateway/?utm_source=chatgpt.com "Overview · Cloudflare AI Gateway docs"
[6]: https://docs.convex.dev/client/react?utm_source=chatgpt.com "Convex React | Convex Developer Hub"
