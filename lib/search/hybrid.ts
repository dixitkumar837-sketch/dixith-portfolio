/**
 * DIXITH Hybrid Retrieval Layer
 * Phase 8G.8: Hybrid Retrieval Foundation + Evaluation
 *
 * Fuses deterministic Phase 8F lexical search with Phase 8G.6 dense semantic search
 * using entity-level consolidation and Reciprocal Rank Fusion (RRF).
 *
 * Non-negotiable principles:
 * - Git canonical content remains the sole source of truth.
 * - Semantic index is purely a derived representation.
 * - Phase 8F and Phase 8G.6 remain preserved and decoupled.
 * - Raw lexical scores and cosine similarities are NEVER mixed directly.
 * - RRF rank-based blending is used: RRF(e) = sum(1 / (k + rank)).
 * - Multiple semantic chunks for one entity collapse to a single entity candidate.
 * - Defense-in-depth publication safety (isIndexable).
 */

import { ContentStatus, isIndexable, EntityType } from "@/data/types";
import {
  searchContent,
  SearchResult,
  SearchableEntityType,
} from "../search";
import {
  semanticSearch,
  SemanticSearchResult,
  SemanticRetrievalFailureReason,
  EmbeddingProvider,
  VectorStore,
} from "../semantic";
import {
  RRF_DEFAULT_K,
  HYBRID_SEARCH_DEFAULT_LIMIT,
  HYBRID_SEARCH_MAX_LIMIT,
  HYBRID_SEARCH_DEFAULT_SEMANTIC_THRESHOLD,
} from "../semantic/config";
import { getResearchById } from "@/data/research";
import { getExperimentById } from "@/data/experiments";
import { getArticleById } from "@/data/articles";
import { getGuideById } from "@/data/guides";
import { getProfessionalExperienceById } from "@/data/professional-experience";
import {
  filterLexicalCandidates,
  LexicalQualityGateOptions,
} from "./lexical-quality";

export type RetrievalSignal = "lexical" | "semantic" | "both";

/**
 * Clean result contract representing ONE canonical content entity.
 */
export interface HybridSearchResult {
  entityId: string;
  entityType: SearchableEntityType;
  slug: string;
  title: string;
  href: string;
  summary: string;
  hybridScore: number;
  rrfScore: number;
  lexicalRank?: number;
  semanticRank?: number;
  lexicalScore?: number;
  semanticScore?: number;
  matchedFields?: string[];
  matchedChunkId?: string;
  matchedChunkExcerpt?: string;
  retrievalSignals: RetrievalSignal;
  topics?: string[];
  sourceIds?: string[];
}

export interface HybridSearchOptions {
  limit?: number;
  semanticThreshold?: number;
  rrfK?: number;
  entityType?: SearchableEntityType | "all";
  topics?: string[];
  provider?: EmbeddingProvider;
  store?: VectorStore;
  qualityGateOptions?: LexicalQualityGateOptions;
  disableQualityGate?: boolean;
}

export interface HybridSearchDiagnostics {
  lexicalCount: number;
  lexicalPreGateCount?: number;
  lexicalPostGateCount?: number;
  semanticChunksCount: number;
  semanticConsolidatedCount: number;
  lexicalAvailable: boolean;
  semanticAvailable: boolean;
  semanticReason?: SemanticRetrievalFailureReason;
}

export interface HybridSearchResponse {
  results: HybridSearchResult[];
  totalFound: number;
  durationMs: number;
  query: {
    raw: string;
    normalized: string;
  };
  diagnostics: HybridSearchDiagnostics;
}

/**
 * Intermediate consolidated representation of an entity from chunk-level semantic retrieval.
 */
interface ConsolidatedSemanticCandidate {
  entityId: string;
  entityType: SearchableEntityType;
  slug: string;
  title: string;
  semanticRank: number; // 1-based rank among consolidated entities
  semanticScore: number; // Highest similarity score among its chunks
  matchedChunkId: string;
  matchedChunkExcerpt: string;
  topics?: string[];
  sourceIds?: string[];
}

/**
 * Resolves a canonical content entity and verifies its publication safety.
 */
function resolveCanonicalEntity(
  entityType: string,
  entityId: string
): {
  isValid: boolean;
  title: string;
  slug: string;
  href: string;
  summary: string;
  topics: string[];
  sourceIds?: string[];
  status: ContentStatus;
} | null {
  switch (entityType) {
    case "professional-experience": {
      const pe = getProfessionalExperienceById(entityId);
      if (!pe || !isIndexable(pe.status)) return null;
      return {
        isValid: true,
        title: pe.title,
        slug: pe.slug,
        href: `/professional-experience/${pe.slug}`,
        summary: pe.summary || pe.overview || "",
        topics: pe.topics || [],
        sourceIds: [],
        status: pe.status,
      };
    }
    case "research": {
      const res = getResearchById(entityId);
      if (!res || !isIndexable(res.status)) return null;
      return {
        isValid: true,
        title: res.title,
        slug: res.slug,
        href: `/research/${res.slug}`,
        summary: res.summary || "",
        topics: res.topics || [],
        sourceIds: res.sourceIds || [],
        status: res.status,
      };
    }
    case "experiment": {
      const exp = getExperimentById(entityId);
      if (!exp || !isIndexable(exp.status)) return null;
      return {
        isValid: true,
        title: exp.title,
        slug: exp.slug,
        href: `/ai-search-lab/${exp.slug}`,
        summary: exp.summary || exp.purpose || "",
        topics: exp.topics || [],
        sourceIds: exp.sourceIds || [],
        status: exp.status,
      };
    }
    case "article": {
      const art = getArticleById(entityId);
      if (!art || !isIndexable(art.status)) return null;
      return {
        isValid: true,
        title: art.title,
        slug: art.slug,
        href: `/articles/${art.slug}`,
        summary: art.summary || "",
        topics: art.topics || [],
        sourceIds: art.sourceIds || [],
        status: art.status,
      };
    }
    case "guide": {
      const guide = getGuideById(entityId);
      if (!guide || !isIndexable(guide.status)) return null;
      return {
        isValid: true,
        title: guide.title,
        slug: guide.slug,
        href: `/guides/${guide.slug}`,
        summary: guide.summary || "",
        topics: guide.topics || [],
        sourceIds: guide.sourceIds || [],
        status: guide.status,
      };
    }
    default:
      return null;
  }
}

/**
 * Consolidates chunk-level semantic results into entity-level candidates.
 * Preserves the best semantic rank, highest similarity score, and strongest chunk excerpt.
 */
export function consolidateSemanticChunks(
  chunks: SemanticSearchResult[]
): ConsolidatedSemanticCandidate[] {
  const candidateMap = new Map<string, ConsolidatedSemanticCandidate>();

  for (const chunk of chunks) {
    if (!chunk.entityId) continue;

    const existing = candidateMap.get(chunk.entityId);
    if (!existing) {
      candidateMap.set(chunk.entityId, {
        entityId: chunk.entityId,
        entityType: chunk.entityType as SearchableEntityType,
        slug: chunk.slug,
        title: chunk.title,
        semanticRank: candidateMap.size + 1, // 1-based order of first appearance
        semanticScore: chunk.similarity,
        matchedChunkId: chunk.chunkId,
        matchedChunkExcerpt: chunk.excerpt,
        topics: chunk.topics,
        sourceIds: chunk.sourceIds,
      });
    } else {
      // If a subsequent chunk has a higher similarity score, update the representative chunk
      if (chunk.similarity > existing.semanticScore) {
        existing.semanticScore = chunk.similarity;
        existing.matchedChunkId = chunk.chunkId;
        existing.matchedChunkExcerpt = chunk.excerpt;
      }
    }
  }

  return Array.from(candidateMap.values());
}

/**
 * Calculates Reciprocal Rank Fusion (RRF) score:
 * RRF(entity) = sum( 1 / (k + rank) ) across retrieval systems where the entity appears.
 */
export function calculateRrfScore(
  lexicalRank: number | undefined,
  semanticRank: number | undefined,
  k: number = RRF_DEFAULT_K
): number {
  let score = 0;
  if (lexicalRank !== undefined && lexicalRank > 0) {
    score += 1 / (k + lexicalRank);
  }
  if (semanticRank !== undefined && semanticRank > 0) {
    score += 1 / (k + semanticRank);
  }
  return score;
}

/**
 * Executes hybrid retrieval across canonical DIXITH content entities.
 * Combines Phase 8F lexical search and Phase 8G.6 semantic search via RRF.
 */
export async function hybridSearch(
  query: string,
  options?: HybridSearchOptions
): Promise<HybridSearchResponse> {
  const startTime = Date.now();
  const rawQuery = query || "";
  const trimmed = rawQuery.trim();

  // 1. Guard against empty queries immediately
  if (!trimmed) {
    return {
      results: [],
      totalFound: 0,
      durationMs: Date.now() - startTime,
      query: { raw: rawQuery, normalized: "" },
      diagnostics: {
        lexicalCount: 0,
        lexicalPreGateCount: 0,
        lexicalPostGateCount: 0,
        semanticChunksCount: 0,
        semanticConsolidatedCount: 0,
        lexicalAvailable: true,
        semanticAvailable: true,
        semanticReason: "empty_query",
      },
    };
  }

  const k = options?.rrfK ?? RRF_DEFAULT_K;
  const rawLimit = options?.limit ?? HYBRID_SEARCH_DEFAULT_LIMIT;
  const limit = Math.max(1, Math.min(rawLimit, HYBRID_SEARCH_MAX_LIMIT));
  const semanticThreshold =
    options?.semanticThreshold ?? HYBRID_SEARCH_DEFAULT_SEMANTIC_THRESHOLD;

  // 2. Execute Phase 8F Lexical Retrieval
  let rawLexicalResults: SearchResult[] = [];
  let lexicalAvailable = true;
  try {
    rawLexicalResults = searchContent(trimmed, {
      typeFilter: options?.entityType,
    });
  } catch {
    lexicalAvailable = false;
    rawLexicalResults = [];
  }

  const lexicalPreGateCount = rawLexicalResults.length;

  // Phase 8G.9: Lexical Quality Gate & Negative Query Rejection
  const lexicalResults = options?.disableQualityGate
    ? rawLexicalResults
    : filterLexicalCandidates(rawLexicalResults, trimmed, options?.qualityGateOptions);
  const lexicalPostGateCount = lexicalResults.length;

  // 3. Execute Phase 8G.6 Semantic Retrieval
  let semanticChunks: SemanticSearchResult[] = [];
  let semanticAvailable = false;
  let semanticReason: SemanticRetrievalFailureReason | undefined = undefined;

  try {
    const semResponse = await semanticSearch(trimmed, {
      limit: 18, // Fetch all matching chunks in published corpus for consolidation
      threshold: semanticThreshold,
      entityType:
        options?.entityType === "all" ? undefined : (options?.entityType as EntityType),
      topics: options?.topics,
      provider: options?.provider,
      store: options?.store,
    });

    semanticAvailable = semResponse.available;
    semanticReason = semResponse.reason;
    if (semResponse.available) {
      semanticChunks = semResponse.results;
    }
  } catch {
    semanticAvailable = false;
    semanticReason = "model_initialization_failed";
    semanticChunks = [];
  }

  // 4. Consolidate Semantic Chunks to Entity Level
  const semanticCandidates = consolidateSemanticChunks(semanticChunks);

  // Diagnostic counts
  const diagnostics: HybridSearchDiagnostics = {
    lexicalCount: lexicalResults.length,
    lexicalPreGateCount,
    lexicalPostGateCount,
    semanticChunksCount: semanticChunks.length,
    semanticConsolidatedCount: semanticCandidates.length,
    lexicalAvailable,
    semanticAvailable,
    semanticReason,
  };

  // 5. Handle Both Systems Unavailable
  if (!lexicalAvailable && !semanticAvailable) {
    return {
      results: [],
      totalFound: 0,
      durationMs: Date.now() - startTime,
      query: { raw: rawQuery, normalized: trimmed.toLowerCase() },
      diagnostics,
    };
  }

  // 6. Build Entity Maps
  const lexicalMap = new Map<string, { rank: number; result: SearchResult }>();
  lexicalResults.forEach((res, index) => {
    lexicalMap.set(res.id, { rank: index + 1, result: res });
  });

  const semanticMap = new Map<string, ConsolidatedSemanticCandidate>();
  semanticCandidates.forEach((cand) => {
    semanticMap.set(cand.entityId, cand);
  });

  // 7. Collect All Unique Entity IDs
  const allEntityIds = new Set<string>([
    ...Array.from(lexicalMap.keys()),
    ...Array.from(semanticMap.keys()),
  ]);

  // 8. Fusion via Reciprocal Rank Fusion & Canonical Safety Verification
  const fusedResults: HybridSearchResult[] = [];

  for (const entityId of allEntityIds) {
    const lex = lexicalMap.get(entityId);
    const sem = semanticMap.get(entityId);

    const entityType = (lex?.result.entityType || sem?.entityType) as SearchableEntityType;

    // Defense-in-depth: Resolve canonical entity and enforce isIndexable
    const canonical = resolveCanonicalEntity(entityType, entityId);
    if (!canonical || !canonical.isValid || !isIndexable(canonical.status)) {
      continue;
    }

    // Optional topic filtering
    if (options?.topics && options.topics.length > 0) {
      const entityTopics = canonical.topics || [];
      const hasTopic = options.topics.some((t) => entityTopics.includes(t));
      if (!hasTopic) continue;
    }

    // Optional entityType filtering
    if (
      options?.entityType &&
      options.entityType !== "all" &&
      canonical &&
      entityType !== options.entityType
    ) {
      continue;
    }

    const lexicalRank = lex?.rank;
    const semanticRank = sem?.semanticRank;
    const rrfScore = calculateRrfScore(lexicalRank, semanticRank, k);

    let signals: RetrievalSignal = "both";
    if (lex && !sem) signals = "lexical";
    if (!lex && sem) signals = "semantic";

    fusedResults.push({
      entityId,
      entityType,
      slug: canonical.slug,
      title: canonical.title,
      href: canonical.href,
      summary: canonical.summary,
      hybridScore: Number(rrfScore.toFixed(6)),
      rrfScore: Number(rrfScore.toFixed(6)),
      lexicalRank,
      semanticRank,
      lexicalScore: lex?.result.score,
      semanticScore: sem?.semanticScore,
      matchedFields: lex?.result.matchedFields,
      matchedChunkId: sem?.matchedChunkId,
      matchedChunkExcerpt: sem?.matchedChunkExcerpt,
      retrievalSignals: signals,
      topics: canonical.topics,
      sourceIds: canonical.sourceIds,
    });
  }

  // 9. Deterministic Sorting
  // Primary: RRF Score DESC
  // Tie-breaker 1: entityId ASC
  // Tie-breaker 2: slug ASC
  fusedResults.sort((a, b) => {
    if (b.rrfScore !== a.rrfScore) {
      return b.rrfScore - a.rrfScore;
    }
    const cmpEntity = a.entityId.localeCompare(b.entityId);
    if (cmpEntity !== 0) return cmpEntity;
    return a.slug.localeCompare(b.slug);
  });

  // 10. Limit Enforcement (Entity-level limit)
  const finalResults = fusedResults.slice(0, limit);

  return {
    results: finalResults,
    totalFound: finalResults.length,
    durationMs: Date.now() - startTime,
    query: {
      raw: rawQuery,
      normalized: trimmed.toLowerCase(),
    },
    diagnostics,
  };
}
