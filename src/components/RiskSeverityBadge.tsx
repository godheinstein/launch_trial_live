import type { Severity } from "../types";
import { cn } from "../lib/cn";
import { severityLabel } from "../lib/scoring";

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: "bg-risk-critical/10 text-risk-critical border-risk-critical/40",
  high: "bg-risk-high/10 text-risk-high border-risk-high/40",
  medium: "bg-risk-medium/10 text-risk-medium border-risk-medium/40",
  low: "bg-risk-low/10 text-risk-low border-risk-low/40",
};

interface Props {
  severity: Severity;
  className?: string;
}

export function RiskSeverityBadge({ severity, className }: Props) {
  return (
    <span
      className={cn(
        "chip uppercase tracking-wide",
        SEVERITY_STYLES[severity],
        className,
      )}
    >
      {severityLabel(severity)}
    </span>
  );
}
