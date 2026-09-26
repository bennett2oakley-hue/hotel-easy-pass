# Hotel Easy Pass

**Mobile-first hotel stay companion PWA for travelers and hotel operators.**

Hotel Easy Pass is designed as a clean, low-friction travel utility rather than an ad-heavy hotel search portal. The current product is a static Progressive Web App that works from a browser and can be installed on supported devices.

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

Hotel Easy Pass includes privacy-conscious, browser-local product analytics. Lightweight events are stored locally under `hep_events`, capped at the latest 100 events. The dashboard at `dashboard.html` provides event counts, top features, recent activity and JSON export. No third-party analytics SDK or remote event collector is required by the current build.

## Design approach

The interface uses a mobile-first card system, high-contrast teal branding, large touch targets, simple navigation, responsive layouts and plain-language labels. The goal is to keep the core workflow understandable for a broad age range.

## Technical architecture

- Vanilla HTML, CSS and JavaScript
- Progressive Web App manifest
- Service worker
- Browser-local persistence for current user data
- Browser-local product analytics
- IndexedDB room-photo storage on supported browsers
- No required application server
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

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for static hosting and [OPERATIONS.md](OPERATIONS.md) for release, rollback and container operations.

## Current product boundaries

The current package does not include a hosted booking engine, payment processor, universal hotel/PMS integration, universal smart-lock integration, or server-side photo storage. Those are intentionally positioned as future expansion opportunities rather than represented as existing functionality.

## Included package

The project can be distributed as a clean ZIP through the included GitHub Actions packaging workflow. The package excludes the Git repository metadata and development-only clutter.
