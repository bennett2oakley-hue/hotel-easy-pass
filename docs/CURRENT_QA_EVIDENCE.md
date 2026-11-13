# Current QA evidence — Hotel Easy Pass

**Status: NOT BUYER-READY — engineering foundation only**

## Verified
- Supabase project was created on the free tier.
- Core tables, owner-scoped row-level security policies, indexes and a private storage bucket were applied.
- Supabase security and health advisors previously returned no findings.
- Expo native foundation exists on branch `expo-native-foundation`.
- GitHub CI previously passed dependency installation, Expo compatibility check, Expo Doctor and Android JavaScript bundle export.

## Not verified / still open
- Traveler journey from trip creation through saved places and trip completion.
- Hotel-owner onboarding, property management, promotions and role separation.
- Supabase authentication, CRUD, storage upload/download and cross-account isolation from actual client screens.
- End-to-end browser and physical Android tests.
- Production deployment, domain ownership, backup restore and mobile store packaging.
- Native screens currently constitute a starter shell; complete feature parity is not established.

## Release gate
Do not list as a fully functioning travel marketplace until the above journeys are implemented, tested with separate traveler/owner accounts, and evidenced in a production-like environment.
