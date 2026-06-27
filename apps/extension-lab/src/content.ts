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

function buildToken(tabId: number): { token: string; expiresAt: number } {
  const iat = Date.now();
  const exp = iat + 60_000;
  const json = JSON.stringify({ sub: tabId, iat, exp });
  const token = btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return { token, expiresAt: exp };
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
    const tabId = chrome.devtools?.inspectedWindow?.tabId ?? 0;
    const { token, expiresAt } = buildToken(tabId);
    const grant = {
      __novus: true,
      id: crypto.randomUUID(),
      nonce: crypto.randomUUID(),
      ts: Date.now(),
      token: "",
      payload: { type: "TOKEN_GRANT", token, expiresAt },
    };
    iframe.contentWindow?.postMessage(grant, "*");
    console.log("[Novus Bridge] TOKEN_GRANT sent to SDK.");
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
