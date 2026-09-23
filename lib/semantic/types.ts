import { ContentStatus, EntityType } from "@/data/types";

/**
 * Standard representation of an embedding vector.
 */
export interface EmbeddingVector {
  values: number[];
  dimensions: number;
}

/**
 * Provider-agnostic embedding interface.
 * Isolates all vector generation behind a swappable contract.
 */
export interface EmbeddingProvider {
  readonly name: string;
  readonly dimensions: number;

  /**
   * Generates an embedding vector for a single text input.
   */
  embedText(text: string): Promise<number[]>;

  /**
   * Generates embedding vectors for a batch of text inputs.
   */
  embedBatch(texts: string[]): Promise<number[][]>;
}

/**
 * Metadata associated with an indexed vector record.
 * Preserves full provenance and publication status for safe filtering.
 */
export interface VectorMetadata {
  chunkId: string;
  entityId: string;
  entityType: EntityType;
  slug: string;
  title: string;
  section: string;
  heading?: string;
  topics?: string[];
  sourceIds?: string[];
  status: ContentStatus;
  contentHash: string;
  content?: string;
  embeddingModel?: string;
  embeddingDimensions?: number;
}

/**
 * A single record stored in the vector index.
 */
export interface VectorRecord {
  id: string; // Stable chunkId (e.g. "PE-001#overview#0")
  values: number[];
  metadata: VectorMetadata;
}

/**
 * Metadata filter criteria for vector similarity queries.
 */
export interface VectorSearchFilter {
  /**
   * Mandatory filter ensuring unpublished or draft content is never returned.
   */
  status?: ContentStatus;
  entityType?: EntityType;
  topics?: string[];
}

/**
 * Parameter payload for vector similarity search.
 */
export interface VectorSearchQuery {
  vector: number[];
  topK?: number;
  filter?: VectorSearchFilter;
  minScore?: number;
}

/**
 * Standard result item returned from a vector search query.
 */
export interface VectorSearchResult {
  id: string;
  score: number; // Cosine similarity: 0.0 - 1.0 (internal ranking only)
  metadata: VectorMetadata;
}

/**
 * Provider-agnostic vector storage interface.
 * Abstracts storage engines (Supabase pgvector, Cloudflare Vectorize, local index, etc.)
 */
export interface VectorStore {
  readonly name: string;

  /**
   * Upserts a batch of vector records with metadata into the index.
   */
  upsert(records: VectorRecord[]): Promise<void>;

  /**
   * Deletes vectors by their unique chunk IDs.
   */
  delete(ids: string[]): Promise<void>;

  /**
   * Executes a vector similarity query with optional metadata filtering.
   */
  search(query: VectorSearchQuery): Promise<VectorSearchResult[]>;

  /**
   * Verifies health and availability of the storage layer.
   */
  isAvailable(): Promise<boolean>;

  /**
   * Optional inspection method to retrieve stored records by chunk IDs for incremental sync.
   */
  getRecords?(ids: string[]): Promise<(VectorRecord | null)[]>;

  /**
   * Optional inspection method to list all records currently in the store for synchronization.
   */
  listRecords?(): Promise<VectorRecord[]>;
}

/**
 * Operational telemetry and status of the semantic infrastructure layer.
 */
export interface SemanticInfrastructureStatus {
  providerName: string;
  providerAvailable: boolean;
  vectorStoreName: string;
  vectorStoreAvailable: boolean;
  isFullyOperational: boolean;
  mode: "disabled" | "mock" | "live";
}

/**
 * Normalized content chunk derived from canonical content models.
 */
export interface ContentChunk {
  chunkId: string; // e.g. "PE-001#overview#0"
  entityId: string;
  entityType: EntityType;
  slug: string;
  title: string;
  section: string;
  heading?: string;
  content: string;
  topics: string[];
  sourceIds?: string[];
  status: ContentStatus;
  contentHash: string;
  tokenCount: number;
}

/**
 * Configuration options for the indexing pipeline.
 */
export interface IndexingOptions {
  dryRun?: boolean;
  forceReindex?: boolean;
  provider?: EmbeddingProvider;
  store?: VectorStore;
}

/**
 * Structured report returned by the indexing pipeline.
 */
export interface IndexingReport {
  scanned: number;
  eligible: number;
  chunksGenerated: number;
  unchanged: number;
  added: number;
  updated: number;
  deleted: number;
  skipped: number;
  errors: number;
  details: string[];
  durationMs: number;
  isDryRun: boolean;
}

/**
 * Structure of the persistent derived local vector index file.
 */
export interface LocalVectorIndexFile {
  version: number;
  embeddingModel: string;
  dimensions: number;
  generatedAt: string;
  records: VectorRecord[];
}

/**
 * Options passed to semanticSearch().
 */
export interface SemanticSearchOptions {
  limit?: number;
  threshold?: number;
  entityType?: EntityType;
  topics?: string[];
  provider?: EmbeddingProvider;
  store?: VectorStore;
}

/**
 * Clean result item returned from semantic retrieval.
 * Does not expose raw vectors or internal implementation details.
 */
export interface SemanticSearchResult {
  chunkId: string;
  entityId: string;
  entityType: EntityType;
  slug: string;
  title: string;
  section: string;
  heading?: string;
  excerpt: string;
  similarity: number;
  topics?: string[];
  sourceIds?: string[];
}

/**
 * Controlled diagnostic reasons for semantic retrieval failures.
 */
export type SemanticRetrievalFailureReason =
  | "success"
  | "empty_query"
  | "semantic_index_unavailable"
  | "semantic_index_incompatible"
  | "model_initialization_failed"
  | "provider_unavailable"
  | "vector_store_unavailable";

/**
 * Structured response payload from semantic retrieval.
 */
export interface SemanticRetrievalResponse {
  results: SemanticSearchResult[];
  available: boolean;
  reason: SemanticRetrievalFailureReason;
  totalFound: number;
  durationMs: number;
  query: {
    raw: string;
    normalized: string;
  };
}
