# Attack Simulation Report

> Documents the security attack simulations executed during **Phase -1 – Sandbox Feasibility Spike** to validate the Novus security architecture.

---

# Document Information

| Field      | Value    |
| ---------- | -------- |
| Project    | Novus    |
| Phase      | Phase -1 |
| Assignment | P-1-E003 |
| Author     | Mayur    |
| Status     | Complete |

---

# Objective

The purpose of this report is to validate that every trust boundary within the Novus architecture correctly enforces its security guarantees.

Each simulation attempts to violate a security property of the system. Successful validation means the attack is rejected without compromising privileged resources.

---

# Test Environment

* Chrome Manifest V3 Extension
* Development Build
* Local Test Website
* SPA Navigation Enabled
* React Sandbox Application
* Trusted Runtime Enabled
* Capability Tokens Enabled
* Route Epoch System Enabled

---

# Attack Simulations

## SEC-001 — Forged Bridge Message

**Objective**

Attempt to invoke the Trusted Runtime without a valid capability token.

**Expected Result**

The bridge rejects the request before it reaches the Trusted Runtime.

**Result**

✅ Passed

---

## SEC-002 — Replay Attack

**Objective**

Reuse a previously accepted request.

**Expected Result**

Replay protection detects the reused nonce and rejects the request.

**Result**

✅ Passed

---

## SEC-003 — Expired Capability Token

**Objective**

Reuse an expired capability token.

**Expected Result**

Runtime rejects the request.

**Result**

✅ Passed

---

## SEC-004 — Wrong Route Token

**Objective**

Reuse a token after SPA navigation.

**Expected Result**

Route Epoch validation rejects the stale token.

**Result**

✅ Passed

---

## SEC-005 — Wrong Tab Token

**Objective**

Attempt to reuse a token from another browser tab.

**Expected Result**

Runtime rejects the request.

**Result**

✅ Passed

---

## SEC-006 — Spoofed iframe

**Objective**

Create an unauthorized iframe and attempt bridge communication.

**Expected Result**

Origin validation rejects the message.

**Result**

✅ Passed

---

## SEC-007 — Fake Message Source

**Objective**

Forge the message sender.

**Expected Result**

Bridge rejects the request.

**Result**

✅ Passed

---

## SEC-008 — Sandbox Escape

**Objective**

Attempt to escape the sandbox.

**Attempted Operations**

* `window.parent`
* `window.top`
* `chrome.runtime`
* `document.cookie`
* Host DOM access
* Extension DOM access
* `eval()`
* `Function()`

**Expected Result**

Browser sandbox prevents all privileged access.

**Result**

✅ Passed

---

## SEC-009 — Malformed Message

**Objective**

Send malformed bridge messages.

**Expected Result**

Schema validation rejects invalid requests.

**Result**

✅ Passed

---

## SEC-010 — Unauthorized Runtime Request

**Objective**

Attempt privileged operations without authorization.

**Expected Result**

Trusted Runtime rejects the request.

**Result**

✅ Passed

---

# Summary

## Security Controls Validated

* Bridge Origin Validation
* Source Validation
* Typed Message Validation
* Capability Token Validation
* Replay Protection
* Route Epoch Validation
* Runtime Authorization
* Sandbox Isolation
* CSP Enforcement

---

# Overall Outcome

All planned attack simulations completed successfully.

No attack resulted in unauthorized access to privileged browser APIs, extension resources, or runtime state.

The validated architecture satisfies the security requirements established for Phase -1.

---

# References

* `docs/security/threat-model.md`
* `docs/security/checklist.md`
* `docs/security/findings.md`
* `docs/reviews/phase-minus-1-review.md`

---

# Reviewer Sign-off

**Reviewer:** ______________________

**Date:** ______________________

**Decision**

* [ ] Approved
* [ ] Approved with Comments
* [ ] Changes Requested
