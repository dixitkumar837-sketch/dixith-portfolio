/**
 * DIXITH Search Mode API Layer
 * Phase 8G.10: Controlled Hybrid Search Integration & UX Benchmark
 *
 * Centralizes multi-mode retrieval routing between Phase 8F deterministic keyword search
 * and Phase 8G.10 hybrid retrieval.
 *
 * Non-negotiable principles:
 * - Default search mode remains Phase 8F keyword search (/search?q=...).
 * - Hybrid mode is strictly opt-in via mode=hybrid (/search?q=...&mode=hybrid).
 * - Unknown or invalid modes safely fall back to keyword search.
 * - Server-side only: no embedding vectors, internal scores, or chunk IDs exposed to client.
 * - Empty query preserves search-page empty state without initializing embedding models.
 * - Graceful fallback to keyword search if hybrid retrieval encounters an error.
 */

import {
  searchContent,
  SearchResult,
  SearchableEntityType,
} from "../search";
import {
  hybridSearch,
  HybridSearchResult,
  HybridSearchOptions,
} from "./hybrid";
import { EmbeddingProvider, VectorStore } from "../semantic";

export type SearchMode = "keyword" | "hybrid";
export const DEFAULT_SEARCH_MODE: SearchMode = "keyword";

/**
 * Safely parses a raw query parameter into a validated SearchMode.
 * Unrecognized or missing values default to "keyword".
 */
export function parseSearchMode(mode?: string | null): SearchMode {
  if (mode && mode.toLowerCase().trim() === "hybrid") {
    return "hybrid";
  }
  return DEFAULT_SEARCH_MODE;
}

/**
 * Clean result presentation contract compatible with both Keyword and Hybrid retrieval modes.
 * Exposes only presentation-relevant data; internal RRF scores and embedding vectors are omitted.
 */
export interface UnifiedSearchResult {
  id: string;
  entityType: SearchableEntityType;
  title: string;
  summary: string;
  category?: string;
  slug?: string;
  href: string;
  topics: string[];
  matchedFields?: string[];
  retrievalSignals?: "lexical" | "semantic" | "both";
  matchedChunkExcerpt?: string;
}

export interface SearchWithModeOptions {
  mode?: SearchMode | string;
  typeFilter?: SearchableEntityType | "all";
  topics?: string[];
  limit?: number;
  semanticThreshold?: number;
  provider?: EmbeddingProvider;
  store?: VectorStore;
}

export interface SearchWithModeResponse {
  mode: SearchMode;
  effectiveMode: SearchMode;
  fallbackToKeyword: boolean;
  results: UnifiedSearchResult[];
  totalFound: number;
  durationMs: number;
  query: {
    raw: string;
    normalized: string;
  };
}

/**
 * Executes search according to the specified or defaulted search mode.
 * Centralizes error handling and ensures graceful degradation.
 */
export async function searchWithMode(
  query: string,
  options?: SearchWithModeOptions
): Promise<SearchWithModeResponse> {
  const startTime = Date.now();
  const rawQuery = query || "";
  const trimmed = rawQuery.trim();
  const requestedMode = parseSearchMode(options?.mode);

  // 1. Guard against empty query: return immediately without model loading
  if (!trimmed) {
    return {
      mode: requestedMode,
      effectiveMode: requestedMode,
      fallbackToKeyword: false,
      results: [],
      totalFound: 0,
      durationMs: 0,
      query: { raw: rawQuery, normalized: "" },
    };
  }

  // 2. Keyword Mode Execution (Phase 8F Deterministic Lexical Search)
  if (requestedMode === "keyword") {
    return executeKeywordSearch(rawQuery, trimmed, startTime, options?.typeFilter);
  }

  // 3. Hybrid Mode Execution (Phase 8G.10 Opt-in Hybrid Search)
  try {
    const hybridResponse = await hybridSearch(trimmed, {
      entityType: options?.typeFilter,
      topics: options?.topics,
      limit: options?.limit,
      semanticThreshold: options?.semanticThreshold,
      provider: options?.provider,
      store: options?.store,
    });

    // If semantic retrieval was unavailable (index missing, model failure), fallback to keyword
    if (!hybridResponse.diagnostics.semanticAvailable) {
      return executeKeywordFallback(rawQuery, trimmed, startTime, options?.typeFilter);
    }

    const unifiedResults: UnifiedSearchResult[] = hybridResponse.results.map((r) => ({
      id: r.entityId,
      entityType: r.entityType,
      title: r.title,
      summary: r.summary,
      category: r.entityType === "professional-experience" ? "Experience" : undefined,
      slug: r.slug,
      href: r.href,
      topics: r.topics || [],
      matchedFields: r.matchedFields,
      retrievalSignals: r.retrievalSignals,
      matchedChunkExcerpt: r.matchedChunkExcerpt,
    }));

    return {
      mode: "hybrid",
      effectiveMode: "hybrid",
      fallbackToKeyword: false,
      results: unifiedResults,
      totalFound: unifiedResults.length,
      durationMs: Date.now() - startTime,
      query: hybridResponse.query,
    };
  } catch {
    // 4. Graceful Fallback to Keyword Search on Hybrid Error
    return executeKeywordFallback(rawQuery, trimmed, startTime, options?.typeFilter);
  }
}

/**
 * Helper to run standard Phase 8F lexical search.
 */
function executeKeywordSearch(
  rawQuery: string,
  trimmed: string,
  startTime: number,
  typeFilter?: SearchableEntityType | "all"
): SearchWithModeResponse {
  const lexicalResults = searchContent(trimmed, { typeFilter });

  const unifiedResults: UnifiedSearchResult[] = lexicalResults.map((r) => ({
    id: r.id,
    entityType: r.entityType,
    title: r.title,
    summary: r.summary,
    category: r.category,
    href: r.href,
    topics: r.topics || [],
    matchedFields: r.matchedFields,
    retrievalSignals: "lexical",
  }));

  return {
    mode: "keyword",
    effectiveMode: "keyword",
    fallbackToKeyword: false,
    results: unifiedResults,
    totalFound: unifiedResults.length,
    durationMs: Date.now() - startTime,
    query: {
      raw: rawQuery,
      normalized: trimmed.toLowerCase(),
    },
  };
}

/**
 * Helper to execute fallback keyword search when hybrid retrieval is unavailable.
 */
function executeKeywordFallback(
  rawQuery: string,
  trimmed: string,
  startTime: number,
  typeFilter?: SearchableEntityType | "all"
): SearchWithModeResponse {
  const lexicalResults = searchContent(trimmed, { typeFilter });

  const unifiedResults: UnifiedSearchResult[] = lexicalResults.map((r) => ({
    id: r.id,
    entityType: r.entityType,
    title: r.title,
    summary: r.summary,
    category: r.category,
    href: r.href,
    topics: r.topics || [],
    matchedFields: r.matchedFields,
    retrievalSignals: "lexical",
  }));

  return {
    mode: "hybrid",
    effectiveMode: "keyword",
    fallbackToKeyword: true,
    results: unifiedResults,
    totalFound: unifiedResults.length,
    durationMs: Date.now() - startTime,
    query: {
      raw: rawQuery,
      normalized: trimmed.toLowerCase(),
    },
  };
}
