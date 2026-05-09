/**
 * ArenaSpeechBubble.tsx
 * Design: Holographic War Room — Sci-Fi Command Center
 * A compact speech bubble that appears above the active agent,
 * with a tail pointing down toward the agent's head.
 */

import { motion } from "framer-motion";
import type { ArenaSize } from "./AgentStandee";

interface ArenaSpeechBubbleProps {
  text: string;
  accentHex: string;
  size?: ArenaSize;
}

const SIZES: Record<
  ArenaSize,
  { width: string; padding: string; text: string; tail: number }
> = {
  embedded: {
    width: "w-[clamp(180px,18vw,240px)]",
    padding: "px-3 py-2",
    text: "text-[clamp(11px,0.95vw,12.5px)]",
    tail: 7,
  },
  fullscreen: {
    width: "w-[clamp(240px,22vw,320px)]",
    padding: "px-4 py-3",
    text: "text-[clamp(13px,1.05vw,16px)]",
    tail: 9,
  },
};

export function ArenaSpeechBubble({
  text,
  accentHex,
  size = "embedded",
}: ArenaSpeechBubbleProps) {
  const s = SIZES[size];
  return (
    <motion.div
      className={
        "absolute -top-1 left-1/2 z-30 -translate-x-1/2 -translate-y-full pointer-events-none " +
        s.width
      }
      initial={{ opacity: 0, scale: 0.92, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div
        className={"relative rounded-lg leading-relaxed text-slate-100 " + s.padding + " " + s.text}
        style={{
          background: `linear-gradient(135deg, rgba(15,20,35,0.92), rgba(20,25,45,0.88))`,
          backdropFilter: "blur(12px)",
          border: `1px solid ${accentHex}55`,
          boxShadow: `0 0 16px ${accentHex}22, 0 6px 16px rgba(0,0,0,0.5)`,
        }}
      >
        <p className="font-sans italic text-slate-100/95">&ldquo;{text}&rdquo;</p>

        {/* Tail pointing down */}
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: -s.tail }}
        >
          <div
            className="w-0 h-0"
            style={{
              borderLeft: `${s.tail - 1}px solid transparent`,
              borderRight: `${s.tail - 1}px solid transparent`,
              borderTop: `${s.tail}px solid ${accentHex}55`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
