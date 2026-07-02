/**
 * Mock AI Provider implementation.
 * Returns hardcoded feature manifest for development and testing.
 */

export interface FeatureManifest {
  id: string;
  name: string;
  description: string;
  icon?: string;
  enabled: boolean;
  tags?: string[];
}

export interface AIProviderResponse {
  success: boolean;
  data?: FeatureManifest;
  error?: string;
}

/**
 * Mock implementation of AI provider.
 * Returns hardcoded responses for development without API keys.
 */
export class MockAIProvider {
  async getFeatureManifest(userId: string): Promise<AIProviderResponse> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      success: true,
      data: {
        id: "feature-001",
        name: "Mock Feature",
        description: "A mock feature manifest for development",
        icon: "🚀",
        enabled: true,
        tags: ["mock", "development"],
      },
    };
  }

  async generateContent(prompt: string): Promise<AIProviderResponse> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 150));

    return {
      success: true,
      data: {
        id: "generated-001",
        name: "Generated Content",
        description: `Mock response to prompt: "${prompt}"`,
        enabled: true,
      },
    };
  }

  async validateConnection(): Promise<boolean> {
    // Always succeeds in mock mode
    return true;
  }
}

export const mockAIProvider = new MockAIProvider();
