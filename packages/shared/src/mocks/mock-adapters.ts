/**
 * Mock Adapters implementation.
 * Provides fake responses for GitHub and Linear integrations.
 */

export interface GitHubAdapterResponse {
  success: boolean;
  data?: {
    owner: string;
    repo: string;
    issues?: Array<{ id: string; title: string; state: string }>;
  };
  error?: string;
}

export interface LinearAdapterResponse {
  success: boolean;
  data?: {
    teamId: string;
    issues?: Array<{ id: string; title: string; status: string }>;
  };
  error?: string;
}

/**
 * Mock GitHub adapter.
 */
export class MockGitHubAdapter {
  async listIssues(
    owner: string,
    repo: string,
  ): Promise<GitHubAdapterResponse> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 50));

    return {
      success: true,
      data: {
        owner,
        repo,
        issues: [
          { id: "gh-001", title: "Mock GitHub Issue 1", state: "open" },
          { id: "gh-002", title: "Mock GitHub Issue 2", state: "closed" },
        ],
      },
    };
  }

  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body: string,
  ): Promise<GitHubAdapterResponse> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    return {
      success: true,
      data: {
        owner,
        repo,
        issues: [{ id: "gh-999", title, state: "open" }],
      },
    };
  }

  async validateConnection(): Promise<boolean> {
    return true;
  }
}

/**
 * Mock Linear adapter.
 */
export class MockLinearAdapter {
  async listIssues(teamId: string): Promise<LinearAdapterResponse> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 50));

    return {
      success: true,
      data: {
        teamId,
        issues: [
          { id: "lin-001", title: "Mock Linear Issue 1", status: "Todo" },
          {
            id: "lin-002",
            title: "Mock Linear Issue 2",
            status: "In Progress",
          },
        ],
      },
    };
  }

  async createIssue(
    teamId: string,
    title: string,
    description: string,
  ): Promise<LinearAdapterResponse> {
    await new Promise((resolve) => setTimeout(resolve, 50));

    return {
      success: true,
      data: {
        teamId,
        issues: [{ id: "lin-999", title, status: "Todo" }],
      },
    };
  }

  async validateConnection(): Promise<boolean> {
    return true;
  }
}

export const mockGitHubAdapter = new MockGitHubAdapter();
export const mockLinearAdapter = new MockLinearAdapter();
