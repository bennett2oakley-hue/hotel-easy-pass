# Hotel Easy Pass — Buyer Due-Diligence & Handover Pack

**Status: WORK IN PROGRESS — NOT CERTIFIED FOR PRODUCTION TRANSFER**

This document is the operational handover baseline. It deliberately distinguishes verified facts from items that must be tested by the seller and buyer. Do not represent this product as fully production-ready until every release gate is evidenced.

## 1. Architecture and build inventory

- Primary source repository: this repository.
- Native Expo foundation (if present): `mobile/`; branch `expo-native-foundation`.
- The native Expo foundation is a starter shell, not proof that all product workflows have been ported.
- Record the production web URL, hosting service, current deployment ID, DNS provider, registrar and support contacts in the private handover register before closing.
- Record each external service and its owner in the transfer matrix below. Never put secret values in Git.

## 2. Critical bug and security checklist (priority order)

### P0 — release blockers
- [ ] Rotate any credential that has ever been committed, logged, pasted into chat, or shared with a contractor.
- [ ] Confirm no service-role key, database password, Stripe secret, signing key, OAuth client secret or private token exists in client bundles, Git history, build logs or screenshots.
- [ ] Confirm every private record is protected by server-side authorization and row-level security; test cross-account reads and writes with two separate accounts.
- [ ] Confirm authentication, password reset, account deletion, session expiry and role changes.
- [ ] Confirm payment flows (if enabled) use server-created checkout sessions, verified webhook signatures, idempotency and safe retry handling. Do not enable live payments until tested end-to-end.
- [ ] Confirm user uploads use private storage, ownership checks, file-size/type limits, signed URLs and retention/deletion rules.
- [ ] Verify backup/restore and data export before transferring customer data.

### P1 — buyer acceptance
- [ ] Run clean dependency install and production build from a fresh clone.
- [ ] Run type checks, lint, unit tests, integration tests and browser/mobile smoke tests.
- [ ] Test empty, slow, offline, unauthorized, duplicate-submit and server-error states.
- [ ] Verify all advertised features against actual implemented behavior; remove or label placeholders and demo data.
- [ ] Check accessibility, responsive layouts, keyboard navigation and current supported browsers/devices.
- [ ] Review dependency vulnerabilities, abandoned packages, licenses and lockfile consistency.

### P2 — reliability and scale
- [ ] Add structured, redacted logs; error monitoring; uptime checks; alert ownership and incident runbooks.
- [ ] Add pagination, bounded queries, indexes based on query plans, rate limits and abuse controls.
- [ ] Define capacity assumptions, cost ceilings, retention periods and recovery objectives.
- [ ] Document third-party service limits and fallback behavior.

## 3. Codebase cleanup plan

1. Inventory routes, endpoints, database tables, storage buckets, scheduled jobs, integrations and environment variables.
2. Search for hardcoded secrets and credential-like strings; rotate exposed credentials before removing them from current code. Git-history cleanup is a separate coordinated operation.
3. Remove dead routes, unused components, stale prototypes, duplicate dependencies and demo records only after confirming they are not production dependencies.
4. Replace magic values with documented configuration; validate all server-side inputs and authorize every object access.
5. Keep generated output, local environment files, logs, uploads and build artifacts out of version control.
6. Pin dependencies with the committed lockfile; document supported Node/runtime versions.
7. Keep schema migrations versioned and reversible; never edit production data/schema without a backup and a reviewed migration.
8. Maintain a changelog, architecture diagram, threat model and release evidence.

## 4. Operational SOPs to deliver

- **SOP-01 Release:** branch policy, review, CI checks, staging, approval, deployment, smoke test and rollback.
- **SOP-02 Account administration:** create/disable users, roles, password resets, MFA and account deletion.
- **SOP-03 Data operations:** backup schedule, restore drill, export, retention, deletion and migration.
- **SOP-04 Incident response:** severity levels, triage, containment, credential rotation, customer notice and postmortem.
- **SOP-05 Security:** access reviews, key rotation, dependency updates, vulnerability handling and audit evidence.
- **SOP-06 Billing/integrations:** payment reconciliation, webhook replay, refunds, failed-payment handling and provider outage.
- **SOP-07 Support/content:** customer support, moderation (if applicable), content corrections and escalation.
- **SOP-08 Cost and capacity:** monthly service review, usage limits, alerts and scaling decision triggers.
- **SOP-09 Disaster recovery:** RPO/RTO, restore steps, DNS failover and owner contact tree.
- **SOP-10 Ownership transfer:** transfer order, access validation, buyer acceptance, seller offboarding and credential rotation.

## 5. Asset transfer register

Complete this register privately before closing. Do not place secret values in this repository.

| Asset | Record / transfer requirement | Status |
|---|---|---|
| Source control | Repository URL, owner, default branch, branch protection, collaborators, issues and Actions | To verify |
| Hosting | Provider, service/project ID, deployment history, build command, runtime, rollback | To verify |
| Domain | Registrar, registrant, renewal date, DNS zone, nameservers, TLS certificate | To verify |
| Database | Provider/project/region, schema migrations, RLS, backup/export, restore evidence | To verify |
| File storage | Buckets, privacy, upload policies, retention and export | To verify |
| Authentication | Provider, OAuth apps, redirect URLs, email sender, MFA and recovery | To verify |
| Payments | Stripe account owner, products/prices, webhook endpoints, dispute/refund history | To verify |
| AI/API providers | Provider, model/service, usage limits, billing owner, key rotation procedure | To verify |
| Mobile stores | Apple Developer team, App Store Connect app, Google Play Console app, signing keys | To verify / not assumed |
| Analytics/monitoring | Provider, property IDs, alert routes, error-report access | To verify |
| Legal/customer records | Privacy policy, terms, data processing agreements, consent and deletion process | Legal review required |

Transfer account ownership through each provider's official team/ownership controls. Do not hand over personal passwords. Buyer should create their own MFA and recovery methods, then seller access should be removed after acceptance.

## 6. Buyer acceptance evidence

Attach dated evidence for:
- clean clone/build/test output;
- production URL and deployment ID;
- role-based access tests using two accounts;
- security advisor and dependency scan results;
- backup and successful restore drill;
- payment sandbox and webhook test (if applicable);
- mobile device/browser matrix;
- known-issues register and feature-to-test traceability;
- completed asset register and SOP sign-off.

## 7. Known limitations / sign-off

Until evidence is attached, all unchecked items remain open. A successful CI bundle export alone does not prove production readiness, complete feature functionality, mobile device behavior, security, or ownership transfer.

**Seller sign-off:** ____________________  **Date:** __________

**Buyer acceptance:** __________________  **Date:** __________
