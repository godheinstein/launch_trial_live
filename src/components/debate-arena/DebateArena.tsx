/**
 * DebateArena.tsx
 * Design: Holographic War Room — Sci-Fi Command Center
 * Main arena component: 3-column grid layout with agents in horseshoe,
 * product centered, and controls at the bottom.
 * Designed to fit within one desktop viewport (100vh).
 *
 * Desktop layout (horseshoe/amphitheater):
 *
 *              Final Judge (top center)
 *
 *   Privacy Auditor    [Product]    Skeptical Investor
 *
 *   Malicious User   Confused Customer   Prompt Injection
 */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  agents as allAgents,
  productOnTrial,
  trialSteps,
  type AgentStatus,
} from "./mockTrialData";
import { AgentStandee } from "./AgentStandee";
import { ProductOnTrialCenter } from "./ProductOnTrialCenter";
import { ArenaControls } from "./ArenaControls";

export function DebateArena() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const activeAgentId = trialSteps[currentStep]?.activeAgentId || "";
  const currentAccusation = trialSteps[currentStep]?.accusation || "";

  const getAgentStatus = useCallback(
    (agentId: string): AgentStatus => {
      if (agentId === activeAgentId) return "speaking";
      const agentStepIndex = trialSteps.findIndex(
        (s) => s.activeAgentId === agentId
      );
      if (agentStepIndex < currentStep) return "spoken";
      return "waiting";
    },
    [currentStep, activeAgentId]
  );

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= trialSteps.length - 1) {
          setIsAutoPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const handleNext = () => {
    if (currentStep < trialSteps.length - 1) setCurrentStep((prev) => prev + 1);
  };
  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };
  const handleReset = () => {
    setCurrentStep(0);
    setIsAutoPlaying(false);
  };
  const handleAutoPlay = () => setIsAutoPlaying((prev) => !prev);

  const topAgent = allAgents.find((a) => a.id === "final_judge")!;
  const midLeftAgent = allAgents.find((a) => a.id === "privacy_auditor")!;
  const midRightAgent = allAgents.find((a) => a.id === "skeptical_investor")!;
  const botLeftAgent = allAgents.find((a) => a.id === "malicious_user")!;
  const botCenterAgent = allAgents.find((a) => a.id === "confused_customer")!;
  const botRightAgent = allAgents.find((a) => a.id === "prompt_injection")!;

  return (
    <div className="h-screen flex flex-col overflow-hidden relative bg-[#070b14]">
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
          background: "radial-gradient(ellipse at center, rgba(6,182,212,0.03) 0%, transparent 60%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-center py-2 px-4 flex-shrink-0">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-100 tracking-tight">Launch Trial Live</h1>
            <p className="text-[8px] font-mono text-slate-500 uppercase tracking-[0.2em]">Debate Arena</p>
          </div>
        </motion.div>
      </header>

      {/* Arena - Desktop */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 min-h-0">
        <div className="w-full max-w-[1100px]">
          {/* Desktop Arena Grid - all fits in viewport */}
          <div className="hidden lg:grid grid-cols-3 gap-x-8 gap-y-2 items-center justify-items-center">
            {/* Row 1: Final Judge centered */}
            <div className="col-span-3 pt-6">
              <AgentStandee
                agent={topAgent}
                isActive={activeAgentId === topAgent.id}
                status={getAgentStatus(topAgent.id)}
              />
            </div>

            {/* Row 2: Privacy Auditor | Product | Skeptical Investor */}
            <div className="pt-8">
              <AgentStandee
                agent={midLeftAgent}
                isActive={activeAgentId === midLeftAgent.id}
                status={getAgentStatus(midLeftAgent.id)}
              />
            </div>
            <div>
              <ProductOnTrialCenter
                product={productOnTrial}
                currentAccusation={currentAccusation}
              />
            </div>
            <div className="pt-8">
              <AgentStandee
                agent={midRightAgent}
                isActive={activeAgentId === midRightAgent.id}
                status={getAgentStatus(midRightAgent.id)}
              />
            </div>

            {/* Row 3: Malicious User | Confused Customer | Prompt Injection */}
            <div className="pt-4">
              <AgentStandee
                agent={botLeftAgent}
                isActive={activeAgentId === botLeftAgent.id}
                status={getAgentStatus(botLeftAgent.id)}
              />
            </div>
            <div className="pt-4">
              <AgentStandee
                agent={botCenterAgent}
                isActive={activeAgentId === botCenterAgent.id}
                status={getAgentStatus(botCenterAgent.id)}
              />
            </div>
            <div className="pt-4">
              <AgentStandee
                agent={botRightAgent}
                isActive={activeAgentId === botRightAgent.id}
                status={getAgentStatus(botRightAgent.id)}
              />
            </div>
          </div>

          {/* Tablet layout */}
          <div className="hidden md:grid lg:hidden grid-cols-3 gap-3 items-start justify-items-center">
            <div className="col-span-3 pt-6">
              <AgentStandee agent={topAgent} isActive={activeAgentId === topAgent.id} status={getAgentStatus(topAgent.id)} />
            </div>
            <div className="pt-6">
              <AgentStandee agent={midLeftAgent} isActive={activeAgentId === midLeftAgent.id} status={getAgentStatus(midLeftAgent.id)} />
            </div>
            <div>
              <ProductOnTrialCenter product={productOnTrial} currentAccusation={currentAccusation} />
            </div>
            <div className="pt-6">
              <AgentStandee agent={midRightAgent} isActive={activeAgentId === midRightAgent.id} status={getAgentStatus(midRightAgent.id)} />
            </div>
            <div>
              <AgentStandee agent={botLeftAgent} isActive={activeAgentId === botLeftAgent.id} status={getAgentStatus(botLeftAgent.id)} />
            </div>
            <div>
              <AgentStandee agent={botCenterAgent} isActive={activeAgentId === botCenterAgent.id} status={getAgentStatus(botCenterAgent.id)} />
            </div>
            <div>
              <AgentStandee agent={botRightAgent} isActive={activeAgentId === botRightAgent.id} status={getAgentStatus(botRightAgent.id)} />
            </div>
          </div>

          {/* Mobile layout */}
          <div className="md:hidden flex flex-col gap-4 max-h-[calc(100vh-100px)] overflow-y-auto pb-4">
            <ProductOnTrialCenter product={productOnTrial} currentAccusation={currentAccusation} />
            <div className="grid grid-cols-2 gap-3">
              {allAgents.map((agent) => (
                <div key={agent.id} className="flex justify-center">
                  <AgentStandee agent={agent} isActive={activeAgentId === agent.id} status={getAgentStatus(agent.id)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Controls */}
      <div className="relative z-10 flex-shrink-0 pb-3">
        <ArenaControls
          currentStep={currentStep}
          totalSteps={trialSteps.length}
          isAutoPlaying={isAutoPlaying}
          onNext={handleNext}
          onPrev={handlePrev}
          onReset={handleReset}
          onAutoPlay={handleAutoPlay}
        />
      </div>
    </div>
  );
}
