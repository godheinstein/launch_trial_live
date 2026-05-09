import { ArrowUpRight, Wrench, Check } from "lucide-react";
import { motion } from "framer-motion";
import type { RiskCard } from "../types";
import { cn } from "../lib/cn";
import { severityRank } from "../lib/scoring";
import { RiskSeverityBadge } from "./RiskSeverityBadge";
import { CATEGORY_LABEL } from "./RiskCard";

interface Props {
  risks: RiskCard[];
  selectedRiskIds: string[];
  onToggle: (riskId: string) => void;
  onRetrial: () => void;
  isRetrialing?: boolean;
}

export function FixSelectionPanel({
  risks,
  selectedRiskIds,
  onToggle,
  onRetrial,
  isRetrialing,
}: Props) {
  const sorted = [...risks].sort(
    (a, b) => severityRank(a.severity) - severityRank(b.severity),
  );

  return (
    <section className="panel p-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip">
              <Wrench className="h-3 w-3" /> Fix checklist
            </span>
            <span className="text-xs text-slate-400">
              Pick the risks you'd address before retrial
            </span>
          </div>
          <h2 className="mt-2 text-lg font-semibold">
            Apply fixes and rerun the trial
          </h2>
        </div>
        <button
          type="button"
          disabled={selectedRiskIds.length === 0 || isRetrialing}
          onClick={onRetrial}
          className="btn-primary"
        >
          {isRetrialing ? "Retrial running…" : "Run retrial"}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </header>

      <ul className="mt-5 space-y-2">
        {sorted.map((risk) => {
          const selected = selectedRiskIds.includes(risk.id);
          return (
            <motion.li
              key={risk.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-all",
                selected
                  ? "border-accent/60 bg-accent/5"
                  : "border-border bg-bg-elevated/60 hover:border-border-strong",
              )}
              onClick={() => onToggle(risk.id)}
            >
              <div
                className={cn(
                  "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border",
                  selected
                    ? "bg-accent border-accent text-white"
                    : "border-border-strong",
                )}
              >
                {selected && <Check className="h-3 w-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="text-sm font-medium">{risk.title}</h4>
                  <div className="flex items-center gap-1.5">
                    <span className="chip text-slate-300 text-[10px]">
                      {CATEGORY_LABEL[risk.category]}
                    </span>
                    <RiskSeverityBadge severity={risk.severity} />
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  {risk.fix}
                </p>
              </div>
            </motion.li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-slate-500">
        {selectedRiskIds.length} fix{selectedRiskIds.length === 1 ? "" : "es"}{" "}
        selected · the retrial agent rewrites your product spec with each fix
        baked in, then the jury runs again.
      </p>
    </section>
  );
}
