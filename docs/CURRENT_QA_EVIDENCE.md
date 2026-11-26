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

## Open issue found during this pass — RESOLVED 2026-11-24

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

### Resolution

The mapping was decided and shipped on 2026-11-24. `main.js` now holds a data-driven
`TRIP_TOOL_SETS` map plus a `TOOL_SECTIONS` registry, and `renderDashboard()` composes
the page from the resolved tool list instead of emitting a fixed set of sections.

| Trip intent | Tools surfaced |
| --- | --- |
| Business | Wi-Fi & Printing, Somewhere Quiet to Work, Trip Budget, Tip Calculator |
| Emergency | Emergency Travel, Directions, Nearby Essentials, Hotel Contact, Tip Calculator |
| Family | Kids & Family Needs, Family Activities, Travel Checklists |
| Leisure | Nearby food & attractions, Trip Budget, Travel Marketplace, Travel Checklists, Rewards Wallet |

The navigation is derived from the rendered tools, so no button can point at a section
that is not on the page. The traveller's stated `needs` promote the tool that answers
them and add a matching search chip. The welcome panel and the command card are also
intent-aware, and the questionnaire copy at `main.js:163` now says the dashboard is
*"built around the tools that fit your trip, not the whole catalogue"* — which is what
the app actually does.

### Re-verification after the fix

All four intents were driven through the real questionnaire handler path in the browser:

- **Business** — nav `Stay, My Trip, Work, Quiet, Budget, Tip, Owners`; `Wi-Fi & Printing`
  and `Somewhere Quiet to Work` cards; budget calculated `$165.00` against a `$400` limit;
  tip on a `$100` bill at `20%` for `2` people returned `Tip: $20.00 / Total: $120.00 / Each: $60.00`.
  The stated need *"parking"* added a `🅿 Parking` chip to the work card.
- **Emergency** — nav `Stay, My Trip, Emergency, Directions, Essentials, My Hotel, Tip, Owners`;
  the Hotel Contact card showed the saved stay (`Reno Grand`, `Room 512`, address, check-in).
  The stated need *"directions"* promoted Directions to the top.
- **Family** — nav `Stay, My Trip, Activities, Family, Checklists, Owners`; `Family Activities`
  and `Kids & Family Needs` cards.
- **Leisure** — nav `Stay, My Trip, Explore, Budget, Marketplace, Checklists, Rewards, Owners`;
  checklist toggle, reward add (`Marriott Bonvoy` / `4200` points) and packing add all worked.
  The stated need *"shopping"* added a `🛍 Shopping` chip to the nearby finder.

Every `scrollToId(...)` target on every intent resolves to a rendered section — no dead
buttons. No console errors on any intent. `npm test` is green: 4 tests pass, and the new
smoke-test assertions execute the mapping in a `node:vm` sandbox rather than just
grepping for it.

### Service worker — deploy staleness found while verifying

`sw.js` was serving the app **cache-first**, and `server.js` sends JS with
`Cache-Control: public, max-age=3600`. The two together meant a returning traveller
would keep the previous `main.js` indefinitely — the change above would never have
reached existing users. A live `hotel-easy-pass-v6` cache was confirmed serving the old
build in the test browser.

`sw.js` now uses **network first** (`cache: "no-cache"`) for same-origin GETs, falling
back to the cache when offline, and `CACHE_NAME` was bumped to `v7`. The install snapshot
also fetches with `cache: "reload"` so the offline fallback is never seeded from a stale
HTTP-cached build. The server's cache headers were left alone — adding `ETag` /
`Last-Modified` to `server.js` would let the browser revalidate instead of re-download,
but that is a server change and out of scope for this step.


## Public demo smoke audit — 2026-11-26

A read-only browser audit loaded the following live pages successfully:

- https://hotel-easy-pass.onrender.com/
- https://hotel-easy-pass.onrender.com/owner.html
- https://hotel-easy-pass.onrender.com/dashboard.html
- https://hotel-easy-pass.onrender.com/traveler.html

The traveler entry accepted a fictional demo nickname and continued to the traveler flow. The owner workspace and analytics dashboard rendered. The dashboard showed zero recorded events, zero app opens, zero traveler actions, and zero partner clicks after the traveler demo. No browser console, uncaught runtime, or unhandled promise errors were observed.

The audit did not sign in, configure billing, create real bookings, submit payments, or persist owner data. It therefore verifies page reachability and the limited public demo flow, not complete production operations.

## Latest CI evidence — 2026-11-26

- GitHub Actions test workflow [45825124242](https://github.com/bennett2oakley-hue/hotel-easy-pass/actions/runs/45825124242): passed.
- Validation workflow [45825124395](https://github.com/bennett2oakley-hue/hotel-easy-pass/actions/runs/45825124395): passed.
- Sale-package workflow [45825124202](https://github.com/bennett2oakley-hue/hotel-easy-pass/actions/runs/45825124202): passed.

## Remaining release limitations

The public browser audit did not verify live Supabase account creation, database persistence, Stripe checkout, webhook fulfillment, refunds, disputes, or real owner-side cloud writes. The prior sandbox QA found billing configuration absent there. The buyer must configure their own Supabase and Stripe credentials and run provider test-mode acceptance before enabling paid access. Treat Hotel Easy Pass as a working client-side PWA and early-stage software asset, not a fully integrated hotel booking or payments platform.
