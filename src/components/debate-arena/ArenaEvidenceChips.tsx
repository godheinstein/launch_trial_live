/**
 * ArenaEvidenceChips.tsx
 * Design: Holographic War Room — Sci-Fi Command Center
 * Compact evidence/risk chips near the product card.
 */

import { motion } from "framer-motion";
import type { EvidenceChip } from "./mockTrialData";

interface ArenaEvidenceChipsProps {
  chips: EvidenceChip[];
}

const severityConfig: Record<string, { bg: string; text: string; dot: string }> = {
  low: { bg: "bg-blue-500/10 border-blue-500/10", text: "text-blue-300", dot: "bg-blue-400" },
  medium: { bg: "bg-yellow-500/10 border-yellow-500/10", text: "text-yellow-300", dot: "bg-yellow-400" },
  high: { bg: "bg-orange-500/10 border-orange-500/10", text: "text-orange-300", dot: "bg-orange-400" },
  critical: { bg: "bg-red-500/10 border-red-500/10", text: "text-red-300", dot: "bg-red-500" },
};

export function ArenaEvidenceChips({ chips }: ArenaEvidenceChipsProps) {
  return (
    <div className="space-y-1">
      <p className="text-[8px] font-mono uppercase tracking-widest text-slate-500">
        Evidence
      </p>
      <div className="flex flex-col gap-1">
        {chips.map((chip, index) => {
          const config = severityConfig[chip.severity] || severityConfig.medium;
          return (
            <motion.div
              key={chip.id}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded border ${config.bg}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.08 }}
            >
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
              <span className={`text-[9px] font-medium ${config.text} leading-tight`}>
                {chip.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
