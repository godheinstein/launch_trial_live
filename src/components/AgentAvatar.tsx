import { useState } from "react";
import {
  ShieldAlert,
  Eye,
  HelpCircle,
  Bug,
  TrendingDown,
  Scale,
} from "lucide-react";
import type { AgentType } from "../types";
import { AGENT_BY_TYPE } from "../lib/agents";
import { cn } from "../lib/cn";

type Size = "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<Size, string> = {
  sm: "h-10 w-10 text-base",
  md: "h-14 w-14 text-lg",
  lg: "h-20 w-20 text-2xl",
  xl: "h-32 w-32 text-5xl",
};

const RING_SIZE: Record<Size, string> = {
  sm: "ring-2",
  md: "ring-2",
  lg: "ring-4",
  xl: "ring-[6px]",
};

interface AgentVisual {
  emoji: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  Icon: typeof ShieldAlert;
}

const VISUALS: Record<AgentType, AgentVisual> = {
  malicious_user: {
    emoji: "🥷",
    initials: "MU",
    gradientFrom: "#7f1d1d",
    gradientTo: "#ff4d6d",
    Icon: ShieldAlert,
  },
  privacy_auditor: {
    emoji: "🔍",
    initials: "PA",
    gradientFrom: "#3b1d8e",
    gradientTo: "#7c5cff",
    Icon: Eye,
  },
  confused_customer: {
    emoji: "🤔",
    initials: "CC",
    gradientFrom: "#7c4a00",
    gradientTo: "#f5c451",
    Icon: HelpCircle,
  },
  prompt_injection_attacker: {
    emoji: "👾",
    initials: "PI",
    gradientFrom: "#7c2d12",
    gradientTo: "#ff8a3d",
    Icon: Bug,
  },
  skeptical_investor: {
    emoji: "📊",
    initials: "SI",
    gradientFrom: "#064e3b",
    gradientTo: "#7be0a4",
    Icon: TrendingDown,
  },
  final_judge: {
    emoji: "⚖️",
    initials: "FJ",
    gradientFrom: "#312e81",
    gradientTo: "#a594ff",
    Icon: Scale,
  },
};

interface Props {
  agentType: AgentType;
  size?: Size;
  active?: boolean;
  dim?: boolean;
  className?: string;
  showIcon?: boolean;
}

export function AgentAvatar({
  agentType,
  size = "md",
  active,
  dim,
  className,
  showIcon,
}: Props) {
  const visual = VISUALS[agentType];
  const meta = AGENT_BY_TYPE[agentType];
  const [imageOk, setImageOk] = useState(true);
  const imageSrc = `/agents/${agentType}.png`;

  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-full overflow-hidden transition-all duration-300",
        SIZE_CLASS[size],
        active && "shadow-glow",
        active && RING_SIZE[size],
        dim && "opacity-40 saturate-50",
        className,
      )}
      style={{
        background: imageOk
          ? `linear-gradient(135deg, ${visual.gradientFrom} 0%, ${visual.gradientTo} 100%)`
          : `linear-gradient(135deg, ${visual.gradientFrom} 0%, ${visual.gradientTo} 100%)`,
        boxShadow: active
          ? `0 0 0 2px rgba(255,255,255,0.06), 0 0 32px -4px ${meta.accent}`
          : undefined,
      }}
      title={meta.name}
    >
      {/* If a /agents/{agentType}.png exists it overlays the gradient */}
      <img
        src={imageSrc}
        alt={meta.name}
        onError={() => setImageOk(false)}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
          imageOk ? "opacity-100" : "opacity-0",
        )}
        loading="lazy"
      />

      {!imageOk && (
        <div className="relative grid place-items-center text-white">
          <span className="leading-none drop-shadow-md">{visual.emoji}</span>
        </div>
      )}

      {showIcon && (() => {
        const Icon = visual.Icon;
        return (
          <div
            className="absolute bottom-0 right-0 grid h-5 w-5 place-items-center rounded-full border border-bg bg-bg-elevated text-[10px]"
            style={{ color: meta.accent }}
          >
            <Icon className="h-2.5 w-2.5" />
          </div>
        );
      })()}
    </div>
  );
}

export function getAgentVisual(agentType: AgentType): AgentVisual {
  return VISUALS[agentType];
}
