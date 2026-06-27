# Novus Lab – Phase -1 Feasibility Spike

## Overview

Novus Lab is a research prototype that validates a secure Chrome Manifest V3 architecture for running an isolated React application inside a sandboxed iframe.

The goal of **Phase -1** is to verify the feasibility of the security model before implementing the production platform.

---

## Architecture

```
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
React Runtime
```

---

## Repository Structure

```
apps/
├── extension-lab/      # Chrome MV3 Extension
├── sandbox-app/        # React Sandbox Runtime
└── test-website/       # Local testing website

packages/
└── shared/             # Shared libraries (future)

docs/
└── architecture/       # ADRs & architecture documentation
```

---

## Tech Stack

* Chrome Manifest V3
* TypeScript
* React
* Vite
* esbuild
* pnpm Workspace

---

## Getting Started

### 1. Clone

```bash
git clone <repository-url>
cd novus-lab-feasible-v1
```

### 2. Install Dependencies

```bash
pnpm install
```

---

## Development

### Build the Extension

```bash
pnpm --filter extension-lab build
```

### Build the React Sandbox

```bash
pnpm --filter sandbox-app watch
```

### Run the Test Website

```bash
pnpm --filter test-website dev
```

---

## Loading the Extension

1. Open Chrome.
2. Navigate to `chrome://extensions`.
3. Enable **Developer Mode**.
4. Click **Load unpacked**.
5. Select:

```
apps/extension-lab
```

---

## Current Progress

### Phase -1

* ✅ Milestone A – Chrome Platform Feasibility
* ✅ Milestone B – Sandbox Architecture (B001–B003)
* ⏳ Milestone C – Typed Bridge Prototype
* ⏳ Milestone D – Lifecycle Validation
* ⏳ Milestone E – Security Validation

---

## Security Principles

* Closed Shadow DOM isolation
* Sandboxed iframe runtime
* Strict Manifest V3 Content Security Policy
* No inline JavaScript
* No `eval()` or dynamic code execution
* Least-privilege architecture

---

## Roadmap

The next milestone introduces a secure, typed communication bridge between the sandboxed React application and the trusted extension runtime, followed by capability tokens, lifecycle management, and full security validation.
