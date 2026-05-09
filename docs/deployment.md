# Deployment Checklist

## Preflight

- Confirm `npm run build` passes locally.
- Confirm `.env.local` has live values for Convex and OpenAI.
- Confirm fallback demo mode works without external API calls.
- Confirm no secret values are committed.

## Convex

1. Log in to Convex.
2. Create or select the production Convex deployment.
3. Set Convex environment variables for server-side actions.
4. Deploy Convex functions.
5. Copy the production Convex URL.
6. Add the URL to Vercel as `VITE_CONVEX_URL`.

Suggested commands:

```bash
npx convex dev
npx convex deploy
```

## Vercel

1. Import the repository into Vercel.
2. Set framework preset to Vite.
3. Set build command to `npm run build`.
4. Set output directory to `dist`.
5. Add environment variables:
   - `VITE_CONVEX_URL`
   - `CONVEX_DEPLOYMENT`
   - `OPENAI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `FAL_KEY`
6. Deploy.
7. Open the production URL and run the email assistant demo.

## Smoke Test

- App loads without console errors.
- Guest demo can start.
- Initial trial displays agent timeline.
- Verdict displays score 42 in fallback mode.
- Retrial displays score 78 in fallback mode.
- Export report works.
- Live mode can run at least one agent response.

## Rollback Plan

- Keep fallback mode enabled for judging.
- If live Convex actions fail, demo deterministic trial data.
- If production deploy fails, use local `npm run dev` with screen share.
