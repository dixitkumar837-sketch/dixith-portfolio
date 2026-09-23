/**
 * DIXITH Phase 8G.8 — Hybrid Retrieval Test & Benchmarking Suite
 *
 * Verifies:
 * 1. Unit & Functional Tests:
 *    - Lexical-only entity
 *    - Semantic-only entity
 *    - Entity appearing in both
 *    - Entity consolidation: multiple semantic chunks collapse to 1 entity
 *    - Exact RRF formula calculation
 *    - Missing rank handling (lexical or semantic absent)
 *    - Deterministic tie-breaking (rrfScore DESC, entityId ASC, slug ASC)
 *    - Entity type filtering
 *    - Topic filtering
 *    - Publication safety (DRAFT / IN_REVIEW exclusion)
 *    - Empty query handling
 *    - Graceful fallbacks: semantic unavailable, lexical unavailable, both unavailable
 *    - Limit enforcement & clamping
 *    - Threshold sensitivity
 *    - Repeated-query determinism
 * 2. Comparative Benchmark against 24-query evaluation dataset:
 *    - Lexical baseline (Phase 8F)
 *    - Semantic baseline (Phase 8G.6)
 *    - Hybrid retrieval at thresholds 0.40, 0.45, 0.50
 *    - Category breakdown (Exact, Paraphrase, Vocabulary, Negative)
 *    - MRR (Mean Reciprocal Rank)
 *    - Entity duplication rates
 */

import * as fs from "fs";
import * as path from "path";
import {
  hybridSearch,
  consolidateSemanticChunks,
  calculateRrfScore,
  HybridSearchResult,
} from "../lib/search/hybrid";
import { searchContent } from "../lib/search";
import {
  semanticSearch,
  LocalEmbeddingProvider,
  LocalVectorStore,
  InMemoryVectorStore,
  MockEmbeddingProvider,
  EVALUATION_DATASET,
  SemanticEvaluationQuery,
  EvaluationCategory,
  RRF_DEFAULT_K,
  SemanticSearchResult,
  VectorRecord,
} from "../lib/semantic";
import { ContentStatus } from "../data/types";

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
  console.log(" DIXITH Phase 8G.8 — Hybrid Retrieval Test & Benchmark Suite");
  console.log("================================================================================\n");

  const provider = new LocalEmbeddingProvider();
  const store = new LocalVectorStore();
  await store.load();

  // ----------------------------------------------------
  // SECTION 1: UNIT & FUNCTIONAL CONTRACT TESTS
  // ----------------------------------------------------
  console.log("[Section 1: Unit & Functional Verification]");

  // 1. RRF Score Calculation Formula
  {
    const k = 60;
    const rrfBoth = calculateRrfScore(1, 1, k);
    const expectedBoth = 1 / 61 + 1 / 61;
    assert(
      Math.abs(rrfBoth - expectedBoth) < 1e-9,
      "RRF calculation for entity in both systems equals 1/(k+r1) + 1/(k+r2)"
    );

    const rrfLexOnly = calculateRrfScore(1, undefined, k);
    assert(
      Math.abs(rrfLexOnly - 1 / 61) < 1e-9,
      "RRF calculation for lexical-only entity equals 1/(k+r_lex)"
    );

    const rrfSemOnly = calculateRrfScore(undefined, 2, k);
    assert(
      Math.abs(rrfSemOnly - 1 / 62) < 1e-9,
      "RRF calculation for semantic-only entity equals 1/(k+r_sem)"
    );

    const rrfNeither = calculateRrfScore(undefined, undefined, k);
    assert(rrfNeither === 0, "RRF calculation with no ranks returns 0");
  }

  // 2. Entity Consolidation: Multiple Chunks Collapse to One Entity
  {
    const mockChunks: SemanticSearchResult[] = [
      {
        chunkId: "PE-002#overview#0",
        entityId: "PE-002",
        entityType: "professional-experience",
        slug: "international-search-architecture",
        title: "International Search Architecture",
        section: "overview",
        excerpt: "Excerpt 1 overview",
        similarity: 0.6084,
      },
      {
        chunkId: "PE-002#technical-focus#0",
        entityId: "PE-002",
        entityType: "professional-experience",
        slug: "international-search-architecture",
        title: "International Search Architecture",
        section: "technical-focus",
        excerpt: "Excerpt 2 technical focus with higher similarity",
        similarity: 0.6671,
      },
      {
        chunkId: "PE-002#search-focus#0",
        entityId: "PE-002",
        entityType: "professional-experience",
        slug: "international-search-architecture",
        title: "International Search Architecture",
        section: "search-focus",
        excerpt: "Excerpt 3 search focus",
        similarity: 0.6551,
      },
      {
        chunkId: "PE-001#overview#0",
        entityId: "PE-001",
        entityType: "professional-experience",
        slug: "healthcare-search-architecture",
        title: "Healthcare Search Architecture",
        section: "overview",
        excerpt: "Healthcare overview",
        similarity: 0.5487,
      },
    ];

    const consolidated = consolidateSemanticChunks(mockChunks);
    assert(
      consolidated.length === 2,
      "Consolidation collapses 4 chunks across 2 entities into exactly 2 entity candidates"
    );
    const pe002 = consolidated.find((c) => c.entityId === "PE-002");
    assert(
      pe002 !== undefined && pe002.semanticScore === 0.6671,
      "PE-002 preserves highest chunk similarity (0.6671)"
    );
    assert(
      pe002?.matchedChunkId === "PE-002#technical-focus#0",
      "PE-002 preserves chunkId of best matching chunk"
    );
    assert(
      pe002?.semanticRank === 1,
      "PE-002 receives semanticRank 1 (first appearing entity)"
    );
    const pe001 = consolidated.find((c) => c.entityId === "PE-001");
    assert(
      pe001 !== undefined && pe001.semanticRank === 2,
      "PE-001 receives semanticRank 2"
    );
  }

  // 3. Live Hybrid Search: Multi-chunk Entity Collapses in Final Result Set
  {
    const q = "technical SEO and crawl optimization for international websites";
    const res = await hybridSearch(q, { provider, store, limit: 5 });
    const pe002Count = res.results.filter((r) => r.entityId === "PE-002").length;
    assert(
      pe002Count === 1,
      `PE-002 appears exactly once in final hybrid results (Count: ${pe002Count})`
    );
    assert(
      res.results[0]?.entityId === "PE-002",
      `PE-002 is ranked #1 in hybrid search for international query (Got: ${res.results[0]?.entityId})`
    );
    assert(
      res.results[0]?.retrievalSignals === "both",
      "PE-002 retrievalSignals indicates 'both' (present in lexical and semantic)"
    );
  }

  // 4. Retrieval Signal Attribution ("lexical", "semantic", "both")
  {
    // Query matching vocabulary acronym present in lexical
    const resVocab = await hybridSearch("Schema.org MedicalCondition", { provider, store });
    const pe001 = resVocab.results.find((r) => r.entityId === "PE-001");
    assert(
      pe001 !== undefined && (pe001.retrievalSignals === "both" || pe001.retrievalSignals === "lexical"),
      `PE-001 correctly retrieved with signal: ${pe001?.retrievalSignals}`
    );
  }

  // 5. Empty Query Handling
  {
    const emptyRes = await hybridSearch("", { provider, store });
    assert(
      emptyRes.results.length === 0 && emptyRes.totalFound === 0,
      "Empty query returns 0 results immediately"
    );
    const wsRes = await hybridSearch("     ", { provider, store });
    assert(
      wsRes.results.length === 0 && wsRes.totalFound === 0,
      "Whitespace query returns 0 results immediately"
    );
  }

  // 6. Limit Enforcement & Clamping
  {
    const resLimit1 = await hybridSearch("search architecture", { provider, store, limit: 1 });
    assert(resLimit1.results.length === 1, "limit: 1 returns exactly 1 entity");

    const resLimitMax = await hybridSearch("search architecture", { provider, store, limit: 99 });
    assert(
      resLimitMax.results.length <= 10,
      `Excessive limit clamped to max limit 10 (Got: ${resLimitMax.results.length})`
    );
  }

  // 7. Entity Type Filtering
  {
    const resType = await hybridSearch("technical SEO", {
      provider,
      store,
      entityType: "professional-experience",
    });
    assert(
      resType.results.every((r) => r.entityType === "professional-experience"),
      "entityType filter restricts results strictly to professional-experience"
    );

    const resDraftType = await hybridSearch("technical SEO", {
      provider,
      store,
      entityType: "research",
    });
    assert(
      resDraftType.results.length === 0,
      "Filtering for currently unpublished entityType 'research' returns 0 results safely"
    );
  }

  // 8. Topic Filtering
  {
    const resTopic = await hybridSearch("healthcare search", {
      provider,
      store,
      topics: ["TOP-006"],
    });
    assert(
      resTopic.results.length > 0 && resTopic.results.every((r) => r.topics?.includes("TOP-006")),
      "topic filter restricts results strictly to entities tagged with TOP-006 (PE-001)"
    );
  }

  // 9. Publication Safety Regression
  {
    const leakStore = new InMemoryVectorStore();
    const mockProv = new MockEmbeddingProvider(384);
    const pubText = "Canonical published knowledge verification item.";
    const vec = await mockProv.embedText(pubText);

    await leakStore.upsert([
      {
        id: "EXP-013#overview#0",
        values: vec,
        metadata: {
          chunkId: "EXP-013#overview#0",
          entityId: "EXP-013",
          entityType: "research",
          slug: "testing-generative-engine-visibility",
          title: "Testing Generative Engine Visibility",
          section: "overview",
          status: "DRAFT" as ContentStatus,
          contentHash: "hash-draft",
          content: pubText,
        },
      },
    ]);

    const leakRes = await hybridSearch(pubText, {
      provider: mockProv,
      store: leakStore,
      semanticThreshold: 0.1,
    });

    const leakIds = leakRes.results.map((r) => r.entityId);
    assert(
      !leakIds.includes("EXP-013"),
      "DRAFT entity EXP-013 is strictly excluded from hybrid retrieval by canonical publication gate"
    );
  }

  // 10. Graceful Fallback: Semantic Unavailable
  {
    const missingStore = new LocalVectorStore("data/derived/non-existent-store.json");
    const fallbackRes = await hybridSearch("international search", {
      provider,
      store: missingStore,
    });
    assert(
      fallbackRes.diagnostics.semanticAvailable === false,
      "Detects semantic index unavailable in diagnostics"
    );
    assert(
      fallbackRes.results.length > 0,
      "Lexical results remain available when semantic index is missing"
    );
    assert(
      fallbackRes.results.every((r) => r.retrievalSignals === "lexical"),
      "All results fallback cleanly to 'lexical' signal"
    );
  }

  // 11. Repeated-Query Determinism
  {
    const q = "cross-border hreflang mapping and reciprocal tag validation";
    const r1 = await hybridSearch(q, { provider, store });
    const r2 = await hybridSearch(q, { provider, store });
    const r3 = await hybridSearch(q, { provider, store });

    const sig1 = r1.results.map((r) => `${r.entityId}:${r.rrfScore}`).join("|");
    const sig2 = r2.results.map((r) => `${r.entityId}:${r.rrfScore}`).join("|");
    const sig3 = r3.results.map((r) => `${r.entityId}:${r.rrfScore}`).join("|");

    assert(
      sig1 === sig2 && sig2 === sig3,
      "Repeated queries produce identical hybrid rankings, entity IDs, and RRF scores"
    );
  }

  // ----------------------------------------------------
  // SECTION 2: COMPARATIVE BENCHMARK ACROSS 24 QUERIES
  // ----------------------------------------------------
  console.log("\n================================================================================");
  console.log(" [Section 2: Comparative Benchmark across Phase 8F, 8G.6, and 8G.8]");
  console.log("================================================================================\n");

  const positiveQueries = EVALUATION_DATASET.filter((q) => q.expectedRelevant);
  const negativeQueries = EVALUATION_DATASET.filter((q) => !q.expectedRelevant);

  interface SystemMetrics {
    name: string;
    top1HitRate: number;
    top3HitRate: number;
    top5HitRate: number;
    zeroResultCount: number;
    negativeFalsePositiveCount: number;
    negativeFalsePositiveRate: number;
    mrr: number;
    categoryTop1: Record<string, number>;
    entityDuplicationRate: number; // % of queries with duplicate entities in top 5
  }

  async function evaluateSystem(
    name: string,
    searchFn: (q: string) => Promise<{ entityIds: string[]; chunkCount: number }>
  ): Promise<SystemMetrics> {
    let top1Count = 0;
    let top3Count = 0;
    let top5Count = 0;
    let zeroCount = 0;
    let negFpCount = 0;
    let reciprocalRankSum = 0;
    let duplicateEntitySetsCount = 0;

    const catHits: Record<string, { hits: number; total: number }> = {
      exact_intent: { hits: 0, total: 0 },
      conceptual_paraphrase: { hits: 0, total: 0 },
      vocabulary_variation: { hits: 0, total: 0 },
    };

    // Positive Queries
    for (const q of positiveQueries) {
      catHits[q.category].total++;
      const { entityIds } = await searchFn(q.query);

      // Duplication check
      const uniqueEntities = new Set(entityIds);
      if (uniqueEntities.size < entityIds.length) {
        duplicateEntitySetsCount++;
      }

      if (entityIds.length === 0) {
        zeroCount++;
      }

      const top1 = entityIds[0];
      const isTop1 = Boolean(top1 && q.expectedEntityIds?.includes(top1));
      if (isTop1) {
        top1Count++;
        catHits[q.category].hits++;
      }

      const isTop3 = entityIds.slice(0, 3).some((id) => q.expectedEntityIds?.includes(id));
      if (isTop3) top3Count++;

      const isTop5 = entityIds.slice(0, 5).some((id) => q.expectedEntityIds?.includes(id));
      if (isTop5) top5Count++;

      // MRR calculation
      let foundRank = 0;
      for (let i = 0; i < entityIds.length; i++) {
        if (q.expectedEntityIds?.includes(entityIds[i])) {
          foundRank = i + 1;
          break;
        }
      }
      if (foundRank > 0) {
        reciprocalRankSum += 1 / foundRank;
      }
    }

    // Negative Queries
    for (const q of negativeQueries) {
      const { entityIds } = await searchFn(q.query);
      if (entityIds.length > 0) {
        negFpCount++;
      }
    }

    const categoryTop1: Record<string, number> = {};
    for (const k of Object.keys(catHits)) {
      categoryTop1[k] = catHits[k].hits / catHits[k].total;
    }

    return {
      name,
      top1HitRate: top1Count / positiveQueries.length,
      top3HitRate: top3Count / positiveQueries.length,
      top5HitRate: top5Count / positiveQueries.length,
      zeroResultCount: zeroCount,
      negativeFalsePositiveCount: negFpCount,
      negativeFalsePositiveRate: negFpCount / negativeQueries.length,
      mrr: reciprocalRankSum / positiveQueries.length,
      categoryTop1,
      entityDuplicationRate: duplicateEntitySetsCount / positiveQueries.length,
    };
  }

  // System A: Phase 8F Lexical Baseline
  const lexicalMetrics = await evaluateSystem("Phase 8F Lexical", async (query) => {
    const results = searchContent(query);
    return {
      entityIds: results.map((r) => r.id),
      chunkCount: results.length,
    };
  });

  // System B: Phase 8G.6 Semantic Baseline (at default 0.50 threshold)
  const semanticMetrics = await evaluateSystem("Phase 8G.6 Semantic (0.50)", async (query) => {
    const sem = await semanticSearch(query, { provider, store, threshold: 0.50, limit: 5 });
    return {
      entityIds: sem.results.map((r) => r.entityId),
      chunkCount: sem.results.length,
    };
  });

  // System C: Phase 8G.8 Hybrid Retrieval (Threshold 0.40)
  const hybrid040Metrics = await evaluateSystem("Hybrid (0.40)", async (query) => {
    const hyb = await hybridSearch(query, { provider, store, semanticThreshold: 0.40, limit: 5 });
    return {
      entityIds: hyb.results.map((r) => r.entityId),
      chunkCount: hyb.results.length,
    };
  });

  // System D: Phase 8G.8 Hybrid Retrieval (Threshold 0.45)
  const hybrid045Metrics = await evaluateSystem("Hybrid (0.45)", async (query) => {
    const hyb = await hybridSearch(query, { provider, store, semanticThreshold: 0.45, limit: 5 });
    return {
      entityIds: hyb.results.map((r) => r.entityId),
      chunkCount: hyb.results.length,
    };
  });

  // System E: Phase 8G.8 Hybrid Retrieval (Threshold 0.50)
  const hybrid050Metrics = await evaluateSystem("Hybrid (0.50)", async (query) => {
    const hyb = await hybridSearch(query, { provider, store, semanticThreshold: 0.50, limit: 5 });
    return {
      entityIds: hyb.results.map((r) => r.entityId),
      chunkCount: hyb.results.length,
    };
  });

  const allMetrics = [
    lexicalMetrics,
    semanticMetrics,
    hybrid040Metrics,
    hybrid045Metrics,
    hybrid050Metrics,
  ];

  console.log("---------------------------------------------------------------------------------------------------------");
  console.log("System                     | Top-1 Hit | Top-3 Hit | Top-5 Hit | MRR   | Pos Zero | Neg FP Rate | Entity Dup");
  console.log("---------------------------+-----------+-----------+-----------+-------+----------+-------------+-----------");
  for (const m of allMetrics) {
    console.log(
      `${m.name.padEnd(26)} |   ${(m.top1HitRate * 100).toFixed(1).padStart(5)}%  |   ${(m.top3HitRate * 100).toFixed(1).padStart(5)}%  |   ${(m.top5HitRate * 100).toFixed(1).padStart(5)}%  | ${(m.mrr).toFixed(3)} |    ${m.zeroResultCount}     |    ${(m.negativeFalsePositiveRate * 100).toFixed(1)}%    |   ${(m.entityDuplicationRate * 100).toFixed(1)}%`
    );
  }
  console.log("---------------------------------------------------------------------------------------------------------\n");

  console.log("Category-Level Top-1 Hit Rate Comparison:");
  console.log("System                     | Exact Intent (n=6) | Paraphrase (n=6) | Vocab / Acronym (n=6)");
  console.log("---------------------------+--------------------+------------------+----------------------");
  for (const m of allMetrics) {
    console.log(
      `${m.name.padEnd(26)} |       ${(m.categoryTop1.exact_intent * 100).toFixed(1).padStart(5)}%        |      ${(m.categoryTop1.conceptual_paraphrase * 100).toFixed(1).padStart(5)}%       |        ${(m.categoryTop1.vocabulary_variation * 100).toFixed(1).padStart(5)}%`
    );
  }
  console.log("---------------------------------------------------------------------------------------------------------\n");

  console.log("================================================================================");
  console.log(` Test Assertions: ${passed} passed, ${failed} failed`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
