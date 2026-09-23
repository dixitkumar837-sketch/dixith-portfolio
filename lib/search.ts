import { ContentStatus, isIndexable } from "@/data/types";
import { getAllResearch, getResearchById } from "@/data/research";
import { getAllExperiments, getExperimentById } from "@/data/experiments";
import { getAllArticles } from "@/data/articles";
import { getAllGuides } from "@/data/guides";
import { getAllProfessionalExperiences } from "@/data/professional-experience";
import { getSourceById } from "@/data/sources";
import { getTopicsForContent } from "@/lib/content-utils";

export type SearchableEntityType =
  | "research"
  | "experiment"
  | "article"
  | "guide"
  | "professional-experience";

export interface SearchDocument {
  id: string;
  entityType: SearchableEntityType;
  title: string;
  summary: string;
  category?: string;
  slug: string;
  href: string;
  topics: string[];
  headings: string[];
  content: string;
  sources: string[];
  relatedEntityTitles: string[];
  status: ContentStatus;
}

export interface SearchResult {
  id: string;
  entityType: SearchableEntityType;
  title: string;
  summary: string;
  category?: string;
  href: string;
  topics: string[];
  score: number;
  matchedFields: string[];
}

export interface SearchOptions {
  typeFilter?: SearchableEntityType | "all";
}

/**
 * Centralized, explainable scoring weights for deterministic matching.
 * Preserves the architectural hierarchy:
 * Title > Summary > Topics > Headings/Metadata > Content/Body > Sources.
 */
export const SEARCH_WEIGHTS = {
  // Phrase Matching Bonuses
  PHRASE_TITLE: 25,
  PHRASE_SUMMARY: 14,
  PHRASE_HEADINGS: 10,
  PHRASE_CONTENT: 6,

  // Token-Level Field Matches
  TOKEN_TITLE: 10,
  TOKEN_SUMMARY: 6,
  TOKEN_TOPICS: 5,
  TOKEN_HEADINGS: 4,
  TOKEN_CONTENT: 3,
  TOKEN_SOURCES: 2,
  TOKEN_RELATED: 2,

  // Taxonomy / Alias Expansion Match
  TAXONOMY_ALIAS_MATCH: 5,
};

/**
 * Controlled Taxonomy & Acronym Vocabulary for DIXITH.
 * Based ONLY on actual project topics, canonical sources, and domain entities.
 * No generic synonyms or external dictionaries.
 */
export const DIXITH_TAXONOMY_ALIASES: Record<string, string[]> = {
  aeo: ["answer engine optimization"],
  "answer engine optimization": ["aeo"],
  geo: ["generative engine optimization"],
  "generative engine optimization": ["geo"],
  seo: ["technical seo", "search engine optimization"],
  "technical seo": ["seo"],
  "search engine optimization": ["seo", "technical seo"],
  rag: ["retrieval augmented generation", "retrieval grounding"],
  "retrieval augmented generation": ["rag"],
  "retrieval grounding": ["rag"],
  "knowledge graph": ["knowledge graphs", "entities"],
  "knowledge graphs": ["knowledge graph", "entities"],
  entities: ["knowledge graphs", "entity recognition"],
  "entity recognition": ["entities", "knowledge graphs"],
  schema: ["schema org", "structured data"],
  "schema org": ["schema", "structured data"],
  "schema.org": ["schema", "structured data"],
  "structured data": ["schema", "schema org"],
  "ai search": ["generative search", "ai-search"],
  "ai-search": ["ai search"],
  hreflang: ["international search", "cross-border"],
};

/**
 * Normalizes input text for deterministic matching:
 * - Lowercases characters
 * - Normalizes apostrophes and quotes
 * - Converts punctuation, hyphens, and slashes to whitespace while preserving alphanumeric tokens
 * - Collapses repeated whitespace
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/['"’`]/g, "") // Strip quotes and apostrophes cleanly
    .replace(/[^\w\s]/g, " ") // Replace punctuation/hyphens with space
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenizes a query string into unique non-empty words.
 * Preserves technical tokens and removes single-character noise unless alphanumeric.
 */
export function tokenizeQuery(query: string): string[] {
  const normalized = normalizeText(query);
  if (!normalized) return [];
  const rawTokens = normalized.split(/\s+/).filter(Boolean);
  return Array.from(new Set(rawTokens));
}

/**
 * Expands query tokens using the controlled DIXITH taxonomy and acronym dictionary.
 */
export function expandQueryTokens(tokens: string[], originalQuery: string): string[] {
  const expanded = new Set<string>(tokens);
  const normalizedFull = normalizeText(originalQuery);

  // 1. Check full query match in alias dictionary
  if (DIXITH_TAXONOMY_ALIASES[normalizedFull]) {
    for (const alias of DIXITH_TAXONOMY_ALIASES[normalizedFull]) {
      tokenizeQuery(alias).forEach((t) => expanded.add(t));
    }
  }

  // 2. Check individual token match in alias dictionary
  for (const token of tokens) {
    if (DIXITH_TAXONOMY_ALIASES[token]) {
      for (const alias of DIXITH_TAXONOMY_ALIASES[token]) {
        tokenizeQuery(alias).forEach((t) => expanded.add(t));
      }
    }
  }

  return Array.from(expanded);
}

/**
 * Builds the canonical search documents index.
 * CRITICAL: Enforces indexability safety using centralized isIndexable(status).
 * Unpublished, draft, or in-review content is strictly excluded from the search index.
 */
export function buildSearchIndex(): SearchDocument[] {
  const docs: SearchDocument[] = [];

  // 1. Research Documents (Filtered by canonical indexability)
  for (const item of getAllResearch()) {
    if (!isIndexable(item.status)) continue;
    const resolvedTopics = getTopicsForContent(item.topics).flatMap((t) => [
      t.name,
      t.slug,
    ]);
    const sourceTitles = (item.sourceIds || [])
      .map((id) => getSourceById(id)?.title)
      .filter((title): title is string => Boolean(title));

    const relatedTitles = (item.relatedExperimentIds || [])
      .map((id) => getExperimentById(id)?.title)
      .filter((t): t is string => Boolean(t));

    docs.push({
      id: item.id,
      entityType: "research",
      title: item.title,
      summary: item.summary || "",
      category: item.category,
      slug: item.slug,
      href: `/research/${item.slug}`,
      topics: resolvedTopics,
      headings: [
        item.question || "",
        item.methodology || "",
        item.researchArea || "",
      ].filter(Boolean),
      content: [item.summary || "", ...(item.limitations || [])].join(" "),
      sources: sourceTitles,
      relatedEntityTitles: relatedTitles,
      status: item.status,
    });
  }

  // 2. AI Search Lab Experiments (Filtered by canonical indexability)
  for (const exp of getAllExperiments()) {
    if (!isIndexable(exp.status)) continue;
    const resolvedTopics = getTopicsForContent(exp.topics).flatMap((t) => [
      t.name,
      t.slug,
    ]);
    const sourceTitles = (exp.sourceIds || [])
      .map((id) => getSourceById(id)?.title)
      .filter((title): title is string => Boolean(title));

    const relatedTitles = (exp.relatedResearchIds || [])
      .map((id) => getResearchById(id)?.title)
      .filter((t): t is string => Boolean(t));

    docs.push({
      id: exp.id,
      entityType: "experiment",
      title: exp.title,
      summary: exp.summary || exp.purpose || "",
      category: exp.category,
      slug: exp.slug,
      href: `/ai-search-lab/${exp.slug}`,
      topics: resolvedTopics,
      headings: [
        exp.researchQuestion || "",
        exp.objective || "",
        exp.purpose || "",
      ].filter(Boolean),
      content: [
        exp.methodology || "",
        ...(exp.observations || []),
        ...(exp.evidence || []),
        ...(exp.variables || []),
      ].join(" "),
      sources: sourceTitles,
      relatedEntityTitles: relatedTitles,
      status: exp.status,
    });
  }

  // 3. Articles (Filtered by canonical indexability)
  for (const article of getAllArticles()) {
    if (!isIndexable(article.status)) continue;
    const resolvedTopics = getTopicsForContent(article.topics).flatMap((t) => [
      t.name,
      t.slug,
    ]);
    const sourceTitles = (article.sourceIds || [])
      .map((id) => getSourceById(id)?.title)
      .filter((title): title is string => Boolean(title));

    const relatedTitles = (article.relatedResearchIds || [])
      .map((id) => getResearchById(id)?.title)
      .filter((t): t is string => Boolean(t));

    docs.push({
      id: article.id,
      entityType: "article",
      title: article.title,
      summary: article.summary || "",
      category: article.category,
      slug: article.slug,
      href: `/articles/${article.slug}`,
      topics: resolvedTopics,
      headings: [article.category],
      content: [article.body || "", article.summary || ""].join(" "),
      sources: sourceTitles,
      relatedEntityTitles: relatedTitles,
      status: article.status,
    });
  }

  // 4. Implementation Guides (Filtered by canonical indexability)
  for (const guide of getAllGuides()) {
    if (!isIndexable(guide.status)) continue;
    const resolvedTopics = getTopicsForContent(guide.topics).flatMap((t) => [
      t.name,
      t.slug,
    ]);
    const sourceTitles = (guide.sourceIds || [])
      .map((id) => getSourceById(id)?.title)
      .filter((title): title is string => Boolean(title));

    const stepTitles = (guide.steps || []).map((s) => s.title);
    const stepDescriptions = (guide.steps || []).map((s) => s.description);
    const relatedTitles = (guide.relatedResearchIds || [])
      .map((id) => getResearchById(id)?.title)
      .filter((t): t is string => Boolean(t));

    docs.push({
      id: guide.id,
      entityType: "guide",
      title: guide.title,
      summary: guide.summary || "",
      category: guide.category,
      slug: guide.slug,
      href: `/guides/${guide.slug}`,
      topics: resolvedTopics,
      headings: stepTitles,
      content: [
        guide.summary || "",
        ...stepDescriptions,
        ...(guide.prerequisites || []),
      ].join(" "),
      sources: sourceTitles,
      relatedEntityTitles: relatedTitles,
      status: guide.status,
    });
  }

  // 5. Professional Experiences (Filtered by canonical indexability)
  for (const pe of getAllProfessionalExperiences()) {
    if (!isIndexable(pe.status)) continue;
    const resolvedTopics = getTopicsForContent(pe.topics).flatMap((t) => [
      t.name,
      t.slug,
    ]);
    const relatedTitles = (pe.relatedResearchIds || [])
      .map((id) => getResearchById(id)?.title)
      .filter((t): t is string => Boolean(t));

    docs.push({
      id: pe.id,
      entityType: "professional-experience",
      title: pe.title,
      summary: pe.summary,
      category: pe.domain,
      slug: pe.slug,
      href: `/professional-experience/${pe.slug}`,
      topics: resolvedTopics,
      headings: [pe.domain, pe.roleContext || ""].filter(Boolean),
      content: [
        pe.overview,
        pe.professionalContext,
        ...(pe.responsibilities || []),
        ...(pe.technicalFocus || []),
        ...(pe.searchFocus || []),
        ...(pe.technologies || []),
      ].join(" "),
      sources: [],
      relatedEntityTitles: relatedTitles,
      status: pe.status,
    });
  }

  return docs;
}

/**
 * Checks if a token matches within normalized target text.
 * Requires token boundary match or prefix match (for tokens >= 3 chars).
 */
function tokenMatches(targetNormalized: string, token: string): boolean {
  if (!targetNormalized || !token) return false;
  // Whole-word match
  const wordBoundaryRegex = new RegExp(`\\b${token}\\b`, "i");
  if (wordBoundaryRegex.test(targetNormalized)) return true;

  // Prefix match for tokens with length >= 3
  if (token.length >= 3) {
    const prefixRegex = new RegExp(`\\b${token}`, "i");
    if (prefixRegex.test(targetNormalized)) return true;
  }

  return false;
}

/**
 * Checks if an exact multi-word phrase is contained within normalized target text.
 */
function phraseMatches(targetNormalized: string, phrase: string): boolean {
  if (!targetNormalized || !phrase) return false;
  const normalizedPhrase = normalizeText(phrase);
  if (normalizedPhrase.length < 3) return false;
  return targetNormalized.includes(normalizedPhrase);
}

/**
 * Evaluates document relevance against the raw query, base tokens, and expanded tokens.
 * Produces deterministic score and tracks matched fields for internal explainability.
 */
export function scoreDocument(
  doc: SearchDocument,
  rawQuery: string,
  baseTokens: string[],
  expandedTokens: string[]
): { score: number; matchedFields: string[] } {
  if (baseTokens.length === 0) return { score: 0, matchedFields: [] };

  const normalizedQuery = normalizeText(rawQuery);
  const normalizedTitle = normalizeText(doc.title);
  const normalizedSummary = normalizeText(doc.summary);
  const normalizedTopics = normalizeText(doc.topics.join(" "));
  const normalizedHeadings = normalizeText(doc.headings.join(" "));
  const normalizedContent = normalizeText(doc.content);
  const normalizedSources = normalizeText(doc.sources.join(" "));
  const normalizedRelated = normalizeText(doc.relatedEntityTitles.join(" "));

  let score = 0;
  const matchedFields = new Set<string>();

  // 1. Phrase Matching (Higher priority for contiguous multi-word phrases)
  if (normalizedQuery.includes(" ") && normalizedQuery.length >= 3) {
    if (phraseMatches(normalizedTitle, normalizedQuery)) {
      score += SEARCH_WEIGHTS.PHRASE_TITLE;
      matchedFields.add("title-phrase");
    }
    if (phraseMatches(normalizedSummary, normalizedQuery)) {
      score += SEARCH_WEIGHTS.PHRASE_SUMMARY;
      matchedFields.add("summary-phrase");
    }
    if (phraseMatches(normalizedHeadings, normalizedQuery)) {
      score += SEARCH_WEIGHTS.PHRASE_HEADINGS;
      matchedFields.add("headings-phrase");
    }
    if (phraseMatches(normalizedContent, normalizedQuery)) {
      score += SEARCH_WEIGHTS.PHRASE_CONTENT;
      matchedFields.add("content-phrase");
    }
  }

  // 2. Base Token Matching across structured fields
  for (const token of baseTokens) {
    if (tokenMatches(normalizedTitle, token)) {
      score += SEARCH_WEIGHTS.TOKEN_TITLE;
      matchedFields.add("title");
    }
    if (tokenMatches(normalizedSummary, token)) {
      score += SEARCH_WEIGHTS.TOKEN_SUMMARY;
      matchedFields.add("summary");
    }
    if (tokenMatches(normalizedTopics, token)) {
      score += SEARCH_WEIGHTS.TOKEN_TOPICS;
      matchedFields.add("topics");
    }
    if (tokenMatches(normalizedHeadings, token)) {
      score += SEARCH_WEIGHTS.TOKEN_HEADINGS;
      matchedFields.add("headings");
    }
    if (tokenMatches(normalizedContent, token)) {
      score += SEARCH_WEIGHTS.TOKEN_CONTENT;
      matchedFields.add("content");
    }
    if (tokenMatches(normalizedSources, token)) {
      score += SEARCH_WEIGHTS.TOKEN_SOURCES;
      matchedFields.add("sources");
    }
    if (tokenMatches(normalizedRelated, token)) {
      score += SEARCH_WEIGHTS.TOKEN_RELATED;
      matchedFields.add("graph-relations");
    }
  }

  // 3. Taxonomy / Alias Expansion Matching
  // Only evaluate expanded tokens that were not in the base tokens
  const aliasTokens = expandedTokens.filter((t) => !baseTokens.includes(t));
  for (const aliasToken of aliasTokens) {
    const inTitle = tokenMatches(normalizedTitle, aliasToken);
    const inSummary = tokenMatches(normalizedSummary, aliasToken);
    const inTopics = tokenMatches(normalizedTopics, aliasToken);
    const inHeadings = tokenMatches(normalizedHeadings, aliasToken);

    if (inTitle || inSummary || inTopics || inHeadings) {
      score += SEARCH_WEIGHTS.TAXONOMY_ALIAS_MATCH;
      matchedFields.add("taxonomy-alias");
    }
  }

  return { score, matchedFields: Array.from(matchedFields) };
}

/**
 * Deterministic enhanced retrieval across published DIXITH content entities.
 * Includes multi-word phrase detection, taxonomy expansion, and optional type filtering.
 * Guaranteed deterministic tie-breaking (score descending, then title ascending).
 */
export function searchContent(
  query: string,
  options?: SearchOptions
): SearchResult[] {
  const trimmed = (query || "").trim();
  if (!trimmed) return [];

  const baseTokens = tokenizeQuery(trimmed);
  if (baseTokens.length === 0) return [];

  const expandedTokens = expandQueryTokens(baseTokens, trimmed);
  const docs = buildSearchIndex();
  const rawResults: SearchResult[] = [];

  for (const doc of docs) {
    // Optional content-type filter
    if (
      options?.typeFilter &&
      options.typeFilter !== "all" &&
      doc.entityType !== options.typeFilter
    ) {
      continue;
    }

    const { score, matchedFields } = scoreDocument(
      doc,
      trimmed,
      baseTokens,
      expandedTokens
    );

    if (score > 0) {
      rawResults.push({
        id: doc.id,
        entityType: doc.entityType,
        title: doc.title,
        summary: doc.summary,
        category: doc.category,
        href: doc.href,
        topics: doc.topics,
        score,
        matchedFields,
      });
    }
  }

  // Deduplication: ensure one canonical entity ID produces exactly one card
  const deduplicatedMap = new Map<string, SearchResult>();
  for (const res of rawResults) {
    const existing = deduplicatedMap.get(res.id);
    if (!existing) {
      deduplicatedMap.set(res.id, res);
    } else {
      // If duplicate candidate exists, merge score and matched fields
      existing.score = Math.max(existing.score, res.score);
      const combinedFields = Array.from(
        new Set([...existing.matchedFields, ...res.matchedFields])
      );
      existing.matchedFields = combinedFields;
    }
  }

  const results = Array.from(deduplicatedMap.values());

  // Deterministic sorting: highest score first; tie-breaker: title ascending
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.title.localeCompare(b.title);
  });

  return results;
}
