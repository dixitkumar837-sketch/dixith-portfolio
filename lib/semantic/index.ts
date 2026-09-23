/**
 * DIXITH Semantic Retrieval Infrastructure
 * Phase 8G.2 Foundation & Phase 8G.3 Chunking/Indexing Pipeline
 *
 * Provider-agnostic abstractions, configuration boundary,
 * content-type aware chunking, and incremental vector indexing.
 */

// Abstraction contracts & types
export type {
  EmbeddingVector,
  EmbeddingProvider,
  VectorMetadata,
  VectorRecord,
  VectorSearchFilter,
  VectorSearchQuery,
  VectorSearchResult,
  VectorStore,
  SemanticInfrastructureStatus,
  ContentChunk,
  IndexingOptions,
  IndexingReport,
  LocalVectorIndexFile,
  SemanticSearchOptions,
  SemanticSearchResult,
  SemanticRetrievalFailureReason,
  SemanticRetrievalResponse,
} from "./types";

// Configuration & status
export {
  getSemanticConfig,
  getServerOnlyCredentials,
  getSemanticStatus,
  LOCAL_EMBEDDING_MODEL,
  LOCAL_EMBEDDING_DIMENSIONS,
  LOCAL_EMBEDDING_NORMALIZE,
  LOCAL_VECTOR_INDEX_PATH,
  SEMANTIC_SEARCH_DEFAULT_LIMIT,
  SEMANTIC_SEARCH_MAX_LIMIT,
  SEMANTIC_SEARCH_DEFAULT_THRESHOLD,
  SEMANTIC_SEARCH_MAX_EXCERPT_LENGTH,
  RRF_DEFAULT_K,
  HYBRID_SEARCH_DEFAULT_LIMIT,
  HYBRID_SEARCH_MAX_LIMIT,
  HYBRID_SEARCH_DEFAULT_SEMANTIC_THRESHOLD,
} from "./config";
export type {
  SupportedEmbeddingProvider,
  SupportedVectorStore,
  SemanticConfig,
} from "./config";

// Factories
export {
  getEmbeddingProvider,
  resetEmbeddingProvider,
} from "./provider-factory";

export {
  getVectorStore,
  resetVectorStore,
} from "./vector-store-factory";

// Implementations (Mock and Local)
export { MockEmbeddingProvider } from "./mock-provider";
export { InMemoryVectorStore } from "./mock-vector-store";
export { LocalEmbeddingProvider } from "./local-embedding-provider";
export { LocalVectorStore } from "./local-vector-store";

// Chunking & hashing
export {
  chunkContent,
  chunkResearch,
  chunkExperiment,
  chunkArticle,
  chunkGuide,
  chunkProfessionalExperience,
  computeChunkHash,
  normalizeChunkText,
  estimateTokens,
} from "./chunking";
export type { CanonicalEntity } from "./chunking";

// Indexing pipeline
export { indexPublishedContent } from "./indexer";

// Semantic retrieval
export {
  semanticSearch,
  normalizeSemanticQuery,
  createExcerpt,
} from "./retrieval";

// Evaluation dataset (Phase 8G.7)
export { EVALUATION_DATASET } from "./evaluation-dataset";
export type {
  EvaluationCategory,
  SemanticEvaluationQuery,
} from "./evaluation-dataset";
