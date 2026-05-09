import type { AgentMessage, AgentType, Verdict } from "../types";

const MAX_LEN = 160;

function firstSentence(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  const match = trimmed.match(/^[\s\S]*?[.!?](?:\s|$)/);
  return (match ? match[0] : trimmed).trim();
}

function truncate(text: string, max = MAX_LEN): string {
  if (!text) return text;
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max - 1).trimEnd() + "…";
}

/**
 * Pick the most demo-friendly snippet from a structured agent message,
 * following the priority described in the design spec:
 *   keyQuestion → headline → first sentence of critique → first sentence of suggestedFix.
 *
 * The Final Judge always shows the closing statement when a verdict is in.
 */
export function getBubbleText(
  message: AgentMessage | null,
  agentType: AgentType,
  verdict?: Verdict,
): string | null {
  if (agentType === "final_judge") {
    if (verdict?.judgeClosingStatement) {
      return truncate(verdict.judgeClosingStatement);
    }
    return null;
  }
  if (!message) return null;
  if (message.keyQuestion) return truncate(`"${message.keyQuestion}"`);
  if (message.headline) return truncate(message.headline);
  if (message.critique) return truncate(firstSentence(message.critique));
  if (message.suggestedFix) return truncate(firstSentence(message.suggestedFix));
  return null;
}

export type BubblePlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "upper-left"
  | "upper-right";

export function getBubblePlacement(agentType: AgentType): BubblePlacement {
  switch (agentType) {
    case "final_judge":
      return "bottom";
    case "privacy_auditor":
      return "right";
    case "skeptical_investor":
      return "left";
    case "malicious_user":
      return "upper-right";
    case "prompt_injection_attacker":
      return "upper-left";
    case "confused_customer":
      return "top";
  }
}
