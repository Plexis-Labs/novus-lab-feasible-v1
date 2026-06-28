# Novus Lab — Phase -1 Feasibility Spike

> A Chrome Manifest V3 architecture validation project for securely embedding isolated React applications into arbitrary web pages.

---

## Overview

**Novus Lab** is a technical feasibility spike created to validate the core architecture of the Novus platform before production development.

Rather than building product features, this repository answers a single question:

> **Can a secure, capability-based architecture be implemented within the constraints of Chrome Manifest V3?**

Phase -1 validates:

* Chrome Manifest V3 compatibility
* Secure extension injection
* Closed Shadow DOM integration
* Sandboxed iframe isolation
* React sandbox execution
* Typed communication bridge
* Trusted Runtime architecture
* Capability-based authorization
* Route epoch lifecycle
* Browser refresh persistence
* Security validation and architecture review

The successful completion of this repository provides the technical foundation for **Phase 0 – Contracts & Engineering Foundation**.

---

# Architecture

```text
Host Website
        │
        ▼
Trusted Content Script
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

---

# Repository Structure

```text
apps/
├── extension-lab/      # Chrome Manifest V3 extension
├── sandbox-app/        # React application running inside the sandbox
└── test-website/       # Local website used for validation

packages/
└── shared/             # Shared libraries (future)

docs/
├── adr/                # Architecture Decision Records
├── reviews/            # Architecture review documents
└── security/           # Security validation documentation
```

---

# Technology Stack

* Chrome Manifest V3
* TypeScript
* React
* Vite
* esbuild
* pnpm Workspace

---

# Getting Started

## Clone the Repository

```bash
git clone <repository-url>
cd novus-lab-feasible-v1
```

---

## Install Dependencies

```bash
pnpm install
```

---

# Development

## Build the Extension

```bash
pnpm --filter extension-lab build
```

---

## Start the React Sandbox

```bash
pnpm --filter sandbox-app dev
```

---

## Run the Test Website

```bash
pnpm --filter test-website dev
```

---

# Loading the Extension

1. Open Chrome.
2. Navigate to `chrome://extensions`.
3. Enable **Developer Mode**.
4. Click **Load unpacked**.
5. Select:

```text
apps/extension-lab
```

---

# Security Validation

Phase -1 includes a dedicated security validation suite used to verify the proposed architecture.

Validated security controls include:

* Sandboxed iframe isolation
* Strict Manifest V3 Content Security Policy
* Origin validation
* Source validation
* Typed bridge communication
* Capability token authorization
* Replay protection
* Route epoch invalidation
* Browser refresh persistence
* Sandbox escape prevention

Attack simulations include:

* Forged bridge messages
* Replay attacks
* Expired tokens
* Wrong route tokens
* Wrong tab tokens
* Spoofed iframe communication
* Malformed messages
* Sandbox escape attempts

---

# Documentation

Project documentation is located in the `docs/` directory.

```text
docs/
├── adr/
│   ├── ADR-001-overall-architecture.md
│   ├── ADR-002-sandbox-isolation.md
│   └── ADR-003-bridge-security.md
│
├── reviews/
│   └── phase-minus-1-review.md
│
└── security/
    ├── threat-model.md
    ├── checklist.md
    ├── attack-simulation.md
    └── findings.md
```

---

# Phase -1 Results

All planned milestones were successfully completed.

| Milestone                   | Status     |
| --------------------------- | ---------- |
| Chrome Platform Feasibility | ✅ Complete |
| Sandbox Architecture        | ✅ Complete |
| Bridge Prototype            | ✅ Complete |
| Lifecycle Validation        | ✅ Complete |
| Security Validation         | ✅ Complete |

---

# Key Outcomes

Phase -1 successfully demonstrated:

* Chrome Manifest V3 supports the proposed architecture.
* Browser sandboxing provides effective isolation.
* Privileged operations can be centralized within a Trusted Runtime.
* Capability-based authorization is feasible.
* Route epoch lifecycle management prevents stale authorization.
* The architecture satisfies the security objectives defined for the feasibility spike.

The architecture received a **GO** decision and is approved to proceed to Phase 0.

---

# Security Principles

The Novus architecture follows the following principles:

* Defense in Depth
* Principle of Least Privilege
* Explicit Trust Boundaries
* Capability-Based Authorization
* Browser-Enforced Isolation
* Secure by Default
* Fail Securely

---

# Next Phase

Phase 0 transitions from architecture validation to engineering foundations.

Primary objectives include:

* Shared contracts
* Domain models
* Project architecture
* Build system
* Testing infrastructure
* Developer tooling

---

# License

This repository contains the Phase -1 research and validation work for the Novus platform.
