import { useState } from "react";
import { Download, Check } from "lucide-react";
import type { TrialResult, AgentMessage } from "../types";
import { AGENT_BY_TYPE, SPECIALIST_AGENT_TYPES } from "../lib/agents";
import { severityLabel, verdictLabelText } from "../lib/scoring";

function formatAgentSection(messages: AgentMessage[]): string[] {
  const lines: string[] = [];
  for (const t of SPECIALIST_AGENT_TYPES) {
    const meta = AGENT_BY_TYPE[t];
    const m = messages.find((msg) => msg.agentType === t);
    lines.push(`### ${meta.name}`);
    if (!m) {
      lines.push("(no response)");
      lines.push("");
      continue;
    }
    lines.push(`**Headline:** ${m.headline}`);
    lines.push(`**Severity:** ${severityLabel(m.severity)}`);
    lines.push("");
    lines.push(m.critique);
    lines.push("");
    lines.push(`**Key question:** ${m.keyQuestion}`);
    lines.push(`**Suggested fix:** ${m.suggestedFix}`);
    lines.push("");
  }
  return lines;
}

export function buildMarkdown(result: TrialResult): string {
  const lines: string[] = [];
  const t = result.trial;
  lines.push(`# TrialRun Report: ${t.productName}`);
  lines.push("");
  lines.push("## Product or Idea Summary");
  lines.push(t.productDescription);
  lines.push("");
  lines.push(`- **Target users:** ${t.targetUsers}`);
  lines.push(`- **What it does on the user's behalf:** ${t.aiActions}`);
  lines.push(`- **Data accessed:** ${t.dataAccessed}`);
  lines.push(`- **Autonomy:** ${t.autonomyLevel}`);
  if (t.additionalContext)
    lines.push(`- **Context:** ${t.additionalContext}`);
  lines.push("");

  if (result.initialVerdict) {
    lines.push("## Launch Readiness Verdict");
    lines.push(`**Score:** ${result.initialVerdict.launchReadinessScore} / 100`);
    lines.push(
      `**Label:** ${verdictLabelText(result.initialVerdict.verdictLabel)}`,
    );
    lines.push("");
    lines.push(result.initialVerdict.summary);
    lines.push("");
  }

  lines.push("## Agent Findings");
  lines.push("");
  lines.push(...formatAgentSection(result.initialMessages));

  if (result.initialVerdict) {
    lines.push("## Top Risks");
    for (const r of result.initialVerdict.topRisks) lines.push(`- ${r}`);
    lines.push("");
    lines.push("## Recommended Fixes");
    for (const r of result.initialVerdict.recommendedFixes) lines.push(`- ${r}`);
    lines.push("");
  }

  if (result.retrialVerdict && result.initialVerdict) {
    lines.push("## Retest Results");
    lines.push(
      `- **Initial score:** ${result.initialVerdict.launchReadinessScore}`,
    );
    lines.push(
      `- **Retest score:** ${result.retrialVerdict.launchReadinessScore}`,
    );
    lines.push(
      `- **Improvement:** ${
        result.retrialVerdict.launchReadinessScore -
        result.initialVerdict.launchReadinessScore
      } points`,
    );
    lines.push("");
    lines.push(result.retrialVerdict.summary);
    lines.push("");
    lines.push("### Retrial Agent Findings");
    lines.push("");
    lines.push(...formatAgentSection(result.retrialMessages));
    lines.push("## Improved Product Positioning");
    lines.push(result.retrialVerdict.improvedPositioning);
    lines.push("");
    lines.push("## Judge Closing Statement");
    lines.push(`> ${result.retrialVerdict.judgeClosingStatement}`);
    lines.push("");
  } else if (result.initialVerdict) {
    lines.push("## Improved Product Positioning");
    lines.push(result.initialVerdict.improvedPositioning);
    lines.push("");
    lines.push("## Judge Closing Statement");
    lines.push(`> ${result.initialVerdict.judgeClosingStatement}`);
    lines.push("");
  }

  return lines.join("\n");
}

interface Props {
  result: TrialResult;
}

export function MarkdownExportButton({ result }: Props) {
  const [copied, setCopied] = useState(false);

  const handleExport = () => {
    const md = buildMarkdown(result);
    const slug = result.trial.productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || "trial"}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <button type="button" onClick={handleExport} className="btn-secondary">
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Downloaded
        </>
      ) : (
        <>
          <Download className="h-3.5 w-3.5" />
          Export Markdown
        </>
      )}
    </button>
  );
}
