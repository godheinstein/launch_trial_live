import type { Severity } from "../types";
import { cn } from "../lib/cn";

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

interface Props {
  active: Set<Severity>;
  onToggle: (s: Severity) => void;
  counts: Record<Severity, number>;
}

const STYLES: Record<Severity, string> = {
  critical: "border-risk-critical/40 text-risk-critical",
  high: "border-risk-high/40 text-risk-high",
  medium: "border-risk-medium/40 text-risk-medium",
  low: "border-risk-low/40 text-risk-low",
};

export function RiskFilterBar({ active, onToggle, counts }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {SEVERITIES.map((s) => {
        const isActive = active.has(s);
        return (
          <button
            key={s}
            type="button"
            onClick={() => onToggle(s)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition-all",
              STYLES[s],
              isActive
                ? "bg-bg-elevated"
                : "opacity-50 hover:opacity-100 bg-transparent",
            )}
          >
            {s} · {counts[s] ?? 0}
          </button>
        );
      })}
    </div>
  );
}
