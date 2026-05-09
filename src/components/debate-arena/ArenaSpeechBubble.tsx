/**
 * ArenaSpeechBubble.tsx
 * Design: Holographic War Room — Sci-Fi Command Center
 * A compact speech bubble that appears above the active agent,
 * with a tail pointing down toward the agent's head.
 *
 * Three alignment modes so right- and left-column bubbles don't get clipped
 * by the chamber edges:
 *   - center      → bubble centered horizontally above the card.
 *   - from-left   → bubble's left edge anchored to the card's left edge,
 *                   bubble extends rightward (use for left-column agents).
 *   - from-right  → bubble's right edge anchored to the card's right edge,
 *                   bubble extends leftward (use for right-column agents).
 *
 * The bubble may overlap the agent card itself when extending sideways —
 * that's intentional, since it keeps the bubble inside the viewport.
 */

import { motion } from "framer-motion";
import type { ArenaSize } from "./AgentStandee";

export type BubbleAlignment = "center" | "from-left" | "from-right";

interface ArenaSpeechBubbleProps {
  text: string;
  accentHex: string;
  size?: ArenaSize;
  alignment?: BubbleAlignment;
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

const BUBBLE_POSITION: Record<BubbleAlignment, string> = {
  center: "left-1/2 -translate-x-1/2 -translate-y-full",
  "from-left": "left-0 -translate-y-full",
  "from-right": "right-0 -translate-y-full",
};

export function ArenaSpeechBubble({
  text,
  accentHex,
  size = "embedded",
  alignment = "center",
}: ArenaSpeechBubbleProps) {
  const s = SIZES[size];

  // Tail anchor: roughly above the card center. Card sits at the card's edge
  // of the bubble, so for from-left the tail belongs near 25% of bubble width,
  // for from-right near 75%.
  const tailOuterStyle: React.CSSProperties =
    alignment === "from-left"
      ? { left: "22%", transform: "translateX(-50%)", bottom: -s.tail }
      : alignment === "from-right"
        ? { right: "22%", transform: "translateX(50%)", bottom: -s.tail }
        : { left: "50%", transform: "translateX(-50%)", bottom: -s.tail };

  return (
    <motion.div
      className={
        "absolute -top-1 z-30 pointer-events-none " +
        s.width +
        " " +
        BUBBLE_POSITION[alignment]
      }
      initial={{ opacity: 0, scale: 0.92, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div
        className={
          "relative rounded-lg leading-relaxed text-slate-100 " +
          s.padding +
          " " +
          s.text
        }
        style={{
          background: `linear-gradient(135deg, rgba(15,20,35,0.92), rgba(20,25,45,0.88))`,
          backdropFilter: "blur(12px)",
          border: `1px solid ${accentHex}55`,
          boxShadow: `0 0 16px ${accentHex}22, 0 6px 16px rgba(0,0,0,0.5)`,
        }}
      >
        <p className="font-sans italic text-slate-100/95">&ldquo;{text}&rdquo;</p>

        {/* Tail pointing down toward the agent card */}
        <div className="absolute" style={tailOuterStyle}>
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
