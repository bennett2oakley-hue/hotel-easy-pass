# Hotel Easy Pass — Owner

The standalone business app for hotel owners and operators. It is intentionally separate from the traveler product.

## Owner features
- Property profile and contact setup
- Owner command center with voice-to-text request capture
- Staff shift scheduling
- Guest offer and promotion drafts
- Direct booking link support
- Before/after room-condition photo records
- Owner-side local product analytics dashboard

## Deployment
This app is built from the `owner-app` branch of the Hotel Easy Pass repository. Deploy it as its own web service and domain. Do not serve the traveler app from this deployment.

## Data and payments
The current owner workspace saves its records in browser-local storage. That keeps owner records separate from traveler accounts, but it does not yet provide multi-device or multi-user cloud sync. Do not represent it as a shared hotel management system until a dedicated owner database and authentication are provisioned.

Owner billing must use a separate Stripe account and separate private credentials from the Traveler app. Billing is not enabled in this branch.

## Product boundary
Offer drafts are not published to a traveler directory yet. Direct booking links are entered by the owner; no booking engine or PMS integration is implied.
