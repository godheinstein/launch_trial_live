# Launch Trial Live Pitch Script

## 30 seconds

Launch Trial Live is a real-time multi-agent red-team simulator for any product or idea — apps, startup ideas, workflows, features, AI agents.

Instead of asking a chatbot, "what could go wrong?", you enter a product or idea and watch specialist agents challenge it from different angles: malicious use, privacy, customer confusion, prompt injection (when it applies), market risk, and final launch judgment.

In our demo, an AI email assistant starts at a launch-readiness score of 42 because automatic Gmail replies create privacy and injection risk. After applying guardrails, the retrial score rises to 78.

The value is simple: find the launch blockers before users, reviewers, or attackers do.

## 60 seconds

Builders ship products and ideas fast, but product-level risk is hard to see from inside the team. Code scanners do not tell you whether your product can be abused, whether users understand what the product actually does, whether sensitive data is handled correctly, or whether hostile content can manipulate any AI surface in the loop.

Launch Trial Live turns that review into a live trial. You paste a product description, then multiple AI agents interrogate it: malicious user, privacy auditor, confused customer, prompt-injection attacker, skeptical investor, and final judge. Each agent produces concrete risks and fixes, not generic advice.

The demo product is an AI email assistant that reads Gmail and can automatically reply. The first verdict is harsh: 42 out of 100, high risk. The agents find prompt injection in incoming emails, sensitive inbox data, unclear "important email" rules, and unsafe automatic sending.

Then we apply fixes: approval before send, action logs, sensitive-topic blocks, explainable classifications, and injection screening. The retrial improves to 78.

That before-and-after loop is the product: identify risks, apply fixes, rerun the launch trial, and leave with a report the team can act on.

## 2 minutes

Launch Trial Live helps builders test any product or idea before launch at the product level, not just the code level.

The problem is that modern products fail in ways normal QA misses. An automation might take an unsafe action. A user might not understand what the product is actually doing. A malicious email, document, or webpage might inject instructions into an AI surface. A privacy reviewer might reject a product because the data boundary is vague. These are launch-readiness risks that show up the same whether or not the product is AI-driven.

Our workflow is built around a live multi-agent trial. The user enters a product idea, landing page, prompt, README, or feature spec. Then six agents evaluate it:

- Malicious User Agent
- Privacy Auditor Agent
- Confused Customer Agent
- Prompt Injection Attacker Agent
- Skeptical Investor Agent
- Final Judge Agent

Each agent speaks in the timeline, creates risk cards with severity, and recommends specific fixes. The judge produces a launch-readiness score, verdict, top risks, and recommended changes.

For the demo, we use an AI email assistant that connects to Gmail, reads important emails, drafts replies, and can send automatically. That sounds useful, but the initial trial scores it 42. The agents flag serious blockers: sensitive inbox access, email-borne prompt injection, impersonation through automatic sending, unclear importance rules, and weak launch positioning.

Then we show the second half of the product. We select fixes and rerun the trial on an improved spec: every reply needs explicit human approval, the app explains why an email is important, every action is logged, financial/legal/medical topics are blocked, and incoming email content is scanned for prompt injection. The retrial score rises to 78.

The core insight is that teams do not just need risk detection. They need a fast loop that proves the product got safer. Launch Trial Live gives builders a courtroom-style evaluation, a concrete fix list, before-and-after scoring, and an exportable launch report.
