import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Gavel,
  ShieldAlert,
  Eye,
  HelpCircle,
  Bug,
  TrendingDown,
  Scale,
  ShieldCheck,
  Lock,
  Rocket,
} from "lucide-react";
import { AGENTS } from "../lib/agents";
import type { AgentType } from "../types";
import { OpenAILogo, ConvexLogo, GeminiLogo, FalLogo } from "./BrandLogos";

interface SponsorEntry {
  name: string;
  role: string;
  Logo: (props: {
    className?: string;
    style?: React.CSSProperties;
  }) => JSX.Element;
  /** Tint applied to the logo glyph and the chip border on hover. */
  accent: string;
}

const SPONSORS: SponsorEntry[] = [
  {
    name: "OpenAI",
    role: "GPT-5.5 reasoning",
    Logo: OpenAILogo,
    accent: "#10a37f",
  },
  {
    name: "Convex",
    role: "Realtime state & actions",
    Logo: ConvexLogo,
    accent: "#f97316",
  },
  {
    name: "Gemini Voice Agent",
    role: "Voice verdict · ElevenLabs fallback",
    Logo: GeminiLogo,
    accent: "#9b72cb",
  },
  {
    name: "Fal",
    role: "Agent character art generation",
    Logo: FalLogo,
    accent: "#c026d3",
  },
];

const AGENT_ICONS: Record<AgentType, typeof ShieldAlert> = {
  malicious_user: ShieldAlert,
  privacy_auditor: Eye,
  confused_customer: HelpCircle,
  prompt_injection_attacker: Bug,
  skeptical_investor: TrendingDown,
  final_judge: Scale,
};

const VALUE_CARDS = [
  {
    icon: ShieldCheck,
    title: "Catch abuse cases",
    body: "Specialist agents probe how real users and attackers will misuse your product, app, or workflow on day one.",
    accent: "#ff4d6d",
  },
  {
    icon: Lock,
    title: "Find privacy risks",
    body: "Trace data end-to-end, surface non-consenting processing, and flag scope creep across any product or idea.",
    accent: "#7c5cff",
  },
  {
    icon: Rocket,
    title: "Improve launch readiness",
    body: "Get a launch score, a prioritized fix list, and a retrial that proves the score moved.",
    accent: "#7be0a4",
  },
];

export function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <span className="chip mx-auto mb-6">
          <Gavel className="h-3 w-3" /> TrialRun · AIE Hackathon
        </span>
        <h1 className="text-balance text-5xl md:text-6xl font-bold tracking-tight">
          Put your idea through a trial run
          <br />
          <span className="bg-gradient-to-r from-accent-soft via-accent to-risk-high bg-clip-text text-transparent">
            before users, attackers, customers, and judges do.
          </span>
        </h1>
        <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
          TrialRun helps builders stress-test any product or idea with AI
          agents that simulate users, attackers, auditors, and judges before
          launch. Apply the fixes, rerun the trial, watch the score move.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/new" className="btn-primary px-5 py-2.5 text-base">
            Start trial run
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/new?demo=1" className="btn-secondary px-5 py-2.5 text-base">
            Run demo
          </Link>
        </div>

      </motion.div>

      {/* ===== Powered by — sits directly below the CTAs ===== */}
      <div className="mt-10">
        <div className="text-center mb-6">
          <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            Powered by
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {SPONSORS.map(({ name, role, Logo, accent }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * i }}
              className="group relative flex items-center gap-3 rounded-xl border border-border bg-bg-elevated/40 px-4 py-3 transition-colors hover:border-border-strong hover:bg-bg-elevated/70"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
                style={{
                  background: `radial-gradient(60% 80% at 0% 50%, ${accent}1f, transparent 60%)`,
                }}
              />
              <div
                className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/5 bg-black/30"
                style={{ color: accent }}
              >
                <Logo className="h-5 w-5" />
              </div>
              <div className="relative min-w-0">
                <div className="text-sm font-semibold tracking-tight text-slate-100 truncate">
                  {name}
                </div>
                <div className="text-[10.5px] uppercase tracking-wider text-slate-400 truncate">
                  {role}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-slate-500">
          Logos shown are trademarks of their respective owners.
        </p>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4">
        {VALUE_CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * i }}
              className="panel p-6"
            >
              <div
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={{
                  backgroundColor: `${card.accent}1a`,
                  color: card.accent,
                }}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                {card.body}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-20">
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400 text-center">
          The jury
        </h2>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((agent, i) => {
            const Icon = AGENT_ICONS[agent.type];
            return (
              <motion.div
                key={agent.type}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
                className="panel p-5 hover:border-border-strong transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                    style={{
                      backgroundColor: `${agent.accent}1a`,
                      color: agent.accent,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">{agent.name}</h3>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                      {agent.tagline}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
