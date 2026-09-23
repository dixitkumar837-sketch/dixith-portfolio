import { VectorStore } from "./types";
import { getSemanticConfig } from "./config";
import { InMemoryVectorStore } from "./mock-vector-store";
import { LocalVectorStore } from "./local-vector-store";

let cachedVectorStore: VectorStore | null = null;

/**
 * Factory returning a VectorStore based on server configuration.
 * Returns null if the store is unconfigured or disabled, allowing
 * the application to build and run safely offline.
 */
export function getVectorStore(): VectorStore | null {
  if (cachedVectorStore) {
    return cachedVectorStore;
  }

  const config = getSemanticConfig();

  switch (config.vectorStore) {
    case "mock":
    case "memory":
      cachedVectorStore = new InMemoryVectorStore();
      return cachedVectorStore;

    case "local":
    case "file":
      cachedVectorStore = new LocalVectorStore();
      return cachedVectorStore;

    case "none":
    default:
      // Graceful offline state: no vector store is loaded
      return null;
  }
}

/**
 * Resets the cached vector store instance (useful for test isolation).
 */
export function resetVectorStore(): void {
  cachedVectorStore = null;
}
