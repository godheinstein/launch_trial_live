# Setup

## Requirements

- Node.js 20 or newer
- npm
- Convex account for live mode
- OpenAI API key for live agent generation
- Optional ElevenLabs and Fal keys for voice or poster experiments

## Install

```bash
npm install
```

## Environment

Create `.env.local` from `.env.example` and fill in available values.

```bash
VITE_CONVEX_URL=
CONVEX_DEPLOYMENT=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
FAL_KEY=
```

## Convex Guest Mode

For hackathon demos, keep the first flow usable without login. Store a guest session id locally and associate trials with that guest session.

Use login later for saved history, team workspaces, and private report access. The guest flow should still allow:

- Run initial trial
- View live agent timeline
- Select fixes
- Run retrial
- Export report

## Development

Start the app:

```bash
npm run dev
```

Start Convex in another terminal when live mode is needed:

```bash
npx convex dev
```

## Build

```bash
npm run build
```

## Demo Fallback

If live APIs are unavailable, use the deterministic fallback trial script. The intended email assistant arc is:

- Initial score: 42
- Retrial score: 78
- Main change: automatic sending becomes approval-only supervised drafting
