/**
 * ProductOnTrialCenter.tsx
 * Design: Holographic War Room — Sci-Fi Command Center
 * Central product card "on trial" — landscape orientation, mode-aware sizing.
 */

import { motion } from "framer-motion";
import type { ProductOnTrial } from "./mockTrialData";
import { ArenaEvidenceChips } from "./ArenaEvidenceChips";
import type { ArenaSize } from "./AgentStandee";

interface ProductOnTrialCenterProps {
  product: ProductOnTrial;
  currentAccusation: string;
  size?: ArenaSize;
}

interface SizeSpec {
  card: string;
  ringSize: string;
  ringSvg: string;
  ringScoreText: string;
  ringMaxText: string;
  title: string;
  description: string;
  pillText: string;
  bodyText: string;
  pad: string;
}

const SIZES: Record<ArenaSize, SizeSpec> = {
  embedded: {
    card: "w-[clamp(260px,26vw,360px)]",
    ringSize: "w-12 h-12",
    ringSvg: "w-12 h-12",
    ringScoreText: "text-[clamp(11px,0.9vw,13px)]",
    ringMaxText: "text-[7px]",
    title: "text-[clamp(12px,1vw,14px)]",
    description: "text-[clamp(10px,0.8vw,11px)]",
    pillText: "text-[clamp(8px,0.7vw,9px)]",
    bodyText: "text-[clamp(10px,0.78vw,11px)]",
    pad: "p-2.5",
  },
  fullscreen: {
    card: "w-[clamp(320px,30vw,460px)]",
    ringSize: "w-16 h-16",
    ringSvg: "w-16 h-16",
    ringScoreText: "text-[clamp(15px,1.2vw,18px)]",
    ringMaxText: "text-[9px]",
    title: "text-[clamp(14px,1.25vw,18px)]",
    description: "text-[clamp(11px,0.85vw,12.5px)]",
    pillText: "text-[clamp(8.5px,0.7vw,10px)]",
    bodyText: "text-[clamp(11px,0.85vw,12.5px)]",
    pad: "p-3",
  },
};

function ScoreRing({
  score,
  maxScore,
  size,
}: {
  score: number;
  maxScore: number;
  size: ArenaSize;
}) {
  const percentage = (score / maxScore) * 100;
  const r = size === "fullscreen" ? 28 : 22;
  const cxcy = size === "fullscreen" ? 32 : 24;
  const viewBox = size === "fullscreen" ? "0 0 64 64" : "0 0 48 48";
  const stroke = size === "fullscreen" ? 2.5 : 2.5;
  const circumference = 2 * Math.PI * r;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = "#ef4444";
  if (score > 30) strokeColor = "#f97316";
  if (score > 50) strokeColor = "#eab308";
  if (score > 70) strokeColor = "#22c55e";

  const s = SIZES[size];

  return (
    <div
      className={
        "relative flex items-center justify-center flex-shrink-0 " +
        s.ringSize
      }
    >
      <svg className={s.ringSvg + " -rotate-90"} viewBox={viewBox}>
        <circle
          cx={cxcy}
          cy={cxcy}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-white/5"
        />
        <circle
          cx={cxcy}
          cy={cxcy}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={"font-bold text-slate-100 " + s.ringScoreText}>
          {score}
        </span>
        <span className={"font-mono text-slate-500 " + s.ringMaxText}>
          /{maxScore}
        </span>
      </div>
    </div>
  );
}

export function ProductOnTrialCenter({
  product,
  currentAccusation,
  size = "embedded",
}: ProductOnTrialCenterProps) {
  const s = SIZES[size];
  return (
    <motion.div
      className="relative flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Concentric rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={
            "absolute rounded-full border border-cyan-500/[0.05] " +
            (size === "fullscreen"
              ? "w-[280px] h-[280px]"
              : "w-[260px] h-[260px]")
          }
        />
        <div
          className={
            "absolute rounded-full border border-cyan-500/[0.04] " +
            (size === "fullscreen"
              ? "w-[220px] h-[220px]"
              : "w-[200px] h-[200px]")
          }
        />
        <div
          className={
            "absolute rounded-full border border-amber-500/10 arena-ring-expand " +
            (size === "fullscreen"
              ? "w-[190px] h-[190px]"
              : "w-[170px] h-[170px]")
          }
        />
      </div>

      {/* Product card — landscape */}
      <div
        className={"relative z-10 rounded-xl " + s.pad + " " + s.card}
        style={{
          background:
            "linear-gradient(145deg, rgba(12,16,30,0.92), rgba(15,20,40,0.88))",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(245,158,11,0.22)",
          boxShadow:
            "0 0 28px rgba(245,158,11,0.06), 0 12px 32px rgba(0,0,0,0.55)",
        }}
      >
        {/* Header — title/description left, score ring right */}
        <div className="flex items-start gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span
                className={
                  "font-mono text-amber-400/80 uppercase tracking-widest " +
                  s.pillText
                }
              >
                On Trial
              </span>
            </div>
            <h2
              className={
                "font-bold text-slate-100 leading-tight " +
                (size === "embedded" ? "line-clamp-1 " : "line-clamp-2 ") +
                s.title
              }
            >
              {product.name}
            </h2>
            <p
              className={
                "text-slate-400 mt-1 leading-snug " +
                (size === "embedded" ? "line-clamp-2 " : "line-clamp-2 ") +
                s.description
              }
            >
              {product.description}
            </p>
          </div>
          <ScoreRing
            score={product.score}
            maxScore={product.maxScore}
            size={size}
          />
        </div>

        {/* Verdict */}
        <div className={"px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 " + (size === "embedded" ? "mb-1" : "mb-2")}>
          <div className="flex items-center gap-1.5">
            <svg
              className={
                "text-amber-400 flex-shrink-0 " +
                (size === "fullscreen" ? "w-3.5 h-3.5" : "w-2.5 h-2.5")
              }
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"
              />
            </svg>
            <p className={"font-medium text-amber-200 " + s.bodyText}>
              {product.verdict}
            </p>
          </div>
        </div>

        {/* Current accusation */}
        {currentAccusation && (
          <motion.div
            key={currentAccusation}
            className={"px-2.5 py-1 rounded-md bg-red-500/5 border border-red-500/15 " + (size === "embedded" ? "mb-0" : "mb-2")}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p
              className={
                "font-mono uppercase tracking-wider text-red-400/70 " +
                s.pillText
              }
            >
              Challenge
            </p>
            <p
              className={
                "text-red-200/90 leading-snug line-clamp-2 " + s.bodyText
              }
            >
              {currentAccusation}
            </p>
          </motion.div>
        )}

        {/* Evidence — only in fullscreen; the dashboard already shows the
            full risk list below the chamber in embedded mode. */}
        {size === "fullscreen" && (
          <ArenaEvidenceChips chips={product.evidenceChips} />
        )}
      </div>
    </motion.div>
  );
}
