/**
 * Mock configuration flag and provider factory.
 * Determines whether to use mock implementations based on NOVUS_AI_PROVIDER env var.
 */
import { env } from "../env";

export const isMock = env.NOVUS_AI_PROVIDER === "mock";

/**
 * Returns true if we should use mocks for all services.
 */
export function useMockServices(): boolean {
  return isMock;
}
