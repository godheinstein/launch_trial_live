/**
 * DebateArena.tsx
 * Design: Holographic War Room — Sci-Fi Command Center
 * Main arena component: 3-column grid layout with agents in horseshoe,
 * product centered.
 *
 * Modes:
 *   - "fullscreen" — full-viewport cinematic layout, larger sizing.
 *   - "embedded"   — fits inside the dashboard's chamber, smaller sizing.
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  agents as mockAgents,
  productOnTrial as mockProduct,
  trialSteps as mockSteps,
  type AgentStatus,
  type ArenaAgent,
  type ProductOnTrial,
  type TrialStep,
} from "./mockTrialData";
import { AgentStandee, type ArenaSize } from "./AgentStandee";
import { ProductOnTrialCenter } from "./ProductOnTrialCenter";
import { ArenaControls } from "./ArenaControls";

interface DebateArenaProps {
  /** Override the six agents (status + speech text). Order doesn't matter; lookup is by id. */
  agents?: ArenaAgent[];
  /** Override the product on trial. */
  product?: ProductOnTrial;
  /** Override the script of "who speaks when". */
  trialSteps?: TrialStep[];
  /** Controlled mode — parent owns the current step. */
  currentStepIndex?: number;
  /** Notified when prev/next/reset is pressed in controlled mode. */
  onStepChange?: (index: number) => void;
  /** Drop the outer header (the host has its own toolbar). */
  embedded?: boolean;
  /** Hide the prev/next/auto/reset bar (e.g. when the host has its own narrator). */
  hideControls?: boolean;
  /** Sizing profile. Defaults: "fullscreen" when standalone, "embedded" when embedded. */
  mode?: ArenaSize;
}

export function DebateArena({
  agents,
  product,
  trialSteps,
  currentStepIndex,
  onStepChange,
  embedded = false,
  hideControls = false,
  mode,
}: DebateArenaProps = {}) {
  const allAgents = agents ?? mockAgents;
  const productOnTrial = product ?? mockProduct;
  const steps = trialSteps ?? mockSteps;

  // Default mode mirrors the previous behaviour: standalone = fullscreen,
  // embedded = embedded. Callers can still force either.
  const size: ArenaSize = mode ?? (embedded ? "embedded" : "fullscreen");

  const isControlled = typeof currentStepIndex === "number";
  const [internalStep, setInternalStep] = useState(0);
  const currentStep = isControlled
    ? Math.max(0, Math.min(steps.length - 1, currentStepIndex))
    : internalStep;
  const setCurrentStep = useCallback(
    (next: number | ((prev: number) => number)) => {
      const resolved =
        typeof next === "function"
          ? (next as (p: number) => number)(currentStep)
          : next;
      const clamped = Math.max(0, Math.min(steps.length - 1, resolved));
      if (isControlled) onStepChange?.(clamped);
      else setInternalStep(clamped);
    },
    [currentStep, isControlled, onStepChange, steps.length],
  );

  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const activeAgentId = steps[currentStep]?.activeAgentId || "";
  const currentAccusation = steps[currentStep]?.accusation || "";

  const getAgentStatus = useCallback(
    (agentId: string): AgentStatus => {
      if (agentId === activeAgentId) return "speaking";
      const agentStepIndex = steps.findIndex(
        (s) => s.activeAgentId === agentId,
      );
      if (agentStepIndex < currentStep && agentStepIndex >= 0) return "spoken";
      return "waiting";
    },
    [currentStep, activeAgentId, steps],
  );

  // Auto-play only matters in uncontrolled mode (the standalone showcase).
  useEffect(() => {
    if (isControlled) return;
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setInternalStep((prev) => {
        if (prev >= steps.length - 1) {
          setIsAutoPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, isControlled, steps.length]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };
  const handleReset = () => {
    setCurrentStep(0);
    setIsAutoPlaying(false);
  };
  const handleAutoPlay = () => setIsAutoPlaying((prev) => !prev);

  const findAgent = (id: string): ArenaAgent | undefined =>
    allAgents.find((a) => a.id === id);
  const topAgent = findAgent("final_judge");
  const midLeftAgent = findAgent("privacy_auditor");
  const midRightAgent = findAgent("skeptical_investor");
  const botLeftAgent = findAgent("malicious_user");
  const botCenterAgent = findAgent("confused_customer");
  const botRightAgent = findAgent("prompt_injection");

  // Tuning per mode: layout container width + grid spacing.
  const layout =
    size === "fullscreen"
      ? {
          mainPad: "px-6 lg:px-10 py-2",
          inner: "w-full max-w-[1500px]",
          gridGap: "gap-x-10 lg:gap-x-16 gap-y-2 lg:gap-y-3",
          rowTop1: "pt-8 lg:pt-10",
          rowTop2: "pt-1 lg:pt-2",
          rowTop3: "pt-1 lg:pt-2",
        }
      : {
          mainPad: "px-3 lg:px-5 py-1",
          inner: "w-full max-w-[1200px]",
          gridGap: "gap-x-4 lg:gap-x-8 gap-y-1 lg:gap-y-2",
          rowTop1: "pt-1",
          rowTop2: "pt-1 lg:pt-2",
          rowTop3: "pt-1",
        };

  const arenaContent = (
    <>
      {/* Subtle background grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100,200,255,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,200,255,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      {/* Radial ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(6,182,212,0.04) 0%, transparent 65%)",
        }}
      />

      {/* Header (only in standalone mode) */}
      {!embedded && (
        <header className="relative z-10 flex items-center justify-center py-2 px-4 flex-shrink-0">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/20 flex items-center justify-center">
              <svg
                className="w-3 h-3 text-cyan-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xs font-bold text-slate-100 tracking-tight">
                TrialRun
              </h1>
              <p className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.2em]">
                Debate Arena
              </p>
            </div>
          </motion.div>
        </header>
      )}

      {/* Arena */}
      <main
        className={
          "relative z-10 flex-1 flex items-center justify-center min-h-0 " +
          layout.mainPad
        }
      >
        <div className={layout.inner}>
          {/* Desktop Arena Grid — single layout for both modes:
              Row 1: Final Judge (centered, alone)
              Row 2: Privacy Auditor | Product on Trial | Skeptical Investor
              Row 3: Malicious User  | Confused Customer | Prompt Injection */}
          <div
            className={
              "hidden lg:grid grid-cols-3 items-center justify-items-center " +
              layout.gridGap
            }
          >
            {/* Row 1: Final Judge centered */}
            {topAgent && (
              <div className={"col-span-3 " + layout.rowTop1}>
                <AgentStandee
                  agent={topAgent}
                  isActive={activeAgentId === topAgent.id}
                  status={getAgentStatus(topAgent.id)}
                  size={size}
                />
              </div>
            )}

            {/* Row 2: Privacy | Product | Skeptical */}
            {midLeftAgent && (
              <div className={layout.rowTop2}>
                <AgentStandee
                  agent={midLeftAgent}
                  isActive={activeAgentId === midLeftAgent.id}
                  status={getAgentStatus(midLeftAgent.id)}
                  size={size}
                />
              </div>
            )}
            <div className={layout.rowTop2}>
              <ProductOnTrialCenter
                product={productOnTrial}
                currentAccusation={currentAccusation}
                size={size}
              />
            </div>
            {midRightAgent && (
              <div className={layout.rowTop2}>
                <AgentStandee
                  agent={midRightAgent}
                  isActive={activeAgentId === midRightAgent.id}
                  status={getAgentStatus(midRightAgent.id)}
                  size={size}
                />
              </div>
            )}

            {/* Row 3: Malicious | Confused Customer | Prompt Injection */}
            {botLeftAgent && (
              <div className={layout.rowTop3}>
                <AgentStandee
                  agent={botLeftAgent}
                  isActive={activeAgentId === botLeftAgent.id}
                  status={getAgentStatus(botLeftAgent.id)}
                  size={size}
                />
              </div>
            )}
            {botCenterAgent && (
              <div className={layout.rowTop3}>
                <AgentStandee
                  agent={botCenterAgent}
                  isActive={activeAgentId === botCenterAgent.id}
                  status={getAgentStatus(botCenterAgent.id)}
                  size={size}
                />
              </div>
            )}
            {botRightAgent && (
              <div className={layout.rowTop3}>
                <AgentStandee
                  agent={botRightAgent}
                  isActive={activeAgentId === botRightAgent.id}
                  status={getAgentStatus(botRightAgent.id)}
                  size={size}
                />
              </div>
            )}
          </div>

          {/* Tablet layout */}
          <div className="hidden md:grid lg:hidden grid-cols-3 gap-3 items-start justify-items-center">
            {topAgent && (
              <div className="col-span-3 pt-4">
                <AgentStandee
                  agent={topAgent}
                  isActive={activeAgentId === topAgent.id}
                  status={getAgentStatus(topAgent.id)}
                  size="embedded"
                />
              </div>
            )}
            {midLeftAgent && (
              <div className="pt-4">
                <AgentStandee
                  agent={midLeftAgent}
                  isActive={activeAgentId === midLeftAgent.id}
                  status={getAgentStatus(midLeftAgent.id)}
                  size="embedded"
                />
              </div>
            )}
            <div>
              <ProductOnTrialCenter
                product={productOnTrial}
                currentAccusation={currentAccusation}
                size="embedded"
              />
            </div>
            {midRightAgent && (
              <div className="pt-4">
                <AgentStandee
                  agent={midRightAgent}
                  isActive={activeAgentId === midRightAgent.id}
                  status={getAgentStatus(midRightAgent.id)}
                  size="embedded"
                />
              </div>
            )}
            {botLeftAgent && (
              <div>
                <AgentStandee
                  agent={botLeftAgent}
                  isActive={activeAgentId === botLeftAgent.id}
                  status={getAgentStatus(botLeftAgent.id)}
                  size="embedded"
                />
              </div>
            )}
            {botCenterAgent && (
              <div>
                <AgentStandee
                  agent={botCenterAgent}
                  isActive={activeAgentId === botCenterAgent.id}
                  status={getAgentStatus(botCenterAgent.id)}
                  size="embedded"
                />
              </div>
            )}
            {botRightAgent && (
              <div>
                <AgentStandee
                  agent={botRightAgent}
                  isActive={activeAgentId === botRightAgent.id}
                  status={getAgentStatus(botRightAgent.id)}
                  size="embedded"
                />
              </div>
            )}
          </div>

          {/* Mobile layout */}
          <div className="md:hidden flex flex-col gap-4 max-h-[calc(100vh-100px)] overflow-y-auto pb-4">
            <ProductOnTrialCenter
              product={productOnTrial}
              currentAccusation={currentAccusation}
              size="embedded"
            />
            <div className="grid grid-cols-2 gap-3">
              {allAgents.map((agent) => (
                <div key={agent.id} className="flex justify-center">
                  <AgentStandee
                    agent={agent}
                    isActive={activeAgentId === agent.id}
                    status={getAgentStatus(agent.id)}
                    size="embedded"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Controls */}
      {!hideControls && (
        <div className="relative z-10 flex-shrink-0 pb-3">
          <ArenaControls
            currentStep={currentStep}
            totalSteps={steps.length}
            isAutoPlaying={isAutoPlaying}
            onNext={handleNext}
            onPrev={handlePrev}
            onReset={handleReset}
            onAutoPlay={handleAutoPlay}
          />
        </div>
      )}
    </>
  );

  if (embedded) {
    // Parent owns the height. The wrapper just fills its container.
    return (
      <div className="relative h-full w-full flex flex-col bg-[#070b14] rounded-3xl overflow-hidden border border-cyan-500/10">
        {arenaContent}
      </div>
    );
  }

  // Standalone fullscreen — fill the viewport edge-to-edge.
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative bg-[#070b14]">
      {arenaContent}
    </div>
  );
}
