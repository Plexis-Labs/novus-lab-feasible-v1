/** Payload union */

/** Sent by the SDK into the bridge to request data. */
export type GetDataPayload = {
  type: "GET_DATA";
  resource: string;
};

/** Simple round-trip health-check — no data required. */
export type PingPayload = {
  type: "PING";
};

/** Sent by the runtime back through the bridge.*/
export type ResponsePayload = {
  type: "RESPONSE";
  requestId: string;
  data: unknown;
  error?: string;
};

/** Sent by the content-script to the iframe immediately after mounting,*/
export type TokenGrantPayload = {
  type: "TOKEN_GRANT";
  token: string;
  expiresAt: number;
};

/** Sent by the content-script to the SW to request a tab-bound token. */
export type RequestTokenPayload = {
  type: "REQUEST_TOKEN";
};

/** Discriminated union of all legal payload shapes. */
export type BridgePayload =
  | GetDataPayload
  | PingPayload
  | ResponsePayload
  | TokenGrantPayload
  | RequestTokenPayload;

//Envelope
export type BridgeEnvelope<T extends BridgePayload = BridgePayload> = {
  /** Protocol sentinel — immediately distinguishes Novus envelopes from noise. */
  readonly __novus: true;

  /** UUIDv4 request identifier. Mirrors into ResponsePayload.requestId. */
  readonly id: string;

  /** One-time nonce (UUIDv4). Burned by the replay guard on first use. */
  readonly nonce: string;

  /** Creation timestamp — ms since epoch. Replay guard enforces max age. */
  readonly ts: number;

  /** Capability token issued by the runtime (empty string for TOKEN_GRANT). */
  readonly token: string;

  /** Typed payload, discriminated on `payload.type`. */
  readonly payload: T;
};

//Builder helper
export function buildEnvelope<T extends BridgePayload>(
  payload: T,
  token: string = ""
): BridgeEnvelope<T> {
  return {
    __novus: true,
    id: crypto.randomUUID(),
    nonce: crypto.randomUUID(),
    ts: Date.now(),
    token,
    payload,
  };
}

//Type guard
export function isBridgeEnvelope(value: unknown): value is BridgeEnvelope {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v["__novus"] === true &&
    typeof v["id"] === "string" &&
    typeof v["nonce"] === "string" &&
    typeof v["ts"] === "number" &&
    typeof v["token"] === "string" &&
    typeof v["payload"] === "object" &&
    v["payload"] !== null &&
    typeof (v["payload"] as Record<string, unknown>)["type"] === "string"
  );
}
