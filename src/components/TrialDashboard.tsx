import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  RefreshCw,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { useTrialEngine } from "../lib/useTrialEngine";
import { useLiveTrial } from "../lib/useLiveTrial";
import { isLiveMode } from "../lib/convexClient";
import { sampleTrialResult } from "../demo/runDemoMode";
import { computeFallbackScore, severityRank } from "../lib/scoring";
import type {
  AgentRunState,
  AutonomyLevel,
  ProductInput,
  RiskCard as RiskCardType,
  Severity,
  TrialStatus,
  Verdict,
} from "../types";
import type { Id } from "../../convex/_generated/dataModel";
import { AgentTimeline } from "./AgentTimeline";
import { RiskCard } from "./RiskCard";
import { VerdictPanel } from "./VerdictPanel";
import { FixSelectionPanel } from "./FixSelectionPanel";
import { BeforeAfterComparison } from "./BeforeAfterComparison";
import { MarkdownExportButton } from "./MarkdownExportButton";
import { RiskRadarChart } from "./RiskRadarChart";
import { RiskFilterBar } from "./RiskFilterBar";
import { TrialChamber } from "./TrialChamber";
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

const DEMO_PREFIX = "trial-";

function looksLikeConvexId(id: string | undefined): boolean {
  if (!id) return false;
  if (id.startsWith(DEMO_PREFIX)) return false;
  // Convex IDs are 32 alphanumeric characters
  return /^[a-z0-9]{20,}$/i.test(id);
}

export function TrialDashboard() {
  const { trialId } = useParams<{ trialId: string }>();
  const [searchParams] = useSearchParams();
  const isDemoParam = searchParams.get("demo") === "1";

  const useLive =
    isLiveMode && !isDemoParam && looksLikeConvexId(trialId);

  // Always call both hooks (rules of hooks). The unused one is cheap.
  const live = useLiveTrial(
    useLive ? (trialId as Id<"trials">) : null,
  );

  const productFromParams: ProductInput = useMemo(
    () => ({
      productName:
        searchParams.get("productName") ||
        sampleTrialResult.trial.productName,
      productDescription:
        searchParams.get("productDescription") ||
        sampleTrialResult.trial.productDescription,
      targetUsers:
        searchParams.get("targetUsers") || sampleTrialResult.trial.targetUsers,
      aiActions:
        searchParams.get("aiActions") || sampleTrialResult.trial.aiActions,
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

  const demo = useTrialEngine(trialId ?? "trial", productFromParams);

  // ----- Adapter: pick the source of truth based on mode -----
  const product: ProductInput = useLive && live.trial
    ? {
        productName: live.trial.productName,
        productDescription: live.trial.productDescription,
        targetUsers: live.trial.targetUsers,
        aiActions: live.trial.aiActions,
        dataAccessed: live.trial.dataAccessed,
        autonomyLevel: live.trial.autonomyLevel,
        additionalContext: live.trial.additionalContext,
      }
    : productFromParams;

  const status: TrialStatus = useLive
    ? live.state.status
    : demo.state.status;
  const isRunning = useLive ? live.isRunning : demo.isRunning;
  const showRetrial = useLive
    ? live.showRetrial
    : !!(demo.state.retrialVerdict && demo.state.initialVerdict);

  const initialAgents: AgentRunState[] = useLive
    ? live.state.initialAgents
    : demo.state.initialAgents;
  const retrialAgents: AgentRunState[] = useLive
    ? live.state.retrialAgents
    : demo.state.retrialAgents;
  const initialRisks: RiskCardType[] = useLive
    ? live.state.initialRisks
    : demo.state.initialRisks;
  const retrialRisks: RiskCardType[] = useLive
    ? live.state.retrialRisks
    : demo.state.retrialRisks;
  const initialVerdict: Verdict | undefined = useLive
    ? live.state.initialVerdict
    : demo.state.initialVerdict;
  const retrialVerdict: Verdict | undefined = useLive
    ? live.state.retrialVerdict
    : demo.state.retrialVerdict;

  // ----- Local-only state (severity filter and demo-mode selection) -----
  const [demoSelectedRiskIds, setDemoSelectedRiskIds] = useState<string[]>(
    [],
  );
  const [activeSeverities, setActiveSeverities] = useState<Set<Severity>>(
    () => new Set(ALL_SEVERITIES),
  );

  const selectedRiskIds = useLive
    ? initialRisks.filter((r) => r.selectedForFix).map((r) => r.id)
    : demoSelectedRiskIds;

  // Auto-start demo mode trial when ?demo=1 lands on the dashboard
  useEffect(() => {
    if (!useLive && isDemoParam && demo.state.status === "draft") {
      void demo.runTrial("initial");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const liveScore = useMemo(() => {
    if (status === "draft") return undefined;
    if (retrialVerdict) return retrialVerdict.launchReadinessScore;
    if (initialVerdict) return initialVerdict.launchReadinessScore;
    if (initialRisks.length > 0) return computeFallbackScore(initialRisks);
    return undefined;
  }, [status, initialRisks, initialVerdict, retrialVerdict]);

  const risksForList = showRetrial ? retrialRisks : initialRisks;
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

  const toggleRiskFix = (riskId: string) => {
    if (useLive) {
      const current = initialRisks.find((r) => r.id === riskId);
      if (!current) return;
      void live.toggleRisk(riskId, !current.selectedForFix);
    } else {
      setDemoSelectedRiskIds((prev) =>
        prev.includes(riskId)
          ? prev.filter((id) => id !== riskId)
          : [...prev, riskId],
      );
    }
  };

  const runInitial = () => {
    if (useLive) {
      void live.runTrial("initial");
    } else {
      setDemoSelectedRiskIds([]);
      void demo.runTrial("initial");
    }
  };

  const runRetrial = () => {
    if (selectedRiskIds.length === 0) return;
    if (useLive) {
      void live.runTrial("retrial");
    } else {
      void demo.runTrial("retrial");
    }
  };

  const trialStatusLabel = (() => {
    if (status === "running") return "Trial in progress";
    if (status === "retrial_running") return "Retrial in progress";
    if (status === "completed") return "Trial complete";
    if (status === "retrial_completed") return "Retrial complete";
    if (status === "error") return "Error";
    return "Ready";
  })();

  const result = useLive
    ? live.result ?? demo.result
    : demo.result;

  if (useLive && !live.isReady) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="panel p-8">
          <Activity className="h-5 w-5 text-accent animate-pulse mx-auto" />
          <p className="mt-3 text-slate-300">Loading trial from Convex…</p>
          <p className="mt-1 text-xs text-slate-500">trial · {trialId}</p>
        </div>
      </div>
    );
  }

  if (useLive && live.isReady && !live.trial) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="panel p-8">
          <h1 className="text-xl font-semibold">Trial not found</h1>
          <p className="mt-2 text-sm text-slate-400">
            We couldn't find a trial with id <code>{trialId}</code> in this
            Convex deployment.
          </p>
          <Link to="/new" className="btn-primary mt-4 inline-flex">
            Start a new trial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link to="/new" className="btn-ghost text-xs">
          <ArrowLeft className="h-3.5 w-3.5" />
          New trial
        </Link>
        <div className="flex items-center gap-2">
          {result?.initialVerdict && <MarkdownExportButton result={result} />}
          <button
            type="button"
            onClick={runInitial}
            disabled={isRunning}
            className="btn-secondary"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Running…
              </>
            ) : status === "draft" ? (
              <>
                <Play className="h-3.5 w-3.5" />
                {useLive ? "Start trial" : "Run demo mode"}
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

      {useLive && live.actionError && (
        <div className="mb-4 rounded-xl border border-risk-critical/40 bg-risk-critical/5 px-4 py-3 text-sm text-risk-critical flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{live.actionError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
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
              <Row
                label="What it does on the user's behalf"
                value={product.aiActions}
              />
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
                      : status === "completed" ||
                          status === "retrial_completed"
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
                <div className="text-3xl font-bold tabular-nums">
                  {liveScore}
                </div>
              </div>
            )}
          </section>

          {(initialRisks.length > 0 || showRetrial) && (
            <RiskRadarChart
              initialRisks={initialRisks}
              retrialRisks={showRetrial ? retrialRisks : undefined}
            />
          )}
        </aside>

        <div className="space-y-8 min-w-0">
          <TrialChamber
            agents={showRetrial ? retrialAgents : initialAgents}
            risks={showRetrial ? retrialRisks : initialRisks}
            status={status}
            verdict={showRetrial ? retrialVerdict : initialVerdict}
            phase={showRetrial ? "retrial" : "initial"}
          />

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400 mb-3">
              {showRetrial ? "Retrial · jury timeline" : "Jury timeline"}
            </h2>
            <AgentTimeline agents={showRetrial ? retrialAgents : initialAgents} />
          </section>

          {initialVerdict && !showRetrial && (
            <section>
              <VerdictPanel verdict={initialVerdict} />
            </section>
          )}

          {showRetrial && initialVerdict && retrialVerdict && (
            <>
              <section>
                <BeforeAfterComparison
                  initial={initialVerdict}
                  retrial={retrialVerdict}
                  appliedFixCount={selectedRiskIds.length}
                />
              </section>
              <section>
                <VerdictPanel verdict={retrialVerdict} />
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

          {initialVerdict && !showRetrial && (
            <section>
              <FixSelectionPanel
                risks={initialRisks}
                selectedRiskIds={selectedRiskIds}
                onToggle={toggleRiskFix}
                onRetrial={runRetrial}
                isRetrialing={isRunning}
              />
            </section>
          )}

          {status === "draft" && !isDemoParam && (
            <div className="panel p-8 text-center">
              <p className="text-slate-300">
                {useLive ? (
                  <>
                    Click{" "}
                    <span className="text-white font-medium">Start trial</span>{" "}
                    to run the agents on this product or idea.
                  </>
                ) : (
                  <>
                    Click{" "}
                    <span className="text-white font-medium">
                      Run demo mode
                    </span>{" "}
                    to replay a sample trial — the email-assistant arc takes
                    about a minute.
                  </>
                )}
              </p>
              {!useLive && (
                <p className="mt-2 text-xs text-slate-500">
                  Live mode is active when VITE_CONVEX_URL is set and trials
                  are created via the form.
                </p>
              )}
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
