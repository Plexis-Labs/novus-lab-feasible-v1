/**
 * Mock services barrel export.
 * When NOVUS_AI_PROVIDER=mock, the runtime uses these implementations.
 */

export { isMock, useMockServices } from "./mock-config";
export { MockAIProvider, mockAIProvider } from "./mock-ai-provider";
export type { FeatureManifest, AIProviderResponse } from "./mock-ai-provider";

export { MockStorage, mockStorage } from "./mock-storage";
export type { StorageItem } from "./mock-storage";

export {
  MockGitHubAdapter,
  MockLinearAdapter,
  mockGitHubAdapter,
  mockLinearAdapter,
} from "./mock-adapters";
export type {
  GitHubAdapterResponse,
  LinearAdapterResponse,
} from "./mock-adapters";
