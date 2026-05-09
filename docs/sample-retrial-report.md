# Retrial Report: Gmail Autopilot

## Product Changes

The AI email assistant now drafts replies but requires explicit human approval before sending. It displays why an email was classified as important, logs all AI actions, blocks automatic handling of financial/legal/medical topics, and scans incoming email content for prompt-injection attempts before generating replies.

## Verdict

- Initial score: 42/100
- Retrial score: 78/100
- Improvement: +36
- Verdict: Needs fixes

## Summary

The revised product removes the most dangerous launch behavior: automatic sending. It also gives users more visibility and control through explanations, logs, sensitive-topic blocks, and prompt-injection screening. Remaining concerns are narrower and more implementation-specific.

## Improved Findings

### Malicious User Agent

Human approval blocks the main impersonation and spam path. Risk remains if users approve many replies without reading context.

Next fix: add friction for high-risk external replies, payment language, unusual domains, and attachments.

### Privacy Auditor Agent

Sensitive-topic blocking and action logs improve trust. The product still needs a clear retention and deletion policy.

Next fix: publish retention defaults and provide deletion controls for processed email data.

### Confused Customer Agent

Explaining importance decisions gives users a useful correction loop.

Next fix: allow users to edit future importance rules from the review queue.

### Prompt Injection Attacker Agent

Screening incoming content is a strong improvement, but detection must enforce blocking behavior.

Next fix: make injection detection a hard gate before drafting or sending.

### Skeptical Investor Agent

Supervised drafting with logs is a credible safer wedge.

Next fix: prove value with review time saved, edits per draft, and prevented risky sends.

## Before and After

| Area | Initial Trial | Retrial |
| --- | --- | --- |
| Sending | Automatic replies | Human approval required |
| Privacy | Broad Gmail access unclear | Sensitive topics blocked, logs visible |
| Prompt injection | No mitigation | Incoming content scanned |
| UX | Importance criteria unclear | Reasons displayed |
| Trust | Little auditability | Actions logged |

## Remaining Risks

| Risk | Category | Severity |
| --- | --- | --- |
| Retention policy still unspecified | Privacy | Medium |
| Detection without enforcement | Prompt Injection | Medium |
| Careless bulk approval | Security | Medium |

## Judge Closing Statement

The retrial moves the product from high-risk to demo-ready with remaining fixes. The score improves from 42 to 78 because the core autonomy risk is now controlled.
