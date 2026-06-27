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