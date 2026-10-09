# Hotel Easy Pass

**Mobile-first hotel stay companion PWA for travelers and hotel operators.**

Hotel Easy Pass is designed as a clean, low-friction travel utility rather than an ad-heavy hotel search portal. The current product is a static Progressive Web App that works from a browser and can be installed on supported devices.

## Live demo and buyer handoff

- Live demo: https://hotel-easy-pass.onrender.com/
- Owner hub: https://hotel-easy-pass.onrender.com/owner.html
- Local analytics dashboard: https://hotel-easy-pass.onrender.com/dashboard.html
- Source repository: https://github.com/bennett2oakley-hue/hotel-easy-pass
- Buyer transfer and acceptance checklist: [BUYER_HANDOFF.md](BUYER_HANDOFF.md)

## Product

### Traveler experience
- Hotel stay dashboard
- Nearby food, gas, groceries and attractions
- Trip budget and tip tools
- Rewards tracking
- Packing checklist and trip notes
- Trip sharing
- Emergency travel shortcuts
- Room photo check-in/check-out documentation
- Installable PWA experience

### Hotel-owner experience
- Property and contact setup
- Promotion and offer drafts
- Direct booking link support
- Guest perks and local recommendations
- Room-condition inspection workflow
- Product analytics dashboard
- Space for future hotel-partner features

## Product analytics

Hotel Easy Pass includes browser-local product analytics. Lightweight events are stored locally under `hep_events`, capped at the latest 100 events. The dashboard at `dashboard.html` provides event counts, top features, recent activity and JSON export. No third-party analytics SDK or remote event collector is required by the current build.

## Technical architecture

- Vanilla HTML, CSS and JavaScript
- Progressive Web App manifest and service worker
- Browser-local persistence for current user data
- Browser-local product analytics
- IndexedDB room-photo storage on supported browsers
- No required database
- No framework build step

## Quality and delivery

- Automated smoke test: `npm test`
- GitHub Actions CI
- Locked npm dependency metadata
- GitHub Pages deployment workflow
- Vercel-compatible configuration
- Netlify configuration
- Nginx/Docker deployment option
- Automated clean sale-package workflow

## Local development

No dependency installation is required for the application itself. A modern browser can serve the static files.

For the automated check:

```bash
npm ci
npm test
```

## Current product boundaries

The current package does not include a hosted booking engine, payment processor, universal hotel/PMS integration, universal smart-lock integration, or server-side photo storage. Those are future expansion opportunities, not existing functionality. Data stored in a browser may not follow a user to another device and may be removed when browser data is cleared.

## Included package

The project can be distributed as a clean ZIP through the included GitHub Actions packaging workflow. The package excludes the Git repository metadata and development-only clutter. Review [BUYER_HANDOFF.md](BUYER_HANDOFF.md) before representing the asset to a buyer.
