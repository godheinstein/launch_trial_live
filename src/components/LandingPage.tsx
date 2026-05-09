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
    body: "Specialist red-team agents probe the workflows real attackers will hit on day one.",
    accent: "#ff4d6d",
  },
  {
    icon: Lock,
    title: "Find privacy risks",
    body: "Trace data end-to-end, surface non-consenting processing, and flag scope creep.",
    accent: "#7c5cff",
  },
  {
    icon: Rocket,
    title: "Improve launch readiness",
    body: "Get a launch score, a prioritized fix list, and a retrial that proves the score moved.",
    accent: "#7be0a4",
  },
];

const SPONSORS = [
  { name: "GPT-5.5", caption: "Reasoning" },
  { name: "Convex", caption: "Realtime state" },
  { name: "ElevenLabs", caption: "Voice verdict" },
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
          <Gavel className="h-3 w-3" /> AIE Hackathon
        </span>
        <h1 className="text-balance text-5xl md:text-6xl font-bold tracking-tight">
          Put your AI product on trial
          <br />
          <span className="bg-gradient-to-r from-accent-soft via-accent to-risk-high bg-clip-text text-transparent">
            before users do.
          </span>
        </h1>
        <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
          Five specialist agents prosecute your product. A final judge issues a
          launch readiness score, top risks, and concrete fixes. Apply the
          fixes, rerun the trial, watch the score move.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/new" className="btn-primary px-5 py-2.5 text-base">
            Start trial
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/new?demo=1" className="btn-secondary px-5 py-2.5 text-base">
            Run demo product
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          {SPONSORS.map((s) => (
            <div
              key={s.name}
              className="rounded-xl border border-border bg-bg-elevated/60 px-3 py-1.5 text-left"
            >
              <div className="text-[11px] uppercase tracking-wider text-slate-500">
                {s.caption}
              </div>
              <div className="text-sm font-medium">{s.name}</div>
            </div>
          ))}
        </div>
      </motion.div>

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
