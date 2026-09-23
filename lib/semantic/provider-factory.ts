import { EmbeddingProvider } from "./types";
import { getSemanticConfig } from "./config";
import { MockEmbeddingProvider } from "./mock-provider";
import { LocalEmbeddingProvider } from "./local-embedding-provider";

let cachedProvider: EmbeddingProvider | null = null;

/**
 * Factory returning an EmbeddingProvider based on server configuration.
 * Returns null if the provider is unconfigured or disabled, allowing
 * the application to build and run safely without external dependencies.
 */
export function getEmbeddingProvider(): EmbeddingProvider | null {
  if (cachedProvider) {
    return cachedProvider;
  }

  const config = getSemanticConfig();

  switch (config.embeddingProvider) {
    case "mock":
      cachedProvider = new MockEmbeddingProvider(768);
      return cachedProvider;

    case "local":
      cachedProvider = new LocalEmbeddingProvider();
      return cachedProvider;

    case "none":
    default:
      // Graceful offline state: no provider is loaded
      return null;
  }
}

/**
 * Resets the cached provider instance (useful for test isolation).
 */
export function resetEmbeddingProvider(): void {
  cachedProvider = null;
}
