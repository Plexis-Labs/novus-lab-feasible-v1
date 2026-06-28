# Threat Model

> Defines the security model of the Novus architecture, including protected assets, trust boundaries, attack surfaces, and security assumptions validated during **Phase -1 – Sandbox Feasibility Spike**.

---

# Document Information

| Field      | Value    |
| ---------- | -------- |
| Project    | Novus    |
| Phase      | Phase -1 |
| Assignment | P-1-E001 |
| Author     | Mayur    |
| Status     | Complete |

---

# System Overview

Novus is a Chrome Manifest V3 extension that embeds isolated applications into arbitrary web pages.

The architecture separates **trusted extension components** from **untrusted application code** using a sandboxed iframe. All privileged operations are performed exclusively by the Trusted Runtime after authorization through a secure bridge.

```text
Host Website
      │
Content Script
      │
Closed Shadow DOM
      │
Sandboxed iframe
      │
React Application
      │
Typed SDK
      │
Secure Bridge
      │
Trusted Runtime
```

---

# Security Goals

* Protect privileged extension APIs.
* Prevent sandbox escape.
* Prevent unauthorized runtime access.
* Prevent replay attacks.
* Ensure least-privilege communication.
* Maintain secure lifecycle during SPA navigation and browser refresh.

---

# Protected Assets

* Capability Tokens
* Runtime State
* Workspace Data
* Bridge Messages
* Route Epochs
* Extension Storage

---

# Trust Boundaries

The following trust boundaries exist:

1. Host Website → Content Script
2. Content Script → Sandboxed iframe
3. Sandboxed iframe → Secure Bridge
4. Secure Bridge → Trusted Runtime

Every boundary requires explicit validation before privileged operations are permitted.

---

# Threat Actors

The architecture considers the following attackers:

* Malicious webpage
* XSS executing on the host page
* Compromised sandbox application
* Curious user using DevTools
* Malicious browser extension
* Stale or replayed client requests

---

# Attack Surfaces

The following interfaces accept external input:

* Content Script Injection
* Bridge (`postMessage`)
* Typed SDK
* Chrome Runtime Messaging
* Browser Navigation
* Persistent Storage

---

# Security Assumptions

The architecture relies on the following assumptions:

* Chrome Manifest V3 security guarantees remain intact.
* Content Scripts execute in Chrome's isolated world.
* Browser sandbox restrictions are enforced.
* The sandbox cannot access privileged extension APIs.
* All privileged operations pass through the Trusted Runtime.
* Capability Tokens are short-lived and validated.
* Route Epochs invalidate stale permissions.
* Every bridge message is authenticated and validated.

---

# Risks

The following residual risks remain:

* Browser vulnerabilities affecting sandbox isolation.
* Malicious extensions with elevated permissions.
* Future Manifest V3 platform changes.

These risks are considered acceptable and do not block Phase 0.

---

# Phase -1 Validation

The following controls were successfully validated:

* ✅ Content Script injection
* ✅ Closed Shadow DOM isolation
* ✅ Sandboxed iframe execution
* ✅ React application sandboxing
* ✅ Typed bridge communication
* ✅ Origin validation
* ✅ Capability token validation
* ✅ Replay protection
* ✅ Route epoch invalidation
* ✅ Browser refresh persistence
* ✅ Sandbox escape prevention

---

# References

* `docs/security/checklist.md`
* `docs/security/attack-simulation.md`
* `docs/security/findings.md`
* `docs/reviews/phase-minus-1-review.md`

---

# Approval

**Author:** Mayur

**Reviewer:** __________________

**Decision:**

* [x] Approved
* [ ] Approved with Comments
* [ ] Changes Requested
