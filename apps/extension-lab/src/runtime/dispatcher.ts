import {
  BridgeEnvelope,
  BridgePayload,
  GetDataPayload,
  PingPayload,
  RequestTokenPayload,
  ResponsePayload,
  TokenGrantPayload,
  buildEnvelope,
} from "../types/bridge";
import { validateToken, issueToken, TokenError } from "../security/token";
import { guardReplay, ReplayError } from "../security/replay";

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
  // REQUEST_TOKEN is handled inline in registerDispatcher (needs sender tabId).
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
      const tabId = _sender.tab?.id ?? -1;

      // ── REQUEST_TOKEN ────────────────────────────────────────────────────
      // Handled BEFORE the security gate because no token exists yet.
      // The SW issues a fresh token bound to the real sender tabId and
      // returns it as a TOKEN_GRANT envelope.
      if (envelope.payload.type === "REQUEST_TOKEN") {
        issueToken(tabId).then(({ token, expiresAt }) => {
          sendResponse(
            buildEnvelope<TokenGrantPayload>({ type: "TOKEN_GRANT", token, expiresAt })
          );
        }).catch((err) => {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error("[Novus Dispatcher] Failed to issue token:", errMsg);
          sendResponse(
            buildEnvelope<ResponsePayload>({
              type: "RESPONSE", requestId: envelope.id, data: null, error: errMsg,
            })
          );
        });
        return true; // keep channel open for async sendResponse
      }

      // ── Security gate ────────────────────────────────────────────────────
      // Run token + replay guards before routing all other message types.
      // Any guard failure returns a structured error response — never throws.
      const securityCheck = async () => {
        try {
          validateToken(envelope.token, tabId);
          await guardReplay(envelope);
        } catch (err) {
          const code =
            err instanceof TokenError ? err.code
            : err instanceof ReplayError ? err.code
            : "UNKNOWN";
          const errMsg = err instanceof Error ? err.message : String(err);
          console.warn(`[Novus Security] Rejected (${code}):`, errMsg);
          sendResponse(buildEnvelope<ResponsePayload>(
            { type: "RESPONSE", requestId: envelope.id, data: null, error: `${code}: ${errMsg}` }
          ));
          return;
        }
        //Guards passed — dispatch to handler
        dispatch(envelope)
          .then((responseEnvelope) => sendResponse(responseEnvelope))
          .catch((err) => {
            const errMsg = err instanceof Error ? err.message : String(err);
            console.error("[Novus Dispatcher] Unhandled error:", errMsg);
            sendResponse(buildEnvelope<ResponsePayload>(
              { type: "RESPONSE", requestId: envelope.id, data: null, error: errMsg }
            ));
          });
      };

      securityCheck();
      return true;
    }
  );

  console.log("✅ [Novus Dispatcher] Registered — listening for envelopes.");
}
