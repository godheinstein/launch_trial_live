import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import type { Verdict } from "../types";
import { verdictLabelText, verdictTone } from "../lib/scoring";
import { cn } from "../lib/cn";

interface Props {
  initial: Verdict;
  retrial: Verdict;
  appliedFixCount: number;
}

export function BeforeAfterComparison({
  initial,
  retrial,
  appliedFixCount,
}: Props) {
  const delta = retrial.launchReadinessScore - initial.launchReadinessScore;
  const improved = delta > 0;
  const initialTone = verdictTone(initial.verdictLabel);
  const retrialTone = verdictTone(retrial.verdictLabel);

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel-elevated p-6"
    >
      <header className="flex items-center gap-2 flex-wrap">
        <span className="chip">Retrial result</span>
        <span className="text-xs text-slate-400">
          {appliedFixCount} fix{appliedFixCount === 1 ? "" : "es"} applied
        </span>
      </header>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <ScoreTile
          label="Before"
          score={initial.launchReadinessScore}
          verdictText={verdictLabelText(initial.verdictLabel)}
          colorClass={initialTone.color}
          muted
        />
        <ArrowRight className="h-5 w-5 text-slate-500" />
        <ScoreTile
          label="After"
          score={retrial.launchReadinessScore}
          verdictText={verdictLabelText(retrial.verdictLabel)}
          colorClass={retrialTone.color}
          ring={retrialTone.ring}
        />
      </div>

      <div
        className={cn(
          "mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium tabular-nums",
          improved
            ? "border-risk-low/40 bg-risk-low/10 text-risk-low"
            : "border-risk-critical/40 bg-risk-critical/10 text-risk-critical",
        )}
      >
        {improved ? (
          <TrendingUp className="h-3.5 w-3.5" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5" />
        )}
        {improved ? "+" : ""}
        {delta} points
      </div>

      <p className="mt-4 text-sm text-slate-300 leading-relaxed">
        {retrial.summary}
      </p>
    </motion.section>
  );
}

function ScoreTile({
  label,
  score,
  verdictText,
  colorClass,
  ring,
  muted,
}: {
  label: string;
  score: number;
  verdictText: string;
  colorClass: string;
  ring?: string;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 text-center",
        muted
          ? "border-border bg-bg-elevated/40"
          : ring
            ? `bg-bg-elevated/40 ring-2 ${ring}`
            : "border-border bg-bg-elevated/40",
      )}
    >
      <div className="text-[10px] uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-3xl font-bold tabular-nums",
          muted ? "text-slate-300" : colorClass,
        )}
      >
        {score}
      </div>
      <div className={cn("text-[10px] mt-0.5 uppercase tracking-wider", colorClass)}>
        {verdictText}
      </div>
    </div>
  );
}
