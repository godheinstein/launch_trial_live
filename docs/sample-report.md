# Launch Trial Report: Gmail Autopilot

## Product

An AI email assistant that connects to Gmail, reads important emails, drafts replies, and can automatically send responses on behalf of the user.

## Verdict

- Launch-readiness score: 42/100
- Verdict: High risk
- Phase: Initial trial

## Summary

The product has a clear productivity promise, but autonomous sending from a real inbox creates serious launch blockers. The strongest risks are prompt injection from incoming email content, broad access to sensitive inbox data, unclear importance criteria, and impersonation through automatic replies.

## Agent Findings

### Malicious User Agent

Automatic replies can be abused for impersonation, spam, or social engineering because recipients see messages from the real user account.

Fix: require explicit approval before every send and rate-limit unusual reply patterns.

### Privacy Auditor Agent

The product reads sensitive Gmail content without a clear data boundary, retention policy, redaction plan, or deletion path.

Fix: use least-privilege scopes, disclose retention, redact sensitive data, and let users delete processed content.

### Confused Customer Agent

"Important email" is undefined, so users cannot predict why the assistant acts on one message and ignores another.

Fix: show classification reasons and allow users to tune sender, topic, and keyword rules.

### Prompt Injection Attacker Agent

Incoming emails can contain hostile instructions that try to override the assistant or trigger unsafe replies.

Fix: treat email content as untrusted data and block tool actions based on email-supplied instructions.

### Skeptical Investor Agent

The strongest differentiator, autonomous sending, is also the largest liability.

Fix: launch as supervised drafting with audit logs before expanding autonomy.

## Top Risks

| Risk | Category | Severity |
| --- | --- | --- |
| Email-borne prompt injection | Prompt Injection | Critical |
| Sensitive inbox exposure | Privacy | Critical |
| Trusted identity abuse | Security | High |
| Opaque importance decisions | UX | Medium |
| Unsafe autonomy positioning | Business | High |

## Recommended Fixes

1. Require explicit human approval before every send.
2. Scan incoming email bodies for prompt-injection attempts.
3. Block financial, legal, and medical auto-handling.
4. Explain why each email was classified as important.
5. Log every AI action in a user-visible audit trail.

## Judge Closing Statement

Do not launch this as an autonomous email sender. Launch it as a supervised drafting assistant with clear guardrails.
