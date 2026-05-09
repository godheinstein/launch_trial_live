# Launch Trial Live

Put any product or idea on trial before users, attackers, customers, and judges do.

A multi-agent red-teaming simulator for product launches — apps, startup ideas, workflows, features, and AI products. Five specialist agents (malicious user, privacy auditor, confused customer, prompt-injection attacker, skeptical investor) prosecute your product or idea. A final judge issues a launch readiness score, top risks, and concrete fixes. Apply the fixes, rerun the trial, watch the score move.

Built for the AIE Hackathon.

## Stack

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Convex (real-time DB, server functions, actions)
- **AI**: OpenAI GPT-5.5 with structured outputs (per-agent JSON schema)
- **Optional**: ElevenLabs (voice verdict), Fal/GPT Image 2 (verdict poster)

## Quick start (demo mode, no API keys)

Demo mode replays a pre-written email-assistant trial that scores 42, then rises to 78 after applied fixes. No backend needed.

```bash
cd launch-trial-live
npm install
npm run dev
```

Open http://localhost:5173 → click **Run demo product** → watch the trial.

The header chip shows `demo` when `VITE_CONVEX_URL` is unset, `live` when it is.

## Voice verdict (optional polish)

The judge's closing statement can be spoken via the **Play voice verdict** button on the verdict card. Voice is opt-in and never blocks the trial flow. Provider chain (first match wins):

1. **Gemini Voice** — *TODO*. Provider interface is in place; actual call is stubbed because Gemini's TTS API isn't yet a simple browser-side REST endpoint. Wire it server-side via Convex once available.
2. **ElevenLabs** — fully working. Set either:
   - `VITE_ELEVENLABS_API_KEY` in `.env.local` to call from the browser (simplest for local demo), or
   - `ELEVENLABS_API_KEY` in the Convex dashboard to keep the key server-side (recommended for shared deploys).

If neither provider is configured, the button shows a quiet "configure key" hint instead of an error. Demo mode never requires voice.

## Live mode (Convex + OpenAI)

> **Note:** the Convex CLI requires Node 20+. Demo mode works on Node 18.

1. Install Node 22 LTS (https://nodejs.org). Open a fresh terminal.
2. Copy env file and fill keys:
   ```bash
   cp .env.example .env.local
   # then edit .env.local
   ```
   `.env.local` should contain:
   ```env
   # Convex
   VITE_CONVEX_URL=
   CONVEX_DEPLOYMENT=

   # Convex runtime env (set in dashboard, not in .env.local)
   OPENAI_API_KEY=
   ELEVENLABS_API_KEY=
   GEMINI_API_KEY=
   FAL_KEY=

   # Browser-side voice fallbacks (optional, demo-only)
   VITE_ELEVENLABS_API_KEY=
   VITE_GEMINI_API_KEY=
   ```
3. Initialize Convex (this generates `convex/_generated/` and populates `VITE_CONVEX_URL`):
   ```bash
   npx convex dev
   ```
4. Inside the Convex dashboard, set the runtime environment variables (Settings → Environment Variables):
   - `OPENAI_API_KEY` — required for the agent calls.
   - `ELEVENLABS_API_KEY` — optional; enables the voice verdict server-side.
   - `GEMINI_API_KEY` — optional; reserved for the Gemini voice provider (TODO).
5. Wire the client to live data: replace the `useTrialEngine` import in `src/components/TrialDashboard.tsx` with the live hook described in `src/lib/useLiveTrial.ts`.
6. Run the app:
   ```bash
   npm run dev
   ```

## File layout

```
launch-trial-live/
├── prompts/                       # PRD §18 system + role prompts (also embedded in convex/prompts.ts)
├── convex/
│   ├── schema.ts                  # PRD §15 data model
│   ├── trials.ts                  # createTrial, getTrial, getRecentTrials, internal queries
│   ├── messages.ts                # agentMessages insert + query
│   ├── risks.ts                   # riskCards insert, query, toggleRiskFix
│   ├── verdicts.ts                # verdicts insert + query
│   ├── reports.ts                 # generateReport (markdown), getLatestReport
│   ├── prompts.ts                 # SHARED_SYSTEM, agent prompts, JSON schemas (§17)
│   ├── openai.ts                  # GPT-5.5 structured-output client (Node runtime)
│   ├── voiceActions.ts            # ElevenLabs synthesis (Gemini TODO) — Node runtime
│   └── runner.ts                  # runTrial / runRetrial actions (Node runtime)
└── src/
    ├── App.tsx                    # router /, /new, /trial/:trialId
    ├── main.tsx                   # ConvexProvider when VITE_CONVEX_URL set
    ├── types.ts                   # PRD-aligned domain types
    ├── lib/
    │   ├── agents.ts              # six agent metadata
    │   ├── scoring.ts             # severity weights, verdict labels (§19)
    │   ├── cn.ts                  # clsx + tailwind-merge
    │   ├── convexClient.ts        # ConvexReactClient (auto-detect)
    │   ├── useTrialEngine.ts      # demo-mode driver
    │   ├── useLiveTrial.ts        # live-mode wiring stub (post-codegen)
    │   └── voice.ts               # voice provider chain (Gemini stub → ElevenLabs)
    ├── demo/
    │   ├── sampleInputs.ts        # AutoReply AI, Meeting Agent, AI Recruiter
    │   ├── sampleTrialResult.json # full 42 → 78 demo arc
    │   └── runDemoMode.ts         # event-driven replay
    └── components/
        ├── AppShell.tsx
        ├── LandingPage.tsx
        ├── TrialSetupForm.tsx
        ├── TrialDashboard.tsx
        ├── AgentTimeline.tsx
        ├── AgentCard.tsx
        ├── RiskCard.tsx
        ├── RiskSeverityBadge.tsx
        ├── RiskFilterBar.tsx
        ├── RiskRadarChart.tsx
        ├── VerdictPanel.tsx
        ├── FixSelectionPanel.tsx
        ├── BeforeAfterComparison.tsx
        ├── MarkdownExportButton.tsx
        └── VoiceVerdictButton.tsx
```

## Demo arc

The bundled demo replays the PRD §10 use case:

1. AutoReply AI (Gmail auto-reply assistant) → trial → score **42 / 100**.
2. Five specialists raise risks (prompt injection, GDPR, irreversible auto-send, …).
3. Pick fixes from the checklist → run retrial → score moves to **78 / 100**.
4. Click **Export Markdown** for a shareable verdict report.

## Scoring rubric (PRD §19)

| Category | Weight |
| --- | ---: |
| Privacy and data handling | 20 |
| Prompt injection and AI safety | 20 |
| Abuse and misuse potential | 20 |
| UX clarity and trust | 15 |
| Business differentiation | 15 |
| Launch / demo readiness | 10 |

| Score | Label |
| --- | --- |
| 80–100 | Safe to demo |
| 40–79 | Needs fixes before launch |
| 0–39 | High risk |

## Build

```bash
npm run build
```

Passes TypeScript and Vite production build cleanly. Output in `dist/`.

## Hackathon non-goals

Per PRD §31:

- Not a code vulnerability scanner.
- No real exploit generation.
- No authentication, team collaboration, payment, or browser scraping for the MVP.
