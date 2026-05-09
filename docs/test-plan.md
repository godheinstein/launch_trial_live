# Manual Test Plan

## Trial

- Start the app.
- Enter or select the AI email assistant sample.
- Run the initial trial.
- Verify six agents appear in order or complete status.
- Verify risk cards include severity and category.
- Verify final verdict shows score 42 in fallback mode.

## Retrial

- Select recommended fixes.
- Run retrial.
- Verify the retrial uses the improved product spec.
- Verify the retrial timeline is separate from the initial timeline.
- Verify final retrial score is 78 in fallback mode.
- Verify score improvement is displayed as +36 if the UI supports deltas.

## Export

- Export the initial report.
- Verify product description, score, verdict, top risks, and fixes are present.
- Export or view retrial report.
- Verify before-and-after score and remaining risks are present.

## Demo Mode

- Enable fallback or demo mode.
- Run the full flow without OpenAI or Convex actions.
- Verify timeline content is deterministic.
- Verify no loading state blocks the judge demo.

## Live Mode

- Set `VITE_CONVEX_URL`.
- Set Convex deployment and OpenAI key.
- Start Convex dev or use deployed Convex.
- Run a trial and verify at least one live agent response persists.
- Refresh the page and verify trial state can be recovered if implemented.

## Error Handling

- Remove OpenAI key and attempt live trial.
- Verify the app shows a friendly error or offers fallback mode.
- Simulate a slow agent response.
- Verify partial results remain visible.

## Visual Checks

- Test desktop width.
- Test mobile width.
- Verify timeline cards do not overlap.
- Verify long risk titles wrap cleanly.
- Verify export controls remain reachable.
