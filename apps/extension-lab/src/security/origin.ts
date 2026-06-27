let mountedIframe: HTMLIFrameElement | null = null;

export function registerIframe(iframe: HTMLIFrameElement): void {
  mountedIframe = iframe;
  console.log("[Novus Origin] Iframe registered for origin validation.");
}

export function unregisterIframe(): void {
  mountedIframe = null;
  console.log("[Novus Origin] Iframe unregistered.");
}

export function isAuthorizedSource(event: MessageEvent): boolean {
  if (!mountedIframe) return false;
  return event.source === mountedIframe.contentWindow;
}
