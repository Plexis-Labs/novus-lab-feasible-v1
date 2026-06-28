# ADR-001: Overall Architecture

**Status:** Accepted

**Date:** YYYY-MM-DD

**Phase:** Phase -1 – Sandbox Feasibility Spike

**Authors:** Mayur

---

# Context

Novus is a Chrome Manifest V3 extension designed to embed secure, isolated applications into arbitrary web pages while preserving browser security guarantees.

The architecture must satisfy the following requirements:

* Comply with Chrome Manifest V3.
* Execute untrusted application code safely.
* Prevent direct access to privileged browser APIs.
* Support Single Page Applications (SPA).
* Maintain secure communication between untrusted and trusted components.
* Support future extensibility without compromising security.

Multiple architectural approaches were considered before implementation.

---

# Decision

Adopt a layered security architecture consisting of:

```text id="ifj0ow"
Host Website
      │
      ▼
Content Script
      │
      ▼
Closed Shadow DOM
      │
      ▼
Sandboxed iframe
      │
      ▼
React Application
      │
      ▼
Typed SDK
      │
      ▼
Secure Bridge
      │
      ▼
Trusted Runtime
      │
      ▼
Chrome Extension Services
```

The Trusted Runtime is the only component permitted to perform privileged extension operations.

All communication from the sandbox is mediated through the Secure Bridge and validated before execution.

---

# Rationale

This architecture was selected because it:

* Separates trusted and untrusted execution environments.
* Follows the Principle of Least Privilege.
* Uses browser-enforced sandbox isolation.
* Centralizes authorization within the Trusted Runtime.
* Supports future API expansion through the Typed SDK.
* Complies with Manifest V3 restrictions.

---

# Alternatives Considered

## Direct Content Script Execution

**Rejected**

Running the application directly inside the Content Script would expose privileged extension APIs to untrusted code and reduce isolation.

---

## Shadow DOM Only

**Rejected**

Closed Shadow DOM provides UI encapsulation but is not a security boundary.

---

## Background Service Worker Communication Only

**Rejected**

While suitable for privileged operations, this approach does not provide sufficient isolation for executing untrusted application code.

---

# Consequences

## Benefits

* Strong isolation between trusted and untrusted components.
* Clear trust boundaries.
* Secure lifecycle management.
* Extensible communication model.
* Reduced attack surface.

---

## Trade-offs

* Increased architectural complexity.
* Additional message passing overhead.
* More lifecycle management responsibilities.
* Higher implementation effort.

---

# Phase -1 Validation

The following architectural assumptions were validated during Phase -1:

* ✅ Manifest V3 compatibility confirmed.
* ✅ Content Script injection successful.
* ✅ Closed Shadow DOM integration validated.
* ✅ Sandboxed iframe execution validated.
* ✅ React application successfully executed inside sandbox.
* ✅ Secure Bridge communication validated.
* ✅ Trusted Runtime authorization validated.
* ✅ Route Epoch lifecycle validated.
* ✅ Browser refresh persistence validated.
* ✅ Security validation completed successfully.

---

# Related Documents

* `docs/security/threat-model.md`
* `docs/security/checklist.md`
* `docs/security/attack-simulation.md`
* `docs/security/findings.md`
* `docs/reviews/phase-minus-1-review.md`

---

# Approval

**Decision**

✅ Accepted

**Approved By**

Mayur

**Date**

YYYY-MM-DD
