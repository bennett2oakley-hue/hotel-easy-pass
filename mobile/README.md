# Hotel Easy Pass — Expo native foundation

## What is in this branch

This is the React Native / Expo starter for the existing Hotel Easy Pass project. It is kept on the `expo-native-foundation` branch; the repository's default branch is not replaced.

Included:
- `app.json`, `package.json`, `App.tsx`
- `src/screens/AISettingsScreen.tsx`
- `src/lib/secure-ai-key.ts`
- `src/lib/supabase.ts`
- `.env.example`
- `supabase/schema.sql` — one app-specific starter schema with row-level security and private storage policies

**Honest status:** the native shell, settings screen, Supabase client setup and database schema are present. The app-specific workflows, authentication screens, database CRUD wiring, and device-level QA are not complete yet. Do not describe this branch as a finished or store-ready app.

## Free stack

- Expo SDK 57, React Native 0.86.3, React 19.2.3
- Expo Go for Android development/testing
- Supabase Free for this app's own backend
- AsyncStorage for Supabase session persistence
- `expo-secure-store` for an optional user-supplied AI key on Android/iOS
- No paid AI API, EAS paid build, or paid plugin is required for this starter

## Run from an Android phone with Termux

1. Install Termux from its official F-Droid or GitHub source.
2. Open Termux and run:

```sh
pkg update -y
pkg install -y git nodejs-lts
node --version
git --version
```

Use Node.js 22.13 or newer. Then clone this branch:

```sh
git clone --branch expo-native-foundation --single-branch https://github.com/bennett2oakley-hue/hotel-easy-pass.git hotel-easy-pass
cd hotel-easy-pass/mobile
npm ci
npx expo install --fix
npx expo-doctor@latest
npx expo start --tunnel
```

3. Install the Expo Go client that matches SDK 57 from https://expo.dev/go?platform=android&device=true&sdkVersion=57. Expo Go and the project's SDK versions must match.
4. Open Expo Go. Scan the QR code if you have another screen available, or copy the `exp://` development URL from Termux and use Expo Go's manual URL option if shown.

## Supabase setup

1. Create or select a **dedicated Supabase project for Hotel Easy Pass** on the Free plan. Do not reuse another app's database or run this schema in a populated unrelated project.
2. In Supabase SQL Editor, review and run the complete `supabase/schema.sql` file.
3. Copy the project's URL and **publishable** key (not the service-role/secret key).
4. For a local Expo run, copy `.env.example` to `.env` and fill in the two `EXPO_PUBLIC_` values. For Snack, replace the two placeholders in `src/lib/supabase.ts`.
5. Never commit `.env`, a service-role key, or any other secret.

The Supabase client and schema are prepared, but the current starter screens do not yet use them for the app's complete sign-in and data workflows.

## AI key handling

The settings screen stores an optional key supplied by the app owner/user in Android/iOS secure storage. On web, the current fallback is memory-only. **Saving a key does not mean an AI feature is implemented or that the key has been tested against a provider.** No AI request is sent by this foundation.

## Checks already run

GitHub Actions on this branch successfully completed:
- dependency installation
- Expo SDK package compatibility check
- Expo Doctor
- Android JavaScript bundle export

These checks validate the Expo project and bundle. They do not replace running the app on a physical phone, connecting a Supabase project, testing sign-in/data access, or store review.

## Current file layout

```text
mobile/
  README.md
  app.json
  package.json
  App.tsx
  .env.example
  src/
    screens/
      AISettingsScreen.tsx
    lib/
      secure-ai-key.ts
      supabase.ts
  supabase/
    schema.sql
```

Expo version references:
- SDK 57: https://docs.expo.dev/versions/v57.0.0/
- Android Expo Go version selector: https://expo.dev/go


## Existing backend configured for this branch

- Supabase project: `hotel-easy-pass` in the existing Free organization, region `us-east-2`
- Project reference: `edwnfpxprznbdjvneiaq`
- Project URL is set as the client fallback in `src/lib/supabase.ts`; the publishable key is also set there and is not a service-role secret.
- The app-specific SQL schema has been applied and verified: five public tables have RLS enabled with owner-scoped policies, and the private `hotel-easy-pass` Storage bucket exists.
- Supabase Security Advisors returned no findings after the trigger function search path was hardened.

The current React Native screens are still a foundation: they do not yet implement sign-up/sign-in or trip/property CRUD against these tables.

The checked-in `package-lock.json` pins the full dependency tree; use `npm ci` for repeatable installs.
