import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateReport = mutation({
  args: { trialId: v.id("trials") },
  handler: async (ctx, args) => {
    const trial = await ctx.db.get(args.trialId);
    if (!trial) throw new Error("trial not found");

    const initialMessages = await ctx.db
      .query("agentMessages")
      .withIndex("by_trial_phase", (q) =>
        q.eq("trialId", args.trialId).eq("phase", "initial"),
      )
      .collect();
    const retrialMessages = await ctx.db
      .query("agentMessages")
      .withIndex("by_trial_phase", (q) =>
        q.eq("trialId", args.trialId).eq("phase", "retrial"),
      )
      .collect();
    const initialRisks = await ctx.db
      .query("riskCards")
      .withIndex("by_trial_phase", (q) =>
        q.eq("trialId", args.trialId).eq("phase", "initial"),
      )
      .collect();
    const initialVerdict = await ctx.db
      .query("verdicts")
      .withIndex("by_trial_phase", (q) =>
        q.eq("trialId", args.trialId).eq("phase", "initial"),
      )
      .first();
    const retrialVerdict = await ctx.db
      .query("verdicts")
      .withIndex("by_trial_phase", (q) =>
        q.eq("trialId", args.trialId).eq("phase", "retrial"),
      )
      .first();

    const lines: string[] = [];
    lines.push(`# TrialRun Report: ${trial.productName}`);
    lines.push("");
    lines.push("## Product or Idea Summary");
    lines.push(trial.productDescription);
    lines.push("");
    lines.push(`- Target users: ${trial.targetUsers}`);
    lines.push(`- What it does on the user's behalf: ${trial.aiActions}`);
    lines.push(`- Data accessed: ${trial.dataAccessed}`);
    lines.push(`- Autonomy: ${trial.autonomyLevel}`);
    if (trial.additionalContext)
      lines.push(`- Context: ${trial.additionalContext}`);
    lines.push("");

    if (initialVerdict) {
      lines.push("## Launch Readiness Verdict");
      lines.push(`Score: ${initialVerdict.launchReadinessScore}`);
      lines.push(`Label: ${initialVerdict.verdictLabel}`);
      lines.push(`Summary: ${initialVerdict.summary}`);
      lines.push("");
    }

    lines.push("## Agent Findings");
    for (const m of initialMessages) {
      lines.push(`### ${m.agentName}`);
      lines.push(`Headline: ${m.headline}`);
      lines.push(`Severity: ${m.severity}`);
      lines.push(m.critique);
      lines.push(`Key question: ${m.keyQuestion}`);
      lines.push(`Suggested fix: ${m.suggestedFix}`);
      lines.push("");
    }

    if (initialVerdict) {
      lines.push("## Top Risks");
      for (const r of initialVerdict.topRisks) lines.push(`- ${r}`);
      lines.push("");
      lines.push("## Recommended Fixes");
      for (const r of initialVerdict.recommendedFixes) lines.push(`- ${r}`);
      lines.push("");
    }

    if (retrialVerdict && initialVerdict) {
      lines.push("## Retest Results");
      lines.push(`Initial score: ${initialVerdict.launchReadinessScore}`);
      lines.push(`Retest score: ${retrialVerdict.launchReadinessScore}`);
      lines.push(
        `Improvement: ${retrialVerdict.launchReadinessScore - initialVerdict.launchReadinessScore} points`,
      );
      lines.push("");
      lines.push(retrialVerdict.summary);
      lines.push("");
      lines.push("### Retrial Agent Findings");
      for (const m of retrialMessages) {
        lines.push(`#### ${m.agentName}`);
        lines.push(`Headline: ${m.headline}`);
        lines.push(`Severity: ${m.severity}`);
        lines.push(m.critique);
        lines.push("");
      }
      lines.push("## Improved Product Positioning");
      lines.push(retrialVerdict.improvedPositioning);
      lines.push("");
      lines.push("## Judge Closing Statement");
      lines.push(`> ${retrialVerdict.judgeClosingStatement}`);
      lines.push("");
    } else if (initialVerdict) {
      lines.push("## Improved Product Positioning");
      lines.push(initialVerdict.improvedPositioning);
      lines.push("");
      lines.push("## Judge Closing Statement");
      lines.push(`> ${initialVerdict.judgeClosingStatement}`);
      lines.push("");
    }

    void initialRisks;
    const markdown = lines.join("\n");
    const reportId = await ctx.db.insert("reports", {
      trialId: args.trialId,
      markdown,
      createdAt: Date.now(),
    });
    return { reportId, markdown };
  },
});

export const getLatestReport = query({
  args: { trialId: v.id("trials") },
  handler: async (ctx, args) => {
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_trial", (q) => q.eq("trialId", args.trialId))
      .order("desc")
      .first();
    return reports;
  },
});
