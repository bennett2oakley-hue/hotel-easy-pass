# Operations Guide

## Deployment options

Hotel Easy Pass is a static PWA. It can be deployed to GitHub Pages, Vercel-compatible static hosting, Netlify, or an Nginx container.

### GitHub Pages
Use the included GitHub Actions Pages workflow. The site is published from the repository contents and requires HTTPS for PWA service-worker features.

### Static hosts
Use repository root as the publish directory. No application build command is required.

### Container
Build and run:
```bash
docker build -t hotel-easy-pass .
docker run --rm -p 8080:80 hotel-easy-pass
```

## Release process

1. Make changes on a feature branch.
2. Open a pull request.
3. CI runs the smoke test.
4. Merge to `main` after checks pass.
5. GitHub Pages deployment runs automatically.
6. The package workflow creates a clean sale ZIP artifact.

## Rollback

GitHub Pages can be rolled back by reverting the problematic commit and merging the revert. Static-host deployments can be rolled back to the previous published commit or artifact.

## Runtime model

The current app is intentionally serverless/static. Core traveler data and room-photo documentation are stored in the browser's local storage/local browser context. There is no required database server.

## Production considerations for a buyer

A production expansion can add hosted authentication, a database, server-side photo storage, booking APIs, payment processing, hotel PMS integrations, analytics, and smart-lock/vendor integrations.
