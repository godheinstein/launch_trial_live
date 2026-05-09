# TrialRun

Put your idea through a trial run before launch.

TrialRun helps builders stress-test any product or idea — apps, startup ideas, workflows, features, AI products — with AI agents that simulate users, attackers, auditors, and judges before launch. Five specialist agents (malicious user, privacy auditor, confused customer, prompt-injection attacker, skeptical investor) prosecute your idea. A final judge issues a launch readiness score, top risks, and concrete fixes. Apply the fixes, rerun the trial, watch the score move.

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
   - `GEMINI_API_KEY` — primary voice provider for the verdict.
   - `ELEVENLABS_API_KEY` — fallback voice provider.
   - `FAL_KEY` — optional; enables the **Generate agent visuals** button on
     the trial dashboard, which renders six cinematic character standees via
     Fal (`fal-ai/flux/schnell`) and stores their URLs in the `agentAssets`
     Convex table. Server-only; the key never touches the browser.
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

## Deploy to Vercel

The repo ships a [`vercel.json`](./vercel.json) with the right SPA rewrites
(every path → `/index.html`) and a sensible default header pack
(`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`X-Frame-Options: SAMEORIGIN`, `Permissions-Policy` denying camera/geolocation
and limiting microphone access to `self`).

1. **Connect the repo** in the Vercel dashboard. Framework auto-detects as
   Vite. Build command `npm run build`, output `dist`.
2. **Set environment variables** in Vercel → Settings → Environment Variables.
   Only the public Convex URL is needed for the browser bundle:

   | Vercel env var      | Value                                | Notes                                |
   | ------------------- | ------------------------------------ | ------------------------------------ |
   | `VITE_CONVEX_URL`   | `https://<your>.convex.cloud`        | **Public** — baked into the JS bundle |

   Do **not** set `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`,
   or `FAL_KEY` on Vercel. Those are server-only secrets and live in the
   **Convex dashboard** → Settings → Environment Variables (see "Live mode"
   section above). They're consumed by Convex actions, not the browser.

3. **Optional browser-only voice keys** (demo deploys only):
   `VITE_ELEVENLABS_API_KEY` is supported as a *demo fallback* when no Convex
   deployment is configured. Note: any `VITE_*` variable is **embedded into
   the static JS bundle and visible to anyone**. Don't set this on a public
   deployment unless you accept that risk.

4. **Push to main** → Vercel rebuilds automatically. The first deploy needs
   `npx convex deploy` once locally to push the schema/functions to your
   Convex production deployment, then update Vercel's `VITE_CONVEX_URL` to
   point at the production URL.

## Security & abuse-prevention

This deployment is publicly reachable and has **no user authentication** —
trial IDs are unguessable Convex document IDs (random 32-char strings) and
function as bearer tokens. The following safeguards are in place:

- **Server-side input validation** in `convex/trials.ts::createTrial` —
  required-field checks and per-field length caps (`productName ≤ 120`,
  `productDescription ≤ 3000`, …). Mirrors the client form so a custom
  Convex client can't bypass it.
- **Per-deployment rate limits** (sliding window, persisted in the
  `rateLimits` table — see `convex/rateLimit.ts`):
  - `createTrial` — 60 / hour
  - `runTrial`, `runRetrial` — 30 / hour each
  - `falActions.generateAll` — 6 / hour (each run = 6 Fal images)
  - `voiceActions.synthesizeVerdictVoice` — 60 / hour, with a 2 000-char
    text cap on the input
- **Secret hygiene** — server-only keys (`OPENAI_API_KEY`, `GEMINI_API_KEY`,
  `ELEVENLABS_API_KEY`, `FAL_KEY`) are read by Convex actions via
  `process.env.*` and never exposed to the browser. The `VITE_*` voice keys
  are explicitly marked as demo-only with comments in `.env.example`.
- **Frontend error containment** — `<ErrorBoundary>` wraps the trial
  dashboard so a render-time crash falls back to a stack panel instead of a
  blank screen. The `<LiveModeFailureBanner>` translates raw provider
  errors into a friendly "tokens on a coffee break" UX with a one-click
  switch to Demo Mode.
- **No `dangerouslySetInnerHTML`, `eval`, or `Function` constructors**
  anywhere in the codebase (verified via grep).
- **Prompt injection** — all user input flows into structured-output OpenAI
  calls with explicit role separation in `convex/prompts.ts` (system prompt
  vs. product description). Model output is parsed with strict JSON
  schemas before being persisted; an injected payload can at worst alter
  the verdict text, never trigger privileged actions.

### Known limitations / TODOs

- **No authentication.** Anyone with a trial ID can read its data and
  toggle `selectedForFix` flags via `risks.toggleRiskFix`. Acceptable for
  the hackathon demo (IDs are unguessable random strings) but should be
  replaced with proper auth (Convex Auth, Clerk, etc.) before any
  production use. Mark as TODO.
- **Trial ownership** — there's no `userId` field on trials yet, so we
  can't enforce horizontal-isolation checks server-side. Add when auth
  lands.
- **Convex CORS** is managed by Convex itself; the function endpoints only
  accept calls from clients carrying the deployment URL.

## Hackathon non-goals

Per PRD §31:

- Not a code vulnerability scanner.
- No real exploit generation.
- No authentication, team collaboration, payment, or browser scraping for the MVP.
