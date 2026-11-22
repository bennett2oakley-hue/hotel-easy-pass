# Hotel Easy Pass — Traveler

The standalone consumer app for travelers and people planning hotel stays.

## Traveler features
- Personal trip setup and stay dashboard
- Nearby travel needs, food, gas, groceries and attractions
- Trip budget, tip tools, packing checklist and notes
- Rewards tracking and trip sharing
- Emergency travel shortcuts
- Room photo check-in/check-out documentation
- Installable mobile PWA
- Optional Traveler Pass account and one-time unlock flow

## Deployment
This app is built from the `traveler-app` branch of the Hotel Easy Pass repository. Deploy it as its own web service and domain. Do not serve the owner app from this deployment.

## Data and payments
Traveler accounts and entitlements use the dedicated Hotel Easy Pass Traveler Supabase project. Stripe credentials must belong to the Traveler app's own Stripe account and be configured only in private hosting environment variables. Use test mode until checkout, webhook fulfillment, refunds and access revocation are validated.

## Product boundary
This is a traveler utility, not a hotel booking engine. It does not claim live room availability, universal PMS integration, universal smart-lock support, or control over hotel prices and policies.

## Local tests
```bash
npm test
```
