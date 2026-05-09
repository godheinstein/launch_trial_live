import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  RefreshCw,
  Activity,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useFullscreen } from "../lib/useFullscreen";
import { useNarrationController } from "../lib/useNarrationController";
import { getBubbleText } from "../lib/bubbleText";
import { FullscreenButton } from "./FullscreenButton";
import { FullscreenPrompt } from "./FullscreenPrompt";
import { FullscreenHint } from "./FullscreenHint";
import { NarrationControls } from "./NarrationControls";
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
import { DebateArena as ArenaHero } from "./debate-arena";
import {
  mapAgents,
  mapProduct,
  mapTrialSteps,
  activeStepIndex as computeActiveStepIndex,
} from "../lib/arenaMapper";
import { VoiceVerdictButton } from "./VoiceVerdictButton";
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

  // Narration controller — gates demo runner progression and animates a
  // per-agent progress bar so each agent stays on stage long enough to read.
  const narrator = useNarrationController();

  const demo = useTrialEngine(trialId ?? "trial", productFromParams, {
    waitAfterAgent: (message) => {
      const text =
        getBubbleText(message, message.agentType, undefined) ??
        message.headline ??
        "";
      return narrator.narrate(message.agentType, text);
    },
    waitAfterJudge: (verdict) => {
      const text = verdict.judgeClosingStatement ?? verdict.summary ?? "";
      return narrator.narrate("final_judge", text);
    },
  });

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

  // ----- Live-mode best-effort narration -----
  // We can't pause the Convex stream, but when a new message lands we kick
  // off narration so the active agent gets the spotlight & progress bar.
  const lastNarratedMessageId = useRef<string | null>(null);
  useEffect(() => {
    if (!useLive) return;
    const messages = showRetrial ? retrialAgents : initialAgents;
    const lastDone = [...messages]
      .reverse()
      .find((a) => a.status === "complete" && a.message);
    const message = lastDone?.message;
    if (!message) return;
    if (lastNarratedMessageId.current === message.id) return;
    lastNarratedMessageId.current = message.id;
    const text =
      getBubbleText(message, message.agentType, undefined) ??
      message.headline ??
      "";
    void narrator.narrate(message.agentType, text);
  }, [useLive, showRetrial, initialAgents, retrialAgents, narrator]);

  // Live-mode: narrate the closing statement once the verdict resolves.
  const lastNarratedVerdict = useRef<string | null>(null);
  useEffect(() => {
    if (!useLive) return;
    const v = showRetrial ? retrialVerdict : initialVerdict;
    if (!v) return;
    const key = `${v.phase}-${v.launchReadinessScore}`;
    if (lastNarratedVerdict.current === key) return;
    lastNarratedVerdict.current = key;
    void narrator.narrate(
      "final_judge",
      v.judgeClosingStatement ?? v.summary ?? "",
    );
  }, [useLive, showRetrial, initialVerdict, retrialVerdict, narrator]);

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

  // ----- Fullscreen hooks. Must run on every render (rules of hooks),
  // so they live ABOVE any early returns. -----
  const fullscreen = useFullscreen<HTMLElement>();
  const [fsPromptOpen, setFsPromptOpen] = useState(false);

  useEffect(() => {
    if (!fullscreen.supported) return;
    const dismissed = window.localStorage.getItem("ltl_skip_fs_prompt");
    if (dismissed === "1") return;
    const timer = window.setTimeout(() => setFsPromptOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, [fullscreen.supported]);

  const onAcceptFullscreen = async () => {
    setFsPromptOpen(false);
    window.localStorage.setItem("ltl_skip_fs_prompt", "1");
    await fullscreen.enter();
  };
  const onSkipFullscreen = () => {
    setFsPromptOpen(false);
    window.localStorage.setItem("ltl_skip_fs_prompt", "1");
  };

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

  const runButtonNode = (
    <button
      type="button"
      onClick={runInitial}
      disabled={isRunning}
      className={cn(status === "draft" ? "btn-primary" : "btn-secondary")}
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
  );

  const fullscreenButtonNode = (
    <FullscreenButton
      isFullscreen={fullscreen.isFullscreen}
      onToggle={fullscreen.toggle}
      supported={fullscreen.supported}
    />
  );

  const fullscreenHintNode = (
    <FullscreenHint
      visible={fullscreen.supported && !fullscreen.isFullscreen}
      onEnter={() => void fullscreen.enter()}
    />
  );

  const narrationControlNode = (
    <NarrationControls
      active={narrator.state.active}
      paused={narrator.state.paused}
      onPause={narrator.pause}
      onResume={narrator.resume}
      onSkip={narrator.skip}
      onReplay={narrator.replay}
    />
  );

  const liveAlert =
    useLive && live.actionError ? (
      <div className="rounded-xl border border-risk-critical/40 bg-risk-critical/5 px-4 py-3 text-sm text-risk-critical flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>{live.actionError}</span>
      </div>
    ) : null;

  return (
    <div className="mx-auto max-w-[1400px] px-4 md:px-6 py-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link to="/new" className="btn-ghost text-xs">
          <ArrowLeft className="h-3.5 w-3.5" />
          New trial
        </Link>
        <div className="flex items-center gap-2">
          {result?.initialVerdict && <MarkdownExportButton result={result} />}
        </div>
      </div>

      <FullscreenPrompt
        open={fsPromptOpen}
        onEnter={() => void onAcceptFullscreen()}
        onSkip={onSkipFullscreen}
      />

      {/* ===== Toolbar above the arena (status, run/voice/fullscreen, narration) ===== */}
      {!fullscreen.isFullscreen && fullscreenHintNode && (
        <div className="mb-3">{fullscreenHintNode}</div>
      )}

      {liveAlert && <div className="mb-3">{liveAlert}</div>}

      {/* ===== Full-width Debate Arena hero (toolbar inside so it stays
              visible in browser fullscreen) ===== */}
      <section
        ref={fullscreen.ref as React.RefObject<HTMLElement>}
        className={cn(
          "flex flex-col overflow-hidden",
          fullscreen.isFullscreen
            ? "h-screen w-screen bg-[#070b14]"
            : "rounded-3xl border border-cyan-500/15 bg-[#070b14] h-[calc(100vh-240px)] min-h-[480px] max-h-[760px]",
        )}
      >
        {/* Toolbar — always inside the section so it shows in fullscreen */}
        <div
          className={cn(
            "relative z-20 flex items-center justify-between gap-3 flex-wrap shrink-0 border-b border-white/5",
            fullscreen.isFullscreen ? "px-6 py-3" : "px-4 py-2.5",
          )}
        >
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-300">
              Debate Arena
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-300">
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
            <h2 className="text-sm md:text-base font-semibold tracking-tight truncate">
              {product.productName}
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {narrationControlNode}
            {runButtonNode}
            {(showRetrial ? retrialVerdict : initialVerdict) && (
              <VoiceVerdictButton
                text={
                  (showRetrial ? retrialVerdict : initialVerdict)!
                    .judgeClosingStatement
                }
              />
            )}
            {fullscreenButtonNode}
          </div>
        </div>

        <div className="flex-1 min-h-0 relative">
        <ArenaHero
          embedded
          mode={fullscreen.isFullscreen ? "fullscreen" : "embedded"}
          hideControls
          agents={mapAgents(
            showRetrial ? retrialAgents : initialAgents,
            narrator.state.agentType ?? null,
            !!(showRetrial ? retrialVerdict : initialVerdict) &&
              (status === "completed" || status === "retrial_completed"),
            showRetrial ? retrialVerdict : initialVerdict,
          )}
          product={mapProduct(
            product,
            showRetrial ? retrialRisks : initialRisks,
            showRetrial ? retrialVerdict : initialVerdict,
            (() => {
              const messages = (showRetrial ? retrialAgents : initialAgents)
                .map((a) => a.message)
                .filter((m): m is NonNullable<typeof m> => !!m);
              const active = messages.find(
                (m) => m.agentType === narrator.state.agentType,
              );
              return (
                active?.keyQuestion ??
                messages[messages.length - 1]?.keyQuestion ??
                ""
              );
            })(),
          )}
          trialSteps={(() => {
            const steps = mapTrialSteps(
              showRetrial ? retrialAgents : initialAgents,
              showRetrial ? retrialVerdict : initialVerdict,
            );
            return steps.length > 0
              ? steps
              : [
                  {
                    activeAgentId: "final_judge",
                    accusation: "Awaiting opening statements…",
                  },
                ];
          })()}
          currentStepIndex={(() => {
            const steps = mapTrialSteps(
              showRetrial ? retrialAgents : initialAgents,
              showRetrial ? retrialVerdict : initialVerdict,
            );
            const judgeOnStand =
              !!(showRetrial ? retrialVerdict : initialVerdict) &&
              (status === "completed" || status === "retrial_completed");
            return computeActiveStepIndex(
              steps,
              narrator.state.agentType ?? null,
              judgeOnStand,
            );
          })()}
        />
        </div>
      </section>

      {/* ===== Detailed dashboard below ===== */}
      <div className="space-y-8 mt-8">
        <ProductSummarySection
          trialId={trialId}
          product={product}
          autonomy={autonomyLabel(product.autonomyLevel)}
          status={status}
          statusLabel={trialStatusLabel}
          isRunning={isRunning}
          liveScore={liveScore}
          initialRisks={initialRisks}
          retrialRisks={showRetrial ? retrialRisks : undefined}
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
                Live mode is active when VITE_CONVEX_URL is set and trials are
                created via the form.
              </p>
            )}
          </div>
        )}
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

interface ProductSummarySectionProps {
  trialId: string | undefined;
  product: ProductInput;
  autonomy: string;
  status: TrialStatus;
  statusLabel: string;
  isRunning: boolean;
  liveScore?: number;
  initialRisks: RiskCardType[];
  retrialRisks?: RiskCardType[];
}

function ProductSummarySection({
  trialId,
  product,
  autonomy,
  status,
  statusLabel,
  isRunning,
  liveScore,
  initialRisks,
  retrialRisks,
}: ProductSummarySectionProps) {
  const [open, setOpen] = useState(true);
  return (
    <section className="panel">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="chip text-[10px]">trial · {trialId}</span>
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
            Product / Idea Summary
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-300">
            <Activity
              className={cn(
                "h-3 w-3",
                isRunning
                  ? "text-accent animate-pulse"
                  : status === "completed" || status === "retrial_completed"
                    ? "text-risk-low"
                    : "text-slate-500",
              )}
            />
            {statusLabel}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-slate-400 transition-transform duration-200",
              open ? "rotate-180" : "rotate-0",
            )}
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="summary-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_auto] gap-6 px-5 pb-5">
              <div className="min-w-0">
                <h3 className="text-xl font-semibold tracking-tight">
                  {product.productName}
                </h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  {product.productDescription}
                </p>
                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <Row label="Target users" value={product.targetUsers} />
                  <Row
                    label="What it does on the user's behalf"
                    value={product.aiActions}
                  />
                  <Row label="Data accessed" value={product.dataAccessed} />
                  <Row label="Autonomy" value={autonomy} />
                  {product.additionalContext && (
                    <Row label="Context" value={product.additionalContext} />
                  )}
                </dl>
              </div>

              <div className="rounded-xl border border-border bg-bg-elevated/40 p-4 self-start">
                <div className="text-[10px] uppercase tracking-wider text-slate-400">
                  Live score
                </div>
                {liveScore !== undefined ? (
                  <div className="mt-1 text-4xl font-bold tabular-nums">
                    {liveScore}
                  </div>
                ) : (
                  <div className="mt-1 text-xl text-slate-500">—</div>
                )}
                <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                  out of 100
                </div>
              </div>

              {(initialRisks.length > 0 || (retrialRisks && retrialRisks.length > 0)) && (
                <RiskRadarChart
                  initialRisks={initialRisks}
                  retrialRisks={retrialRisks}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
