# Debate Arena UI — Integration Guide

A self-contained, visually cinematic "Debate Arena" component module for **TrialRun**. Six AI agents surround a centered product card in a horseshoe layout, with animated speech bubbles, status badges, and playback controls.

---

## Quick Start (standalone demo)

```tsx
// In any route component:
import { DebateArena } from "./components/debate-arena";

export default function ArenaPage() {
  return <DebateArena />;
}
```

Make sure to import the arena CSS in your app entry point:

```tsx
// In main.tsx or App.tsx
import "./components/debate-arena/arena.css";
```

---

## File Structure

```
src/components/debate-arena/
├── index.ts                 ← Barrel exports
├── arena.css                ← Arena-specific animations & utilities
├── DebateArena.tsx          ← Main orchestrator (layout + state)
├── AgentStandee.tsx         ← Individual agent card with image/silhouette
├── ArenaSpeechBubble.tsx    ← Animated speech bubble
├── ProductOnTrialCenter.tsx ← Central product card with score ring
├── ArenaEvidenceChips.tsx   ← Risk/evidence chip list
├── ArenaControls.tsx        ← Playback controls (prev/next/auto/reset)
├── mockTrialData.ts         ← Mock data (replace with real backend data)
└── README.md                ← This file
```

---

## Integrating with Your Backend

The `DebateArena` component currently uses `mockTrialData.ts` for all data. To wire it to your real backend:

### 1. Replace mock data with props

Refactor `DebateArena` to accept props instead of importing mock data:

```tsx
interface DebateArenaProps {
  agents: ArenaAgent[];
  product: ProductOnTrial;
  trialSteps: TrialStep[];
}
```

### 2. Map your existing types

Your repo already has `AgentMessage`, `RiskCard`, `Verdict`, and `AgentRunState` in `src/types.ts`. Map them to the arena types:

| Your Type | Arena Type | Mapping |
|-----------|-----------|---------|
| `AgentRunState.status` | `AgentStatus` | `"running"` → `"speaking"`, `"complete"` → `"spoken"`, `"pending"` → `"waiting"` |
| `AgentMeta` (from `src/lib/agents.ts`) | `ArenaAgent` | Use `name`, `accent` → `accentHex`, `tagline` → `role` |
| `AgentMessage.keyQuestion` | `ArenaAgent.speechBubble` | The question shown in the bubble |
| `RiskCard` | `EvidenceChip` | `title` → `label`, `severity` stays the same |
| `Verdict` | `ProductOnTrial.verdict` / `.score` | `verdictLabel` → verdict text, `launchReadinessScore` → score |

### 3. Example integration in TrialDashboard

```tsx
import { DebateArena } from "../components/debate-arena";

// Inside TrialDashboard, after trial data is loaded:
<DebateArena
  agents={mappedAgents}
  product={mappedProduct}
  trialSteps={mappedSteps}
/>
```

---

## Adding a Route (optional)

If you want the arena on its own page:

```tsx
// In App.tsx
import { DebateArena } from "./components/debate-arena";

<Route path="/arena" element={<DebateArena />} />
```

---

## Tailwind Configuration

The arena uses standard Tailwind utilities. No changes to `tailwind.config.js` are required. The custom animations are scoped to `arena.css` and use class names prefixed with `arena-` to avoid conflicts.

---

## Agent Images

The arena includes CDN-hosted generated character images. If you want to use local assets instead:

1. Place images in `public/agents/`
2. Update `imageUrl` in `mockTrialData.ts` (or your data mapping) to `/agents/malicious_user.png`, etc.
3. The component gracefully falls back to a CSS gradient silhouette if images fail to load.

---

## Dependencies

All dependencies are already in your `package.json`:
- `framer-motion` (animations)
- `lucide-react` (control icons)
- `tailwindcss` (styling)

No additional packages needed.
