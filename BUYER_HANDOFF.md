# Buyer Handoff — Hotel Easy Pass Owner

## What is included
- Standalone Hotel Owner PWA (root `index.html`)
- Owner identity and workspace personalization
- Voice-to-text owner request capture (browser support dependent)
- Staff shift scheduler
- Property profile and contact setup
- Guest offer and direct-booking link drafts
- Before/after room-condition photo records
- Local product analytics dashboard
- Dedicated static Node server, health endpoint and owner-only file allowlist
- Owner-specific smoke tests

## Separate product boundary
This branch contains the Owner app only. It does not contain the Traveler Pass, traveler login, traveler billing, Stripe checkout code, or traveler entitlement database.

## Current operational limits
- Owner records and inspection photos are stored in the browser on the current device. There is no multi-user cloud database, owner authentication, or cross-device sync in this version.
- Offer drafts are not published to a traveler marketplace. The operator must distribute direct booking links themselves.
- No owner subscription or payment processing is enabled. A separate Owner Stripe account and a dedicated Owner data/auth service are required before paid subscriptions or shared team workflows can be activated.
- Staff scheduling is a lightweight local planner, not a payroll or workforce-management system.

## Deploy
Deploy the `owner-app` branch as its own web service and domain. Use the included Node server and `npm test`. No payment credentials or database secrets are required for the current local-first version.
