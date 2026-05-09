import { motion } from "framer-motion";
import { Gavel, Quote, Sparkles } from "lucide-react";
import type { Verdict } from "../types";
import { verdictLabelText, verdictTone } from "../lib/scoring";
import { cn } from "../lib/cn";

interface Props {
  verdict: Verdict;
}

export function VerdictPanel({ verdict }: Props) {
  const tone = verdictTone(verdict.verdictLabel);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel-elevated p-6 md:p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6 md:gap-8 items-center">
        <div
          className={cn(
            "relative grid h-32 w-32 place-items-center rounded-full border border-border bg-bg ring-4",
            tone.ring,
          )}
        >
          <div className="text-center">
            <div className={cn("text-4xl font-bold tabular-nums", tone.color)}>
              {verdict.launchReadinessScore}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
              of 100
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="chip">
              <Gavel className="h-3 w-3" /> Verdict
            </span>
            <span className={cn("chip uppercase tracking-wide", tone.color)}>
              {verdictLabelText(verdict.verdictLabel)}
            </span>
          </div>
          <h2 className="mt-3 text-lg md:text-xl font-semibold leading-snug text-balance">
            {verdict.summary}
          </h2>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-risk-critical/30 bg-risk-critical/5 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-risk-critical">
            Top risks
          </div>
          <ul className="mt-2 space-y-1.5">
            {verdict.topRisks.map((r, i) => (
              <li key={i} className="text-sm text-slate-200 leading-relaxed">
                · {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-risk-low/30 bg-risk-low/5 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-risk-low">
            Recommended fixes
          </div>
          <ul className="mt-2 space-y-1.5">
            {verdict.recommendedFixes.map((f, i) => (
              <li key={i} className="text-sm text-slate-200 leading-relaxed">
                · {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
          <Sparkles className="h-3.5 w-3.5" /> Improved positioning
        </div>
        <p className="mt-2 text-sm text-slate-200 leading-relaxed">
          {verdict.improvedPositioning}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-bg-elevated/60 p-4">
        <div className="flex items-start gap-2">
          <Quote className="h-4 w-4 mt-0.5 shrink-0 text-slate-500" />
          <p className="text-sm text-slate-200 italic leading-relaxed">
            {verdict.judgeClosingStatement}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
