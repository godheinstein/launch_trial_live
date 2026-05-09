import { useMemo } from "react";
import type { RiskCard, RiskCategory } from "../types";
import { SEVERITY_WEIGHTS } from "../lib/scoring";

const CATEGORIES: { key: RiskCategory; label: string }[] = [
  { key: "privacy", label: "Privacy" },
  { key: "prompt_injection", label: "Injection" },
  { key: "safety", label: "Safety" },
  { key: "security", label: "Security" },
  { key: "ux", label: "UX" },
  { key: "trust", label: "Trust" },
  { key: "business", label: "Business" },
  { key: "compliance", label: "Compliance" },
];

const MAX_RISK_PER_AXIS = 30;

interface Props {
  initialRisks: RiskCard[];
  retrialRisks?: RiskCard[];
}

function computeAxisValues(risks: RiskCard[]): Record<RiskCategory, number> {
  const totals: Record<RiskCategory, number> = {
    privacy: 0,
    security: 0,
    ux: 0,
    business: 0,
    trust: 0,
    compliance: 0,
    prompt_injection: 0,
    safety: 0,
  };
  for (const r of risks) {
    totals[r.category] += SEVERITY_WEIGHTS[r.severity];
  }
  return totals;
}

export function RiskRadarChart({ initialRisks, retrialRisks }: Props) {
  const initial = useMemo(() => computeAxisValues(initialRisks), [initialRisks]);
  const retrial = useMemo(
    () => (retrialRisks ? computeAxisValues(retrialRisks) : null),
    [retrialRisks],
  );

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 36;
  const n = CATEGORIES.length;
  const angleFor = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;

  const buildPolygon = (values: Record<RiskCategory, number>) =>
    CATEGORIES.map(({ key }, i) => {
      const v = Math.min(MAX_RISK_PER_AXIS, values[key]) / MAX_RISK_PER_AXIS;
      const a = angleFor(i);
      return `${cx + Math.cos(a) * radius * v},${cy + Math.sin(a) * radius * v}`;
    }).join(" ");

  return (
    <div className="panel p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Risk radar
      </div>
      <div className="mt-3 flex items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px]">
          {[0.25, 0.5, 0.75, 1].map((r, i) => (
            <polygon
              key={i}
              points={CATEGORIES.map((_, j) => {
                const a = angleFor(j);
                return `${cx + Math.cos(a) * radius * r},${cy + Math.sin(a) * radius * r}`;
              }).join(" ")}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
          ))}
          {CATEGORIES.map((_, j) => {
            const a = angleFor(j);
            return (
              <line
                key={j}
                x1={cx}
                y1={cy}
                x2={cx + Math.cos(a) * radius}
                y2={cy + Math.sin(a) * radius}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
              />
            );
          })}

          <polygon
            points={buildPolygon(initial)}
            fill="rgba(255,77,109,0.18)"
            stroke="#ff4d6d"
            strokeWidth={1.5}
          />

          {retrial && (
            <polygon
              points={buildPolygon(retrial)}
              fill="rgba(123,224,164,0.18)"
              stroke="#7be0a4"
              strokeWidth={1.5}
            />
          )}

          {CATEGORIES.map(({ label }, j) => {
            const a = angleFor(j);
            const x = cx + Math.cos(a) * (radius + 16);
            const y = cy + Math.sin(a) * (radius + 16);
            return (
              <text
                key={label}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-400"
                style={{ fontSize: 10, letterSpacing: 0.5 }}
              >
                {label}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-risk-critical" />
          Initial
        </span>
        {retrial && (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-risk-low" />
            Retrial
          </span>
        )}
      </div>
    </div>
  );
}
