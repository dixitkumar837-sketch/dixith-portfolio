/**
 * DIXITH Phase 8K — Ask DIXITH Knowledge Retrieval Adapter
 *
 * Architecture-level retrieval contracts that compose existing search infrastructure
 * into a grounded knowledge retrieval pipeline for Ask DIXITH.
 *
 * This module does NOT duplicate existing search implementations.
 * It wraps:
 *   - lib/search.ts (keyword/lexical search)
 *   - lib/semantic/index.ts (semantic vector search)
 *   - lib/search/hybrid.ts (hybrid RRF search)
 *   - lib/content-utils.ts (relationship graph helpers)
 *
 * No external providers. No API calls. No paid infrastructure.
 */

import {
  searchContent,
  buildSearchIndex,
  SearchResult,
  SearchableEntityType,
} from "../search";
import {
  hybridSearch,
  HybridSearchResult,
  HybridSearchResponse,
} from "../search/hybrid";
import {
  semanticSearch,
  LocalEmbeddingProvider,
  LocalVectorStore,
} from "../semantic";
import {
  resolveEntity,
  getRelatedContent,
  getSourcesForContent,
  getTopicsForContent,
} from "../content-utils";
import { isIndexable, ContentStatus, EntityType } from "../../data/types";
import {
  AskDixithQuery,
  AskDixithOptions,
  AskDixithIntent,
  AskDixithRetrievalMode,
  GroundedContext,
  GroundedContextItem,
  AskDixithSource,
  AskDixithAnswerStatus,
  AskDixithEvidenceState,
  QueryValidationResult,
  ASK_DIXITH_MAX_QUERY_LENGTH,
  ASK_DIXITH_DEFAULT_CONTEXT_BUDGET,
  ASK_DIXITH_DEFAULT_MAX_SOURCES,
  ASK_DIXITH_DEFAULT_RETRIEVAL_LIMIT,
} from "../../data/ask-dixith-types";

// ============================================================================
// 1. Query Validation
// ============================================================================

/**
 * Validates and sanitizes a user query for Ask DIXITH.
 * Strips HTML, control characters, and enforces length limits.
 * Does NOT attempt prompt-injection detection (that is the provider's responsibility).
 */
export function validateAskDixithQuery(rawQuery: string): QueryValidationResult {
  const errors: string[] = [];

  if (!rawQuery || typeof rawQuery !== "string") {
    return { valid: false, sanitizedQuery: "", errors: ["Query is required."] };
  }

  // Strip HTML tags and control characters
  let sanitized = rawQuery
    .replace(/<[^>]*>/g, "")           // Remove HTML tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "") // Remove control chars (preserve \n, \r, \t)
    .trim();

  if (sanitized.length === 0) {
    errors.push("Query is empty after sanitization.");
    return { valid: false, sanitizedQuery: "", errors };
  }

  if (sanitized.length > ASK_DIXITH_MAX_QUERY_LENGTH) {
    sanitized = sanitized.slice(0, ASK_DIXITH_MAX_QUERY_LENGTH);
    errors.push(`Query truncated to ${ASK_DIXITH_MAX_QUERY_LENGTH} characters.`);
    // Still valid — truncation is a warning, not a rejection
  }

  return { valid: true, sanitizedQuery: sanitized, errors };
}

// ============================================================================
// 2. Deterministic Intent Classification
// ============================================================================

/**
 * Intent signal patterns for deterministic classification.
 * No LLM required — uses keyword matching against the normalized query.
 */
const INTENT_SIGNALS: { intent: AskDixithIntent; patterns: RegExp[] }[] = [
  {
    intent: "GUIDE_LOOKUP",
    patterns: [
      /\b(how\s+to|implement|setup|configure|step[s]?\s+to|guide|tutorial|instructions?)\b/i,
      /\b(schema\.org|json-?ld|structured\s+data|crawler\s+access)\b/i,
    ],
  },
  {
    intent: "RESEARCH_LOOKUP",
    patterns: [
      /\b(research|study|finding|experiment|citation\s+pattern|evidence|methodology)\b/i,
      /\b(EXP-\d{3}|research\s+question|query\s+battery)\b/i,
    ],
  },
  {
    intent: "EXPERIENCE_LOOKUP",
    patterns: [
      /\b(experience|role|professional|career|work\s+at|position|employment)\b/i,
      /\b(PE-\d{3}|healthcare|e-?commerce|international)\b/i,
    ],
  },
  {
    intent: "TECHNICAL_EXPLANATION",
    patterns: [
      /\b(explain|what\s+is|define|definition|protocol|architecture|how\s+does)\b/i,
      /\b(RAG|retrieval|embedding|vector|BM25|semantic|hybrid)\b/i,
    ],
  },
  {
    intent: "SOURCE_LOOKUP",
    patterns: [
      /\b(source|reference|specification|RFC|W3C|documentation|SRC-\d{3})\b/i,
    ],
  },
  {
    intent: "COMPARISON",
    patterns: [
      /\b(compare|comparison|difference|versus|vs\.?|differ)\b/i,
    ],
  },
  {
    intent: "CONCEPT_EXPLANATION",
    patterns: [
      /\b(concept|theory|principle|overview|introduction|fundamentals?)\b/i,
      /\b(AEO|GEO|E-?E-?A-?T|SEO|knowledge\s+graph|entity\s+graph)\b/i,
    ],
  },
  {
    intent: "KNOWLEDGE_LOOKUP",
    patterns: [
      /\b(AI\s+search|search\s+engine|answer\s+engine|generative|Gemini|ChatGPT|Perplexity|Claude|Copilot)\b/i,
    ],
  },
];

/**
 * Classifies query intent deterministically using keyword signals.
 * Returns UNKNOWN if no signal matches with sufficient confidence.
 */
export function classifyIntent(query: string): AskDixithIntent {
  const normalized = query.toLowerCase().trim();

  for (const signal of INTENT_SIGNALS) {
    const matchCount = signal.patterns.filter((p) => p.test(normalized)).length;
    if (matchCount >= 1) {
      return signal.intent;
    }
  }

  return "UNKNOWN";
}

// ============================================================================
// 3. Knowledge Retrieval Pipeline
// ============================================================================

/**
 * Internal retrieval candidate used during pipeline processing.
 */
interface RetrievalCandidate {
  entityId: string;
  entityType: SearchableEntityType;
  title: string;
  href: string;
  status: ContentStatus;
  excerpt: string;
  score: number;
  retrievalSignal: "lexical" | "semantic" | "both" | "relationship";
  sourceIds?: string[];
  topics?: string[];
  matchedFields?: string[];
}

/**
 * Retrieves published DIXITH knowledge for a query.
 * Composes existing search infrastructure without duplication.
 *
 * Pipeline:
 *   1. Validate and sanitize query
 *   2. Execute retrieval (keyword / semantic / hybrid)
 *   3. Filter to PUBLISHED-only content
 *   4. Optionally expand through knowledge graph relationships
 *   5. Deduplicate
 *   6. Rank and truncate to budget
 *   7. Return GroundedContext
 */
export async function retrieveKnowledge(
  query: AskDixithQuery,
  options?: AskDixithOptions
): Promise<GroundedContext> {
  const opts: Required<AskDixithOptions> = {
    retrievalLimit: options?.retrievalLimit ?? ASK_DIXITH_DEFAULT_RETRIEVAL_LIMIT,
    maxSources: options?.maxSources ?? ASK_DIXITH_DEFAULT_MAX_SOURCES,
    contextCharacterBudget: options?.contextCharacterBudget ?? ASK_DIXITH_DEFAULT_CONTEXT_BUDGET,
    expandRelationships: options?.expandRelationships ?? (query.expandRelationships ?? true),
    includeExcerpts: options?.includeExcerpts ?? true,
    retrievalMode: options?.retrievalMode ?? (query.retrievalMode ?? "HYBRID"),
  };

  const intent = classifyIntent(query.text);
  const candidates: RetrievalCandidate[] = [];

  let lexicalCount = 0;
  let semanticCount = 0;
  let hybridCount = 0;

  // ── Step 1: Execute Primary Retrieval ──────────────────────────────────

  if (opts.retrievalMode === "KEYWORD") {
    const results = searchContent(query.text, {
      typeFilter: query.entityTypeFilter,
    });
    lexicalCount = results.length;
    for (const r of results) {
      candidates.push({
        entityId: r.id,
        entityType: r.entityType,
        title: r.title,
        href: r.href,
        status: "PUBLISHED", // searchContent only returns indexable content
        excerpt: r.summary || "",
        score: r.score,
        retrievalSignal: "lexical",
        topics: r.topics,
        matchedFields: r.matchedFields,
      });
    }
  } else if (opts.retrievalMode === "SEMANTIC") {
    const provider = new LocalEmbeddingProvider();
    const store = new LocalVectorStore();
    await store.load();

    const semResponse = await semanticSearch(query.text, {
      provider,
      store,
      limit: opts.retrievalLimit,
    });
    semanticCount = semResponse.results.length;

    for (const r of semResponse.results) {
      candidates.push({
        entityId: r.entityId,
        entityType: r.entityType as SearchableEntityType,
        title: r.title,
        href: `/${r.entityType}/${r.slug}`,
        status: "PUBLISHED",
        excerpt: r.excerpt || "",
        score: r.similarity,
        retrievalSignal: "semantic",
        sourceIds: r.sourceIds,
        topics: r.topics,
      });
    }
  } else {
    // HYBRID (default)
    const provider = new LocalEmbeddingProvider();
    const store = new LocalVectorStore();

    const hybResponse = await hybridSearch(query.text, {
      provider,
      store,
      limit: opts.retrievalLimit,
      entityType: query.entityTypeFilter,
    });
    hybridCount = hybResponse.results.length;

    for (const r of hybResponse.results) {
      candidates.push({
        entityId: r.entityId,
        entityType: r.entityType,
        title: r.title,
        href: r.href,
        status: "PUBLISHED",
        excerpt: r.matchedChunkExcerpt || r.summary || "",
        score: r.hybridScore,
        retrievalSignal: r.retrievalSignals,
        sourceIds: r.sourceIds,
        topics: r.topics,
        matchedFields: r.matchedFields,
      });
    }
  }

  // ── Step 2: Deduplicate ────────────────────────────────────────────────

  const seen = new Set<string>();
  const deduped: RetrievalCandidate[] = [];
  for (const c of candidates) {
    if (!seen.has(c.entityId)) {
      seen.add(c.entityId);
      deduped.push(c);
    }
  }

  // ── Step 3: Relationship Expansion ─────────────────────────────────────

  let relationshipExpansionCount = 0;
  if (opts.expandRelationships && deduped.length > 0) {
    const relatedIds = new Set<string>();
    // Expand from the top 3 results only to limit fan-out
    const topResults = deduped.slice(0, 3);
    for (const top of topResults) {
      const related = getRelatedContent(top.entityType as EntityType, top.entityId, {
        publicOnly: true,
      });
      for (const rel of related) {
        if (!seen.has(rel.targetId)) {
          relatedIds.add(rel.targetId);
          seen.add(rel.targetId);

          const entity = resolveEntity(rel.targetType, rel.targetId) as any;
          if (entity && isIndexable(entity.status)) {
            deduped.push({
              entityId: rel.targetId,
              entityType: rel.targetType as SearchableEntityType,
              title: entity.title || rel.targetId,
              href: `/${rel.targetType}/${entity.slug || rel.targetId}`,
              status: entity.status,
              excerpt: entity.summary || entity.overview || "",
              score: 0, // Relationship-expanded items have no retrieval score
              retrievalSignal: "relationship",
              sourceIds: entity.sourceIds,
              topics: entity.topics,
            });
            relationshipExpansionCount++;
          }
        }
      }
    }
  }

  // ── Step 4: Publication Safety Filter ──────────────────────────────────

  const published = deduped.filter((c) => isIndexable(c.status));

  // ── Step 5: Budget and Truncate ────────────────────────────────────────

  let totalChars = 0;
  let budgetTruncatedCount = 0;
  const budgeted: GroundedContextItem[] = [];
  const candidatesBeforeBudgeting = published.length;

  for (let i = 0; i < published.length; i++) {
    const c = published[i];
    const excerptLength = c.excerpt.length;

    if (totalChars + excerptLength > opts.contextCharacterBudget && budgeted.length > 0) {
      budgetTruncatedCount++;
      continue;
    }

    totalChars += excerptLength;
    budgeted.push({
      entityId: c.entityId,
      entityType: c.entityType,
      title: c.title,
      href: c.href,
      status: c.status,
      excerpt: c.excerpt,
      excerptLength: excerptLength,
      retrievalSignal: c.retrievalSignal,
      rank: budgeted.length + 1,
      sourceIds: c.sourceIds,
      topics: c.topics,
      relationshipPath: c.retrievalSignal === "relationship" ? "graph_expansion" : undefined,
    });

    if (budgeted.length >= opts.maxSources) break;
  }

  // ── Step 6: Construct GroundedContext ───────────────────────────────────

  return {
    query: query.text,
    intent,
    retrievalMode: opts.retrievalMode,
    items: budgeted,
    totalExcerptCharacters: totalChars,
    characterBudget: opts.contextCharacterBudget,
    relationshipsExpanded: opts.expandRelationships,
    candidatesBeforeBudgeting,
    diagnostics: {
      lexicalResultCount: lexicalCount,
      semanticResultCount: semanticCount,
      hybridResultCount: hybridCount,
      relationshipExpansionCount,
      deduplicatedCount: candidates.length - deduped.length + (deduped.length - published.length),
      budgetTruncatedCount,
    },
  };
}

// ============================================================================
// 4. Grounded Context Builder
// ============================================================================

/**
 * Converts GroundedContext items into AskDixithSource references for the answer.
 * Strips internal metadata and produces user-facing source citations.
 */
export function buildSourceCitations(context: GroundedContext): AskDixithSource[] {
  return context.items.map((item) => ({
    entityId: item.entityId,
    entityType: item.entityType,
    title: item.title,
    href: item.href,
    excerpt: item.excerpt.length > 300 ? item.excerpt.slice(0, 300) + "..." : item.excerpt,
    relevance: item.rank === 1 ? "directly answers" : item.retrievalSignal === "relationship" ? "related context" : "supporting evidence",
    sourceIds: item.sourceIds,
    topicIds: item.topics,
    retrievalSignal: item.retrievalSignal,
  }));
}

/**
 * Determines the evidence state for an Ask DIXITH answer based on supporting context.
 */
export function resolveEvidenceState(context: GroundedContext): AskDixithEvidenceState {
  const hasContent = context.items.length > 0;
  const allPublished = context.items.every((item) => isIndexable(item.status));
  const limitations: string[] = [];

  if (!hasContent) {
    limitations.push("No published DIXITH content found for this query.");
  }

  if (context.items.some((item) => item.retrievalSignal === "relationship")) {
    limitations.push("Some supporting content was retrieved through relationship expansion rather than direct matching.");
  }

  return {
    hasEmpiricalEvidence: false, // Will be true when published research with EvidencePacks exists
    researchPublished: false,   // Will be true when research entities reach PUBLISHED status
    limitations,
    quarantinedEvidenceExcluded: false, // Quarantined evidence is architecturally excluded by isIndexable
    provenanceSummary: hasContent
      ? `Based on ${context.items.length} published DIXITH knowledge ${context.items.length === 1 ? "entity" : "entities"}.`
      : "No published evidence available.",
  };
}

/**
 * Determines the answer status based on the grounded context.
 */
export function resolveAnswerStatus(context: GroundedContext): AskDixithAnswerStatus {
  if (context.items.length === 0) {
    return "NO_RELEVANT_CONTENT";
  }

  const directMatches = context.items.filter((i) => i.retrievalSignal !== "relationship");
  if (directMatches.length === 0) {
    return "INSUFFICIENT_EVIDENCE";
  }

  if (directMatches.length >= 2) {
    return "ANSWERED";
  }

  return "PARTIALLY_SUPPORTED";
}
