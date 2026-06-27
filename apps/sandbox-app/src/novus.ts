

type GetDataPayload = { type: 'GET_DATA'; resource: string };
type PingPayload = { type: 'PING' };
type ResponsePayload = { type: 'RESPONSE'; requestId: string; data: unknown; error?: string };
type TokenGrantPayload = { type: 'TOKEN_GRANT'; token: string; expiresAt: number };

type BridgePayload = GetDataPayload | PingPayload | ResponsePayload | TokenGrantPayload;

type BridgeEnvelope<T extends BridgePayload = BridgePayload> = {
  readonly __novus: true;
  readonly id: string;
  readonly nonce: string;
  readonly ts: number;
  readonly token: string;
  readonly payload: T;
};


let currentToken = '';
const REQUEST_TIMEOUT_MS = 5_000;

type PendingEntry = { resolve: (data: unknown) => void; reject: (err: Error) => void };
const pending = new Map<string, PendingEntry>();


function buildEnvelope<T extends BridgePayload>(payload: T): BridgeEnvelope<T> {
  return {
    __novus: true,
    id: crypto.randomUUID(),
    nonce: crypto.randomUUID(),
    ts: Date.now(),
    token: currentToken,
    payload,
  };
}


window.addEventListener('message', (event: MessageEvent) => {
  const data = event.data;
  if (typeof data !== 'object' || data === null || data.__novus !== true) return;

  const env = data as BridgeEnvelope;

  if (env.payload.type === 'TOKEN_GRANT') {
    currentToken = (env.payload as TokenGrantPayload).token;
    console.log('[Novus SDK] Token received, expires at', (env.payload as TokenGrantPayload).expiresAt);
    return;
  }

  if (env.payload.type === 'RESPONSE') {
    const p = env.payload as ResponsePayload;
    const entry = pending.get(p.requestId);
    if (!entry) return;
    pending.delete(p.requestId);
    if (p.error) {
      entry.reject(new Error(p.error));
    } else {
      entry.resolve(p.data);
    }
  }
});

function sendAndAwait(envelope: BridgeEnvelope): Promise<unknown> {
  return new Promise((resolve, reject) => {
    pending.set(envelope.id, { resolve, reject });

    window.parent.postMessage(envelope, '*');

    setTimeout(() => {
      if (pending.has(envelope.id)) {
        pending.delete(envelope.id);
        reject(new Error(`Novus SDK: request ${envelope.id} timed out after ${REQUEST_TIMEOUT_MS}ms`));
      }
    }, REQUEST_TIMEOUT_MS);
  });
}


export const Novus = {
  async getData(resource: string): Promise<unknown> {
    const envelope = buildEnvelope<GetDataPayload>({ type: 'GET_DATA', resource });
    return sendAndAwait(envelope);
  },

  async ping(): Promise<unknown> {
    const envelope = buildEnvelope<PingPayload>({ type: 'PING' });
    return sendAndAwait(envelope);
  },
} as const;
