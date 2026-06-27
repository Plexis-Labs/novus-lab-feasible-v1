console.log("✅ Novus Content Script Loaded");

let mountedIframe: HTMLIFrameElement | null = null;

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


function injectShadowHost() {
  console.log("Checking for existing novus-lab-host element...");
  if (document.getElementById("novus-lab-host")) return;

  console.log("Injecting novus-lab-host element...");
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
    border: none; background: white;
    z-index: 2147483647;
    box-shadow: -4px 0 10px rgba(0,0,0,.15);
  `;

  mountedIframe = iframe;

  iframe.addEventListener("load", () => {
    // Ask the SW to issue a token bound to the real sender tabId.
    // The SW receives this via onMessage where _sender.tab.id is correct.
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
      // SW returns a TOKEN_GRANT envelope — forward it straight to the iframe.
      iframe.contentWindow?.postMessage(response, "*");
      console.log("[Novus Bridge] TOKEN_GRANT forwarded to SDK.");
    });
  });

  shadowRoot.appendChild(iframe);
  document.body.appendChild(host);

  window.addEventListener("message", (event: MessageEvent) => {
    if (!isAuthorizedSource(event)) return;
    if (!isNovusEnvelope(event.data)) return;

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

injectShadowHost();
