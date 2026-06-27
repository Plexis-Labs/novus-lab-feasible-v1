/// <reference lib="webworker" />

import { registerDispatcher } from "./runtime/dispatcher.js";

//Lifecycle

self.addEventListener("install", () => {
  console.log("✅ [Novus SW] Installed.");
  // Force immediate activation — skip waiting for old SW to unload.
  (self as unknown as ServiceWorkerGlobalScope).skipWaiting();
});

self.addEventListener("activate", () => {
  console.log("✅ [Novus SW] Activated.");
});

//Dispatcher

registerDispatcher();

console.log("✅ [Novus SW] Runtime ready.");