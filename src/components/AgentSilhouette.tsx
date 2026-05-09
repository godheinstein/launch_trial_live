import type { AgentType } from "../types";

interface Palette {
  bodyTop: string;
  bodyBot: string;
  headTop: string;
  headBot: string;
  accent: string;
  outline: string;
  /** Optional accent fill (badge, gavel, etc) */
  highlight?: string;
}

const PALETTES: Record<AgentType, Palette> = {
  malicious_user: {
    bodyTop: "#2a0a10",
    bodyBot: "#0d0306",
    headTop: "#1a050a",
    headBot: "#000000",
    accent: "#ff3355",
    outline: "rgba(255,77,109,0.5)",
    highlight: "#ff4d6d",
  },
  privacy_auditor: {
    bodyTop: "#1d3470",
    bodyBot: "#0a1430",
    headTop: "#dfe7f7",
    headBot: "#a4b6da",
    accent: "#6aa9ff",
    outline: "rgba(124,156,255,0.5)",
    highlight: "#bcd2ff",
  },
  confused_customer: {
    bodyTop: "#7a5a18",
    bodyBot: "#241a08",
    headTop: "#f0d28a",
    headBot: "#a47e2e",
    accent: "#f5c451",
    outline: "rgba(245,196,81,0.55)",
    highlight: "#fff0c2",
  },
  prompt_injection_attacker: {
    bodyTop: "#3a1240",
    bodyBot: "#150410",
    headTop: "#5a1a52",
    headBot: "#2a0420",
    accent: "#ff8a3d",
    outline: "rgba(192,132,252,0.55)",
    highlight: "#c084fc",
  },
  skeptical_investor: {
    bodyTop: "#0d3a2a",
    bodyBot: "#03150e",
    headTop: "#dfe7df",
    headBot: "#9bb19f",
    accent: "#7be0a4",
    outline: "rgba(123,224,164,0.55)",
    highlight: "#bff0cf",
  },
  final_judge: {
    bodyTop: "#3b2370",
    bodyBot: "#11062a",
    headTop: "#1c0c40",
    headBot: "#06021a",
    accent: "#d4af37",
    outline: "rgba(212,175,55,0.6)",
    highlight: "#a594ff",
  },
};

interface Props {
  agentType: AgentType;
  className?: string;
}

/**
 * SVG silhouette character. Each agent type has a distinct posture and accent
 * details — not just a head + shoulders blob. Pure SVG / CSS, no images.
 */
export function AgentSilhouette({ agentType, className }: Props) {
  const id = `${agentType}-grad`;
  const p = PALETTES[agentType];

  return (
    <svg
      viewBox="0 0 200 320"
      className={className}
      preserveAspectRatio="xMidYMax meet"
      role="presentation"
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.bodyTop} />
          <stop offset="100%" stopColor={p.bodyBot} />
        </linearGradient>
        <linearGradient id={`${id}-head`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.headTop} />
          <stop offset="100%" stopColor={p.headBot} />
        </linearGradient>
        <radialGradient id={`${id}-spot`} cx="50%" cy="0%" r="60%">
          <stop offset="0%" stopColor={p.accent} stopOpacity="0.35" />
          <stop offset="60%" stopColor={p.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Spotlight from above */}
      <rect width="200" height="80" fill={`url(#${id}-spot)`} />

      {renderAgentBody(agentType, id, p)}
    </svg>
  );
}

function renderAgentBody(
  agentType: AgentType,
  id: string,
  p: Palette,
): React.ReactNode {
  switch (agentType) {
    case "malicious_user":
      return (
        <g>
          {/* Cloak skirt */}
          <path
            d="M 30 320 L 30 260 Q 38 220 70 200 L 70 195 L 130 195 L 130 200 Q 162 220 170 260 L 170 320 Z"
            fill={`url(#${id}-body)`}
            stroke={p.outline}
            strokeWidth="0.6"
          />
          {/* Hood */}
          <path
            d="M 50 200 Q 48 130 100 100 Q 152 130 150 200 L 144 200 Q 134 168 100 158 Q 66 168 56 200 Z"
            fill="#000"
            opacity="0.92"
          />
          {/* Hood inner shadow on face */}
          <path
            d="M 70 195 Q 78 158 100 152 Q 122 158 130 195 Z"
            fill="#000"
            opacity="0.75"
          />
          {/* Glowing eyes */}
          <circle cx="89" cy="170" r="2.4" fill={p.highlight} opacity="0.9" />
          <circle cx="111" cy="170" r="2.4" fill={p.highlight} opacity="0.9" />
          {/* Subtle clasp */}
          <circle cx="100" cy="208" r="3" fill={p.accent} opacity="0.7" />
        </g>
      );

    case "privacy_auditor":
      return (
        <g>
          {/* Suited torso with V-collar */}
          <path
            d="M 30 320 L 30 250 Q 40 222 72 198 L 72 192 L 128 192 L 128 198 Q 160 222 170 250 L 170 320 Z"
            fill={`url(#${id}-body)`}
            stroke={p.outline}
            strokeWidth="0.6"
          />
          {/* Shirt V */}
          <path d="M 90 198 L 100 240 L 110 198 Z" fill="#e9eef7" opacity="0.95" />
          {/* Tie */}
          <path
            d="M 96 200 L 104 200 L 108 244 L 100 256 L 92 244 Z"
            fill={p.accent}
          />
          {/* Head */}
          <ellipse cx="100" cy="158" rx="30" ry="34" fill={`url(#${id}-head)`} />
          {/* Hair */}
          <path
            d="M 70 144 Q 70 114 100 110 Q 130 114 130 144 L 130 138 Q 124 124 100 124 Q 76 124 70 138 Z"
            fill="#0e1730"
          />
          {/* Glasses */}
          <rect x="80" y="158" width="16" height="9" rx="2" fill="none" stroke={p.highlight} strokeWidth="1.5" />
          <rect x="104" y="158" width="16" height="9" rx="2" fill="none" stroke={p.highlight} strokeWidth="1.5" />
          <line x1="96" y1="162" x2="104" y2="162" stroke={p.highlight} strokeWidth="1.5" />
        </g>
      );

    case "confused_customer":
      return (
        <g>
          {/* Casual sweater */}
          <path
            d="M 30 320 L 30 256 Q 42 226 76 204 L 76 196 L 124 196 L 124 204 Q 158 226 170 256 L 170 320 Z"
            fill={`url(#${id}-body)`}
            stroke={p.outline}
            strokeWidth="0.6"
          />
          {/* Sweater pattern stripe */}
          <path
            d="M 38 268 Q 100 258 162 268"
            stroke={p.accent}
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
          {/* Head */}
          <ellipse cx="100" cy="160" rx="30" ry="34" fill={`url(#${id}-head)`} />
          {/* Tousled hair */}
          <path
            d="M 72 142 Q 72 114 100 108 Q 128 114 130 142 Q 124 122 100 124 Q 86 122 76 138 Q 75 142 72 142 Z"
            fill="#3a2a08"
          />
          {/* Eyes (uncertain) */}
          <circle cx="90" cy="160" r="1.6" fill="#0e0a04" />
          <circle cx="110" cy="160" r="1.6" fill="#0e0a04" />
          {/* Wavy mouth */}
          <path
            d="M 92 178 Q 96 175 100 178 Q 104 181 108 178"
            stroke="#0e0a04"
            strokeWidth="1.4"
            fill="none"
          />
          {/* Floating question mark */}
          <g opacity="0.9">
            <path
              d="M 144 100 Q 144 84 156 84 Q 168 84 168 96 Q 168 104 158 108 L 158 116"
              fill="none"
              stroke={p.accent}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="158" cy="124" r="2" fill={p.accent} />
          </g>
        </g>
      );

    case "prompt_injection_attacker":
      return (
        <g>
          {/* Glitchy hooded body */}
          <path
            d="M 30 320 L 30 256 Q 36 220 68 196 L 70 190 L 130 190 L 132 196 Q 164 220 170 256 L 170 320 Z"
            fill={`url(#${id}-body)`}
            stroke={p.outline}
            strokeWidth="0.6"
          />
          {/* Glitch streaks */}
          <rect x="36" y="260" width="50" height="3" fill={p.accent} opacity="0.5" />
          <rect x="100" y="248" width="58" height="2" fill={p.highlight} opacity="0.5" />
          <rect x="48" y="288" width="80" height="2" fill={p.accent} opacity="0.4" />
          {/* Hood */}
          <path
            d="M 56 196 Q 54 130 100 102 Q 146 130 144 196 L 138 196 Q 130 168 100 158 Q 70 168 62 196 Z"
            fill="#0e0418"
            opacity="0.95"
          />
          {/* Glitch eye visor */}
          <rect x="74" y="160" width="52" height="6" fill={p.accent} opacity="0.85" />
          <rect x="74" y="166" width="52" height="2" fill={p.highlight} opacity="0.6" />
          {/* Scanlines on visor */}
          <rect x="74" y="161" width="52" height="0.6" fill="rgba(255,255,255,0.4)" />
          <rect x="74" y="164" width="52" height="0.6" fill="rgba(255,255,255,0.3)" />
          {/* Floating code symbols */}
          <text x="36" y="120" fill={p.highlight} fontSize="14" fontFamily="monospace" opacity="0.6">{`{`}</text>
          <text x="158" y="148" fill={p.accent} fontSize="14" fontFamily="monospace" opacity="0.6">{`}`}</text>
        </g>
      );

    case "skeptical_investor":
      return (
        <g>
          {/* Sharp suit */}
          <path
            d="M 30 320 L 30 252 Q 42 226 74 200 L 74 192 L 126 192 L 126 200 Q 158 226 170 252 L 170 320 Z"
            fill={`url(#${id}-body)`}
            stroke={p.outline}
            strokeWidth="0.6"
          />
          {/* Lapels */}
          <path d="M 74 200 L 100 240 L 80 240 Z" fill="#04140b" />
          <path d="M 126 200 L 100 240 L 120 240 Z" fill="#04140b" />
          {/* Pocket square */}
          <rect x="118" y="232" width="10" height="6" fill={p.highlight} opacity="0.85" />
          {/* Tie */}
          <path d="M 96 198 L 104 198 L 106 240 L 100 252 L 94 240 Z" fill={p.accent} />
          {/* Head */}
          <ellipse cx="100" cy="158" rx="30" ry="34" fill={`url(#${id}-head)`} />
          {/* Slick hair */}
          <path
            d="M 70 142 Q 70 116 100 110 Q 130 116 130 142 Q 130 134 122 130 L 110 130 L 100 134 L 90 130 L 78 130 Q 70 134 70 142 Z"
            fill="#0a0f0d"
          />
          {/* Sharp brow */}
          <path d="M 85 152 L 95 156" stroke="#0a0f0d" strokeWidth="2" />
          <path d="M 105 156 L 115 152" stroke="#0a0f0d" strokeWidth="2" />
          {/* Eyes */}
          <circle cx="90" cy="162" r="1.4" fill="#0a0f0d" />
          <circle cx="110" cy="162" r="1.4" fill="#0a0f0d" />
          {/* Pursed mouth */}
          <path d="M 92 180 L 108 180" stroke="#0a0f0d" strokeWidth="1.6" />
          {/* Floating chart accent */}
          <g opacity="0.8">
            <path
              d="M 144 110 L 152 102 L 158 108 L 168 96"
              stroke={p.accent}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="168" cy="96" r="2.5" fill={p.accent} />
          </g>
        </g>
      );

    case "final_judge":
      return (
        <g>
          {/* Robe */}
          <path
            d="M 22 320 L 22 248 Q 36 218 70 196 L 70 188 L 130 188 L 130 196 Q 164 218 178 248 L 178 320 Z"
            fill={`url(#${id}-body)`}
            stroke={p.outline}
            strokeWidth="0.8"
          />
          {/* Robe inner V */}
          <path d="M 86 196 L 100 250 L 114 196 Z" fill="#0e0726" />
          {/* Gold trim */}
          <path d="M 86 196 L 100 250" stroke={p.accent} strokeWidth="1.2" />
          <path d="M 114 196 L 100 250" stroke={p.accent} strokeWidth="1.2" />
          {/* Sash buttons */}
          <circle cx="100" cy="220" r="2.5" fill={p.accent} />
          <circle cx="100" cy="234" r="2.5" fill={p.accent} />
          {/* Head */}
          <ellipse cx="100" cy="148" rx="28" ry="32" fill={`url(#${id}-head)`} />
          {/* Wig / formal hair */}
          <path
            d="M 70 134 Q 72 100 100 96 Q 128 100 130 134 Q 130 122 122 118 L 100 116 L 78 118 Q 70 122 70 134 Z"
            fill="#1a1140"
          />
          {/* Gold crown band */}
          <path
            d="M 76 130 Q 100 122 124 130"
            stroke={p.accent}
            strokeWidth="2"
            fill="none"
          />
          <circle cx="100" cy="124" r="3" fill={p.accent} />
          {/* Eyes */}
          <circle cx="90" cy="152" r="1.6" fill="#0e0726" />
          <circle cx="110" cy="152" r="1.6" fill="#0e0726" />
          {/* Stern mouth */}
          <path d="M 92 170 L 108 170" stroke="#0e0726" strokeWidth="1.8" />
          {/* Gavel raised */}
          <g transform="rotate(-20 30 180)">
            <rect x="22" y="146" width="6" height="48" rx="1.5" fill="#5a3a18" />
            <rect x="14" y="138" width="22" height="14" rx="2" fill={p.accent} />
            <rect x="14" y="148" width="22" height="2" fill="#a07a18" />
          </g>
          {/* Aura points */}
          <circle cx="58" cy="80" r="1.4" fill={p.accent} opacity="0.8" />
          <circle cx="142" cy="78" r="1.4" fill={p.accent} opacity="0.8" />
          <circle cx="100" cy="62" r="1.6" fill={p.accent} opacity="0.85" />
        </g>
      );
  }
}
