# Hotel Easy Pass

Hotel Easy Pass is a mobile-first travel toolkit built as a lightweight Progressive Web App.

## Current features
- Hotel stay dashboard with check-in/check-out details
- Check-in countdown
- Trip sharing
- Nearby food, attractions, groceries, gas, pharmacy, coffee, laundry and ATMs
- Travel marketplace for hotels, experiences, flights and day passes
- Trip budget calculator
- Rewards wallet
- Hotel and packing checklists
- Tip calculator
- Trip notes
- Emergency quick links
- PWA install support
- Privacy and terms pages
- SEO files and custom 404 page

## Revenue architecture
The marketplace is prepared for approved affiliate/deep links, but the current outbound links are ordinary links until real partner tracking is connected. Actual revenue and user-growth metrics must be measured after deployment and partner approval.

## Buyer-ready metrics to add later
- Monthly active users
- Returning users
- Marketplace click-through rate
- Completed bookings
- Monthly affiliate revenue
- Revenue per active user
- Acquisition sources
- Operating costs and profit

## Deployment
This project can be hosted with GitHub Pages. Keep `index.html` at the top level of the published source.

## Important
Do not place passwords, payment card numbers, API secrets or private credentials in this repository.


## Two-sided package
- Public landing page with separate Traveler Pass and Hotel Owner Hub entry points.
- Dedicated traveler.html experience using the existing travel toolkit.
- Dedicated owner.html workspace for property profiles and offer drafts.
- Core owner/traveler drafts are stored locally on the user's device until live accounts/backend services are connected.
