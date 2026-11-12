# Hotel Easy Pass — Expo native foundation

This branch replaces the previous WebView wrapper with a real React Native screen foundation. The current production PWA remains untouched on main.

## Free stack
- Expo SDK 57 / React Native 0.86 / React 19
- Supabase Free: Auth, Postgres and private Storage
- AsyncStorage for Supabase sessions
- expo-secure-store for a user's own AI provider key
- Expo Go for phone testing; no EAS paid build scripts or paid plugins

## Run
Open this folder as an Expo project or copy it into Expo Snack. Use the Snack dependency picker or `npx expo install --fix` to align Expo modules. Set the Supabase URL and publishable key in `src/lib/supabase.ts` for Snack, or in a local `.env`. Run `supabase/schema.sql` only in this app's dedicated Supabase project.

## Included mobile modules
- Traveler trip dashboard and preferences
- Saved places, trip notes and packing workflow
- Hotel-owner property and promotion workspace
- AI key settings screen (optional, user-provided key)

This is an implementation foundation, not a finished or store-tested application. Store builds/signing and app-store accounts are not included in the zero-paid-tool scope.
