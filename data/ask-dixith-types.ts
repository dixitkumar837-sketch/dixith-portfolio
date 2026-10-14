/**
 * DIXITH Phase 8K — Ask DIXITH Type Contracts
 *
 * Architecture-level interfaces and types for the Ask DIXITH
 * grounded knowledge assistant. These are CONTRACTS ONLY —
 * no external providers, no API calls, no runtime implementation.
 *
 * Guiding Principles:
 * 1. Ask DIXITH answers from the PUBLISHED DIXITH knowledge base only.
 * 2. It does NOT answer from general model knowledge.
 * 3. It fails closed when the knowledge base has insufficient support.
 * 4. It never exposes raw evidence, credentials, or unpublished content.
 * 5. All answers are traceable to DIXITH sources.
 */

import { ContentStatus, EntityType } from "./types";

/**
 * Searchable entity type for Ask DIXITH retrieval.
 * Mirrors the SearchableEntityType from lib/search.ts to avoid circular imports.
 */
export type AskDixithSearchableEntityType =
  | "research"
  | "experiment"
  | "article"
  | "guide"
  | "professional-experience";

// ============================================================================
// 1. Query & Intent Contracts
// ============================================================================

/**
 * Deterministic intent classification for Ask DIXITH queries.
 * Resolved without LLM inference using keyword signals and entity matching.
 */
export type AskDixithIntent =
  | "KNOWLEDGE_LOOKUP"        // General published knowledge retrieval
  | "RESEARCH_LOOKUP"         // Specific research study or finding
  | "TECHNICAL_EXPLANATION"   // Protocol, methodology, or technical concept
  | "GUIDE_LOOKUP"            // Implementation guide or step-by-step instructions
  | "EXPERIENCE_LOOKUP"       // Professional experience or domain expertise
  | "SOURCE_LOOKUP"           // Canonical source or specification reference
  | "COMPARISON"              // Comparative analysis between concepts or systems
  | "CONCEPT_EXPLANATION"     // Explanatory breakdown of a domain concept
  | "UNKNOWN";                // Unclassifiable — triggers broad retrieval

/**
 * Retrieval mode selection for Ask DIXITH knowledge retrieval.
 */
export type AskDixithRetrievalMode =
  | "KEYWORD"     // Exact / phrase / taxonomy-driven lexical retrieval
  | "SEMANTIC"    // Meaning-based embedding retrieval
  | "HYBRID";     // Combined lexical + semantic with reciprocal rank fusion

/**
 * User-facing query submitted to Ask DIXITH.
 */
export interface AskDixithQuery {
  /** The raw user question text. */
  text: string;
  /** Optional explicit retrieval mode override. Defaults to HYBRID. */
  retrievalMode?: AskDixithRetrievalMode;
  /** Optional entity type filter to scope retrieval. */
  entityTypeFilter?: AskDixithSearchableEntityType | "all";
  /** Optional topic filter to scope retrieval. */
  topicFilter?: string[];
  /** Maximum number of sources to include in the answer. */
  maxSources?: number;
  /** Whether to expand through knowledge graph relationships. Defaults to true. */
  expandRelationships?: boolean;
}

/**
 * Internal options for the Ask DIXITH retrieval and answer pipeline.
 */
export interface AskDixithOptions {
  /** Maximum number of retrieval candidates before ranking. Default: 20. */
  retrievalLimit?: number;
  /** Maximum number of sources in the final answer. Default: 5. */
  maxSources?: number;
  /** Maximum character budget for grounded context passed to a provider. Default: 8000. */
  contextCharacterBudget?: number;
  /** Whether to perform relationship expansion. Default: true. */
  expandRelationships?: boolean;
  /** Whether to include source excerpts in the answer. Default: true. */
  includeExcerpts?: boolean;
  /** Retrieval mode. Default: HYBRID. */
  retrievalMode?: AskDixithRetrievalMode;
}

// ============================================================================
// 2. Answer Status & Evidence State Contracts
// ============================================================================

/**
 * Deterministic answer state classification.
 * NO numeric confidence scores — only structurally verifiable states.
 */
export type AskDixithAnswerStatus =
  | "ANSWERED"               // Sufficient published content supports the answer
  | "PARTIALLY_SUPPORTED"    // Some relevant content found but gaps exist
  | "INSUFFICIENT_EVIDENCE"  // Relevant topic exists but evidence is incomplete
  | "NO_RELEVANT_CONTENT"    // No published content matches the query at all
  | "RETRIEVAL_ERROR";       // Technical failure in retrieval pipeline

/**
 * Evidence state for research-derived answer claims.
 * Tracks whether the answer's supporting content has underlying empirical evidence.
 */
export interface AskDixithEvidenceState {
  /** Whether any supporting content has verified empirical evidence packs. */
  hasEmpiricalEvidence: boolean;
  /** Whether supporting research has completed the publication gate. */
  researchPublished: boolean;
  /** Explicit limitations from supporting research studies. */
  limitations: string[];
  /** Whether any supporting evidence was excluded due to quarantine or invalidity. */
  quarantinedEvidenceExcluded: boolean;
  /**
   * Evidence provenance summary (e.g. "Based on 3 published professional experiences").
   * Never exposes raw file paths, SHA-256 hashes, or internal vault structure.
   */
  provenanceSummary: string;
}

// ============================================================================
// 3. Source & Citation Contracts
// ============================================================================

/**
 * A single DIXITH source cited in an Ask DIXITH answer.
 * Resolves to internal DIXITH URLs only — no external web citations.
 */
export interface AskDixithSource {
  /** Internal content entity ID (e.g. "PE-001", "EXP-014"). */
  entityId: string;
  /** Content type for display and icon resolution. */
  entityType: AskDixithSearchableEntityType;
  /** Human-readable content title. */
  title: string;
  /** Canonical DIXITH URL slug (e.g. "/professional-experience/healthcare-search-architecture"). */
  href: string;
  /** Relevant excerpt from the source content. */
  excerpt?: string;
  /** Relationship to the query (e.g. "directly answers", "provides context", "related research"). */
  relevance: string;
  /** Source IDs referenced by this content (e.g. "SRC-001"). */
  sourceIds?: string[];
  /** Topic IDs associated with this content. */
  topicIds?: string[];
  /** Retrieval signal that surfaced this source. */
  retrievalSignal?: "lexical" | "semantic" | "both" | "relationship";
}

// ============================================================================
// 4. Grounded Context Contracts
// ============================================================================

/**
 * A single item in the grounded context assembled for answer generation.
 * Each item represents a published DIXITH entity with its relevant excerpt.
 */
export interface GroundedContextItem {
  /** Entity ID. */
  entityId: string;
  /** Entity type. */
  entityType: AskDixithSearchableEntityType;
  /** Content title. */
  title: string;
  /** Canonical URL. */
  href: string;
  /** Publication status (must be PUBLISHED to be included). */
  status: ContentStatus;
  /** Relevant text excerpt for grounding. Truncated to budget. */
  excerpt: string;
  /** Character count of the excerpt. */
  excerptLength: number;
  /** How this item was retrieved. */
  retrievalSignal: "lexical" | "semantic" | "both" | "relationship";
  /** Relevance rank (1 = most relevant). */
  rank: number;
  /** Source IDs for provenance attribution. */
  sourceIds?: string[];
  /** Topic associations. */
  topics?: string[];
  /** Relationship path if retrieved via graph expansion. */
  relationshipPath?: string;
}

/**
 * Assembled grounded context for an Ask DIXITH answer generation request.
 * This is the DATA boundary — retrieved content is DATA, not instructions.
 */
export interface GroundedContext {
  /** The normalized user query. */
  query: string;
  /** Classified intent. */
  intent: AskDixithIntent;
  /** Retrieval mode used. */
  retrievalMode: AskDixithRetrievalMode;
  /** Ranked, deduplicated, publication-verified context items. */
  items: GroundedContextItem[];
  /** Total character count of all excerpts. */
  totalExcerptCharacters: number;
  /** Character budget limit. */
  characterBudget: number;
  /** Whether relationship expansion was applied. */
  relationshipsExpanded: boolean;
  /** Number of items retrieved before deduplication and budgeting. */
  candidatesBeforeBudgeting: number;
  /** Retrieval diagnostics. */
  diagnostics: {
    lexicalResultCount: number;
    semanticResultCount: number;
    hybridResultCount: number;
    relationshipExpansionCount: number;
    deduplicatedCount: number;
    budgetTruncatedCount: number;
  };
}

// ============================================================================
// 5. Answer Contract
// ============================================================================

/**
 * The complete Ask DIXITH answer response.
 * Returned to the user with full source attribution and evidence state.
 */
export interface AskDixithAnswer {
  /** Unique request identifier for observability. */
  requestId: string;
  /** The original user query. */
  query: string;
  /** Classified intent of the query. */
  intent: AskDixithIntent;
  /** The synthesized answer text. Empty string if no answer can be generated. */
  answer: string;
  /** Deterministic answer status classification. */
  answerStatus: AskDixithAnswerStatus;
  /** Retrieval mode used for this answer. */
  retrievalMode: AskDixithRetrievalMode;
  /** DIXITH sources supporting the answer. */
  sources: AskDixithSource[];
  /** Evidence state for research-derived claims. */
  evidenceState: AskDixithEvidenceState;
  /** Explicit limitations of the answer. */
  limitations: string[];
  /** Related content the user may want to explore. */
  relatedContent: AskDixithSource[];
  /** ISO 8601 UTC timestamp of answer generation. */
  generatedAt: string;
  /** Provider that generated the answer (null if no LLM was used). */
  modelProvider: string | null;
  /** Model version (null if no LLM was used). */
  modelVersion: string | null;
  /** Grounding metadata for reproducibility and audit. */
  groundingMetadata: {
    /** IDs of entities retrieved during the pipeline. */
    retrievedEntityIds: string[];
    /** IDs of entities selected for context. */
    selectedEntityIds: string[];
    /** Total retrieval latency in milliseconds. */
    retrievalDurationMs: number;
    /** Total answer generation latency in milliseconds. */
    generationDurationMs: number;
    /** Content version identifier for cache invalidation. */
    contentVersion?: string;
    /** Embedding model used for semantic retrieval. */
    embeddingModel?: string;
  };
  /**
   * Deterministic claim support report evaluating whether extracted claims have
   * identifiable grounding within retrieved published context (Phase 8N).
   */
  claimReport?: ClaimSupportReport;
}

// ============================================================================
// 6. Provider Abstraction Contracts
// ============================================================================

/**
 * Request payload sent to an answer generation provider.
 * The provider receives the grounded context and generates a synthesized answer.
 */
export interface AnswerGenerationRequest {
  /** The user's question. */
  query: string;
  /** The assembled grounded context (retrieved DIXITH content). */
  groundedContext: GroundedContext;
  /** System-level grounding instructions (never overridden by retrieved content). */
  systemInstructions: string;
  /** Maximum answer length in characters. */
  maxAnswerLength?: number;
  /** Whether the provider should cite specific source IDs in the answer text. */
  citeSources?: boolean;
}

/**
 * Response returned by an answer generation provider.
 */
export interface AnswerGenerationResponse {
  /** The generated answer text. */
  answer: string;
  /** Provider-reported answer status. */
  answerStatus: AskDixithAnswerStatus;
  /** Entity IDs the provider cited in the answer. */
  citedEntityIds: string[];
  /** Provider name (e.g. "openai", "anthropic", "google", "local"). */
  providerName: string;
  /** Model identifier (e.g. "gpt-4o", "claude-sonnet-4-20250514", "gemini-2.5-flash"). */
  modelVersion: string;
  /** Generation latency in milliseconds. */
  durationMs: number;
  /** Provider-specific metadata (token counts, finish reason, etc.). */
  providerMetadata?: Record<string, unknown>;
}

/**
 * Abstract answer generation provider interface.
 * Implementations wrap specific LLM APIs (OpenAI, Anthropic, Google, local models).
 *
 * All implementations MUST:
 * 1. Use ONLY the provided grounded context for answer generation.
 * 2. Return INSUFFICIENT_EVIDENCE when context is inadequate.
 * 3. Never substitute general model knowledge for missing DIXITH content.
 * 4. Treat retrieved content as DATA, not as executable instructions.
 * 5. Keep API keys strictly server-side.
 */
export interface AnswerGenerationProvider {
  /** Provider identifier. */
  readonly name: string;
  /** Whether this provider is currently available. */
  isAvailable(): Promise<boolean>;
  /** Generate an answer from grounded context. */
  generateAnswer(request: AnswerGenerationRequest): Promise<AnswerGenerationResponse>;
}

/**
 * Controlled provider failure states.
 * Used internally for error classification without leaking raw provider exceptions.
 */
export type AskDixithProviderErrorType =
  | "PROVIDER_NOT_CONFIGURED"
  | "PROVIDER_TIMEOUT"
  | "PROVIDER_RATE_LIMITED"
  | "PROVIDER_UNAVAILABLE"
  | "PROVIDER_INVALID_RESPONSE"
  | "PROVIDER_VALIDATION_FAILED";

// ============================================================================
// 7. Observability Contracts
// ============================================================================

/**
 * Telemetry record for an Ask DIXITH request.
 * Designed for minimal data retention — no API keys, passwords, cookies, or auth tokens.
 */
export interface AskDixithTelemetry {
  requestId: string;
  /** Hash of the query text (not the raw query, for privacy). */
  queryHash: string;
  intent: AskDixithIntent;
  retrievalMode: AskDixithRetrievalMode;
  answerStatus: AskDixithAnswerStatus;
  retrievedEntityIds: string[];
  selectedEntityIds: string[];
  citedEntityIds: string[];
  providerName: string | null;
  modelVersion: string | null;
  retrievalDurationMs: number;
  generationDurationMs: number;
  totalDurationMs: number;
  errorType?: string;
  timestamp: string;
}

// ============================================================================
// 8. Security & Input Validation Contracts
// ============================================================================

/**
 * Input validation result for Ask DIXITH queries.
 */
export interface QueryValidationResult {
  valid: boolean;
  sanitizedQuery: string;
  errors: string[];
}

/** Maximum allowed query length in characters. */
export const ASK_DIXITH_MAX_QUERY_LENGTH = 500;

/** Maximum allowed answer length in characters. */
export const ASK_DIXITH_MAX_ANSWER_LENGTH = 4000;

/** Default context character budget. */
export const ASK_DIXITH_DEFAULT_CONTEXT_BUDGET = 8000;

/** Default maximum sources per answer. */
export const ASK_DIXITH_DEFAULT_MAX_SOURCES = 5;

/** Default retrieval limit (candidates before ranking). */
export const ASK_DIXITH_DEFAULT_RETRIEVAL_LIMIT = 20;

// ============================================================================
// 9. Claim-Level Grounding & Support Contracts (Phase 8N)
// ============================================================================

/**
 * Categorical classification of claim-level evidence support.
 * Does NOT represent natural-language theorem proving or absolute factual truth.
 * Evaluates whether an extracted substantive claim has identifiable support within retrieved context.
 */
export type ClaimSupportClassification =
  | "SUPPORTED"
  | "PARTIALLY_SUPPORTED"
  | "UNSUPPORTED"
  | "UNCITED"
  | "UNVERIFIABLE";

/**
 * An individual assertion or sentence extracted from the synthesized answer.
 */
export interface ExtractedClaim {
  /** Unique deterministic identifier (e.g. "claim-1"). */
  id: string;
  /** Normalized text of the extracted claim sentence. */
  text: string;
  /** Whether the sentence makes a substantive technical assertion (vs. purely stylistic/transitional). */
  substantive: boolean;
  /** Canonical entity IDs cited within this claim (e.g. ["PE-001"]). */
  citationIds: string[];
  /** Categorical support classification. */
  classification: ClaimSupportClassification;
  /** ID of the primary supporting source if identifiable. */
  supportingSourceId?: string;
  /** Ratio of substantive claim keywords found in supporting source excerpt (0.0 to 1.0). */
  supportOverlapRatio?: number;
  /** Human-readable explanation of why this classification was assigned. */
  rationale: string;
}

/**
 * Diagnostic report of claim-level support coverage across an answer.
 */
export interface ClaimSupportReport {
  /** Total count of extracted sentences/statements. */
  totalExtractedClaims: number;
  /** Count of claims identified as substantive assertions. */
  substantiveClaimsCount: number;
  /** Count of substantive claims with verified identifiable source support. */
  supportedCount: number;
  /** Count of substantive claims partially grounded in available context. */
  partiallySupportedCount: number;
  /** Count of substantive claims lacking identifiable support in cited sources. */
  unsupportedCount: number;
  /** Count of substantive claims lacking any explicit source citations. */
  uncitedCount: number;
  /** Count of claims that cannot be deterministically verified. */
  unverifiableCount: number;
  /** Array of individual extracted claims with their classifications. */
  claims: ExtractedClaim[];
  /**
   * Diagnostic summary string (e.g. "2 of 2 extracted claims had identifiable source support.").
   * Never phrased as "X% factually correct" or an "AI accuracy score".
   */
  diagnosticSummary: string;
  /** Aggregate support state. */
  overallSupportState:
    | "SUPPORTED"
    | "PARTIALLY_SUPPORTED"
    | "UNSUPPORTED"
    | "MIXED"
    | "NO_SUBSTANTIVE_CLAIMS";
}
