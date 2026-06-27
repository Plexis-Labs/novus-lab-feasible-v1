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

    // Create container
    const container = document.createElement("div");

    container.id = "novus-sandbox-container";

    container.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 360px;
        height: 100vh;
        background: white;
        border-left: 1px solid #ddd;
        box-shadow: -4px 0 10px rgba(0,0,0,.15);
        z-index: 2147483647;
        padding: 20px;
        font-family: Arial, sans-serif;
    `;

    container.innerHTML = `
        <h2>🚀 Novus Lab</h2>

        <p>
            Shadow DOM injection successful.
        </p>

        <button id="testButton">
            Click Me
        </button>
    `;

    shadowRoot.appendChild(container);

    document.body.appendChild(host);
}

injectShadowHost();