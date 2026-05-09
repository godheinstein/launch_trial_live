/**
 * ProductOnTrialCenter.tsx
 * Design: Holographic War Room — Sci-Fi Command Center
 * Central product card "on trial" — compact to fit within the arena grid.
 */

import { motion } from "framer-motion";
import type { ProductOnTrial } from "./mockTrialData";
import { ArenaEvidenceChips } from "./ArenaEvidenceChips";

interface ProductOnTrialCenterProps {
  product: ProductOnTrial;
  currentAccusation: string;
}

function ScoreRing({ score, maxScore }: { score: number; maxScore: number }) {
  const percentage = (score / maxScore) * 100;
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = "#ef4444";
  if (score > 30) strokeColor = "#f97316";
  if (score > 50) strokeColor = "#eab308";
  if (score > 70) strokeColor = "#22c55e";

  return (
    <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/5" />
        <circle
          cx="32" cy="32" r="28" fill="none" stroke={strokeColor} strokeWidth="2.5"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-sm font-bold text-slate-100">{score}</span>
        <span className="text-[7px] font-mono text-slate-500">/{maxScore}</span>
      </div>
    </div>
  );
}

export function ProductOnTrialCenter({ product, currentAccusation }: ProductOnTrialCenterProps) {
  return (
    <motion.div
      className="relative flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Concentric rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-[240px] h-[240px] rounded-full border border-cyan-500/[0.05]" />
        <div className="absolute w-[180px] h-[180px] rounded-full border border-cyan-500/[0.04]" />
        <div className="absolute w-[160px] h-[160px] rounded-full border border-amber-500/10 arena-ring-expand" />
      </div>

      {/* Product card */}
      <div
        className="relative z-10 rounded-xl p-3.5 w-[240px]"
        style={{
          background: "linear-gradient(145deg, rgba(12,16,30,0.92), rgba(15,20,40,0.88))",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(245,158,11,0.2)",
          boxShadow: "0 0 24px rgba(245,158,11,0.04), 0 8px 24px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-2.5 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[7px] font-mono text-amber-400/80 uppercase tracking-widest">On Trial</span>
            </div>
            <h2 className="text-xs font-bold text-slate-100 leading-tight">{product.name}</h2>
            <p className="text-[9px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{product.description}</p>
          </div>
          <ScoreRing score={product.score} maxScore={product.maxScore} />
        </div>

        {/* Verdict */}
        <div className="mb-2 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/15">
          <div className="flex items-center gap-1">
            <svg className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
            <p className="text-[9px] font-medium text-amber-200">{product.verdict}</p>
          </div>
        </div>

        {/* Current accusation */}
        {currentAccusation && (
          <motion.div
            key={currentAccusation}
            className="mb-2 px-2 py-1 rounded-md bg-red-500/5 border border-red-500/10"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-[8px] font-mono uppercase tracking-wider text-red-400/60 mb-0.5">Challenge</p>
            <p className="text-[9px] text-red-200/80 leading-relaxed">{currentAccusation}</p>
          </motion.div>
        )}

        {/* Evidence */}
        <ArenaEvidenceChips chips={product.evidenceChips} />
      </div>
    </motion.div>
  );
}
