Perfect. Next is **ADR-002**, which documents one of the most important decisions in Novus: **why the UI runs inside a sandboxed iframe mounted inside a Closed Shadow DOM**.

---

# ADR-002: Sandboxed iframe & Closed Shadow DOM

**Status:** Accepted

**Date:** 2026-06-28

**Phase:** Phase -1 – Sandbox Feasibility Spike

**Authors:** Mayur

---

# Context

Novus embeds applications into third-party websites that are outside the extension's control.

The embedded application must:

* Remain visually isolated from the host page.
* Be protected from accidental interference by the host page.
* Be prevented from accessing privileged browser APIs.
* Prevent untrusted application code from directly interacting with extension internals.
* Comply with Chrome Manifest V3 security requirements.

A secure isolation mechanism was therefore required.

---

# Decision

Adopt the following UI architecture:

```text
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
```

The **Closed Shadow DOM** provides DOM encapsulation and reduces interference between the host page and the extension UI.

The **sandboxed iframe** provides the primary security boundary by executing the React application in an isolated browser context with restricted permissions.

All privileged operations are delegated to the Trusted Runtime through the Secure Bridge.

---

# Rationale

This design provides multiple independent layers of protection.

## Closed Shadow DOM

Used for:

* UI encapsulation
* Style isolation
* Preventing accidental DOM manipulation
* Reducing interaction with host page scripts

It is **not** considered a security boundary.

---

## Sandboxed iframe

Provides:

* Browser-enforced execution isolation
* Restricted JavaScript environment
* No direct access to extension APIs
* No direct access to host page resources

The iframe is treated as an **untrusted execution environment**.

---

# Alternatives Considered

## React inside Content Script

**Rejected**

Would execute untrusted application code inside a privileged extension context.

---

## Shadow DOM without iframe

**Rejected**

Shadow DOM improves encapsulation but does not isolate JavaScript execution.

---

## Direct DOM Injection

**Rejected**

Exposes the application to host page interference and significantly increases the attack surface.

---

# Consequences

## Benefits

* Strong browser-enforced isolation.
* Clear separation of trusted and untrusted code.
* Reduced attack surface.
* Manifest V3 compatible.
* Supports secure future expansion.

---

## Trade-offs

* Additional message passing between contexts.
* More complex lifecycle management.
* Slight runtime overhead from iframe isolation.

---

# Phase -1 Validation

The following assumptions were successfully validated:

* ✅ Closed Shadow DOM mounts correctly.
* ✅ React application executes inside sandbox.
* ✅ CSP restrictions enforced.
* ✅ No access to `chrome.*`
* ✅ No access to `window.parent`
* ✅ No access to `window.top`
* ✅ No access to host DOM.
* ✅ No access to extension DOM.
* ✅ Sandbox escape attempts unsuccessful.

The sandbox architecture satisfies the isolation requirements established for Phase -1.

---

# Related Documents

* `docs/security/threat-model.md`
* `docs/security/checklist.md`
* `docs/security/attack-simulation.md`
* `docs/security/findings.md`
* `docs/adr/ADR-001-overall-architecture.md`

---

# Approval

**Decision**

✅ Accepted

**Approved By**

Mayur

**Date**

YYYY-MM-DD

This ADR is one of the strongest in your documentation because it justifies the core security boundary of the platform.

The last ADR, **ADR-012**, explains the communication architecture—why every privileged operation goes through a **Typed SDK → Secure Bridge → Trusted Runtime** pipeline with capability tokens, origin validation, and replay protection. It's arguably the most security-critical ADR in the project.
