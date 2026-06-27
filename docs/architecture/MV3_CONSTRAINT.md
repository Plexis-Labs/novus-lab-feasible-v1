# Chrome MV3 Constraints & Architectural Impact

## 1. The Service Worker Execution Model
* **Constraint:** Service Workers terminate after 30 seconds of idle time or 5 minutes of total execution.
* **Impact:** No persistent global state. All transient state must be serialized to `chrome.storage.session` and rehydrated upon wake.

## 2. Content Security Policy (CSP) Restrictions
* **Constraint:** `unsafe-eval` and inline scripts are blocked.
* **Impact:** The AI-generated React bundle cannot be evaluated dynamically. It must be compiled into a static, immutable artifact and loaded via a strictly authorized sandbox.

## 3. Content Script "Isolated Worlds"
* **Constraint:** Content scripts share the DOM with the host page but execute in an isolated JavaScript environment.
* **Impact:** Cannot directly read the host page's internal framework state (React/Vue). Extraction relies purely on semantic DOM or approved network projections.

## 4. The Sandbox Origin Boundary
* **Constraint:** An `<iframe>` without `allow-same-origin` operates in a unique, opaque origin.
* **Impact:** The sandbox cannot directly access `chrome.storage` or extension APIs. The replay-safe typed `window.postMessage` bridge is mandatory for all data transit.