# Buyer Handoff — Hotel Easy Pass Traveler

## What is included
- Standalone consumer/traveler PWA (root `index.html`)
- Traveler trip dashboard, nearby travel tools, trip notes, budget and tip tools
- Rewards and checklist utilities
- Emergency travel shortcuts
- Room photo check-in/check-out documentation
- Supabase Auth and traveler entitlement client code
- Stripe one-time Traveler Pass Checkout and webhook source
- Installable PWA, privacy/terms pages and Node smoke tests

## Separate product boundary
This branch contains the Traveler app only. It does not contain the Hotel Owner workspace, owner analytics dashboard, owner staff scheduling, or owner property/offer tools.

## Current operational limits
- Traveler authentication and entitlement storage depend on the dedicated Hotel Easy Pass Traveler Supabase project and its private hosting configuration.
- Stripe checkout is not considered live until a separate Traveler Stripe account is connected, test-mode price and webhook credentials are configured, and purchase/refund/access-revocation tests pass.
- The app is a trip utility, not a hotel booking engine or PMS integration. It does not guarantee live room rates or availability.
- Browser-local trip data may not follow the user across devices.

## Deploy
Deploy the `traveler-app` branch as its own web service and domain. Use the included Node server and `npm test`. Keep all Traveler Supabase and Stripe credentials in private host environment settings.
