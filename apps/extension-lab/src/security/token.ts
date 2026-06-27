/// <reference lib="webworker" />

const TOKEN_TTL_MS = 60_000;

export type TokenPayload = {
  sub: number;
  iat: number;
  exp: number;
};

function encode(payload: TokenPayload): string {
  const json = JSON.stringify(payload);
  return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(token: string): TokenPayload | null {
  try {
    const json = atob(token.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

function storageKey(tabId: number): string {
  return `novus_token_${tabId}`;
}

export async function issueToken(
  tabId: number
): Promise<{ token: string; expiresAt: number }> {
  const iat = Date.now();
  const exp = iat + TOKEN_TTL_MS;
  const payload: TokenPayload = { sub: tabId, iat, exp };
  const token = encode(payload);

  await chrome.storage.session.set({ [storageKey(tabId)]: token });

  console.log(`[Novus Token] Issued for tab ${tabId}, expires at ${exp}`);
  return { token, expiresAt: exp };
}

export function validateToken(token: string, tabId: number): TokenPayload {
  const payload = decode(token);

  if (!payload) {
    throw new TokenError("MALFORMED", "Token could not be decoded");
  }

  if (payload.sub !== tabId) {
    throw new TokenError(
      "WRONG_TAB",
      `Token sub=${payload.sub} does not match sender tabId=${tabId}`
    );
  }

  if (Date.now() > payload.exp) {
    throw new TokenError(
      "EXPIRED",
      `Token expired at ${payload.exp}, now=${Date.now()}`
    );
  }

  return payload;
}

export async function revokeToken(tabId: number): Promise<void> {
  await chrome.storage.session.remove(storageKey(tabId));
  console.log(`[Novus Token] Revoked for tab ${tabId}`);
}

export class TokenError extends Error {
  readonly code: "MALFORMED" | "WRONG_TAB" | "EXPIRED";
  constructor(code: TokenError["code"], message: string) {
    super(message);
    this.name = "TokenError";
    this.code = code;
  }
}
