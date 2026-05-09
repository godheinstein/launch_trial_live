/**
 * ArenaControls.tsx
 * Design: Holographic War Room — Sci-Fi Command Center
 * Simple playback controls for the trial simulation.
 */

import { motion } from "framer-motion";
import {
  SkipBack,
  SkipForward,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

interface ArenaControlsProps {
  currentStep: number;
  totalSteps: number;
  isAutoPlaying: boolean;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  onAutoPlay: () => void;
}

export function ArenaControls({
  currentStep,
  totalSteps,
  isAutoPlaying,
  onNext,
  onPrev,
  onReset,
  onAutoPlay,
}: ArenaControlsProps) {
  return (
    <motion.div
      className="flex items-center justify-center gap-3 py-4 px-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="arena-glass-panel rounded-full px-4 py-2 flex items-center gap-2">
        {/* Reset */}
        <button
          onClick={onReset}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-slate-500 hover:text-slate-100"
          title="Reset"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Previous */}
        <button
          onClick={onPrev}
          disabled={currentStep === 0}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-slate-500 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Previous Speaker"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        {/* Auto-play / Pause */}
        <button
          onClick={onAutoPlay}
          className={`p-2 rounded-full transition-colors ${
            isAutoPlaying
              ? "bg-cyan-500/20 text-cyan-300"
              : "hover:bg-white/10 text-slate-500 hover:text-slate-100"
          }`}
          title={isAutoPlaying ? "Pause" : "Auto-play Trial"}
        >
          {isAutoPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </button>

        {/* Next */}
        <button
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-slate-500 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Next Speaker"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* Step indicator */}
        <div className="ml-2 pl-2 border-l border-white/10 flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? "bg-cyan-400 scale-125"
                  : i < currentStep
                  ? "bg-cyan-400/40"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
