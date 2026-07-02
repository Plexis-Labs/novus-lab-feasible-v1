/**
 * Mock Storage implementation.
 * In-memory key-value store for development without requiring external storage.
 */

export interface StorageItem {
  key: string;
  value: unknown;
  timestamp: number;
}

/**
 * Mock storage implementation using Map.
 * All data is kept in memory and lost when the process restarts.
 */
export class MockStorage {
  private data: Map<string, unknown> = new Map();

  async get<T = unknown>(key: string): Promise<T | undefined> {
    return (this.data.get(key) as T) || undefined;
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    this.data.set(key, value);
  }

  async delete(key: string): Promise<boolean> {
    return this.data.delete(key);
  }

  async clear(): Promise<void> {
    this.data.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.data.keys());
  }

  async entries(): Promise<Array<[string, unknown]>> {
    return Array.from(this.data.entries());
  }

  async has(key: string): Promise<boolean> {
    return this.data.has(key);
  }

  /**
   * Get all items currently in storage.
   * Useful for debugging during development.
   */
  debug_getAllItems(): StorageItem[] {
    const items: StorageItem[] = [];
    this.data.forEach((value, key) => {
      items.push({
        key,
        value,
        timestamp: Date.now(),
      });
    });
    return items;
  }
}

export const mockStorage = new MockStorage();
