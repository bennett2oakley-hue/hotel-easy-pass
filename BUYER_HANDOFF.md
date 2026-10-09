# Hotel Easy Pass Buyer Handoff

## Asset summary
Hotel Easy Pass is a mobile-first travel companion and hotel-operator PWA.

- Live demo: https://hotel-easy-pass.onrender.com/
- Traveler entry: https://hotel-easy-pass.onrender.com/
- Owner hub: https://hotel-easy-pass.onrender.com/owner.html
- Analytics dashboard: https://hotel-easy-pass.onrender.com/dashboard.html
- Source repository: https://github.com/bennett2oakley-hue/hotel-easy-pass
- Stack: vanilla HTML/CSS/JavaScript, PWA manifest/service worker, optional simple Node static server
- Local checks: `npm ci`, then `npm test`

## Included
- Traveler trip companion and dashboard
- Packing/checklist and trip-note workflows
- Budget/tip utilities and rewards tracking
- Emergency travel shortcuts and local recommendation tools
- Hotel-owner hub and offer/partner-link tools
- Room-condition/photo documentation workflow
- Browser-local analytics dashboard with JSON export
- PWA assets and deployment configurations

## Known limits to disclose
This is a client-side PWA with browser-local persistence. Analytics are stored locally on the current browser/device, not in a central hosted analytics service. The current package does not include a hosted booking engine, payment processor, universal hotel/PMS integration, universal smart-lock integration, or server-side photo storage. Data stored in a browser may not follow a user to another device and may be removed when browser data is cleared. Any external links, nearby information, or partner offers must be validated by the buyer before commercial use.

## Transfer checklist
1. Transfer repository ownership or provide a source archive at closing.
2. Transfer hosting only after both parties agree; recreate any provider credentials under buyer ownership.
3. Verify privacy and terms content for the buyer's intended geography and use case.
4. Test traveler and owner flows on mobile and desktop.
5. Test photo capture/storage permissions and local persistence on supported browsers.
6. Verify analytics export and clear-history controls.
7. Replace all demo/sample content before commercial launch.

## Acceptance checklist
- [ ] New visitor can enter a nickname and continue
- [ ] Traveler dashboard and primary navigation work
- [ ] Trip/checklist/notes features work and persist locally as expected
- [ ] Owner hub loads and editable features behave as expected
- [ ] Analytics dashboard loads, renders empty state, and exports JSON
- [ ] Photo capture/documentation works on a supported device/browser
- [ ] Install prompt/manifest works where supported
- [ ] Run `npm ci && npm test`

## Sale representation
Market as a travel companion PWA / early-stage software asset. Do not promise hotel booking, payment processing, universal PMS or smart-lock integration, or cloud-synced traveler records unless those capabilities are separately implemented and verified.
