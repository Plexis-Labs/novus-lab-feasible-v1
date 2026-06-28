/// <reference lib="webworker" />

import { BridgeEnvelope } from "../types/bridge";

const TOKEN_TTL_MS = 60_000;
const STORAGE_KEY = "novus_seen_nonces";

let seenNonces = new Set<string>();

export async function rehydrateNonces(): Promise<void> {
  const result = await chrome.storage.session.get(STORAGE_KEY);
  const stored = result[STORAGE_KEY];
  if (Array.isArray(stored)) {
    seenNonces = new Set<string>(stored as string[]);
    console.log(`[Novus Replay] Rehydrated ${seenNonces.size} nonces.`);
  }
}

async function persistNonces(): Promise<void> {
  await chrome.storage.session.set({
    [STORAGE_KEY]: Array.from(seenNonces),
  });
}

export async function guardReplay(envelope: BridgeEnvelope): Promise<void> {
  if (!envelope.__novus) {
    throw new ReplayError("BAD_SENTINEL", "Missing __novus sentinel");
  }

  const age = Date.now() - envelope.ts;
  if (age > TOKEN_TTL_MS) {
    throw new ReplayError(
      "EXPIRED",
      `Envelope is ${age}ms old, max allowed is ${TOKEN_TTL_MS}ms`
    );
  }

  if (seenNonces.has(envelope.nonce)) {
    throw new ReplayError("NONCE_REUSED", `Nonce already used: ${envelope.nonce}`);
  }

  seenNonces.add(envelope.nonce);
  await persistNonces();
}

export class ReplayError extends Error {
  readonly code: "BAD_SENTINEL" | "EXPIRED" | "NONCE_REUSED";
  constructor(code: ReplayError["code"], message: string) {
    super(message);
    this.name = "ReplayError";
    this.code = code;
  }
}
