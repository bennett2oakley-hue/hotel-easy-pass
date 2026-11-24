# Hotel Easy Pass QA evidence — 2026-11-24

Verified by running the app end-to-end in the ProductOS sandbox (preview runtime,
`PORT=3000`). All checks below were executed against the live server, not against a
static read of the source.

## Runtime

- `npm start` → `node server.js`, plain Node HTTP server. No Next.js app, no build step.
- Dev server responded `200` on `http://localhost:3000` throughout the session.
- The `EADDRINUSE: address already in use 0.0.0.0:3000` line in the dev log comes from
  the preview runtime launching `npm start` twice concurrently. The first instance keeps
  the port and serves normally; the second dies immediately. It is benign — check for a
  `200` and exactly one live `node server.js` before treating it as a fault.
- `X-Frame-Options: ALLOWALL` is set on every response, so the app renders inside the
  ProductOS cross-site preview iframe. Do not revert to `DENY`.

## Route surface — all `200`

`/`, `/index.html`, `/traveler.html`, `/owner.html`, `/dashboard.html`, `/faq.html`,
`/privacy.html`, `/terms.html`, `/404.html`, `/sw.js`, `/manifest.webmanifest`,
`/api/config`.

`/server.js`, `/stripe-billing.js`, `/package.json`, `/package-lock.json`,
`/.env.example`, dot-prefixed paths, `/supabase/*` and `/tests/*` correctly return
`403 Forbidden`.

`GET /api/config` returns `{"supabaseUrl":"","supabaseAnonKey":"","billingReady":false}`.
`billingReady` is false because `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`STRIPE_PRICE_UNLOCK` and `SUPABASE_SERVICE_ROLE_KEY` are absent in the sandbox. The
traveller page shows *"Account billing is not configured yet"* and
`POST /api/stripe/checkout` returns `503`. That is the intended guarded behaviour.

## Traveller flow — exercised end to end, no console errors

`/` redirects to `/traveler.html`. Questionnaire completed twice, once per trip type:

1. destination → 2. intent → 3. party size → 4. trip length → 5. hotel → 6. rental car →
7. flight → 8. needs → 9. experience/vibe → 10. *"Build My Trip"* → full toolkit dashboard.

The questionnaire genuinely adapts to the chosen intent:

- **Leisure** needs → "A hotel / Restaurants / Attractions & events / Shopping /
  Adventures & activities / Transportation"; experience → "Relaxed / Lots to do /
  Food & nightlife / Daring & adventurous / A little luxury".
- **Emergency** needs → "A place to stay / Transportation / Directions / Emergency help /
  Nearby essential services / Help me decide"; experience → "Practical & immediate /
  Closest useful option / Keep it affordable / You choose for me".

The trip profile persists and survives *"Start a different trip"* → re-answer, and the
summary line renders correctly for both intents.

## Owner hub — exercised end to end, no console errors

- Property profile: saved "Harbor View Hotel / San Diego, CA", cleared the field, then
  *"Load saved"* correctly restored the value. Round trip verified.
- Command Center, Staff Scheduler, guest-offer draft, room-condition record (pre-arrival
  and post-checkout photo capture), and the "Built for owners" panel all render.

## Analytics dashboard — exercised

`/dashboard.html` reads the browser-local event log and correctly reported the `app_open`
event raised during the session (1 app open, 0 traveller actions, 0 partner clicks), with
the feature breakdown and recent-activity list populated.

## Tool calculations spot-checked

Tip calculator: bill `100`, tip `20%`, 1 person → `Tip: $20.00`, `Total: $120.00`,
`Each: $120.00`. Correct.

## Open issue found during this pass

**The tool set is not filtered by trip intent.** The questionnaire adapts its questions,
but `renderDashboard()` in `main.js` renders the same eight nav sections and the same
toolset for every trip type — a Leisure trip and an Emergency trip produce byte-identical
dashboards apart from the profile summary line. `tripType`, `needs` and `experience` are
read only inside the questionnaire (lines 142–298) and never inside `renderDashboard()`
(line 392). The onboarding copy at `main.js:163` — *"You won't be shown irrelevant
choices"* — and the product overview's description of the questionnaire as routing the
traveller to only the relevant tools therefore overstate what the app currently does.

This is a gap between stated intent and shipped behaviour, not a crash or a broken
control. Nothing in `docs/` specifies an intent→tools mapping, so deciding which tools
each intent should surface is a product decision that has not been made yet. Fixing it
means making the section list in `renderDashboard()` conditional on the stored trip
profile, and updating the `main.js:163` copy to match whatever that mapping turns out
to be.
