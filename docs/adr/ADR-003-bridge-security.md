# ADR-003: Secure Bridge & Trusted Runtime

**Status:** Accepted

**Date:** 2026-06-28

**Phase:** Phase -1 – Sandbox Feasibility Spike

**Authors:** Mayur

---

# Context

The Novus architecture executes application code inside a sandboxed iframe, which intentionally lacks access to privileged browser APIs and extension resources.

However, embedded applications must still perform operations such as reading workspace data, interacting with browser storage, and invoking privileged extension functionality.

A secure communication mechanism is therefore required between the untrusted sandbox and the trusted extension runtime.

---

# Decision

Adopt a message-based communication architecture consisting of:

```text
Sandboxed React Application
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

The **Trusted Runtime** is the only component permitted to execute privileged extension operations.

All requests originating from the sandbox must pass through the **Secure Bridge**, where they are validated before reaching the runtime.

The bridge enforces:

* Typed message envelopes
* Origin validation
* Source validation
* Capability token validation
* Route epoch validation
* Replay protection

No direct communication between the sandbox and privileged extension APIs is permitted.

---

# Rationale

This architecture centralizes all authorization decisions within a single trusted component.

Benefits include:

* Single point of security enforcement.
* Reduced attack surface.
* Consistent request validation.
* Strong separation between trusted and untrusted code.
* Easier auditing and future API expansion.

By treating every sandbox request as untrusted input, the architecture follows a zero-trust communication model.

---

# Alternatives Considered

## Direct Chrome Runtime Messaging

**Rejected**

Would expose privileged messaging directly to untrusted application code and scatter authorization logic across multiple components.

---

## Exposing Extension APIs to the Sandbox

**Rejected**

Violates the Principle of Least Privilege and significantly increases the attack surface.

---

## Multiple Independent Bridges

**Rejected**

Introduces unnecessary complexity and duplicates validation logic.

---

# Consequences

## Benefits

* Centralized authorization.
* Strong trust boundary.
* Consistent validation pipeline.
* Easier testing and auditing.
* Extensible API design.

---

## Trade-offs

* Additional message-passing overhead.
* Increased implementation complexity.
* Every privileged request incurs validation before execution.

These trade-offs are acceptable given the security benefits.

---

# Phase -1 Validation

The communication architecture was validated during Phase -1.

The following controls were successfully verified:

* ✅ Typed message envelopes.
* ✅ Origin validation.
* ✅ Source validation.
* ✅ Capability token validation.
* ✅ Replay protection.
* ✅ Route epoch validation.
* ✅ Unauthorized requests rejected.
* ✅ Malformed messages rejected.

All bridge communication successfully enforced the intended trust boundary.

---

# Related Documents

* `docs/security/threat-model.md`
* `docs/security/checklist.md`
* `docs/security/attack-simulation.md`
* `docs/security/findings.md`
* `docs/adr/ADR-001-overall-architecture.md`
* `docs/adr/ADR-002-sandbox-isolation.md`

---

# Approval

**Decision**

✅ Accepted

**Approved By**

Mayur

**Date**

YYYY-MM-DD
