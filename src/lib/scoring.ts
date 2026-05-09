import type { RiskCard, Severity, VerdictLabel } from "../types";

export const SEVERITY_WEIGHTS: Record<Severity, number> = {
  critical: 15,
  high: 10,
  medium: 5,
  low: 2,
};

export const BASE_SCORE = 100;

export function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeFallbackScore(risks: RiskCard[]): number {
  const penalty = risks.reduce(
    (acc, risk) => acc + (SEVERITY_WEIGHTS[risk.severity] ?? 0),
    0,
  );
  return clampScore(BASE_SCORE - penalty);
}

export function severityRank(severity: Severity): number {
  return { critical: 0, high: 1, medium: 2, low: 3 }[severity];
}

export function severityLabel(severity: Severity): string {
  return severity[0].toUpperCase() + severity.slice(1);
}

export function verdictLabelFromScore(score: number): VerdictLabel {
  if (score >= 80) return "safe_to_demo";
  if (score >= 40) return "needs_fixes";
  return "high_risk";
}

export function verdictLabelText(label: VerdictLabel): string {
  if (label === "safe_to_demo") return "Safe to demo";
  if (label === "needs_fixes") return "Needs fixes before launch";
  return "High risk";
}

export function verdictTone(label: VerdictLabel) {
  if (label === "safe_to_demo")
    return { color: "text-risk-low", ring: "ring-risk-low/40" };
  if (label === "needs_fixes")
    return { color: "text-risk-medium", ring: "ring-risk-medium/40" };
  return { color: "text-risk-critical", ring: "ring-risk-critical/40" };
}
