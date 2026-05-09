import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Play, RefreshCw, Activity } from "lucide-react";
import { useTrialEngine } from "../lib/useTrialEngine";
import { sampleTrialResult } from "../demo/runDemoMode";
import { computeFallbackScore, severityRank } from "../lib/scoring";
import type {
  AutonomyLevel,
  ProductInput,
  Severity,
} from "../types";
import { AgentTimeline } from "./AgentTimeline";
import { RiskCard } from "./RiskCard";
import { VerdictPanel } from "./VerdictPanel";
import { FixSelectionPanel } from "./FixSelectionPanel";
import { BeforeAfterComparison } from "./BeforeAfterComparison";
import { MarkdownExportButton } from "./MarkdownExportButton";
import { RiskRadarChart } from "./RiskRadarChart";
import { RiskFilterBar } from "./RiskFilterBar";
import { cn } from "../lib/cn";

const ALL_SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];

function autonomyLabel(a: AutonomyLevel): string {
  return {
    none: "None",
    suggests_only: "Suggests only",
    requires_approval: "Requires approval",
    acts_automatically: "Acts automatically",
  }[a];
}

export function TrialDashboard() {
  const { trialId } = useParams<{ trialId: string }>();
  const [searchParams] = useSearchParams();

  const product: ProductInput = useMemo(
    () => ({
      productName:
        searchParams.get("productName") ||
        sampleTrialResult.trial.productName,
      productDescription:
        searchParams.get("productDescription") ||
        sampleTrialResult.trial.productDescription,
      targetUsers:
        searchParams.get("targetUsers") ||
        sampleTrialResult.trial.targetUsers,
      aiActions:
        searchParams.get("aiActions") ||
        sampleTrialResult.trial.aiActions,
      dataAccessed:
        searchParams.get("dataAccessed") ||
        sampleTrialResult.trial.dataAccessed,
      autonomyLevel:
        (searchParams.get("autonomyLevel") as AutonomyLevel) ||
        sampleTrialResult.trial.autonomyLevel,
      additionalContext:
        searchParams.get("additionalContext") ||
        sampleTrialResult.trial.additionalContext,
    }),
    [searchParams],
  );

  const isDemoParam = searchParams.get("demo") === "1";

  const { state, result, runTrial, isRunning } = useTrialEngine(
    trialId ?? "trial",
    product,
  );

  const [selectedRiskIds, setSelectedRiskIds] = useState<string[]>([]);
  const [activeSeverities, setActiveSeverities] = useState<Set<Severity>>(
    () => new Set(ALL_SEVERITIES),
  );

  useEffect(() => {
    if (isDemoParam && state.status === "draft") {
      void runTrial("initial");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liveScore = useMemo(() => {
    if (state.status === "draft") return undefined;
    if (state.retrialVerdict) return state.retrialVerdict.launchReadinessScore;
    if (state.initialVerdict) return state.initialVerdict.launchReadinessScore;
    return computeFallbackScore(state.initialRisks);
  }, [state]);

  const showRetrial = state.retrialVerdict && state.initialVerdict;
  const risksForList = showRetrial ? state.retrialRisks : state.initialRisks;
  const sortedRisks = useMemo(
    () =>
      [...risksForList].sort(
        (a, b) => severityRank(a.severity) - severityRank(b.severity),
      ),
    [risksForList],
  );
  const filteredRisks = sortedRisks.filter((r) =>
    activeSeverities.has(r.severity),
  );
  const counts = useMemo(() => {
    const acc: Record<Severity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };
    for (const r of risksForList) acc[r.severity] += 1;
    return acc;
  }, [risksForList]);

  const toggleSeverity = (s: Severity) =>
    setActiveSeverities((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  const toggleRiskFix = (riskId: string) =>
    setSelectedRiskIds((prev) =>
      prev.includes(riskId)
        ? prev.filter((id) => id !== riskId)
        : [...prev, riskId],
    );

  const onRetrial = () => {
    if (selectedRiskIds.length === 0) return;
    void runTrial("retrial");
  };

  const onRunInitial = () => {
    setSelectedRiskIds([]);
    void runTrial("initial");
  };

  const trialStatusLabel = (() => {
    if (state.status === "running") return "Trial in progress";
    if (state.status === "retrial_running") return "Retrial in progress";
    if (state.status === "completed") return "Trial complete";
    if (state.status === "retrial_completed") return "Retrial complete";
    if (state.status === "error") return "Error";
    return "Ready";
  })();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link to="/new" className="btn-ghost text-xs">
          <ArrowLeft className="h-3.5 w-3.5" />
          New trial
        </Link>
        <div className="flex items-center gap-2">
          {state.initialVerdict && <MarkdownExportButton result={result} />}
          <button
            type="button"
            onClick={onRunInitial}
            disabled={isRunning}
            className="btn-secondary"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Running…
              </>
            ) : state.status === "draft" ? (
              <>
                <Play className="h-3.5 w-3.5" />
                Run demo mode
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                Re-run trial
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Left column: product summary, status, score */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <section className="panel p-5">
            <span className="chip mb-2 text-[10px]">trial · {trialId}</span>
            <h1 className="text-xl font-semibold tracking-tight">
              {product.productName}
            </h1>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {product.productDescription}
            </p>

            <dl className="mt-4 space-y-2 text-xs">
              <Row label="Target users" value={product.targetUsers} />
              <Row label="AI actions" value={product.aiActions} />
              <Row label="Data accessed" value={product.dataAccessed} />
              <Row
                label="Autonomy"
                value={autonomyLabel(product.autonomyLevel)}
              />
              {product.additionalContext && (
                <Row label="Context" value={product.additionalContext} />
              )}
            </dl>
          </section>

          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-slate-400">
                Trial status
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs">
                <Activity
                  className={cn(
                    "h-3 w-3",
                    isRunning
                      ? "text-accent animate-pulse"
                      : state.status === "completed" ||
                          state.status === "retrial_completed"
                        ? "text-risk-low"
                        : "text-slate-500",
                  )}
                />
                {trialStatusLabel}
              </span>
            </div>
            {liveScore !== undefined && (
              <div className="mt-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  Live score
                </div>
                <div className="text-3xl font-bold tabular-nums">{liveScore}</div>
              </div>
            )}
          </section>

          {(state.initialRisks.length > 0 || showRetrial) && (
            <RiskRadarChart
              initialRisks={state.initialRisks}
              retrialRisks={
                showRetrial ? state.retrialRisks : undefined
              }
            />
          )}
        </aside>

        {/* Center + right (we'll use a single flowing column on the right) */}
        <div className="space-y-8 min-w-0">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400 mb-3">
              {showRetrial ? "Retrial · the jury" : "The jury"}
            </h2>
            <AgentTimeline
              agents={
                showRetrial ? state.retrialAgents : state.initialAgents
              }
            />
          </section>

          {state.initialVerdict && !showRetrial && (
            <section>
              <VerdictPanel verdict={state.initialVerdict} />
            </section>
          )}

          {showRetrial && state.initialVerdict && state.retrialVerdict && (
            <>
              <section>
                <BeforeAfterComparison
                  initial={state.initialVerdict}
                  retrial={state.retrialVerdict}
                  appliedFixCount={selectedRiskIds.length}
                />
              </section>
              <section>
                <VerdictPanel verdict={state.retrialVerdict} />
              </section>
            </>
          )}

          {risksForList.length > 0 && (
            <section>
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {showRetrial ? "Retrial risks" : "Risks ranked by severity"}
                </h2>
                <RiskFilterBar
                  active={activeSeverities}
                  onToggle={toggleSeverity}
                  counts={counts}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filteredRisks.map((risk, i) => (
                  <RiskCard key={risk.id} risk={risk} index={i} />
                ))}
              </div>
            </section>
          )}

          {state.initialVerdict && !showRetrial && (
            <section>
              <FixSelectionPanel
                risks={state.initialRisks}
                selectedRiskIds={selectedRiskIds}
                onToggle={toggleRiskFix}
                onRetrial={onRetrial}
                isRetrialing={isRunning}
              />
            </section>
          )}

          {state.status === "draft" && !isDemoParam && (
            <div className="panel p-8 text-center">
              <p className="text-slate-300">
                Click{" "}
                <span className="text-white font-medium">Run demo mode</span> to
                replay a sample trial — the email-assistant arc takes about a
                minute.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Live mode wires up via Convex once VITE_CONVEX_URL is set.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="text-slate-200 leading-relaxed">{value}</dd>
    </div>
  );
}
