# Project Report — Real-Time Workplace Harassment Reporting & Evidence Protection

**Problem Statement:** PS-B09 | Theme: Women's Safety & Empowerment
**Live Deployment:** https://ps-b09-app.vercel.app
**Repository:** github.com/Shubham2025-ai/ps-b09-app

---

## 1. Problem Summary

Workplace harassment reporting systems commonly fail on three fronts: victims don't trust that reports stay confidential, evidence can be lost or altered without detection, and urgent safety cases don't get routed with appropriate speed. PS-B09 calls for a platform that solves all three — confidential reporting, tamper-evident evidence, and risk-based routing to the correct authority — with full transparency for the person who filed the report.

## 2. Solution Overview

We built a full-stack reporting and case-management platform where every core guarantee is enforced technically, not just promised in policy:

- **Confidentiality** is structural — anonymous reports never store an identity in the database at all; confidential reports are visible only to the assigned Internal Committee (IC) member, enforced at the query layer.
- **Evidence integrity** is proven, not assumed — files are hashed (SHA-256) client-side before upload, and every action on a case (submission, viewing, status change, escalation) is recorded in an append-only audit log, chained together with HMAC hashes. If any record is altered outside the application — even directly in the database — the chain breaks at that exact point and the break is programmatically detectable.
- **Risk-based routing** is automated — an LLM classifier (Groq, Llama 3.3 70B) evaluates each report's severity in real time and routes urgent cases directly to a dedicated Responder queue with immediate notification, while routine cases enter the standard IC review process.
- **Transparency** is built into every role — complainants get a live status tracker, IC members get a full case dashboard with a visual audit trail, and administrators get a system-wide integrity check across every case in the database.

## 3. Architecture

Single Next.js 14 (App Router) codebase — frontend and backend API routes in one deployable unit, avoiding the integration overhead of a split frontend/backend stack.

```
Next.js (Vercel) ──► PostgreSQL (Neon) via Prisma
       │
       ├──► Groq API (severity classification)
       └──► Vercel Blob (encrypted evidence storage, signed URLs)
```

**Stack:**
- **Framework:** Next.js 14, App Router, Server Actions + Route Handlers
- **Database:** PostgreSQL (Neon), accessed via Prisma ORM with a driver adapter
- **Auth:** NextAuth (Credentials provider), JWT sessions carrying role claims
- **File Storage:** Vercel Blob, private access with signed URL retrieval
- **AI Classification:** Groq API (Llama 3.3 70B) for severity/category routing
- **Styling:** Tailwind CSS v4 with a dual design-token system (see Section 6)
- **Deployment:** Vercel (app), Neon (database)

## 4. Security Architecture — Why the Audit Trail Can Be Trusted

This is the technical core of the submission, so it's worth explaining in depth.

**The problem with most "audit logs":** a table that records actions is only as trustworthy as the application code that writes to it. If an attacker (or a corrupt insider with database access) can directly UPDATE or DELETE a row, the audit trail becomes fiction.

**Our approach — two independent layers:**

1. **Cryptographic hash-chaining.** Every audit log row's hash is computed as `HMAC-SHA256(previous_row_hash + case_id + action + actor + timestamp)`. This means each row is cryptographically bound to the one before it — altering any field in any row breaks the hash for that row and every row after it. A verification function walks the entire chain for a case and reports exactly which row diverges, if any.

2. **Database-enforced immutability.** The application connects to Postgres using a restricted role (`app_runtime`) that has been explicitly granted `INSERT` and `SELECT` on the audit log table, with `UPDATE` and `DELETE` **revoked** at the database level. This means even if the application code had a bug, or an attacker gained access to the running application's database credentials, the database itself refuses the write. This is enforced independently of anything the Next.js code does — it's a Postgres role permission, not a code convention.

We demonstrated this live: a row was manually corrupted directly in Postgres (bypassing the application entirely, using elevated credentials only available to us as developers), and the verification function correctly detected the break and identified the exact row.

## 5. Feature Checklist Against PS-B09

| Required Feature | Status | Implementation |
|---|---|---|
| Confidential reporting | ✅ | Role-scoped visibility, enforced server-side |
| Optional anonymous reporting | ✅ | No identity captured; random tracking code issued |
| Multilingual guided forms | ⏳ Deferred | Scoped for post-hackathon; English-only in this build |
| Secure evidence upload | ✅ | Vercel Blob, private access, signed URL retrieval |
| Tamper-evident timestamps | ✅ | HMAC hash-chain per audit row |
| Immutable audit history | ✅ | DB-level INSERT-only grant, proven via live tamper test |
| Role-based access | ✅ | 4 roles (Complainant, IC Member, Responder, Admin), enforced at query layer |
| Complaint routing | ✅ | AI severity classifier routes urgent → Responder, routine → IC |
| Real-time case tracking | ✅ | Status stepper (complainant), live queue (staff) |
| Retaliation-risk flags | ✅ | Rule-based: repeated same-category filings by same complainant |
| Urgent safety escalation | ✅ | Self-reported danger flag hard-overrides to URGENT |
| Controlled notifications | ✅ | In-app notification center, scoped to relevant events |

## 6. Design Approach

The interface deliberately uses two distinct visual languages, on the reasoning that a harassment reporting form and an operational case-management dashboard serve fundamentally different emotional needs:

- **Complainant-facing screens** (report wizard, tracking, homepage) use a warm, muted, low-saturation palette with serif headings — calm rather than clinical, since this is a trauma-adjacent context.
- **Staff-facing screens** (IC dashboard, responder queue, admin panel) use a dense, dark, data-forward palette — appropriate for operational case review.
- **The audit trail view** is treated as the product's centerpiece screen: a visual hash-chain with a clear pass/fail integrity check, designed to make cryptographic tamper-evidence legible to a non-technical reviewer, not just a developer.

## 7. Known Limitations & Future Scope

- **Multilingual support** was deprioritized under hackathon time constraints in favor of getting the core security architecture fully correct and demonstrable. The i18n framework (next-intl) is a straightforward addition post-hackathon.
- **Retaliation-risk detection** is currently rule-based (repeated filings in the same category). A production version would incorporate more signals — timing patterns, cross-referencing accused parties, escalation frequency.
- **Notifications** are in-app only in this build; email delivery (Resend) is scaffolded but not fully wired into every event type.
- **Evidence storage** uses Vercel Blob with signed URL access; a production deployment would add virus scanning on upload and encryption-at-rest verification as an explicit compliance step.

## 8. Screenshots

*[Insert screenshots here: homepage, report wizard evidence-hash step, IC dashboard queue, audit trail — verified and broken states, admin system-wide integrity check, responder urgent queue]*

## 9. Summary

Every core requirement in PS-B09 — confidential reporting, evidence integrity, risk-based routing, transparent tracking — is implemented and live, with the audit trail specifically engineered so that its tamper-evidence claim is independently verifiable rather than merely asserted. The system is deployed, functional across all four user roles, and demonstrable end-to-end from initial report submission through to a database-level integrity check.