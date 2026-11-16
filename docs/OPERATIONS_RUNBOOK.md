# Hotel Easy Pass — Operating Runbook

**Purpose:** enable a buyer or operator to run the product without relying on the original creator.
**Status:** draft operating controls; not proof that all product workflows are production-ready.

## Current operating boundary
- Public web site: https://hotel-easy-pass.onrender.com
- Hosting: Render; current production service must be verified in the Render dashboard before a transfer.
- Source of truth: GitHub repository; acquisition work is on `buyer-readiness` and is not merged or deployed.
- Supabase project exists on the free tier with core tables, owner-scoped RLS and a private storage bucket. The current traveler/owner UI has not been verified as connected to authentication, CRUD or storage.
- Payments, hotel booking, hotel-room unlocking and any third-party reservation integrations must be treated as unavailable unless separately demonstrated.

## Daily operations
1. Review uptime and Render service health.
2. Review application errors and hosting resource usage.
3. Review Supabase project health, database usage and storage usage.
4. Triage customer reports; record severity, affected user, time, reproduction steps and resolution.
5. Do not manually edit customer records in production without an approved, logged procedure.

## Customer and property operations
- Do not onboard real hotel owners or accept traveler data until sign-in, role separation, owner-scoped access and end-to-end traveler/owner workflows are tested.
- When enabled, validate each property owner against the correct property and test with two separate accounts.
- Keep promotional content and property data accurate; record who approved each change.
- Provide a documented support route and response-time policy before commercial launch.

## Release procedure
1. Work on a feature branch; open a pull request.
2. Require CI success, code review and a recorded test result.
3. Deploy to staging first where available.
4. Verify traveler, owner, authorization, upload, mobile and offline behavior.
5. Obtain release approval, deploy, run smoke tests and record the deployment ID.
6. If smoke tests fail, roll back to the last known-good deployment and record the incident.
7. Never merge or deploy the current buyer-readiness branch without explicit owner approval.

## Security and privacy
- Keep Supabase service-role keys and all secrets out of browser/mobile code and Git.
- Verify RLS with two independent accounts; test that one user cannot read or alter another user's trips, saved places, property records or files.
- Use private storage and short-lived signed URLs for private uploads.
- Establish privacy notice, retention, deletion, export and account-closure procedures before collecting real customer data.
- Rotate credentials after any suspected exposure and at ownership transfer.

## Backup, recovery and continuity
- Configure and document database backups and retention with the actual provider settings.
- Perform a restore drill into a separate non-production project before claiming recoverability.
- Export source, schema/migrations, storage inventory and configuration (never secrets) before closing.
- Record recovery owner, recovery time objective and recovery point objective; these are currently unset.

## Monthly cost control
- Record Render, Supabase, domain, email, monitoring, maps, AI and other provider costs.
- Set usage alerts and a buyer-approved monthly ceiling.
- The current configuration is intended to remain on free tiers; free-tier limits and provider policies can change.
- Do not activate paid integrations or payment processing without explicit approval.

## Ownership transfer checklist
- Transfer GitHub repository ownership or grant buyer-admin access.
- Transfer Render service and deployment access, Supabase project ownership, domain/DNS and support mailbox.
- Export database and storage; verify buyer can restore and operate them.
- Rotate all secrets; revoke seller access only after buyer acceptance.
- Transfer privacy, support, incident, release and backup procedures.
- Obtain written acceptance of known limitations and the final asset inventory.

## Open buyer-critical gates
- [ ] Traveler journey works end to end.
- [ ] Hotel-owner onboarding and property management work end to end.
- [ ] Authentication, role checks and cross-account isolation pass.
- [ ] Upload/download and private storage policies pass.
- [ ] Real-device Android and browser testing completed.
- [ ] Backup restore demonstrated.
- [ ] Monitoring, support route, privacy terms and cost ceilings documented.
- [ ] Deployment and ownership transfer rehearsed.
