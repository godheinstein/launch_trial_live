/**
 * AgentStandee.tsx
 * Design: Holographic War Room — Sci-Fi Command Center
 * Compact agent card with character image, name, role, status, speech bubble.
 * Sized to fit 6 agents + product in one viewport.
 */

import { motion, AnimatePresence } from "framer-motion";
import type { ArenaAgent, AgentStatus } from "./mockTrialData";
import { ArenaSpeechBubble } from "./ArenaSpeechBubble";

interface AgentStandeeProps {
  agent: ArenaAgent;
  isActive: boolean;
  status: AgentStatus;
}

function StatusBadge({ status }: { status: AgentStatus }) {
  const config = {
    waiting: { label: "Waiting", cls: "bg-slate-700/50 text-slate-400" },
    speaking: { label: "Speaking", cls: "bg-amber-500/20 text-amber-300" },
    spoken: { label: "Spoken", cls: "bg-emerald-500/15 text-emerald-400" },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-mono uppercase tracking-wider ${c.cls}`}>
      {status === "speaking" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
      {c.label}
    </span>
  );
}

export function AgentStandee({ agent, isActive, status }: AgentStandeeProps) {
  return (
    <div className={`relative flex flex-col items-center ${agent.colorClass}`}>
      {/* Speech bubble above agent */}
      <AnimatePresence>
        {isActive && (
          <ArenaSpeechBubble text={agent.speechBubble} accentHex={agent.accentHex} />
        )}
      </AnimatePresence>

      {/* Agent card */}
      <motion.div
        className={`relative overflow-hidden rounded-lg w-[150px] transition-all duration-300 ${isActive ? "" : "opacity-55 hover:opacity-75"}`}
        style={{
          background: isActive
            ? `linear-gradient(145deg, rgba(15,20,35,0.85), rgba(10,14,28,0.9))`
            : `linear-gradient(145deg, rgba(12,16,28,0.6), rgba(8,12,22,0.7))`,
          backdropFilter: "blur(8px)",
          border: `1px solid ${isActive ? agent.accentHex + "66" : "rgba(255,255,255,0.06)"}`,
          boxShadow: isActive
            ? `0 0 20px ${agent.accentHex}22, 0 4px 16px rgba(0,0,0,0.5)`
            : "0 2px 8px rgba(0,0,0,0.3)",
        }}
        animate={isActive ? { scale: 1.03, y: -3 } : { scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Top accent line */}
        <div className="h-[2px] w-full" style={{ background: isActive ? agent.accentHex : `${agent.accentHex}44` }} />

        {/* Character image */}
        <div className="relative h-[100px] flex items-end justify-center overflow-hidden">
          {isActive && (
            <div
              className="absolute inset-0 arena-pulse-glow"
              style={{ background: `radial-gradient(ellipse at center bottom, ${agent.accentHex}25 0%, transparent 70%)` }}
            />
          )}
          <img
            src={agent.imageUrl}
            alt={agent.name}
            className="relative z-10 h-[90px] w-auto object-contain object-bottom"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          {/* Silhouette fallback */}
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
            <div className="w-10 h-16 rounded-t-full opacity-10" style={{ background: `linear-gradient(to top, ${agent.accentHex}, transparent)` }} />
          </div>
        </div>

        {/* Info */}
        <div className="px-2 py-1.5 space-y-0.5">
          <div className="flex items-center justify-between gap-1">
            <h3 className="text-[10px] font-semibold text-slate-100 truncate">{agent.name}</h3>
            {agent.severity && (
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                agent.severity === "critical" ? "bg-red-500" :
                agent.severity === "high" ? "bg-orange-500" :
                agent.severity === "medium" ? "bg-yellow-400" : "bg-blue-400"
              }`} />
            )}
          </div>
          <p className="text-[8px] font-mono text-slate-500 uppercase tracking-wide truncate">{agent.role}</p>
          <StatusBadge status={status} />
        </div>
      </motion.div>
    </div>
  );
}
