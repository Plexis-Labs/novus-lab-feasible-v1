console.log("✅ Novus Content Script Loaded");

// GLOBALS & STATE

let mountedIframe: HTMLIFrameElement | null = null;
let currentEpoch = Date.now();
let currentRoute = window.location.href;

console.log(`[Content] Initializing Novus Epoch: ${currentEpoch} on ${currentRoute}`);


// MILESTONE C: SECURITY BRIDGE HELPERS

function isAuthorizedSource(event: MessageEvent): boolean {
  if (!mountedIframe) return false;
  return event.source === mountedIframe.contentWindow;
}

function isNovusEnvelope(data: unknown): boolean {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as Record<string, unknown>)["__novus"] === true
  );
}


// MILESTONE D: TEARDOWN SEQUENCE (P-1-D005)

function teardownShadowHost() {
  const existingHost = document.getElementById("novus-lab-host");
  if (existingHost) {
    console.log("[Content] SPA Nav Detected: Destroying old sandbox iframe...");
    existingHost.remove(); // Physically vaporizes the iframe and all its tokens
    mountedIframe = null;
  }
}

// MILESTONE B & C: UI INJECTION & MESSAGE ROUTING

function injectShadowHost() {
  console.log("Checking for existing novus-lab-host element...");
  if (document.getElementById("novus-lab-host")) return;

  console.log("Injecting fresh novus-lab-host element...");
  const host = document.createElement("div");
  host.id = "novus-lab-host";

  const shadowRoot = host.attachShadow({ mode: "closed" });

  const iframe = document.createElement("iframe");
  iframe.id = "novus-sandbox-container";
  iframe.src = chrome.runtime.getURL("sandbox/index.html");
  iframe.setAttribute("sandbox", "allow-scripts");
  iframe.style.cssText = `
    position: fixed; top: 0; right: 0;
    width: 360px; height: 100vh;
    border: none; background: #0f172a;
    z-index: 2147483647;
    box-shadow: -4px 0 10px rgba(0,0,0,.15);
  `;

  mountedIframe = iframe;

  // Track the exact epoch this specific iframe instance was born in
  const iframeEpoch = currentEpoch;

  iframe.addEventListener("load", () => {
    const requestTokenEnvelope = {
      __novus: true,
      id: crypto.randomUUID(),
      nonce: crypto.randomUUID(),
      ts: Date.now(),
      token: "",
      payload: { type: "REQUEST_TOKEN" },
    };
    chrome.runtime.sendMessage(requestTokenEnvelope, (response: unknown) => {
      if (chrome.runtime.lastError) {
        console.error("[Novus Bridge] TOKEN_REQUEST failed:", chrome.runtime.lastError.message);
        return;
      }
      iframe.contentWindow?.postMessage(response, "*");
      console.log("[Novus Bridge] TOKEN_GRANT forwarded to SDK.");
    });
  });

  shadowRoot.appendChild(iframe);
  document.body.appendChild(host);

  window.addEventListener("message", (event: MessageEvent) => {
    if (!isAuthorizedSource(event)) return;
    if (!isNovusEnvelope(event.data)) return;

    // HARD SECURITY LAYER: If this iframe tries to talk but the global epoch moved on, kill it.
    if (iframeEpoch !== currentEpoch) {
      console.error(`[Security] Blocked message from a zombie iframe context.`);
      return;
    }

    const envelope = event.data;

    if (
      envelope.payload?.type === "RESPONSE" ||
      envelope.payload?.type === "TOKEN_GRANT"
    ) return;

    chrome.runtime.sendMessage(envelope, (response: unknown) => {
      if (chrome.runtime.lastError) {
        console.error("[Novus Bridge] SW error:", chrome.runtime.lastError.message);
        return;
      }
      iframe.contentWindow?.postMessage(response, "*");
    });
  });
}


// MILESTONE D: ROUTE INTERCEPTOR

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "NOVUS_ROUTE_CHANGED") {
    // 1. Update global tracking metrics
    currentRoute = message.url;
    currentEpoch = message.epoch;
    
    console.log(`[Content] 🔄 Route Swapped to: ${currentRoute}`);
    
    // 2. Physical lifecycle management (P-1-D005)
    teardownShadowHost();
    injectShadowHost();
  }
});

// Initialize the UI on first load
injectShadowHost();