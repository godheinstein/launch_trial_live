/**
 * ArenaSpeechBubble.tsx
 * Design: Holographic War Room — Sci-Fi Command Center
 * A compact speech bubble that appears above the active agent,
 * with a tail pointing down toward the agent's head.
 */

import { motion } from "framer-motion";

interface ArenaSpeechBubbleProps {
  text: string;
  accentHex: string;
}

export function ArenaSpeechBubble({ text, accentHex }: ArenaSpeechBubbleProps) {
  return (
    <motion.div
      className="absolute -top-1 left-1/2 z-30 w-[190px] -translate-x-1/2 -translate-y-full pointer-events-none"
      initial={{ opacity: 0, scale: 0.92, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div
        className="relative rounded-lg px-2.5 py-2 text-[11px] leading-relaxed text-slate-100"
        style={{
          background: `linear-gradient(135deg, rgba(15,20,35,0.92), rgba(20,25,45,0.88))`,
          backdropFilter: "blur(12px)",
          border: `1px solid ${accentHex}55`,
          boxShadow: `0 0 12px ${accentHex}18, 0 4px 12px rgba(0,0,0,0.5)`,
        }}
      >
        <p className="font-sans italic text-slate-100/90">&ldquo;{text}&rdquo;</p>

        {/* Tail pointing down */}
        <div className="absolute left-1/2 -bottom-[7px] -translate-x-1/2">
          <div
            className="w-0 h-0"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: `7px solid ${accentHex}55`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
