/**
 * DIXITH Lexical Quality Gate & Negative Query Rejection Module
 * Phase 8G.9: Lexical Quality Gate & Negative Query Rejection
 *
 * Sits between Phase 8F deterministic lexical retrieval and Phase 8G.8 hybrid RRF fusion.
 * Vets lexical candidate results to eliminate false positives arising from weak generic
 * conversational token overlap ("how", "to", "for", "in", "with", "high", etc.) while
 * ensuring 100% recall on genuine domain queries (exact phrases, taxonomy aliases, topics,
 * acronyms, and multi-token substantive overlap).
 *
 * Non-negotiable principles:
 * - Git canonical content remains the sole source of truth.
 * - Publication safety (isIndexable) is strictly enforced.
 * - Phase 8F scoring weights, aliases, and ranking logic remain completely untouched.
 * - No global score cutoff alone (which would kill short, high-value queries like "SEO", "E-E-A-T").
 * - Zero external AI APIs, external databases, or employer resources.
 */

import {
  SearchResult,
  SearchDocument,
  buildSearchIndex,
  tokenizeQuery,
  normalizeText,
} from "../search";

/**
 * Curated set of English function words, prepositions, articles, auxiliary verbs,
 * interrogatives, and generic conversational filler tokens.
 */
export const GENERIC_CONVERSATIONAL_TOKENS: ReadonlySet<string> = new Set([
  // Interrogatives & relative pronouns
  "how", "what", "where", "when", "why", "who", "which", "whom", "whose",
  // Auxiliary and state verbs
  "is", "are", "was", "were", "be", "been", "being",
  "do", "does", "did",
  "have", "has", "had",
  "can", "could", "will", "would", "shall", "should", "may", "might", "must",
  // Articles
  "the", "a", "an",
  // Prepositions & directional particles
  "to", "for", "of", "in", "on", "at", "by", "with", "from", "about",
  "into", "through", "during", "before", "after", "above", "below",
  "up", "down", "out", "off", "over", "under", "between", "against",
  // Conjunctions
  "and", "or", "but", "so", "if", "then", "because", "as", "until", "while",
  // Pronouns
  "it", "its", "this", "that", "these", "those",
  "they", "them", "their", "theirs",
  "we", "us", "our", "ours",
  "you", "your", "yours",
  "he", "him", "his",
  "she", "her", "hers",
  // Generic qualifiers, quantifiers, and conversational adjectives
  "not", "no", "nor", "none",
  "all", "any", "both", "each", "every", "few", "more", "most", "other", "some", "such",
  "only", "same", "than", "too", "very", "just",
  "best", "good", "better", "great",
  "high", "low", "new", "old", "many", "much",
]);

/**
 * Controlled list of core DIXITH domain terms that must NEVER be treated as generic noise,
 * even if they are short or share syllables with common language.
 */
export const PROTECTED_DOMAIN_TERMS: ReadonlySet<string> = new Set([
  "seo", "aeo", "geo", "rag", "eeat", "e-e-a-t",
  "hreflang", "jsonld", "json-ld", "schema", "taxonomy",
  "crawl", "crawler", "crawling", "index", "indexing", "indexation",
  "sitemap", "sitemaps", "entity", "entities", "search", "retrieval",
  "chunking", "vector", "vectors", "embedding", "embeddings", "llm",
  "discovery", "structured", "data", "canonical", "canonicalization",
  "catalog", "catalogs", "ecommerce", "e-commerce",
  "healthcare", "clinical", "medical", "hospital",
  "merchant", "merchants", "offer", "offers", "product", "products",
  "dixith", "citations", "overviews", "grounding",
  "chatgpt", "perplexity", "claude", "gemini", "copilot",
]);

/**
 * Detailed evaluation report for a single lexical candidate result.
 */
export interface LexicalQualityEvaluation {
  entityId: string;
  accepted: boolean;
  reason: string;
  score: number;
  substantiveTokens: string[];
  matchedSubstantiveTokens: string[];
  substantiveRatio: number;
  isPhraseMatch: boolean;
  isTaxonomyAliasMatch: boolean;
  isTopicMatch: boolean;
  isTitleMatch: boolean;
}

/**
 * Configurable thresholds for lexical candidate quality gating.
 */
export interface LexicalQualityGateOptions {
  /**
   * Minimum ratio of substantive query tokens that must match the candidate entity
   * when the query contains 3 or more substantive tokens. Default: 0.33 (33%).
   */
  minSubstantiveRatioForMultiToken?: number;

  /**
   * Minimum count of substantive tokens that must match when substantive token count >= 3.
   * Default: 2.
   */
  minSubstantiveCountForMultiToken?: number;

  /**
   * Whether exact phrase matches across title, summary, or headings bypass ratio check.
   * Default: true.
   */
  allowPhraseBypass?: boolean;

  /**
   * Whether taxonomy alias matches bypass ratio check.
   * Default: true.
   */
  allowAliasBypass?: boolean;

  /**
   * Whether canonical topic matches bypass ratio check.
   * Default: true.
   */
  allowTopicBypass?: boolean;
}

export const DEFAULT_QUALITY_GATE_OPTIONS: Required<LexicalQualityGateOptions> = {
  minSubstantiveRatioForMultiToken: 0.33,
  minSubstantiveCountForMultiToken: 2,
  allowPhraseBypass: true,
  allowAliasBypass: true,
  allowTopicBypass: true,
};

/**
 * Extracts substantive, non-generic tokens from a query token array.
 * Substantive tokens are tokens that are either explicitly protected or NOT in
 * the generic conversational stopword set (and length >= 2).
 * Also preserves compact domain acronyms (e.g., "E-E-A-T" -> "eeat").
 */
export function extractSubstantiveTokens(tokens: string[], rawQuery?: string): string[] {
  const result: string[] = [];

  // 1. Check if raw query or its compact alphanumeric version is a protected domain term / acronym
  if (rawQuery) {
    const compact = rawQuery.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (PROTECTED_DOMAIN_TERMS.has(compact) && !result.includes(compact)) {
      result.push(compact);
    }
  }

  // 2. Process individual tokens
  for (const t of tokens) {
    const lower = t.toLowerCase();
    if (PROTECTED_DOMAIN_TERMS.has(lower)) {
      if (!result.includes(lower)) result.push(lower);
    } else if (!GENERIC_CONVERSATIONAL_TOKENS.has(lower) && lower.length >= 2) {
      if (!result.includes(lower)) result.push(lower);
    }
  }

  return result;
}

/**
 * Checks if a token matches within normalized target text via whole word or prefix match.
 * Also handles compact acronyms that expand into space-separated characters under normalization.
 */
function tokenMatchesText(targetNormalized: string, token: string): boolean {
  if (!targetNormalized || !token) return false;

  // Handle compact acronyms that normalize to space-separated single letters (e.g. "eeat" -> "e e a t")
  if (token === "eeat") {
    if (targetNormalized.includes("e e a t") || targetNormalized.includes("eeat")) {
      return true;
    }
  }

  // Handle "jsonld" -> "json ld"
  if (token === "jsonld") {
    if (targetNormalized.includes("json ld") || targetNormalized.includes("jsonld")) {
      return true;
    }
  }

  const wordBoundaryRegex = new RegExp(`\\b${token}\\b`, "i");
  if (wordBoundaryRegex.test(targetNormalized)) return true;

  if (token.length >= 3) {
    const prefixRegex = new RegExp(`\\b${token}`, "i");
    if (prefixRegex.test(targetNormalized)) return true;
  }

  return false;
}

/**
 * Finds all substantive tokens that match within a document's full textual representation.
 */
function findMatchedSubstantiveTokens(
  docFullText: string,
  substantiveTokens: string[]
): string[] {
  return substantiveTokens.filter((token) => tokenMatchesText(docFullText, token));
}

/**
 * Evaluates the lexical quality and domain substance of a SearchResult candidate.
 */
export function evaluateLexicalQuality(
  result: SearchResult,
  rawQuery: string,
  doc?: SearchDocument,
  options?: LexicalQualityGateOptions
): LexicalQualityEvaluation {
  const opts = { ...DEFAULT_QUALITY_GATE_OPTIONS, ...options };
  const trimmed = (rawQuery || "").trim();

  const emptyEval: LexicalQualityEvaluation = {
    entityId: result.id,
    accepted: false,
    reason: "empty_query",
    score: result.score,
    substantiveTokens: [],
    matchedSubstantiveTokens: [],
    substantiveRatio: 0,
    isPhraseMatch: false,
    isTaxonomyAliasMatch: false,
    isTopicMatch: false,
    isTitleMatch: false,
  };

  if (!trimmed) return emptyEval;

  const rawTokens = tokenizeQuery(trimmed);
  if (rawTokens.length === 0) return emptyEval;

  const substantiveTokens = extractSubstantiveTokens(rawTokens, trimmed);

  // Determine structural match indicators from SearchResult.matchedFields
  const matchedFields = new Set(result.matchedFields || []);
  const isPhraseMatch =
    matchedFields.has("title-phrase") ||
    matchedFields.has("summary-phrase") ||
    matchedFields.has("headings-phrase");
  const isContentPhraseMatch = matchedFields.has("content-phrase");
  const isTaxonomyAliasMatch = matchedFields.has("taxonomy-alias");
  const isTopicMatch = matchedFields.has("topics");
  const isTitleMatch = matchedFields.has("title");

  // Reconstruct or extract document full text
  let docFullText = "";
  if (doc) {
    docFullText = normalizeText([
      doc.title,
      doc.summary,
      ...doc.topics,
      ...doc.headings,
      doc.content,
      ...doc.sources,
      ...doc.relatedEntityTitles,
    ].join(" "));
  } else {
    docFullText = normalizeText([
      result.title,
      result.summary,
      ...(result.topics || []),
    ].join(" "));
  }

  const matchedSubstantive = findMatchedSubstantiveTokens(docFullText, substantiveTokens);
  const substantiveRatio =
    substantiveTokens.length > 0
      ? matchedSubstantive.length / substantiveTokens.length
      : 0;

  const baseReport: Omit<LexicalQualityEvaluation, "accepted" | "reason"> = {
    entityId: result.id,
    score: result.score,
    substantiveTokens,
    matchedSubstantiveTokens: matchedSubstantive,
    substantiveRatio: Number(substantiveRatio.toFixed(4)),
    isPhraseMatch,
    isTaxonomyAliasMatch,
    isTopicMatch,
    isTitleMatch,
  };

  // Rule 1: No substantive tokens in query (purely conversational filler / stopwords)
  if (substantiveTokens.length === 0) {
    return {
      ...baseReport,
      accepted: false,
      reason: "generic_conversational_query_no_substantive_tokens",
    };
  }

  // Rule 2: Phrase bypass (contiguous multi-word match in high-value structural fields)
  if (opts.allowPhraseBypass && isPhraseMatch) {
    return {
      ...baseReport,
      accepted: true,
      reason: "phrase_match_high_confidence",
    };
  }

  // Rule 3: Content phrase bypass only if at least 1 substantive token matches
  if (opts.allowPhraseBypass && isContentPhraseMatch && matchedSubstantive.length >= 1) {
    return {
      ...baseReport,
      accepted: true,
      reason: "content_phrase_match",
    };
  }

  // Rule 4: Taxonomy alias bypass
  if (opts.allowAliasBypass && isTaxonomyAliasMatch) {
    if (substantiveTokens.length <= 2 || (matchedSubstantive.length >= 2 && substantiveRatio >= opts.minSubstantiveRatioForMultiToken)) {
      return {
        ...baseReport,
        accepted: true,
        reason: "taxonomy_alias_match",
      };
    }
  }

  // Rule 5: Canonical topic ontology bypass
  // For queries with >= 3 substantive tokens, matching a single isolated token inside a topic
  // (e.g. 'architecture' in 'history of Renaissance architecture in Florence Italy')
  // does not bypass substantive overlap validation.
  if (opts.allowTopicBypass && isTopicMatch) {
    if (substantiveTokens.length <= 2 || (matchedSubstantive.length >= 2 && substantiveRatio >= opts.minSubstantiveRatioForMultiToken)) {
      return {
        ...baseReport,
        accepted: true,
        reason: "canonical_topic_match",
      };
    }
  }

  // Rule 6: Zero substantive tokens matched the document
  if (matchedSubstantive.length === 0) {
    return {
      ...baseReport,
      accepted: false,
      reason: "zero_substantive_tokens_matched",
    };
  }

  // Rule 7: Short queries (1 to 2 substantive tokens, e.g. "SEO", "clinical schema")
  // Since matchedSubstantive.length >= 1, this represents >= 50% substantive match
  if (substantiveTokens.length <= 2) {
    return {
      ...baseReport,
      accepted: true,
      reason: "short_query_substantive_match",
    };
  }

  // Rule 8: Multi-token queries (>= 3 substantive tokens)
  // Require substantive overlap ratio >= threshold AND at least min count of substantive tokens.
  // This prevents 1 isolated modifier (e.g. "architecture" in "history of Renaissance architecture in Florence Italy")
  // from matching an entire irrelevant entity.
  const meetsRatio = substantiveRatio >= opts.minSubstantiveRatioForMultiToken;
  const meetsCount = matchedSubstantive.length >= opts.minSubstantiveCountForMultiToken;

  if (meetsRatio && meetsCount) {
    return {
      ...baseReport,
      accepted: true,
      reason: "multi_token_substantive_overlap",
    };
  }

  return {
    ...baseReport,
    accepted: false,
    reason: `insufficient_substantive_overlap (ratio=${substantiveRatio.toFixed(2)}, matched=${matchedSubstantive.length}/${substantiveTokens.length})`,
  };
}

/**
 * Filters a raw list of Phase 8F SearchResult candidates through the Lexical Quality Gate.
 * Returns only vetted, high-confidence candidates suitable for hybrid RRF fusion.
 */
export function filterLexicalCandidates(
  results: SearchResult[],
  rawQuery: string,
  options?: LexicalQualityGateOptions
): SearchResult[] {
  if (!results || results.length === 0) return [];
  const trimmed = (rawQuery || "").trim();
  if (!trimmed) return [];

  // Build or retrieve search documents map for fast lookup
  const searchDocs = buildSearchIndex();
  const docMap = new Map<string, SearchDocument>();
  for (const d of searchDocs) {
    docMap.set(d.id, d);
  }

  const vetted: SearchResult[] = [];

  for (const result of results) {
    const doc = docMap.get(result.id);
    const evaluation = evaluateLexicalQuality(result, trimmed, doc, options);
    if (evaluation.accepted) {
      vetted.push(result);
    }
  }

  return vetted;
}
