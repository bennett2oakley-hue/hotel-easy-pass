# Hotel Easy Pass

Hotel Easy Pass is a mobile-first Progressive Web App designed as a simple two-sided hospitality platform: one experience for travelers and one workspace for hotel owners.

## Traveler Pass

- Hotel stay dashboard with check-in/check-out details
- Check-in countdown and trip sharing
- Nearby food, attractions, groceries, gas, pharmacy, coffee, laundry, ATMs and urgent care
- Travel marketplace structure for hotels, experiences and travel services
- Trip budget calculator
- Rewards wallet
- Hotel and packing checklists
- Tip calculator
- Trip notes
- Emergency travel shortcuts
- Private check-in and check-out room photo documentation
- Optional notes attached to photo events
- PWA install support

## Hotel Owner Hub

- Property profile
- Guest promotion/offer drafts
- Direct booking URL support
- Guest perks and local recommendations
- Before-guest and after-checkout room-condition documentation
- Future featured placement and referral architecture

## Photo documentation

The traveler side stores room photos in IndexedDB on the user's device. The owner side stores inspection records locally in the browser. The current static version does not upload photos to a Hotel Easy Pass server.

## Smart Room Key direction

The product can be extended into a phone-based room-key experience, but actual door unlocking requires a compatible hotel access-control/lock integration. The current PWA should not be represented as capable of unlocking arbitrary hotel doors.

## Revenue architecture

The marketplace is prepared for approved affiliate/deep links, but current outbound links are ordinary links until real partner tracking is connected. Potential future revenue models include hotel subscriptions, featured offers, qualified booking referrals, premium traveler tools, hotel-branded versions and API/integration partnerships.

## Current technical boundaries

The repository is a static/PWA foundation. It does not currently include a hosted account database, payment processing, live hotel inventory, booking fulfillment, affiliate credentials or universal smart-lock integration.

## Deployment

The project is configured for GitHub Pages. The latest Pages deployment workflow completed successfully on September 26, 2026.

## Buyer documentation

- [BUYER-PACKAGE.md](./BUYER-PACKAGE.md)
- [BUYER-HANDOFF.md](./BUYER-HANDOFF.md)
- [BUYER-FAQ.md](./BUYER-FAQ.md)
- [MONETIZATION.md](./MONETIZATION.md)
- [SALE-LISTING.md](./SALE-LISTING.md)
- [SELLER-HANDOFF.md](./SELLER-HANDOFF.md)

## Sale package

The repository includes a ready-to-use sale listing and seller handoff guide so a buyer can review the product, technical boundaries and transfer terms in one place.

## Security

Do not place passwords, payment card numbers, API secrets or private credentials in this repository.
