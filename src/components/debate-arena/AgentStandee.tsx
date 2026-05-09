/**
 * AgentStandee.tsx
 * Design: Holographic War Room — Sci-Fi Command Center
 * Compact agent card with character image, name, role, status, speech bubble.
 * Sized to fit 6 agents + product in one viewport.
 *
 * Two size modes:
 *   - "embedded"  — fits inside the dashboard's chamber (smaller).
 *   - "fullscreen" — projector-readable sizing for the cinematic mode.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { ArenaAgent, AgentStatus } from "./mockTrialData";
import { ArenaSpeechBubble, type BubbleAlignment } from "./ArenaSpeechBubble";

/** Where the speech bubble should anchor for each agent so it doesn't get
 *  clipped by the chamber edges. Right-column agents anchor right; left-column
 *  anchors left; center column stays centered. */
function bubbleAlignmentFor(agentId: string): BubbleAlignment {
  if (agentId === "skeptical_investor" || agentId === "prompt_injection") {
    return "from-right";
  }
  if (agentId === "privacy_auditor" || agentId === "malicious_user") {
    return "from-left";
  }
  return "center";
}

export type ArenaSize = "embedded" | "fullscreen";

interface AgentStandeeProps {
  agent: ArenaAgent;
  isActive: boolean;
  status: AgentStatus;
  size?: ArenaSize;
}

interface SizeSpec {
  card: string;     // tailwind width class
  image: string;    // tailwind height class
  imgInner: string; // image element height
  name: string;
  role: string;
  badge: string;
  topAccent: string;
  innerPad: string;
}

const SIZES: Record<ArenaSize, SizeSpec> = {
  embedded: {
    card: "w-[clamp(130px,13vw,180px)]",
    image: "h-[clamp(70px,9vh,110px)]",
    imgInner: "h-[clamp(64px,8.5vh,100px)]",
    name: "text-[clamp(10px,0.95vw,11.5px)]",
    role: "text-[clamp(8px,0.65vw,9px)]",
    badge: "text-[clamp(8px,0.65vw,9px)]",
    topAccent: "h-[2px]",
    innerPad: "px-2 py-1",
  },
  fullscreen: {
    card: "w-[clamp(170px,15vw,230px)]",
    image: "h-[clamp(100px,13vh,160px)]",
    imgInner: "h-[clamp(95px,12.5vh,155px)]",
    name: "text-[clamp(12px,1.05vw,14.5px)]",
    role: "text-[clamp(9px,0.75vw,10.5px)]",
    badge: "text-[clamp(9px,0.7vw,10px)]",
    topAccent: "h-[2px]",
    innerPad: "px-2.5 py-1.5",
  },
};

function StatusBadge({
  status,
  size,
}: {
  status: AgentStatus;
  size: ArenaSize;
}) {
  const config = {
    waiting: { label: "Waiting", cls: "bg-slate-700/50 text-slate-400" },
    speaking: { label: "Speaking", cls: "bg-amber-500/20 text-amber-300" },
    spoken: { label: "Spoken", cls: "bg-emerald-500/15 text-emerald-400" },
  } as const;
  const c = config[status];
  return (
    <span
      className={
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full font-mono uppercase tracking-wider " +
        SIZES[size].badge +
        " " +
        c.cls
      }
    >
      {status === "speaking" && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      )}
      {c.label}
    </span>
  );
}

export function AgentStandee({
  agent,
  isActive,
  status,
  size = "embedded",
}: AgentStandeeProps) {
  const s = SIZES[size];
  return (
    <div className={`relative flex flex-col items-center ${agent.colorClass}`}>
      {/* Speech bubble above agent */}
      <AnimatePresence>
        {isActive && (
          <ArenaSpeechBubble
            text={agent.speechBubble}
            accentHex={agent.accentHex}
            size={size}
            alignment={bubbleAlignmentFor(agent.id)}
          />
        )}
      </AnimatePresence>

      {/* Agent card */}
      <motion.div
        className={
          "relative overflow-hidden rounded-lg transition-all duration-300 " +
          s.card +
          (isActive ? "" : " opacity-55 hover:opacity-75")
        }
        style={{
          background: isActive
            ? `linear-gradient(145deg, rgba(15,20,35,0.85), rgba(10,14,28,0.9))`
            : `linear-gradient(145deg, rgba(12,16,28,0.6), rgba(8,12,22,0.7))`,
          backdropFilter: "blur(8px)",
          border: `1px solid ${
            isActive ? agent.accentHex + "66" : "rgba(255,255,255,0.06)"
          }`,
          boxShadow: isActive
            ? `0 0 32px ${agent.accentHex}33, 0 6px 20px rgba(0,0,0,0.55)`
            : "0 2px 8px rgba(0,0,0,0.3)",
        }}
        animate={isActive ? { scale: 1.04, y: -4 } : { scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Top accent line */}
        <div
          className={"w-full " + s.topAccent}
          style={{
            background: isActive ? agent.accentHex : `${agent.accentHex}44`,
          }}
        />

        {/* Character image */}
        <div
          className={
            "relative flex items-end justify-center overflow-hidden " + s.image
          }
        >
          {isActive && (
            <div
              className="absolute inset-0 arena-pulse-glow"
              style={{
                background: `radial-gradient(ellipse at center bottom, ${agent.accentHex}25 0%, transparent 70%)`,
              }}
            />
          )}
          <img
            src={agent.imageUrl}
            alt={agent.name}
            className={
              "relative z-10 w-auto object-contain object-bottom " + s.imgInner
            }
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          {/* Silhouette fallback */}
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
            <div
              className="w-[40%] h-[60%] rounded-t-full opacity-10"
              style={{
                background: `linear-gradient(to top, ${agent.accentHex}, transparent)`,
              }}
            />
          </div>
        </div>

        {/* Info */}
        <div className={"space-y-0.5 " + s.innerPad}>
          <div className="flex items-center justify-between gap-1">
            <h3 className={"font-semibold text-slate-100 truncate " + s.name}>
              {agent.name}
            </h3>
            {agent.severity && (
              <span
                className={
                  "rounded-full flex-shrink-0 " +
                  (size === "fullscreen"
                    ? "w-2 h-2"
                    : "w-1.5 h-1.5") +
                  " " +
                  (agent.severity === "critical"
                    ? "bg-red-500"
                    : agent.severity === "high"
                      ? "bg-orange-500"
                      : agent.severity === "medium"
                        ? "bg-yellow-400"
                        : "bg-blue-400")
                }
              />
            )}
          </div>
          <p
            className={
              "font-mono text-slate-500 uppercase tracking-wide truncate " +
              s.role
            }
          >
            {agent.role}
          </p>
          <StatusBadge status={status} size={size} />
        </div>
      </motion.div>
    </div>
  );
}
