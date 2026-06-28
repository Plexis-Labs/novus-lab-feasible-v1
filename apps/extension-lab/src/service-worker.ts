/// <reference lib="webworker" />

import { registerDispatcher } from "./runtime/dispatcher.js";
import { rehydrateNonces } from "./security/replay.js";

//Lifecycle

self.addEventListener("install", () => {
  console.log("✅ [Novus SW] Installed.");
  (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("✅ [Novus SW] Activated.");
  (event as ExtendableEvent).waitUntil(rehydrateNonces());
});

//Dispatcher

registerDispatcher();

console.log("✅ [Novus SW] Runtime ready.");

//ROUTE EPOCH DETECTOR (Milestone D - P-1-D001)
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  // We only care about the main frame (not iframe navigations)
  if (details.frameId === 0) {
    console.log(`[SW] SPA Navigation detected: ${details.url}`);
    
    // Broadcast the route change to the specific tab's content script
    chrome.tabs.sendMessage(details.tabId, {
      type: "NOVUS_ROUTE_CHANGED",
      url: details.url,
      epoch: Date.now() // The new Epoch ID
    }).catch(() => {
    });
  }
});