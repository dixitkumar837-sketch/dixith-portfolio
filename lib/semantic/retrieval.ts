import { ContentStatus, isIndexable, EntityType } from "@/data/types";
import {
  EmbeddingProvider,
  VectorStore,
  SemanticSearchOptions,
  SemanticSearchResult,
  SemanticRetrievalResponse,
} from "./types";
import {
  LOCAL_EMBEDDING_MODEL,
  LOCAL_EMBEDDING_DIMENSIONS,
  SEMANTIC_SEARCH_DEFAULT_LIMIT,
  SEMANTIC_SEARCH_MAX_LIMIT,
  SEMANTIC_SEARCH_DEFAULT_THRESHOLD,
  SEMANTIC_SEARCH_MAX_EXCERPT_LENGTH,
} from "./config";
import { getEmbeddingProvider } from "./provider-factory";
import { getVectorStore } from "./vector-store-factory";
import { LocalEmbeddingProvider } from "./local-embedding-provider";
import { LocalVectorStore } from "./local-vector-store";

/**
 * Normalizes input query text for semantic retrieval.
 * Reuses the canonical DIXITH normalization rules:
 * - Lowercases all characters
 * - Strips quotes and apostrophes cleanly
 * - Replaces hyphens, slashes, and punctuation with spaces
 * - Collapses repeated whitespace
 * - Preserves technical terminology without truncation
 */
export function normalizeSemanticQuery(query: string): string {
  if (!query || typeof query !== "string") return "";
  return query
    .toLowerCase()
    .replace(/['"’`]/g, "") // Cleanly strip quotation marks and apostrophes
    .replace(/[^\w\s]/g, " ") // Convert punctuation/slashes/hyphens to whitespace
    .replace(/\s+/g, " ") // Collapse whitespace
    .trim();
}

/**
 * Extracts a deterministic, cleanly bounded excerpt from indexed chunk content.
 * Does NOT rewrite, summarize, or fabricate any content.
 */
export function createExcerpt(
  content: string,
  maxLength: number = SEMANTIC_SEARCH_MAX_EXCERPT_LENGTH
): string {
  if (!content) return "";
  const cleaned = content.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  const slice = cleaned.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.7) {
    return `${slice.slice(0, lastSpace)}...`;
  }
  return `${slice}...`;
}

/**
 * Executes server-side semantic retrieval over the local vector index.
 *
 * Pipeline:
 * 1. Query Normalization
 * 2. Storage & Model Availability & Compatibility Verification
 * 3. Local Query Embedding (via LocalEmbeddingProvider)
 * 4. Local Vector Similarity Search (Cosine similarity)
 * 5. Publication Safety Enforcement (status === PUBLISHED)
 * 6. Optional EntityType & Topic Filtering
 * 7. Configurable Similarity Thresholding
 * 8. Deterministic Tie-Breaking & Excerpt Generation
 */
export async function semanticSearch(
  query: string,
  options?: SemanticSearchOptions
): Promise<SemanticRetrievalResponse> {
  const startTime = Date.now();

  // 1. Query Normalization
  const normalizedQuery = normalizeSemanticQuery(query);
  if (!normalizedQuery || normalizedQuery.length === 0) {
    return {
      results: [],
      available: true,
      reason: "empty_query",
      totalFound: 0,
      durationMs: Date.now() - startTime,
      query: {
        raw: query ?? "",
        normalized: "",
      },
    };
  }

  // 2. Resolve Vector Store & Embedding Provider
  const store: VectorStore | null =
    options?.store ?? getVectorStore() ?? new LocalVectorStore();
  if (!store) {
    return {
      results: [],
      available: false,
      reason: "vector_store_unavailable",
      totalFound: 0,
      durationMs: Date.now() - startTime,
      query: { raw: query, normalized: normalizedQuery },
    };
  }

  const provider: EmbeddingProvider | null =
    options?.provider ?? getEmbeddingProvider() ?? new LocalEmbeddingProvider();
  if (!provider) {
    return {
      results: [],
      available: false,
      reason: "provider_unavailable",
      totalFound: 0,
      durationMs: Date.now() - startTime,
      query: { raw: query, normalized: normalizedQuery },
    };
  }

  // 3. Inspect Store Compatibility & Availability before loading embedding weights
  if (store instanceof LocalVectorStore) {
    // Check if the physical index exists on disk
    if (!store.hasIndexFile()) {
      return {
        results: [],
        available: false,
        reason: "semantic_index_unavailable",
        totalFound: 0,
        durationMs: Date.now() - startTime,
        query: { raw: query, normalized: normalizedQuery },
      };
    }

    // Inspect index metadata for model and dimension compatibility
    const metadata = await store.getIndexMetadata();
    if (!metadata) {
      return {
        results: [],
        available: false,
        reason: "semantic_index_unavailable",
        totalFound: 0,
        durationMs: Date.now() - startTime,
        query: { raw: query, normalized: normalizedQuery },
      };
    }

    // Guard against comparing embeddings across mismatched models or dimensions
    const isModelMatch =
      metadata.embeddingModel === provider.name ||
      metadata.embeddingModel === LOCAL_EMBEDDING_MODEL ||
      provider.name === `local:${LOCAL_EMBEDDING_MODEL}`;
    const isDimensionMatch =
      metadata.dimensions === provider.dimensions &&
      metadata.dimensions === LOCAL_EMBEDDING_DIMENSIONS;

    if (!isModelMatch || !isDimensionMatch) {
      return {
        results: [],
        available: false,
        reason: "semantic_index_incompatible",
        totalFound: 0,
        durationMs: Date.now() - startTime,
        query: { raw: query, normalized: normalizedQuery },
      };
    }
  }

  // 4. Resolve Limit & Threshold
  const rawLimit = options?.limit ?? SEMANTIC_SEARCH_DEFAULT_LIMIT;
  const limit = Math.max(1, Math.min(rawLimit, SEMANTIC_SEARCH_MAX_LIMIT));
  const threshold = options?.threshold ?? SEMANTIC_SEARCH_DEFAULT_THRESHOLD;

  // 5. Generate Query Embedding Vector
  let queryVector: number[];
  try {
    queryVector = await provider.embedText(normalizedQuery);
  } catch {
    return {
      results: [],
      available: false,
      reason: "model_initialization_failed",
      totalFound: 0,
      durationMs: Date.now() - startTime,
      query: { raw: query, normalized: normalizedQuery },
    };
  }

  // Validate dimension consistency
  if (!queryVector || queryVector.length !== provider.dimensions) {
    return {
      results: [],
      available: false,
      reason: "semantic_index_incompatible",
      totalFound: 0,
      durationMs: Date.now() - startTime,
      query: { raw: query, normalized: normalizedQuery },
    };
  }

  // 6. Execute Vector Similarity Search
  // Publication safety is strictly enforced via status: PUBLISHED
  const searchResults = await store.search({
    vector: queryVector,
    topK: limit,
    minScore: threshold,
    filter: {
      status: "PUBLISHED" as ContentStatus,
      entityType: options?.entityType,
      topics: options?.topics,
    },
  });

  // 7. Double-gate Publication Safety against any potential leakage
  const publishedResults = searchResults.filter(
    (item) => item.metadata.status && isIndexable(item.metadata.status)
  );

  // 8. Map to Clean SemanticSearchResult contract
  const results: SemanticSearchResult[] = publishedResults.map((item) => ({
    chunkId: item.metadata.chunkId,
    entityId: item.metadata.entityId,
    entityType: item.metadata.entityType,
    slug: item.metadata.slug,
    title: item.metadata.title,
    section: item.metadata.section,
    heading: item.metadata.heading,
    excerpt: createExcerpt(item.metadata.content || ""),
    similarity: Number(item.score.toFixed(4)),
    topics: item.metadata.topics,
    sourceIds: item.metadata.sourceIds,
  }));

  // 9. Deterministic Tie-Breaking (similarity DESC, entityId ASC, chunkId ASC)
  results.sort((a, b) => {
    if (b.similarity !== a.similarity) {
      return b.similarity - a.similarity;
    }
    const entityCmp = a.entityId.localeCompare(b.entityId);
    if (entityCmp !== 0) return entityCmp;
    return a.chunkId.localeCompare(b.chunkId);
  });

  return {
    results,
    available: true,
    reason: "success",
    totalFound: results.length,
    durationMs: Date.now() - startTime,
    query: {
      raw: query,
      normalized: normalizedQuery,
    },
  };
}
