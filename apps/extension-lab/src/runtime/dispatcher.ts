import {
  BridgeEnvelope,
  BridgePayload,
  GetDataPayload,
  PingPayload,
  ResponsePayload,
  buildEnvelope,
} from "../types/bridge";

//Handler type 
type Handler<T extends BridgePayload> = (payload: T) => Promise<unknown>;

//Mock data store (replaced by real data sources in later milestones)
const MOCK_DATA: Record<string, unknown> = {
  "pr-summary": {
    title: "Fix login bug — null check on session token",
    author: "alice",
    files: 3,
    additions: 42,
    deletions: 7,
    status: "open",
  },
  "repo-meta": {
    name: "novus-lab-feasible-v1",
    stars: 0,
    language: "TypeScript",
  },
};

//Handlers
const handleGetData: Handler<GetDataPayload> = async (payload) => {
  const result = MOCK_DATA[payload.resource];
  if (result === undefined) {
    throw new DispatchError(`Unknown resource: "${payload.resource}"`);
  }
  return result;
};

const handlePing: Handler<PingPayload> = async (_payload) => {
  return { pong: true, ts: Date.now() };
};

//Handler registry
const handlers: Partial<Record<BridgePayload["type"], Handler<any>>> = {
  GET_DATA: handleGetData,
  PING: handlePing,
  // RESPONSE and TOKEN_GRANT are outbound-only — no inbound handler needed.
};

//Error class
export class DispatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DispatchError";
  }
}

//Core dispatch function
export async function dispatch(
  envelope: BridgeEnvelope
): Promise<BridgeEnvelope<ResponsePayload>> {
  const { payload, id: requestId } = envelope;
  const handler = handlers[payload.type];

  if (!handler) {
    throw new DispatchError(
      `No handler registered for payload type: "${payload.type}"`
    );
  }

  try {
    const data = await handler(payload);
    return buildEnvelope<ResponsePayload>({
      type: "RESPONSE",
      requestId,
      data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return buildEnvelope<ResponsePayload>({
      type: "RESPONSE",
      requestId,
      data: null,
      error: message,
    });
  }
}

//Chrome runtime message listener (wires into service-worker.ts)
export function registerDispatcher(): void {
  chrome.runtime.onMessage.addListener(
    (
      message: unknown,
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: unknown) => void
    ) => {
      if (
        typeof message !== "object" ||
        message === null ||
        (message as Record<string, unknown>)["__novus"] !== true
      ) {
        return false;
      }

      const envelope = message as BridgeEnvelope;

      dispatch(envelope)
        .then((responseEnvelope) => sendResponse(responseEnvelope))
        .catch((err) => {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error("[Novus Dispatcher] Unhandled error:", errMsg);
          sendResponse({
            __novus: true,
            id: crypto.randomUUID(),
            nonce: crypto.randomUUID(),
            ts: Date.now(),
            token: "",
            payload: {
              type: "RESPONSE",
              requestId: envelope.id,
              data: null,
              error: errMsg,
            },
          } satisfies BridgeEnvelope<ResponsePayload>);
        });

      return true;
    }
  );

  console.log("✅ [Novus Dispatcher] Registered — listening for envelopes.");
}
