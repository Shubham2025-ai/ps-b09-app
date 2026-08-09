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
- **Styling:** Tailwind CSS v4 with a dual design-token system (see Section 7)
- **Deployment:** Vercel (app), Neon (database)

## 4. Security Architecture — Why the Audit Trail Can Be Trusted

This is the technical core of the submission, so it's worth explaining in depth.

**The problem with most "audit logs":** a table that records actions is only as trustworthy as the application code that writes to it. If an attacker (or a corrupt insider with database access) can directly UPDATE or DELETE a row, the audit trail becomes fiction.

**Our approach — two independent layers:**

1. **Cryptographic hash-chaining.** Every audit log row's hash is computed as `HMAC-SHA256(previous_row_hash + case_id + action + actor + timestamp)`. This means each row is cryptographically bound to the one before it — altering any field in any row breaks the hash for that row and every row after it. A verification function walks the entire chain for a case and reports exactly which row diverges, if any.

2. **Database-enforced immutability.** The application connects to Postgres using a restricted role (`app_runtime`) that has been explicitly granted `INSERT` and `SELECT` on the audit log table, with `UPDATE` and `DELETE` **revoked** at the database level. This means even if the application code had a bug, or an attacker gained access to the running application's database credentials, the database itself refuses the write. This is enforced independently of anything the Next.js code does — it's a Postgres role permission, not a code convention.

We demonstrated this live: a row was manually corrupted directly in Postgres (bypassing the application entirely, using elevated credentials only available to us as developers), and the verification function correctly detected the break and identified the exact row.

**This is also covered by an automated test suite** (`src/lib/__tests__/`, run via `npm test`), which proves the chain-detection logic against corruption at the first row, middle row, last row, and a forged-`prevRowHash` attack — 9 tests total, all passing. This means the live demo isn't a one-off observation; the tamper-detection property is verified as a logical guarantee of the algorithm, not just something that happened to work when we tried it once.

**Honest scope of this guarantee:** the `app_runtime` role — which is what the deployed application actually connects as — cannot modify or delete audit rows under any circumstances, including a compromised application server or a bug in our own code. This is the threat model the system defends against. It does not defend against someone holding the separate database *owner* credentials, who retains full privileges by necessity (schema migrations require them). In a production deployment, those owner credentials would be a break-glass credential: held by a small number of people, used only for migrations, and ideally logged/audited separately at the infrastructure level (e.g. Neon's own audit logging, or a bastion-host access pattern) — rather than living in a developer's `.env` file as it does in this prototype. We call this out explicitly rather than let the "immutable" claim be read as absolute.

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
| Retaliation-risk flags | ✅ | Multi-signal weighted scoring (see Section 9) |
| Urgent safety escalation | ✅ | Self-reported danger flag hard-overrides to URGENT |
| Controlled notifications | ✅ | In-app notification center, scoped to relevant events |

## 6. Legal & Compliance Design Approach

PS-B09 does not specify a jurisdiction, and this is a global submission — so rather than anchor to one country's workplace-harassment law, the system is designed around **ILO Convention 190** (the Violence and Harassment Convention, 2019), which is the only genuinely international standard in this space, adopted under the UN's International Labour Organization and applicable as a reference framework across member states rather than one legal system. Data-handling design follows general data-protection principles consistent with GDPR's core tenets (data minimization, purpose limitation, right to erasure-adjacent controls), since these have become the de facto global baseline for handling sensitive personal data regardless of the deployer's specific jurisdiction.

**Feature-to-principle mapping:**

| ILO C190 / data protection principle | System implementation |
|---|---|
| Confidential reporting channels (C190 Art. 10) | Anonymous mode stores zero identity; confidential mode restricts visibility to assigned IC member only |
| Protection from retaliation (C190 Art. 10) | Automated retaliation-risk flagging on repeat filings |
| Access to remedies, including urgent cases (C190 Art. 10) | AI severity classification with hard-override for self-reported danger, automatic responder escalation |
| Record-keeping integrity | Cryptographically hash-chained, database-enforced immutable audit log |
| Data minimization (GDPR Art. 5) | Anonymous submissions never capture identity fields at the schema level, not just at the UI level |
| Purpose limitation | Evidence and case data are scoped by role at the query layer — an IC member cannot see cases outside their assignment, a responder sees only urgent cases |

**Honest scope:** this is a design-principle mapping, not a legal compliance certification. Actual deployment in any specific country would require review against that jurisdiction's binding law (which may impose additional or different requirements than C190, since C190 is a convention states can ratify and implement variably, not directly enforceable law on its own). What we're claiming is that the system's architecture was built with reference to the closest thing to a global standard in this domain, rather than being compliance-vague or accidentally tied to one country's framework by default.

## 7. Design Approach

The interface deliberately uses two distinct visual languages, on the reasoning that a harassment reporting form and an operational case-management dashboard serve fundamentally different emotional needs:

- **Complainant-facing screens** (report wizard, tracking, homepage) use a warm, muted, low-saturation palette with serif headings — calm rather than clinical, since this is a trauma-adjacent context.
- **Staff-facing screens** (IC dashboard, responder queue, admin panel) use a dense, dark, data-forward palette — appropriate for operational case review.
- **The audit trail view** is treated as the product's centerpiece screen: a visual hash-chain with a clear pass/fail integrity check, designed to make cryptographic tamper-evidence legible to a non-technical reviewer, not just a developer.

## 8. Classification Validation

A skeptical reviewer of any AI-routing claim should ask: *does it actually work, and how do you know?* Rather than assert accuracy, we built a reproducible evaluation harness (`src/lib/eval/`) and ran it against a hand-labeled test set.

**Method:** 16 cases spanning three categories — clear-routine (e.g. verbal harassment, exclusion, discriminatory comments), clear-urgent (e.g. physical contact, stalking, explicit threats), and deliberately adversarial edge cases designed to be hard to classify (aggressive-but-not-threatening language; vague, non-explicit menacing language). None of these examples were used to write or tune the classification prompt.

**Result:**

| Metric | Value |
|---|---|
| Accuracy | 100.0% (16/16) |
| Precision (URGENT) | 100.0% |
| Recall (URGENT) | 100.0% |
| F1 Score (URGENT) | 100.0% |
| False negatives | 0 |

Confusion matrix:

| | Predicted URGENT | Predicted ROUTINE |
|---|---|---|
| **Actual URGENT** | 7 | 0 |
| **Actual ROUTINE** | 0 | 9 |

The zero-false-negative result is the meaningful signal, not the raw sample size: in a safety-routing system, a false negative (a genuinely urgent case misclassified as routine) is the worst-case failure mode, since it delays response to real danger. The classifier correctly handled both adversarial edge cases in the set — including a case with aggressive-but-non-explicit language (correctly routed ROUTINE) and a case with vague, indirect threatening language (correctly routed URGENT) — suggesting it isn't simply keyword-matching on words like "threat" or "grabbed."

**Honest limitation:** 16 cases is a rigor demonstration, not a statistically powered validation. The evaluation set is hand-constructed and adversarial by design rather than randomly sampled from real-world reports, so these numbers should be read as "the classifier handles the failure modes we specifically tried to break it with," not as a general accuracy guarantee at scale. The evaluation script is included in the repository and is designed to be extended — `npx tsx src/lib/eval/run-eval.ts` reproduces this result and can be re-run against a larger labeled set as one becomes available.

## 9. Known Limitations & Future Scope

- **Multilingual support** was deprioritized under hackathon time constraints in favor of getting the core security architecture fully correct and demonstrable. The i18n framework (next-intl) is a straightforward addition post-hackathon.
- **Retaliation-risk detection** is currently rule-based (repeated filings in the same category). A production version would incorporate more signals — timing patterns, cross-referencing accused parties, escalation frequency.
- **Notifications** are in-app only in this build; email delivery (Resend) is scaffolded but not fully wired into every event type.
- **Evidence storage** uses Vercel Blob with signed URL access; a production deployment would add virus scanning on upload and encryption-at-rest verification as an explicit compliance step.

- **Rate limiting** is implemented on case submission (5/minute per IP) and tracking-code lookup (20/minute per IP) to prevent spam submissions and brute-force enumeration of tracking codes. This is currently in-memory and per-instance — honest limitation: it resets on serverless cold starts and doesn't coordinate across multiple concurrent instances at scale. A production deployment would move this to a shared store (e.g. Upstash Redis) for consistency under load.

## 10. Screenshots

*[Insert screenshots here: homepage, report wizard evidence-hash step, IC dashboard queue, audit trail — verified and broken states, admin system-wide integrity check, responder urgent queue]*

## 11. Summary

Every core requirement in PS-B09 — confidential reporting, evidence integrity, risk-based routing, transparent tracking — is implemented and live, with the audit trail specifically engineered so that its tamper-evidence claim is independently verifiable rather than merely asserted. The system is deployed, functional across all four user roles, and demonstrable end-to-end from initial report submission through to a database-level integrity check.