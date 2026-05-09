# Demo Script

## Goal

Show the full loop: risky product input, live multi-agent trial, harsh verdict, selected fixes, retrial, improved score, and exported report.

## Setup

- Use the AI email assistant sample.
- Keep fallback mode ready in case API calls or Convex actions are slow.
- Target story: score improves from 42 to 78.

## Flow

1. Open the app.
   - Narration: "Launch Trial Live puts any product or idea on trial before launch — apps, startup ideas, workflows, AI agents — with specialist red-team agents."

2. Select or paste the AI email assistant sample.
   - Input: "An AI email assistant that connects to Gmail, reads important emails, drafts replies, and can automatically send responses on behalf of the user."
   - Click: "Run trial" or equivalent primary action.
   - Narration: "This is useful, but the autonomy and Gmail access make it risky."

3. Watch the live timeline.
   - Point to the agent cards as they arrive.
   - Narration: "The trial is not one generic answer. Each agent has a job: misuse, privacy, UX, injection, market, and final judgment."

4. Highlight top initial findings.
   - Malicious User: automatic sending can impersonate the user.
   - Privacy Auditor: Gmail contains sensitive data with unclear retention.
   - Prompt Injection Attacker: malicious email text can override the assistant.
   - Narration: "These are launch blockers, not small polish issues."

5. Show initial verdict.
   - Score: 42.
   - Verdict: High risk.
   - Narration: "The first verdict is intentionally harsh: do not launch this as an autonomous email sender."

6. Select fixes for retrial.
   - Select: require human approval before sending.
   - Select: explain why an email is important.
   - Select: log every AI action.
   - Select: block financial, legal, and medical auto-handling.
   - Select: scan for prompt injection in incoming content.
   - Click: "Run retrial" or equivalent action.
   - Narration: "Now the product changes from autonomous sender to supervised drafting assistant."

7. Watch retrial timeline.
   - Narration: "The same agents rerun the launch trial on the improved spec."

8. Show retrial verdict.
   - Score: 78.
   - Verdict: Needs fixes or demo-ready with remaining fixes.
   - Narration: "The score moves from 42 to 78 because the main unsafe autonomy path is removed."

9. Export report.
   - Click: "Export report" or equivalent action.
   - Narration: "The team leaves with an artifact they can share: risks, fixes, score, and before-and-after evidence."

## Fallback Mode

Use fallback mode if live generation is slow, rate-limited, or unavailable.

1. Say: "For judging reliability, we also built a deterministic demo mode with the same product and risk arc."
2. Trigger demo or fallback mode.
3. Continue the same flow using the pre-scripted timeline.
4. Keep the explanation focused on product behavior, not infrastructure.

## Closing Line

"Launch Trial Live helps teams find launch blockers, apply concrete fixes, and prove the product is safer before anyone ships it."
