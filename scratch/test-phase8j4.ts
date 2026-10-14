/**
 * DIXITH Phase 8J.4 — Search Quality Audit & Retrieval Integrity Test Suite
 *
 * Verifies 44 assertions across 8 core categories:
 * - Publication Safety (1-9)
 * - Lexical Retrieval Integrity (10-17)
 * - Taxonomy & Acronym Aliases (18-24)
 * - Semantic Retrieval Integrity (25-27)
 * - Hybrid Retrieval Integrity (28-32)
 * - Negative Query & Quarantine Safety (33-37)
 * - Type Filtering Integrity (38-40)
 * - Public Discovery Corpus Integrity (41-44)
 *
 * STRICT CONSTRAINTS:
 * - Offline only: zero external APIs, zero browser launches, zero CDP connections.
 * - Historical evidence untouched.
 * - Quarantined evidence excluded.
 */

import {
  searchContent,
  buildSearchIndex,
  tokenizeQuery,
  expandQueryTokens,
  normalizeText,
  DIXITH_TAXONOMY_ALIASES,
} from "../lib/search";
import {
  hybridSearch,
  consolidateSemanticChunks,
  calculateRrfScore,
} from "../lib/search/hybrid";
import {
  searchWithMode,
  parseSearchMode,
} from "../lib/search/mode";
import {
  semanticSearch,
  LocalEmbeddingProvider,
  LocalVectorStore,
} from "../lib/semantic";
import { isIndexable, ContentStatus } from "../data/types";
import * as fs from "fs";
import * as path from "path";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, extra?: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${extra || ""}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log(" DIXITH Phase 8J.4 — Search Quality Audit & Retrieval Integrity Suite");
  console.log("================================================================================\n");

  const provider = new LocalEmbeddingProvider();
  const store = new LocalVectorStore();
  await store.load();

  // ----------------------------------------------------
  // SECTION 1: PUBLICATION SAFETY (Assertions 1-9)
  // ----------------------------------------------------
  console.log("[Category 1: Publication Safety Gating]");

  // 1. PUBLISHED content retrievable lexically
  {
    const results = searchContent("healthcare search architecture");
    assert(
      results.length > 0 && results.some((r) => r.id === "PE-001"),
      "1. PUBLISHED content is retrievable lexically (PE-001 found)"
    );
  }

  // 2. PUBLISHED content retrievable semantically
  {
    const semResponse = await semanticSearch("healthcare clinical search architecture", {
      provider,
      store,
    });
    assert(
      semResponse.available &&
      semResponse.results.length > 0 &&
      semResponse.results.some((r) => r.entityId === "PE-001"),
      "2. PUBLISHED content is retrievable semantically (PE-001 found)"
    );
  }

  // 3. PUBLISHED content retrievable through hybrid
  {
    const hybResponse = await hybridSearch("healthcare search", {
      provider,
      store,
    });
    assert(
      hybResponse.results.length > 0 && hybResponse.results[0].entityId === "PE-001",
      "3. PUBLISHED content is retrievable through hybrid search (PE-001 top rank)"
    );
  }

  // 4. DRAFT rejected
  {
    assert(
      !isIndexable("DRAFT" as ContentStatus),
      "4. Publication Gate: DRAFT status is rejected by isIndexable()"
    );
  }

  // 5. IN_REVIEW rejected
  {
    assert(
      !isIndexable("IN_REVIEW" as ContentStatus),
      "5. Publication Gate: IN_REVIEW status is rejected by isIndexable()"
    );
  }

  // 6. EVIDENCE_READY rejected
  {
    assert(
      !isIndexable("EVIDENCE_READY" as ContentStatus),
      "6. Publication Gate: EVIDENCE_READY status is rejected by isIndexable()"
    );
  }

  // 7. ACTIVE rejected
  {
    assert(
      !isIndexable("ACTIVE" as ContentStatus),
      "7. Publication Gate: ACTIVE status is rejected by isIndexable()"
    );
  }

  // 8. COMPLETED rejected
  {
    assert(
      !isIndexable("COMPLETED" as ContentStatus),
      "8. Publication Gate: COMPLETED status is rejected by isIndexable()"
    );
  }

  // 9. ARCHIVED rejected
  {
    assert(
      !isIndexable("ARCHIVED" as ContentStatus),
      "9. Publication Gate: ARCHIVED status is rejected by isIndexable()"
    );
  }

  // ----------------------------------------------------
  // SECTION 2: LEXICAL RETRIEVAL (Assertions 10-17)
  // ----------------------------------------------------
  console.log("\n[Category 2: Lexical Retrieval Determinism & Normalization]");

  // 10. Exact phrase works
  {
    const results = searchContent("E-Commerce Search & Generative Discovery");
    assert(
      results.length > 0 &&
      results[0].id === "PE-003" &&
      results[0].matchedFields.includes("title-phrase"),
      "10. Exact phrase match boosts title-phrase and ranks exact match top (PE-003)"
    );
  }

  // 11. Partial phrase works
  {
    const results = searchContent("Generative Discovery");
    assert(
      results.length > 0 && results[0].id === "PE-003",
      "11. Partial title phrase match correctly ranks PE-003 top"
    );
  }

  // 12. Case normalization works
  {
    const rLower = searchContent("technical seo");
    const rUpper = searchContent("TECHNICAL SEO");
    const rMixed = searchContent("TeChNiCaL sEo");
    assert(
      JSON.stringify(rLower) === JSON.stringify(rUpper) &&
      JSON.stringify(rLower) === JSON.stringify(rMixed),
      "12. Case normalization: lowercase, uppercase, and mixed case yield identical results"
    );
  }

  // 13. Whitespace normalization works
  {
    const rNormal = searchContent("technical seo");
    const rSpaced = searchContent("   technical     seo   ");
    assert(
      JSON.stringify(rNormal) === JSON.stringify(rSpaced),
      "13. Whitespace normalization: repeated and leading/trailing spaces yield identical results"
    );
  }

  // 14. Punctuation normalization works
  {
    const rNormal = searchContent("technical seo");
    const rPunct = searchContent("technical, seo! - search?");
    // Note: rPunct includes "search" token which is an extra token, so test exact punctuation stripping:
    const rExactPunct = searchContent("technical, seo!");
    assert(
      JSON.stringify(rNormal) === JSON.stringify(rExactPunct),
      "14. Punctuation normalization: punctuation marks stripped cleanly without affecting tokens"
    );
  }

  // 15. Unknown query safely returns no relevant result
  {
    const results = searchContent("xyzabc12345nonexistenttoken");
    assert(
      results.length === 0,
      "15. Unknown / nonsense query safely returns 0 lexical results"
    );
  }

  // 16. Empty query safely handled
  {
    const empty1 = searchContent("");
    const empty2 = searchContent("     ");
    assert(
      empty1.length === 0 && empty2.length === 0,
      "16. Empty and whitespace-only queries safely return empty arrays immediately"
    );
  }

  // 17. Deterministic repeated query
  {
    const runs = Array.from({ length: 5 }, () => searchContent("technical seo"));
    const allIdentical = runs.every(
      (r) => JSON.stringify(r) === JSON.stringify(runs[0])
    );
    assert(
      allIdentical,
      "17. Deterministic repeated execution: 5 runs produce bit-exact identical rankings and scores"
    );
  }

  // ----------------------------------------------------
  // SECTION 3: TAXONOMY & ACRONYM ALIASES (Assertions 18-24)
  // ----------------------------------------------------
  console.log("\n[Category 3: Taxonomy & Acronym Aliases]");

  // 18. AEO alias
  {
    const aeoTokens = expandQueryTokens(["aeo"], "aeo");
    assert(
      aeoTokens.includes("answer") &&
      aeoTokens.includes("engine") &&
      aeoTokens.includes("optimization"),
      "18. AEO alias expands to 'answer engine optimization'"
    );
  }

  // 19. GEO alias
  {
    const geoTokens = expandQueryTokens(["geo"], "geo");
    assert(
      geoTokens.includes("generative") &&
      geoTokens.includes("engine") &&
      geoTokens.includes("optimization"),
      "19. GEO alias expands to 'generative engine optimization'"
    );
  }

  // 20. SEO alias
  {
    const seoTokens = expandQueryTokens(["seo"], "seo");
    assert(
      seoTokens.includes("technical") &&
      seoTokens.includes("search") &&
      seoTokens.includes("optimization"),
      "20. SEO alias expands to 'technical seo' and 'search engine optimization'"
    );
  }

  // 21. RAG alias
  {
    const ragTokens = expandQueryTokens(["rag"], "rag");
    assert(
      ragTokens.includes("retrieval") &&
      ragTokens.includes("augmented") &&
      ragTokens.includes("generation"),
      "21. RAG alias expands to 'retrieval augmented generation'"
    );
  }

  // 22. Schema / structured data alias
  {
    const schemaTokens = expandQueryTokens(["structured", "data"], "structured data");
    assert(
      schemaTokens.includes("schema"),
      "22. 'structured data' expands to 'schema'"
    );
  }

  // 23. AI-search alias
  {
    const aiSearchTokens = expandQueryTokens(["ai", "search"], "ai search");
    assert(
      aiSearchTokens.includes("generative"),
      "23. 'ai search' expands to 'generative search'"
    );
  }

  // 24. hreflang / international search bidirectional alias
  {
    const hreflangExp = expandQueryTokens(["hreflang"], "hreflang");
    const intSearchExp = expandQueryTokens(["international", "search"], "international search");
    assert(
      hreflangExp.includes("international") && intSearchExp.includes("hreflang"),
      "24. hreflang ↔ international search alias operates bidirectionally in both directions"
    );
  }

  // ----------------------------------------------------
  // SECTION 4: SEMANTIC SEARCH INTEGRITY (Assertions 25-27)
  // ----------------------------------------------------
  console.log("\n[Category 4: Semantic Retrieval Integrity]");

  // 25. Semantic result respects publication gate
  {
    const semResponse = await semanticSearch("search architecture", { provider, store });
    assert(
      semResponse.results.length > 0 &&
      semResponse.results.every((r) => r.entityId.startsWith("PE-")),
      "25. Semantic search returns exclusively PUBLISHED entities (only PE-001..PE-003)"
    );
  }

  // 26. Semantic result limit respected
  {
    const semLimit = await semanticSearch("search architecture", {
      provider,
      store,
      limit: 2,
    });
    assert(
      semLimit.results.length <= 2,
      "26. Semantic search respects explicit result limit (<= 2 chunks)"
    );
  }

  // 27. Semantic duplicate entity eliminated in consolidation
  {
    const rawChunks = await semanticSearch("search architecture", {
      provider,
      store,
      limit: 18,
    });
    const consolidated = consolidateSemanticChunks(rawChunks.results);
    const uniqueIds = new Set(consolidated.map((c) => c.entityId));
    assert(
      uniqueIds.size === consolidated.length,
      "27. Semantic chunk consolidation collapses multiple chunks into single unique entity candidates"
    );
  }

  // ----------------------------------------------------
  // SECTION 5: HYBRID SEARCH INTEGRITY (Assertions 28-32)
  // ----------------------------------------------------
  console.log("\n[Category 5: Hybrid Retrieval Integrity]");

  // 28. Hybrid returns deterministic results
  {
    const hyb1 = await hybridSearch("technical seo", { provider, store });
    const hyb2 = await hybridSearch("technical seo", { provider, store });
    const identical =
      hyb1.results.length === hyb2.results.length &&
      hyb1.results.every((r, idx) => r.entityId === hyb2.results[idx].entityId && r.rrfScore === hyb2.results[idx].rrfScore);
    assert(
      identical,
      "28. Hybrid search returns deterministic, bit-exact results and RRF scores across runs"
    );
  }

  // 29. Hybrid deduplicates lexical + semantic overlap
  {
    const hyb = await hybridSearch("technical seo", { provider, store });
    const entityIds = hyb.results.map((r) => r.entityId);
    const uniqueEntityIds = new Set(entityIds);
    assert(
      uniqueEntityIds.size === entityIds.length,
      "29. Hybrid fusion strictly eliminates duplicate entities across lexical and semantic streams"
    );
  }

  // 30. Hybrid respects publication gate
  {
    const hyb = await hybridSearch("citation analysis latency", { provider, store });
    const allPublished = hyb.results.every((r) => ["PE-001", "PE-002", "PE-003"].includes(r.entityId));
    assert(
      allPublished,
      "30. Hybrid search defense-in-depth gate excludes all non-published entities"
    );
  }

  // 31. Unknown mode falls back safely
  {
    const unknownRes = await searchWithMode("technical seo", {
      mode: "custom_unsupported_mode",
      provider,
      store,
    });
    assert(
      unknownRes.mode === "keyword" &&
      unknownRes.effectiveMode === "keyword" &&
      unknownRes.fallbackToKeyword === false,
      "31. Unknown search mode defaults safely to Phase 8F deterministic keyword search"
    );
  }

  // 32. Hybrid error fallback remains safe
  {
    const brokenStore = new LocalVectorStore("non_existent_directory_for_test");
    const fallbackRes = await searchWithMode("technical seo", {
      mode: "hybrid",
      provider,
      store: brokenStore,
    });
    assert(
      fallbackRes.mode === "hybrid" &&
      fallbackRes.effectiveMode === "keyword" &&
      fallbackRes.fallbackToKeyword === true &&
      fallbackRes.results.length > 0,
      "32. Hybrid retrieval error gracefully degrades to keyword search with fallback flag set"
    );
  }

  // ----------------------------------------------------
  // SECTION 6: NEGATIVE QUERY & SAFETY (Assertions 33-37)
  // ----------------------------------------------------
  console.log("\n[Category 6: Negative Query & Quarantine Safety]");

  // 33. Negative query does not surface unpublished content
  {
    const res = await searchWithMode("how to bake sourdough bread", {
      mode: "hybrid",
      provider,
      store,
    });
    assert(
      res.results.length === 0,
      "33. Negative distractor query ('sourdough bread') yields 0 results in hybrid mode"
    );
  }

  // 34. Quarantined content cannot surface
  {
    const resLex = searchContent("RUN-001-20260927-Q001-gemini-01");
    const resHyb = await hybridSearch("RUN-001-20260927-Q001-gemini-01", { provider, store });
    assert(
      resLex.length === 0 && resHyb.results.length === 0,
      "34. Quarantined incident artifact (gemini-01) cannot surface in lexical or hybrid retrieval"
    );
  }

  // 35. Unpublished research cannot surface
  {
    const indexDocs = buildSearchIndex();
    const hasUnpublishedResearch = indexDocs.some(
      (d) => d.id === "EXP-012" || d.id === "EXP-013" || d.id === "EXP-014"
    );
    assert(
      !hasUnpublishedResearch,
      "35. Unpublished research entities (EXP-012..EXP-014) strictly absent from search index"
    );
  }

  // 36. Draft guide cannot surface
  {
    const indexDocs = buildSearchIndex();
    const hasDraftGuide = indexDocs.some(
      (d) => d.id === "GUI-001" || d.id === "GUI-002"
    );
    assert(
      !hasDraftGuide,
      "36. Draft implementation guides (GUI-001, GUI-002) strictly absent from search index"
    );
  }

  // 37. Draft article cannot surface
  {
    const indexDocs = buildSearchIndex();
    const hasDraftArticle = indexDocs.some(
      (d) => d.id === "INS-001" || d.id === "INS-002" || d.id === "INS-003"
    );
    assert(
      !hasDraftArticle,
      "37. Draft analytical articles (INS-001..INS-003) strictly absent from search index"
    );
  }

  // ----------------------------------------------------
  // SECTION 7: TYPE FILTERS (Assertions 38-40)
  // ----------------------------------------------------
  console.log("\n[Category 7: Search Type Filters]");

  // 38. Professional-experience filter works
  {
    const peResults = searchContent("search", { typeFilter: "professional-experience" });
    assert(
      peResults.length > 0 &&
      peResults.every((r) => r.entityType === "professional-experience"),
      "38. Type filter 'professional-experience' returns exclusively professional experience entities"
    );
  }

  // 39. Unpublished research filter returns zero public results
  {
    const resResults = searchContent("search", { typeFilter: "research" });
    const hybResults = await hybridSearch("search", { entityType: "research", provider, store });
    assert(
      resResults.length === 0 && hybResults.results.length === 0,
      "39. Type filter 'research' returns 0 results across both lexical and hybrid search"
    );
  }

  // 40. Unpublished article filter returns zero public results
  {
    const artResults = searchContent("search", { typeFilter: "article" });
    const hybArtResults = await hybridSearch("search", { entityType: "article", provider, store });
    assert(
      artResults.length === 0 && hybArtResults.results.length === 0,
      "40. Type filter 'article' returns 0 results across both lexical and hybrid search"
    );
  }

  // ----------------------------------------------------
  // SECTION 8: PUBLIC DISCOVERY CORPUS INTEGRITY (Assertions 41-44)
  // ----------------------------------------------------
  console.log("\n[Category 8: Public Discovery Corpus Integrity]");

  // 41. Public search corpus equals expected PUBLISHED corpus
  {
    const indexDocs = buildSearchIndex();
    const docIds = indexDocs.map((d) => d.id).sort();
    assert(
      JSON.stringify(docIds) === JSON.stringify(["PE-001", "PE-002", "PE-003"]),
      "41. Public search corpus consists exclusively of ['PE-001', 'PE-002', 'PE-003']"
    );
  }

  // 42. Semantic corpus contains only published entities
  {
    const rawIndexJson = fs.readFileSync(
      path.join(process.cwd(), "data", "derived", "semantic-index.json"),
      "utf8"
    );
    const parsedIndex = JSON.parse(rawIndexJson);
    const chunkEntities = new Set(parsedIndex.records.map((r: any) => r.metadata.entityId));
    const chunkStatuses = new Set(parsedIndex.records.map((r: any) => r.metadata.status));
    assert(
      Array.from(chunkEntities).every((id) => ["PE-001", "PE-002", "PE-003"].includes(id as string)) &&
      Array.from(chunkStatuses).every((st) => st === "PUBLISHED"),
      "42. Vector store on disk contains only chunks from PUBLISHED entities (PE-001..003)"
    );
  }

  // 43. No duplicate public entity IDs
  {
    const indexDocs = buildSearchIndex();
    const docIds = indexDocs.map((d) => d.id);
    const uniqueDocIds = new Set(docIds);
    assert(
      docIds.length === uniqueDocIds.size,
      "43. Search index contains zero duplicate entity IDs"
    );
  }

  // 44. No invalid result entities
  {
    const results = searchContent("search");
    const allValid = results.every(
      (r) =>
        r.id &&
        r.title &&
        r.href &&
        r.entityType &&
        r.score > 0 &&
        Array.isArray(r.matchedFields) &&
        r.matchedFields.length > 0
    );
    assert(
      allValid,
      "44. All returned search results strictly conform to the validated SearchResult schema contract"
    );
  }

  console.log("\n================================================================================");
  console.log(` RESULTS: ${passed} passed, ${failed} failed`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test suite fatal error:", err);
  process.exit(1);
});
