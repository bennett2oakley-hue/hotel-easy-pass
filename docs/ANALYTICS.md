# Product Analytics

Hotel Easy Pass includes a privacy-conscious local analytics layer.

## Current implementation

- Events are stored in browser localStorage under hep_events.
- The log is capped at the latest 100 events.
- No analytics account, cookie banner, remote tracker or third-party analytics SDK is required.
- The dashboard is available at dashboard.html.
- Users can export or clear the local event log.
- Events intentionally avoid hotel-room photos, trip notes and other personal content.

## Events

The application records lightweight product events such as app_open, app_installed, maps_search, marketplace_click, marketplace_cta, room_photo_saved and emergency shortcut events.

## Production expansion

A buyer can connect a consent-based hosted analytics provider later. Any hosted implementation should document data collection, retention, user choice and applicable privacy requirements before activation.
