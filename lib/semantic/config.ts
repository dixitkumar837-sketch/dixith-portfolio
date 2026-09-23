import { SemanticInfrastructureStatus } from "./types";

export const LOCAL_EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";
export const LOCAL_EMBEDDING_DIMENSIONS = 384;
export const LOCAL_EMBEDDING_NORMALIZE = true;
export const LOCAL_VECTOR_INDEX_PATH = "data/derived/semantic-index.json";

// Retrieval defaults & constraints
export const SEMANTIC_SEARCH_DEFAULT_LIMIT = 5;
export const SEMANTIC_SEARCH_MAX_LIMIT = 10;
/**
 * Experimental starting similarity threshold for cosine distance.
 * NOTE: This is an empirical baseline for Phase 8G.6 and NOT an accuracy guarantee.
 * Rigorous evaluation and calibration will be performed in Phase 8G.7.
 */
export const SEMANTIC_SEARCH_DEFAULT_THRESHOLD = 0.5;
export const SEMANTIC_SEARCH_MAX_EXCERPT_LENGTH = 280;

// Hybrid retrieval & fusion defaults (Phase 8G.8)
export const RRF_DEFAULT_K = 60;
export const HYBRID_SEARCH_DEFAULT_LIMIT = 5;
export const HYBRID_SEARCH_MAX_LIMIT = 10;
export const HYBRID_SEARCH_DEFAULT_SEMANTIC_THRESHOLD = 0.5;

export type SupportedEmbeddingProvider = "none" | "mock" | "local" | "gemini" | "openai" | "cloudflare";
export type SupportedVectorStore = "none" | "mock" | "memory" | "local" | "file" | "supabase";

export interface SemanticConfig {
  embeddingProvider: SupportedEmbeddingProvider;
  vectorStore: SupportedVectorStore;
  hasApiKey: boolean;
  hasStoreUrl: boolean;
  isMockMode: boolean;
  isLocalMode: boolean;
  isEnabled: boolean;
}

/**
 * Server-only configuration boundary for semantic retrieval infrastructure.
 * Reads environment variables safely, ensuring credentials are never exposed
 * or serialized to the browser.
 */
export function getSemanticConfig(): SemanticConfig {
  const provider = (process.env.EMBEDDING_PROVIDER?.toLowerCase() || "none") as SupportedEmbeddingProvider;
  const store = (process.env.VECTOR_STORE?.toLowerCase() || "none") as SupportedVectorStore;

  const validProviders: SupportedEmbeddingProvider[] = ["none", "mock", "local", "gemini", "openai", "cloudflare"];
  const validStores: SupportedVectorStore[] = ["none", "mock", "memory", "local", "file", "supabase"];

  const resolvedProvider = validProviders.includes(provider) ? provider : "none";
  const resolvedStore = validStores.includes(store) ? store : "none";

  const hasApiKey = Boolean(process.env.EMBEDDING_API_KEY && process.env.EMBEDDING_API_KEY.trim() !== "");
  const hasStoreUrl = Boolean(process.env.VECTOR_STORE_URL && process.env.VECTOR_STORE_URL.trim() !== "");

  const isMockMode = resolvedProvider === "mock" || resolvedStore === "mock" || resolvedStore === "memory";
  const isLocalMode = resolvedProvider === "local" || resolvedStore === "local" || resolvedStore === "file";
  const isEnabled = resolvedProvider !== "none" && resolvedStore !== "none";

  return {
    embeddingProvider: resolvedProvider,
    vectorStore: resolvedStore,
    hasApiKey,
    hasStoreUrl,
    isMockMode,
    isLocalMode,
    isEnabled,
  };
}

/**
 * Returns raw server-side secrets only when explicitly requested by internal
 * provider adapters. Never call or expose this function in client components.
 */
export function getServerOnlyCredentials(): {
  apiKey?: string;
  storeUrl?: string;
  storeKey?: string;
} {
  return {
    apiKey: process.env.EMBEDDING_API_KEY?.trim(),
    storeUrl: process.env.VECTOR_STORE_URL?.trim(),
    storeKey: process.env.VECTOR_STORE_KEY?.trim(),
  };
}

/**
 * Evaluates operational status of semantic infrastructure without throwing errors.
 */
export function getSemanticStatus(): SemanticInfrastructureStatus {
  const config = getSemanticConfig();

  let mode: "disabled" | "mock" | "live" = "disabled";
  if (config.isMockMode) {
    mode = "mock";
  } else if (config.isEnabled) {
    mode = "live";
  }

  const providerAvailable =
    config.embeddingProvider === "mock" ||
    config.embeddingProvider === "local" ||
    (config.embeddingProvider !== "none" && config.hasApiKey);

  const vectorStoreAvailable =
    config.vectorStore === "mock" ||
    config.vectorStore === "memory" ||
    config.vectorStore === "local" ||
    config.vectorStore === "file" ||
    (config.vectorStore !== "none" && config.hasStoreUrl);

  return {
    providerName: config.embeddingProvider,
    providerAvailable,
    vectorStoreName: config.vectorStore,
    vectorStoreAvailable,
    isFullyOperational: config.isEnabled && providerAvailable && vectorStoreAvailable,
    mode,
  };
}
