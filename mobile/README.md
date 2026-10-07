# Hotel Easy Pass Mobile

Cross-platform Android and iOS application for Hotel Easy Pass.

## Architecture

This mobile package uses Expo + React Native with the existing production web application embedded in a native WebView. This gives the buyer one mobile distribution package while preserving the existing product logic and web experience.

## Development

```bash
npm install
npm start
```

## Android / iOS builds

```bash
npm run build:android
npm run build:ios
# or
npm run build:all
```

EAS Build produces installable Android/iOS binaries. Store distribution additionally requires the appropriate Google Play and Apple Developer accounts and signing credentials.

## Existing product

https://hotel-easy-pass.onrender.com

## Important

The native shell is production-oriented, but final store submission still requires app-store metadata, screenshots, privacy disclosures, developer accounts, signing, and device testing.