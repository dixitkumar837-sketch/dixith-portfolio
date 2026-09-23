/**
 * DIXITH Phase 8G.9 — Lexical Quality Gate & Negative Query Rejection Test & Benchmark Suite
 *
 * Verifies:
 * 1. Unit & Functional Contract Tests:
 *    - Check 1: Generic-word-only lexical match is rejected
 *    - Check 2: Exact title match is accepted
 *    - Check 3: Exact phrase match is accepted
 *    - Check 4: Taxonomy alias match is accepted
 *    - Check 5: Acronym queries accepted ("SEO", "RAG", "E-E-A-T", "JSON-LD")
 *    - Check 6: Short meaningful query accepted ("clinical schema")
 *    - Check 7: Multi-word meaningful query accepted ("cross-border hreflang SEO architecture")
 *    - Check 8: 10+ negative distractor queries rejected (0 false positives)
 *    - Check 9: Publication safety maintained (DRAFT / IN_REVIEW excluded)
 *    - Check 10: Deterministic ordering preserved across repeated executions
 * 2. API Contract & Diagnostic Telemetry:
 *    - evaluateLexicalQuality report completeness
 *    - filterLexicalCandidates edge case resilience (empty query, empty array)
 *    - hybridSearch diagnostics tracking lexicalPreGateCount & lexicalPostGateCount
 *    - disableQualityGate option for comparative ablation
 * 3. Comparative Benchmark across 34 queries (18 positive + 16 negative distractors):
 *    - System A: Phase 8F Lexical Baseline
 *    - System B: Phase 8G.6 Semantic Baseline
 *    - System C: Phase 8G.8 Standard Hybrid (Ungated)
 *    - System D: Phase 8G.9 Gated Hybrid (Production)
 */

import {
  searchContent,
  SearchResult,
  buildSearchIndex,
  SearchDocument,
} from "../lib/search";
import {
  evaluateLexicalQuality,
  filterLexicalCandidates,
  extractSubstantiveTokens,
  GENERIC_CONVERSATIONAL_TOKENS,
  PROTECTED_DOMAIN_TERMS,
  LexicalQualityEvaluation,
} from "../lib/search/lexical-quality";
import {
  hybridSearch,
  HybridSearchResult,
} from "../lib/search/hybrid";
import {
  semanticSearch,
  LocalEmbeddingProvider,
  LocalVectorStore,
  EVALUATION_DATASET,
  SemanticEvaluationQuery,
  EvaluationCategory,
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
  console.log(" DIXITH Phase 8G.9 — Lexical Quality Gate & Negative Query Rejection Suite");
  console.log("================================================================================\n");

  const provider = new LocalEmbeddingProvider();
  const store = new LocalVectorStore();
  await store.load();

  // ----------------------------------------------------
  // SECTION 1: UNIT & FUNCTIONAL VERIFICATION (10 CHECKS)
  // ----------------------------------------------------
  console.log("[Section 1: Unit & Functional Verification — 10 Required Checks]");

  // Check 1: Generic-word-only lexical match is rejected
  {
    const query = "how to bake sourdough bread with whole wheat flour at high altitude";
    const rawLexical = searchContent(query);
    const vetted = filterLexicalCandidates(rawLexical, query);
    assert(
      rawLexical.length > 0 && vetted.length === 0,
      "Check 1: Generic-word-only match rejected (raw=" + rawLexical.length + ", vetted=" + vetted.length + ")"
    );
  }

  // Check 2: Exact title match is accepted
  {
    const query = "Healthcare Search Architecture";
    const rawLexical = searchContent(query);
    const vetted = filterLexicalCandidates(rawLexical, query);
    assert(
      vetted.some((r) => r.id === "PE-001"),
      "Check 2: Exact title match accepted (PE-001 present in vetted results)"
    );
  }

  // Check 3: Exact phrase match is accepted
  {
    const query = "clinical taxonomy";
    const rawLexical = searchContent(query);
    const vetted = filterLexicalCandidates(rawLexical, query);
    assert(
      vetted.some((r) => r.id === "PE-001"),
      "Check 3: Exact phrase match accepted (PE-001 present in vetted results)"
    );
  }

  // Check 4: Taxonomy alias match is accepted
  {
    const query = "technical seo";
    const rawLexical = searchContent(query);
    const vetted = filterLexicalCandidates(rawLexical, query);
    assert(
      vetted.length > 0 && vetted.some((r) => r.matchedFields.includes("taxonomy-alias")),
      "Check 4: Taxonomy alias match accepted for 'technical seo' (matchedFields includes taxonomy-alias)"
    );
  }

  // Check 5: Acronym queries accepted
  {
    const acronyms = ["SEO", "GEO", "AEO", "JSON-LD", "E-E-A-T"];
    let allAcronymsPassed = true;
    for (const acr of acronyms) {
      const raw = searchContent(acr);
      const vetted = filterLexicalCandidates(raw, acr);
      if (vetted.length === 0) {
        allAcronymsPassed = false;
        console.error(`    Acronym failed: ${acr}`);
      }
    }
    assert(allAcronymsPassed, "Check 5: Acronym queries (SEO, GEO, AEO, JSON-LD, E-E-A-T) accepted");
  }

  // Check 6: Short meaningful query accepted
  {
    const query = "clinical schema";
    const rawLexical = searchContent(query);
    const vetted = filterLexicalCandidates(rawLexical, query);
    assert(
      vetted.some((r) => r.id === "PE-001"),
      "Check 6: Short meaningful query 'clinical schema' accepted (PE-001 retained)"
    );
  }

  // Check 7: Multi-word meaningful query accepted
  {
    const query = "cross-border hreflang SEO architecture";
    const rawLexical = searchContent(query);
    const vetted = filterLexicalCandidates(rawLexical, query);
    assert(
      vetted.some((r) => r.id === "PE-002"),
      "Check 7: Multi-word meaningful query accepted (PE-002 retained)"
    );
  }

  // Check 8: 10+ negative distractor queries rejected (0 false positives)
  {
    let anyNegativeLeaked = false;
    for (const neg of EXPANDED_NEGATIVE_DISTRACTORS) {
      const raw = searchContent(neg);
      const vetted = filterLexicalCandidates(raw, neg);
      if (vetted.length > 0) {
        anyNegativeLeaked = true;
        console.error(`    Negative query leaked: "${neg}" -> [${vetted.map((r) => r.id).join(", ")}]`);
      }
    }
    assert(
      !anyNegativeLeaked,
      "Check 8: 16/16 negative distractor queries rejected with 0 false positives"
    );
  }

  // Check 9: Publication safety maintained (DRAFT / IN_REVIEW excluded)
  {
    const searchDocs = buildSearchIndex();
    const allPublished = searchDocs.every((d) => d.status === "PUBLISHED");
    assert(
      allPublished,
      "Check 9: Publication safety: search index strictly excludes DRAFT and IN_REVIEW entities"
    );
  }

  // Check 10: Deterministic ordering preserved across repeated executions
  {
    const query = "technical SEO and crawl optimization for international websites";
    const run1 = await hybridSearch(query, { provider, store });
    const run2 = await hybridSearch(query, { provider, store });
    const match =
      run1.results.length === run2.results.length &&
      run1.results.every((r, idx) => r.entityId === run2.results[idx].entityId && r.rrfScore === run2.results[idx].rrfScore);
    assert(match, "Check 10: Repeated hybrid queries produce bit-exact identical rankings and scores");
  }

  // ----------------------------------------------------
  // SECTION 2: API CONTRACT & DIAGNOSTICS TELEMETRY
  // ----------------------------------------------------
  console.log("\n[Section 2: API Contract & Diagnostics Telemetry]");

  // 11. evaluateLexicalQuality report completeness
  {
    const raw = searchContent("Healthcare Search Architecture")[0];
    const report = evaluateLexicalQuality(raw, "Healthcare Search Architecture");
    assert(
      report.entityId === "PE-001" &&
      typeof report.accepted === "boolean" &&
      typeof report.reason === "string" &&
      Array.isArray(report.substantiveTokens) &&
      Array.isArray(report.matchedSubstantiveTokens) &&
      typeof report.substantiveRatio === "number" &&
      report.isPhraseMatch === true,
      "evaluateLexicalQuality returns complete, strongly typed diagnostic report"
    );
  }

  // 12. filterLexicalCandidates edge case resilience
  {
    const empty1 = filterLexicalCandidates([], "query");
    const empty2 = filterLexicalCandidates([searchContent("SEO")[0]], "");
    const empty3 = filterLexicalCandidates([searchContent("SEO")[0]], "   ");
    assert(
      empty1.length === 0 && empty2.length === 0 && empty3.length === 0,
      "filterLexicalCandidates handles empty results and empty queries gracefully"
    );
  }

  // 13. hybridSearch diagnostics tracking lexicalPreGateCount & lexicalPostGateCount
  {
    const negQuery = "how to bake sourdough bread with whole wheat flour at high altitude";
    const res = await hybridSearch(negQuery, { provider, store });
    assert(
      res.diagnostics.lexicalPreGateCount === 3 &&
      res.diagnostics.lexicalPostGateCount === 0 &&
      res.diagnostics.lexicalCount === 0 &&
      res.results.length === 0,
      "hybridSearch records lexicalPreGateCount (3), lexicalPostGateCount (0), and drops results to 0"
    );
  }

  // 14. disableQualityGate option for comparative ablation
  {
    const negQuery = "how to bake sourdough bread with whole wheat flour at high altitude";
    const ungated = await hybridSearch(negQuery, { provider, store, disableQualityGate: true });
    assert(
      ungated.results.length === 3 && ungated.diagnostics.lexicalCount === 3,
      "disableQualityGate: true successfully reproduces ungated Phase 8G.8 behavior for comparative ablation"
    );
  }

  // ----------------------------------------------------
  // SECTION 3: COMPARATIVE BENCHMARK
  // ----------------------------------------------------
  console.log("\n[Section 3: Comparative Benchmark across 34 Queries]");

  const positiveQueries = EVALUATION_DATASET.filter((q) => q.expectedRelevant);
  const canonicalNegativeQueries = EVALUATION_DATASET.filter((q) => !q.expectedRelevant);

  // Build combined 16-query negative suite
  const fullNegativeQueries: SemanticEvaluationQuery[] = EXPANDED_NEGATIVE_DISTRACTORS.map((q, idx) => ({
    id: `DISTRACT-EXP-${String(idx + 1).padStart(3, "0")}`,
    query: q,
    category: "negative_distractor" as EvaluationCategory,
    expectedEntityIds: [],
    expectedRelevant: false,
    rationale: "Expanded negative query for thorough rejection testing",
  }));

  interface BenchmarkMetrics {
    name: string;
    top1HitRate: number;
    top3HitRate: number;
    top5HitRate: number;
    mrr: number;
    duplicateRate: number;
    canonicalNegativeFpCount: number;
    canonicalNegativeFpRate: number;
    fullNegativeFpCount: number;
    fullNegativeFpRate: number;
    categoryTop1: Record<string, number>;
  }

  async function evaluateSearchSystem(
    name: string,
    searchFn: (query: string) => Promise<string[]>
  ): Promise<BenchmarkMetrics> {
    let top1Count = 0;
    let top3Count = 0;
    let top5Count = 0;
    let mrrSum = 0;
    let duplicateSets = 0;

    const catHits: Record<string, { hits: number; total: number }> = {
      exact_intent: { hits: 0, total: 0 },
      conceptual_paraphrase: { hits: 0, total: 0 },
      vocabulary_variation: { hits: 0, total: 0 },
    };

    // Positive queries
    for (const q of positiveQueries) {
      catHits[q.category].total++;
      const entityIds = await searchFn(q.query);

      // Duplication check
      const unique = new Set(entityIds);
      if (unique.size < entityIds.length) {
        duplicateSets++;
      }

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
      if (rank > 0) {
        mrrSum += 1 / rank;
      }
    }

    // Canonical negative queries (6)
    let canonicalFp = 0;
    for (const q of canonicalNegativeQueries) {
      const entityIds = await searchFn(q.query);
      if (entityIds.length > 0) canonicalFp++;
    }

    // Full expanded negative queries (16)
    let fullFp = 0;
    for (const q of fullNegativeQueries) {
      const entityIds = await searchFn(q.query);
      if (entityIds.length > 0) fullFp++;
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
      mrr: mrrSum / positiveQueries.length,
      duplicateRate: duplicateSets / positiveQueries.length,
      canonicalNegativeFpCount: canonicalFp,
      canonicalNegativeFpRate: canonicalFp / canonicalNegativeQueries.length,
      fullNegativeFpCount: fullFp,
      fullNegativeFpRate: fullFp / fullNegativeQueries.length,
      categoryTop1,
    };
  }

  // System A: Phase 8F Lexical
  const metricsA = await evaluateSearchSystem("Phase 8F Lexical", async (q) => {
    return searchContent(q).map((r) => r.id);
  });

  // System B: Phase 8G.6 Semantic
  const metricsB = await evaluateSearchSystem("Phase 8G.6 Semantic", async (q) => {
    const res = await semanticSearch(q, { provider, store, threshold: 0.45 });
    // Consolidate chunk IDs to unique entity IDs
    const entities: string[] = [];
    for (const r of res.results) {
      if (!entities.includes(r.entityId)) entities.push(r.entityId);
    }
    return entities;
  });

  // System C: Phase 8G.8 Standard Hybrid (Ungated)
  const metricsC = await evaluateSearchSystem("Phase 8G.8 Hybrid (Ungated)", async (q) => {
    const res = await hybridSearch(q, {
      provider,
      store,
      semanticThreshold: 0.45,
      disableQualityGate: true,
    });
    return res.results.map((r) => r.entityId);
  });

  // System D: Phase 8G.9 Gated Hybrid (Production)
  const metricsD = await evaluateSearchSystem("Phase 8G.9 Hybrid (Gated)", async (q) => {
    const res = await hybridSearch(q, {
      provider,
      store,
      semanticThreshold: 0.45,
      disableQualityGate: false,
    });
    return res.results.map((r) => r.entityId);
  });

  // Display Comparative Results
  console.log("\n--------------------------------------------------------------------------------");
  console.log(" COMPARATIVE RETRIEVAL BENCHMARK TABLE");
  console.log("--------------------------------------------------------------------------------");
  console.log(
    "System                     | Top-1  | Top-3  | MRR   | Canon FP (6) | Full FP (16) | Dupl %"
  );
  console.log("---------------------------+--------+--------+-------+--------------+--------------+-------");
  for (const m of [metricsA, metricsB, metricsC, metricsD]) {
    const namePadded = m.name.padEnd(26);
    const top1 = (m.top1HitRate * 100).toFixed(1).padStart(5) + "%";
    const top3 = (m.top3HitRate * 100).toFixed(1).padStart(5) + "%";
    const mrr = m.mrr.toFixed(3).padStart(5);
    const canonFp = `${m.canonicalNegativeFpCount}/6 (${(m.canonicalNegativeFpRate * 100).toFixed(0)}%)`.padStart(12);
    const fullFp = `${m.fullNegativeFpCount}/16 (${(m.fullNegativeFpRate * 100).toFixed(0)}%)`.padStart(12);
    const dupl = (m.duplicateRate * 100).toFixed(0).padStart(4) + "%";
    console.log(`${namePadded} | ${top1} | ${top3} | ${mrr} | ${canonFp} | ${fullFp} | ${dupl}`);
  }
  console.log("--------------------------------------------------------------------------------\n");

  console.log("Category Top-1 Breakdown (Phase 8G.9 Gated Hybrid):");
  console.log(`  Exact Intent:          ${(metricsD.categoryTop1.exact_intent * 100).toFixed(1)}%`);
  console.log(`  Conceptual Paraphrase: ${(metricsD.categoryTop1.conceptual_paraphrase * 100).toFixed(1)}%`);
  console.log(`  Vocabulary Variation:  ${(metricsD.categoryTop1.vocabulary_variation * 100).toFixed(1)}%`);

  // Assertions for Benchmark
  assert(
    metricsD.canonicalNegativeFpCount === 0,
    "Benchmark: Canonical Negative False Positives dropped from 6/6 (100%) to 0/6 (0.0%)"
  );
  assert(
    metricsD.fullNegativeFpCount === 0,
    "Benchmark: Full Negative False Positives dropped to 0/16 (0.0%)"
  );
  assert(
    metricsD.categoryTop1.exact_intent === 1.0,
    "Benchmark: Exact Intent Top-1 hit rate is 100.0%"
  );
  assert(
    metricsD.mrr >= 0.95,
    "Benchmark: Mean Reciprocal Rank (MRR) maintained above 0.95 (actual: " + metricsD.mrr.toFixed(3) + ")"
  );
  assert(
    metricsD.duplicateRate === 0,
    "Benchmark: Entity duplication rate is 0.0%"
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
