# Deployment Guide

Hotel Easy Pass is a static Progressive Web App and can be deployed without a server.

## GitHub Pages

The repository includes a GitHub Actions workflow at `.github/workflows/pages.yml`. It publishes the repository contents as the site artifact.

## Alternative static hosts

The included `vercel.json` provides deployment metadata for Vercel-compatible static hosting. The project does not require a build step.

Recommended deployment settings:
- Build command: none
- Output directory: repository root
- Node.js: 20 or newer when a Node runtime is requested
- HTTPS: required for service-worker/PWA features

## Important

The current product stores photo documentation locally in the browser. It does not include a hosted database, payment processor, booking engine, universal smart-lock integration, or server-side photo storage.
