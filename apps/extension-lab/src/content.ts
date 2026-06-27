console.log("✅ Novus Content Script Loaded");

function injectShadowHost() {
    // Prevent duplicate injection
    console.log("Checking for existing novus-lab-host element...");
    if (document.getElementById("novus-lab-host")) {
        return;
    }

    // Create host element
    console.log("Injecting novus-lab-host element...");
    const host = document.createElement("div");
    host.id = "novus-lab-host";

    // Attach CLOSED shadow root
    const shadowRoot = host.attachShadow({
        mode: "closed"
    });

    // Create iframe
const iframe = document.createElement("iframe");

iframe.id = "novus-sandbox-container";

iframe.src = chrome.runtime.getURL("sandbox/index.html");

iframe.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 360px;
    height: 100vh;
    border: none;
    background: white;
    z-index: 2147483647;
    box-shadow: -4px 0 10px rgba(0,0,0,.15);
`;

iframe.setAttribute(
    "sandbox",
    "allow-scripts"
);
    shadowRoot.appendChild(iframe);

    document.body.appendChild(host);
}

injectShadowHost();