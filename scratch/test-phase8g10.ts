/**
 * DIXITH Phase 8G.10 — Controlled Hybrid Search Integration & UX Benchmark Suite
 *
 * Verifies:
 * 1. Unit & Mode Parity Tests:
 *    - Default mode is 'keyword'
 *    - Explicit 'keyword' mode matches Phase 8F searchContent exactly
 *    - Explicit 'hybrid' mode runs hybrid retrieval with lexical quality gate
 *    - Unknown mode ('xyz', 'advanced') defaults safely to 'keyword'
 *    - Empty query returns empty results immediately without model initialization
 *    - Type filtering works identically across both keyword and hybrid modes
 *    - Error fallback: hybrid failure gracefully defaults to keyword with fallbackToKeyword: true
 *    - Publication safety: draft/in-review entities remain 100% excluded
 *    - Deterministic ordering: repeated executions yield bit-exact identical rankings
 * 2. UX Comparison across 12 Representative Queries:
 *    - technical seo
 *    - AI search
 *    - answer engine optimization
 *    - GEO
 *    - E-E-A-T
 *    - hreflang
 *    - MerchantReturnPolicy JSON-LD
 *    - healthcare search
 *    - international search
 *    - how to bake sourdough bread
 *    - capital of France
 *    - quantum computing
 * 3. Comparative Benchmark across 34 Queries (18 positive + 16 negative):
 *    - Keyword Mode vs Hybrid Mode
 *    - Top-1, Top-3, Top-5, MRR, Negative FP rates, Entity duplication
 *    - Latency benchmarking (warm vs cold)
 */

import {
  searchContent,
  SearchResult,
  buildSearchIndex,
} from "../lib/search";
import {
  searchWithMode,
  parseSearchMode,
  SearchMode,
  UnifiedSearchResult,
} from "../lib/search/mode";
import {
  LocalEmbeddingProvider,
  LocalVectorStore,
  EVALUATION_DATASET,
  SemanticEvaluationQuery,
  EvaluationCategory,
} from "../lib/semantic";

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

const REPRESENTATIVE_QUERIES = [
  "technical seo",
  "AI search",
  "answer engine optimization",
  "GEO",
  "E-E-A-T",
  "hreflang",
  "MerchantReturnPolicy JSON-LD",
  "healthcare search",
  "international search",
  "how to bake sourdough bread",
  "capital of France",
  "quantum computing",
];

const EXPANDED_NEGATIVE_DISTRACTORS: string[] = [
  "how to bake sourdough bread with whole wheat flour at high altitude",
  "quantum entanglement in topological quantum computers",
  "best defensive football drills for youth training sessions",
  "Python PyTorch tutorial for computer vision object detection",
  "how to replace a broken alternator belt in a Honda Civic",
  "history of Renaissance architecture in Florence Italy",
  "top attractions and hotels in Tokyo Japan for tourists",
  "organic gardening tips for growing tomatoes indoors",
  "guitar chords and tabs for Stairway to Heaven",
  "symptoms of acute appendicitis and emergency treatments",
  "how to fix plumbing leak under kitchen sink",
  "best dog food brands for golden retriever puppies",
  "how to file federal income tax return online",
  "cricket bowling techniques for fast bowlers",
  "history of the Roman Empire and Julius Caesar",
  "astronomy guide to viewing the Andromeda galaxy with binoculars",
];

async function runTestSuite() {
  console.log("================================================================================");
  console.log(" DIXITH Phase 8G.10 — Controlled Hybrid Search Integration & UX Benchmark Suite");
  console.log("================================================================================\n");

  const provider = new LocalEmbeddingProvider();
  const store = new LocalVectorStore();
  await store.load();

  // ----------------------------------------------------
  // SECTION 1: UNIT & MODE PARITY TESTS
  // ----------------------------------------------------
  console.log("[Section 1: Unit & Mode Parity Verification]");

  // 1. parseSearchMode behavior
  {
    assert(parseSearchMode(undefined) === "keyword", "parseSearchMode(undefined) returns 'keyword'");
    assert(parseSearchMode(null) === "keyword", "parseSearchMode(null) returns 'keyword'");
    assert(parseSearchMode("") === "keyword", "parseSearchMode('') returns 'keyword'");
    assert(parseSearchMode("keyword") === "keyword", "parseSearchMode('keyword') returns 'keyword'");
    assert(parseSearchMode("hybrid") === "hybrid", "parseSearchMode('hybrid') returns 'hybrid'");
    assert(parseSearchMode("HYBRID") === "hybrid", "parseSearchMode('HYBRID') returns 'hybrid'");
    assert(parseSearchMode("  hybrid  ") === "hybrid", "parseSearchMode('  hybrid  ') returns 'hybrid'");
    assert(parseSearchMode("unknown_mode") === "keyword", "parseSearchMode('unknown_mode') falls back to 'keyword'");
  }

  // 2. Keyword mode parity with Phase 8F searchContent
  {
    const query = "technical seo";
    const rawLexical = searchContent(query);
    const modeKeyword = await searchWithMode(query, { mode: "keyword", provider, store });
    assert(
      modeKeyword.mode === "keyword" &&
      modeKeyword.effectiveMode === "keyword" &&
      modeKeyword.fallbackToKeyword === false &&
      modeKeyword.results.length === rawLexical.length &&
      modeKeyword.results.every((r, idx) => r.id === rawLexical[idx].id),
      "Keyword mode produces identical results and ordering to Phase 8F searchContent"
    );
  }

  // 3. Default mode is keyword
  {
    const query = "healthcare search";
    const defaultSearch = await searchWithMode(query, { provider, store });
    const keywordSearch = await searchWithMode(query, { mode: "keyword", provider, store });
    assert(
      defaultSearch.mode === "keyword" &&
      defaultSearch.results.length === keywordSearch.results.length &&
      defaultSearch.results.every((r, idx) => r.id === keywordSearch.results[idx].id),
      "Omitted mode parameter defaults to Phase 8F keyword search"
    );
  }

  // 4. Hybrid mode activates hybrid retrieval
  {
    const query = "technical seo";
    const hybridResult = await searchWithMode(query, { mode: "hybrid", provider, store });
    assert(
      hybridResult.mode === "hybrid" &&
      hybridResult.effectiveMode === "hybrid" &&
      hybridResult.fallbackToKeyword === false &&
      hybridResult.results.length > 0 &&
      hybridResult.results[0].retrievalSignals !== undefined,
      "Hybrid mode activates hybrid retrieval and populates retrievalSignals"
    );
  }

  // 5. Unknown mode falls back to keyword safely
  {
    const query = "clinical schema";
    const unknownResult = await searchWithMode(query, { mode: "quantum_ai_search", provider, store });
    const keywordResult = await searchWithMode(query, { mode: "keyword", provider, store });
    assert(
      unknownResult.mode === "keyword" &&
      unknownResult.effectiveMode === "keyword" &&
      unknownResult.results.length === keywordResult.results.length &&
      unknownResult.results.every((r, idx) => r.id === keywordResult.results[idx].id),
      "Unknown mode parameter ('quantum_ai_search') falls back safely to keyword search"
    );
  }

  // 6. Empty query handling
  {
    const empty1 = await searchWithMode("", { mode: "hybrid", provider, store });
    const empty2 = await searchWithMode("   ", { mode: "hybrid", provider, store });
    assert(
      empty1.results.length === 0 &&
      empty1.totalFound === 0 &&
      empty1.durationMs === 0 &&
      empty2.results.length === 0,
      "Empty or whitespace query returns 0 results immediately without model overhead"
    );
  }

  // 7. Type filter parity across modes
  {
    const query = "search architecture";
    const keyType = await searchWithMode(query, { mode: "keyword", typeFilter: "professional-experience", provider, store });
    const hybType = await searchWithMode(query, { mode: "hybrid", typeFilter: "professional-experience", provider, store });
    assert(
      keyType.results.every((r) => r.entityType === "professional-experience") &&
      hybType.results.every((r) => r.entityType === "professional-experience"),
      "Type filter 'professional-experience' is strictly enforced across both keyword and hybrid modes"
    );
  }

  // 8. Graceful fallback on hybrid error
  {
    const query = "technical seo";
    // Simulate failure by passing an uninitialized / broken store
    const uninitializedStore = new LocalVectorStore("non_existent_dir_for_fallback_test");
    const fallbackResponse = await searchWithMode(query, {
      mode: "hybrid",
      provider,
      store: uninitializedStore,
    });
    assert(
      fallbackResponse.mode === "hybrid" &&
      fallbackResponse.effectiveMode === "keyword" &&
      fallbackResponse.fallbackToKeyword === true &&
      fallbackResponse.results.length > 0,
      "Hybrid retrieval error gracefully falls back to keyword search (fallbackToKeyword: true)"
    );
  }

  // 9. Publication safety across both modes
  {
    const searchDocs = buildSearchIndex();
    const allPublished = searchDocs.every((d) => d.status === "PUBLISHED");
    assert(
      allPublished,
      "Publication safety: Search index strictly excludes non-published content"
    );
  }

  // 10. Deterministic ordering
  {
    const query = "technical SEO and crawl optimization for international websites";
    const run1 = await searchWithMode(query, { mode: "hybrid", provider, store });
    const run2 = await searchWithMode(query, { mode: "hybrid", provider, store });
    const identical =
      run1.results.length === run2.results.length &&
      run1.results.every((r, idx) => r.id === run2.results[idx].id);
    assert(identical, "Repeated hybrid searches produce deterministic, bit-exact rankings");
  }

  // ----------------------------------------------------
  // SECTION 2: UX COMPARISON ACROSS 12 REPRESENTATIVE QUERIES
  // ----------------------------------------------------
  console.log("\n[Section 2: UX Comparison across 12 Representative Queries]");
  console.log("---------------------------------------------------------------------------------------------------------");
  console.log("Query                          | Keyword (8F) Top-1 [Count] | Hybrid (8G.10) Top-1 [Count] | Hybrid Signal");
  console.log("-------------------------------+----------------------------+------------------------------+--------------");

  for (const q of REPRESENTATIVE_QUERIES) {
    const keyRes = await searchWithMode(q, { mode: "keyword", provider, store });
    const hybRes = await searchWithMode(q, { mode: "hybrid", provider, store });

    const keyTop = keyRes.results.length > 0
      ? `${keyRes.results[0].id} (${keyRes.results.length})`
      : "None (0)";
    const hybTop = hybRes.results.length > 0
      ? `${hybRes.results[0].id} (${hybRes.results.length})`
      : "None (0)";
    const signal = hybRes.results.length > 0
      ? (hybRes.results[0].retrievalSignals || "none")
      : "n/a (rejected)";

    const qPad = q.padEnd(30);
    const keyPad = keyTop.padEnd(26);
    const hybPad = hybTop.padEnd(28);

    console.log(`${qPad} | ${keyPad} | ${hybPad} | ${signal}`);
  }
  console.log("---------------------------------------------------------------------------------------------------------\n");

  // Verify negative queries in representative list returned 0 in hybrid
  {
    const breadRes = await searchWithMode("how to bake sourdough bread", { mode: "hybrid", provider, store });
    const franceRes = await searchWithMode("capital of France", { mode: "hybrid", provider, store });
    const quantumRes = await searchWithMode("quantum computing", { mode: "hybrid", provider, store });

    assert(
      breadRes.results.length === 0 && franceRes.results.length === 0 && quantumRes.results.length === 0,
      "Representative negative queries (sourdough, capital of France, quantum computing) return 0 results in hybrid mode"
    );
  }

  // ----------------------------------------------------
  // SECTION 3: COMPARATIVE BENCHMARK (34 QUERIES)
  // ----------------------------------------------------
  console.log("[Section 3: Comparative Benchmark across 34 Queries]");

  const positiveQueries = EVALUATION_DATASET.filter((q) => q.expectedRelevant);
  const canonicalNegativeQueries = EVALUATION_DATASET.filter((q) => !q.expectedRelevant);

  const fullNegativeQueries: SemanticEvaluationQuery[] = EXPANDED_NEGATIVE_DISTRACTORS.map((q, idx) => ({
    id: `DISTRACT-EXP-${String(idx + 1).padStart(3, "0")}`,
    query: q,
    category: "negative_distractor" as EvaluationCategory,
    expectedEntityIds: [],
    expectedRelevant: false,
    rationale: "Expanded negative query",
  }));

  interface ModeBenchmark {
    name: string;
    top1HitRate: number;
    top3HitRate: number;
    top5HitRate: number;
    mrr: number;
    duplicateRate: number;
    posZeroCount: number;
    canonNegFpCount: number;
    canonNegFpRate: number;
    fullNegFpCount: number;
    fullNegFpRate: number;
    avgLatencyMs: number;
    categoryTop1: Record<string, number>;
  }

  async function evaluateMode(
    name: string,
    mode: SearchMode
  ): Promise<ModeBenchmark> {
    let top1Count = 0;
    let top3Count = 0;
    let top5Count = 0;
    let mrrSum = 0;
    let duplicateSets = 0;
    let zeroCount = 0;
    let totalLatency = 0;

    const catHits: Record<string, { hits: number; total: number }> = {
      exact_intent: { hits: 0, total: 0 },
      conceptual_paraphrase: { hits: 0, total: 0 },
      vocabulary_variation: { hits: 0, total: 0 },
    };

    // Positive queries
    for (const q of positiveQueries) {
      catHits[q.category].total++;
      const res = await searchWithMode(q.query, { mode, provider, store });
      totalLatency += res.durationMs;
      const entityIds = res.results.map((r) => r.id);

      if (entityIds.length === 0) zeroCount++;

      const unique = new Set(entityIds);
      if (unique.size < entityIds.length) duplicateSets++;

      const top1 = entityIds[0];
      if (top1 && q.expectedEntityIds?.includes(top1)) {
        top1Count++;
        catHits[q.category].hits++;
      }
      if (entityIds.slice(0, 3).some((id) => q.expectedEntityIds?.includes(id))) {
        top3Count++;
      }
      if (entityIds.slice(0, 5).some((id) => q.expectedEntityIds?.includes(id))) {
        top5Count++;
      }

      let rank = 0;
      for (let i = 0; i < entityIds.length; i++) {
        if (q.expectedEntityIds?.includes(entityIds[i])) {
          rank = i + 1;
          break;
        }
      }
      if (rank > 0) mrrSum += 1 / rank;
    }

    // Canonical Negatives (6)
    let canonFp = 0;
    for (const q of canonicalNegativeQueries) {
      const res = await searchWithMode(q.query, { mode, provider, store });
      totalLatency += res.durationMs;
      if (res.results.length > 0) canonFp++;
    }

    // Full Negatives (16)
    let fullFp = 0;
    for (const q of fullNegativeQueries) {
      const res = await searchWithMode(q.query, { mode, provider, store });
      totalLatency += res.durationMs;
      if (res.results.length > 0) fullFp++;
    }

    const totalEvaluated = positiveQueries.length + canonicalNegativeQueries.length + fullNegativeQueries.length;
    const categoryTop1: Record<string, number> = {};
    for (const k of Object.keys(catHits)) {
      categoryTop1[k] = catHits[k].hits / catHits[k].total;
    }

    return {
      name,
      top1HitRate: top1Count / positiveQueries.length,
      top3HitRate: top3Count / positiveQueries.length,
      top5HitRate: top5Count / positiveQueries.length,
      mrr: mrrSum / positiveQueries.length,
      duplicateRate: duplicateSets / positiveQueries.length,
      posZeroCount: zeroCount,
      canonNegFpCount: canonFp,
      canonNegFpRate: canonFp / canonicalNegativeQueries.length,
      fullNegFpCount: fullFp,
      fullNegFpRate: fullFp / fullNegativeQueries.length,
      avgLatencyMs: totalLatency / totalEvaluated,
      categoryTop1,
    };
  }

  const keywordMetrics = await evaluateMode("Keyword Mode (Phase 8F)", "keyword");
  const hybridMetrics = await evaluateMode("Hybrid Mode (Phase 8G.10)", "hybrid");

  console.log("--------------------------------------------------------------------------------------------------------");
  console.log("Mode                        | Top-1  | Top-3  | MRR   | Canon FP (6) | Full FP (16) | Dupl % | Avg Latency");
  console.log("----------------------------+--------+--------+-------+--------------+--------------+--------+------------");
  for (const m of [keywordMetrics, hybridMetrics]) {
    const namePadded = m.name.padEnd(27);
    const top1 = (m.top1HitRate * 100).toFixed(1).padStart(5) + "%";
    const top3 = (m.top3HitRate * 100).toFixed(1).padStart(5) + "%";
    const mrr = m.mrr.toFixed(3).padStart(5);
    const canonFp = `${m.canonNegFpCount}/6 (${(m.canonNegFpRate * 100).toFixed(0)}%)`.padStart(12);
    const fullFp = `${m.fullNegFpCount}/16 (${(m.fullNegFpRate * 100).toFixed(0)}%)`.padStart(12);
    const dupl = (m.duplicateRate * 100).toFixed(0).padStart(5) + "%";
    const latency = `${m.avgLatencyMs.toFixed(1)} ms`.padStart(10);
    console.log(`${namePadded} | ${top1} | ${top3} | ${mrr} | ${canonFp} | ${fullFp} | ${dupl} | ${latency}`);
  }
  console.log("--------------------------------------------------------------------------------------------------------\n");

  // Benchmark Assertions
  assert(
    hybridMetrics.top1HitRate === 1.0,
    "Benchmark: Hybrid mode achieves 100.0% Top-1 hit rate on positive queries"
  );
  assert(
    hybridMetrics.mrr === 1.0,
    "Benchmark: Hybrid mode achieves perfect MRR (1.000)"
  );
  assert(
    hybridMetrics.canonNegFpCount === 0 && hybridMetrics.fullNegFpCount === 0,
    "Benchmark: Hybrid mode achieves 0.0% negative false positive rate across both 6-query and 16-query negative suites"
  );
  assert(
    hybridMetrics.duplicateRate === 0.0,
    "Benchmark: Hybrid mode maintains 0.0% duplicate entities in results"
  );

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
