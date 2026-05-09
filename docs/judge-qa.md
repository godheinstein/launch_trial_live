# Judge Q&A

## What is Launch Trial Live?

A real-time AI product red-team simulator. It evaluates product-level launch risk using specialist agents, then produces a score, verdict, risk cards, fixes, retrial, and exportable report.

## How is this different from asking ChatGPT for feedback?

It is structured around roles, severity, risk cards, scoring, retrial history, and reports. The experience is a repeatable evaluation workflow, not a one-off chat.

## Is this a security scanner?

No. It is a product launch readiness simulator. It focuses on privacy, trust, UX, abuse potential, prompt injection, compliance, autonomy, and market clarity.

## Why use multiple agents?

Different launch risks require different perspectives. A malicious user looks for abuse, a privacy auditor checks data boundaries, a confused customer checks clarity, and the judge synthesizes the final decision.

## Why is the demo about an email assistant?

Email assistants are easy to understand and naturally risky: private inbox data, automatic replies, prompt injection inside emails, and user trust are all visible in one demo.

## What does the 42 to 78 improvement prove?

It proves the app is not only generating criticism. It can retest an improved product spec and show whether the fixes materially reduce launch risk.

## What happens if an API fails during judging?

Fallback mode uses a deterministic prebuilt trial script so the demo still shows the complete product flow.

## Does Convex matter to the product?

Yes. The live trial experience depends on reactive state: agent messages, trial status, risk cards, verdicts, and retrial history update as the trial runs.

## What would you build next?

Stronger report export, saved trial history, team collaboration, custom agent profiles, richer compliance checks, and integrations for GitHub issues or product tickets.

## How do you prevent generic answers?

The agent prompts require specific critique, severity, concrete risks, impact, and fixes. The UI also forces outputs into risk cards and final verdict fields.

## Who is the target user?

Hackathon teams, indie builders, product managers, founders, and developers building AI agents or automation tools.

## What is the business value?

It reduces avoidable launch mistakes. Teams get a fast pre-launch review loop before users, reviewers, investors, or attackers find the problems.
