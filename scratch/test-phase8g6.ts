/**
 * DIXITH Semantic Retrieval Verification Test Suite
 * Phase 8G.6: Semantic Retrieval Implementation
 *
 * Verifies:
 * 1. Query Normalization & Whitespace/Punctuation Handling
 * 2. Empty & Invalid Query Edge Cases (Zero Model Invocations)
 * 3. Publication Safety & Leak Prevention (DRAFT / IN_REVIEW exclusion)
 * 4. Canonical Sanity Queries (PE-001, PE-002, PE-003)
 * 5. Paraphrase & Multi-word Semantic Intent Matching
 * 6. EntityType & Topic Filtering
 * 7. Limit & Threshold Constraints
 * 8. Determinism & Stable Tie-Breaking
 * 9. Out-of-Corpus No-Match Rejection
 * 10. Missing Index Graceful Failure
 * 11. Model/Dimension Mismatch Detection
 * 12. Model Initialization Failure Graceful Handling
 */

import * as fs from "fs";
import * as path from "path";
import {
  semanticSearch,
  normalizeSemanticQuery,
  createExcerpt,
  LocalEmbeddingProvider,
  LocalVectorStore,
  InMemoryVectorStore,
  MockEmbeddingProvider,
  LOCAL_EMBEDDING_MODEL,
  LOCAL_EMBEDDING_DIMENSIONS,
  LOCAL_VECTOR_INDEX_PATH,
  SEMANTIC_SEARCH_DEFAULT_THRESHOLD,
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
  console.log("==================================================");
  console.log(" DIXITH Phase 8G.6 — Semantic Retrieval Test Suite");
  console.log("==================================================\n");

  const provider = new LocalEmbeddingProvider();
  const store = new LocalVectorStore();

  // Ensure index is loaded
  await store.load();

  // ----------------------------------------------------
  // TEST 1: Query Normalization
  // ----------------------------------------------------
  console.log("[Test Suite 1: Query Normalization]");
  {
    assert(
      normalizeSemanticQuery("  Technical  SEO  ") === "technical seo",
      "Collapses leading, trailing, and repeated whitespace"
    );
    assert(
      normalizeSemanticQuery("technical-seo") === "technical seo",
      "Converts hyphens to space while preserving alphanumeric tokens"
    );
    assert(
      normalizeSemanticQuery("technical/SEO") === "technical seo",
      "Converts forward slashes to space"
    );
    assert(
      normalizeSemanticQuery("'technical' \"SEO\" `optimization`") === "technical seo optimization",
      "Strips single quotes, double quotes, backticks, and curly apostrophes"
    );
    assert(
      normalizeSemanticQuery("What is AEO & GEO?") === "what is aeo geo",
      "Converts ampersands and question marks to whitespace cleanly"
    );
  }

  // ----------------------------------------------------
  // TEST 2: Empty & Invalid Query Edge Cases
  // ----------------------------------------------------
  console.log("\n[Test Suite 2: Empty & Invalid Query Handling]");
  {
    const empty1 = await semanticSearch("", { provider, store });
    assert(
      empty1.available === true && empty1.reason === "empty_query" && empty1.results.length === 0,
      "Empty query string returns empty_query reason with 0 results"
    );

    const empty2 = await semanticSearch("     ", { provider, store });
    assert(
      empty2.available === true && empty2.reason === "empty_query" && empty2.results.length === 0,
      "Whitespace-only query returns empty_query reason with 0 results"
    );

    const empty3 = await semanticSearch("!?!?? --- ...", { provider, store });
    assert(
      empty3.available === true && empty3.reason === "empty_query" && empty3.results.length === 0,
      "Punctuation-only query normalizes to empty and returns empty_query"
    );
  }

  // ----------------------------------------------------
  // TEST 3: Publication Safety & Leak Prevention
  // ----------------------------------------------------
  console.log("\n[Test Suite 3: Publication Safety & Leak Prevention]");
  {
    const leakTestStore = new InMemoryVectorStore();
    const mockProvider = new MockEmbeddingProvider(384);

    const publishedText = "Published international crawl optimization study.";
    // Generate identical unit-length vector so similarity to query is 1.0
    const testVector = await mockProvider.embedText(publishedText);

    // Add 1 PUBLISHED record and 2 UNPUBLISHED (DRAFT, IN_REVIEW) records sharing the high-scoring vector
    const testRecords: VectorRecord[] = [
      {
        id: "PUB-001#overview#0",
        values: testVector,
        metadata: {
          chunkId: "PUB-001#overview#0",
          entityId: "PUB-001",
          entityType: "professional-experience",
          slug: "published-case",
          title: "Published International Case Study",
          section: "overview",
          status: "PUBLISHED" as ContentStatus,
          contentHash: "hash-pub",
          content: publishedText,
        },
      },
      {
        id: "DRAFT-001#overview#0",
        values: testVector,
        metadata: {
          chunkId: "DRAFT-001#overview#0",
          entityId: "DRAFT-001",
          entityType: "research",
          slug: "confidential-draft",
          title: "Confidential Draft Research",
          section: "overview",
          status: "DRAFT" as ContentStatus,
          contentHash: "hash-draft",
          content: "Confidential draft research that must never be exposed.",
        },
      },
      {
        id: "REVIEW-001#overview#0",
        values: testVector,
        metadata: {
          chunkId: "REVIEW-001#overview#0",
          entityId: "REVIEW-001",
          entityType: "article",
          slug: "in-review-article",
          title: "Pending In-Review Article",
          section: "overview",
          status: "IN_REVIEW" as ContentStatus,
          contentHash: "hash-review",
          content: "Unapproved article currently in review.",
        },
      },
    ];

    await leakTestStore.upsert(testRecords);

    const leakResponse = await semanticSearch(publishedText, {
      provider: mockProvider,
      store: leakTestStore,
      threshold: 0.5,
      limit: 10,
    });

    const returnedEntityIds = leakResponse.results.map((r) => r.entityId);
    assert(
      !returnedEntityIds.includes("DRAFT-001"),
      "DRAFT status entity is strictly blocked from semantic retrieval"
    );
    assert(
      !returnedEntityIds.includes("REVIEW-001"),
      "IN_REVIEW status entity is strictly blocked from semantic retrieval"
    );
    assert(
      returnedEntityIds.includes("PUB-001"),
      "PUBLISHED status entity is correctly returned"
    );
  }

  // ----------------------------------------------------
  // TEST 4: Canonical Domain Sanity Queries
  // ----------------------------------------------------
  console.log("\n[Test Suite 4: Canonical Domain Sanity Queries (Live Index)]");
  {
    // Query 1: International SEO
    const q1 = "technical SEO and crawl optimization for international websites";
    const res1 = await semanticSearch(q1, { provider, store, threshold: 0.5 });
    assert(res1.available === true, "Query 1 executed successfully");
    assert(res1.results.length > 0, "Query 1 returned matches above threshold");
    assert(
      res1.results[0]?.entityId === "PE-002",
      `Query 1 top result is PE-002 (Got: ${res1.results[0]?.entityId}, score: ${res1.results[0]?.similarity})`
    );

    // Query 2: Healthcare Taxonomy
    const q2 = "clinical taxonomy and healthcare schema markup";
    const res2 = await semanticSearch(q2, { provider, store, threshold: 0.5 });
    assert(res2.available === true, "Query 2 executed successfully");
    assert(res2.results.length > 0, "Query 2 returned matches above threshold");
    assert(
      res2.results[0]?.entityId === "PE-001",
      `Query 2 top result is PE-001 (Got: ${res2.results[0]?.entityId}, score: ${res2.results[0]?.similarity})`
    );

    // Query 3: E-Commerce Product Catalog
    const q3 = "product catalog structured data for ecommerce search engines";
    const res3 = await semanticSearch(q3, { provider, store, threshold: 0.5 });
    assert(res3.available === true, "Query 3 executed successfully");
    assert(res3.results.length > 0, "Query 3 returned matches above threshold");
    assert(
      res3.results[0]?.entityId === "PE-003",
      `Query 3 top result is PE-003 (Got: ${res3.results[0]?.entityId}, score: ${res3.results[0]?.similarity})`
    );
  }

  // ----------------------------------------------------
  // TEST 5: Paraphrases & Multi-word Semantic Intent
  // ----------------------------------------------------
  console.log("\n[Test Suite 5: Paraphrases & Semantic Variations]");
  {
    const paraphrase1 = "hreflang tags and cross-border multi-region crawl budget";
    const resPara1 = await semanticSearch(paraphrase1, { provider, store, threshold: 0.4 });
    assert(
      resPara1.results[0]?.entityId === "PE-002",
      `Paraphrase 1 matches PE-002 (Got: ${resPara1.results[0]?.entityId}, score: ${resPara1.results[0]?.similarity})`
    );

    const paraphrase2 = "medical terminology and health entities structured representation";
    const resPara2 = await semanticSearch(paraphrase2, { provider, store, threshold: 0.4 });
    assert(
      resPara2.results[0]?.entityId === "PE-001",
      `Paraphrase 2 matches PE-001 (Got: ${resPara2.results[0]?.entityId}, score: ${resPara2.results[0]?.similarity})`
    );

    const paraphrase3 = "merchant center feeds and retail product attributes for generative AI";
    const resPara3 = await semanticSearch(paraphrase3, { provider, store, threshold: 0.4 });
    assert(
      resPara3.results[0]?.entityId === "PE-003",
      `Paraphrase 3 matches PE-003 (Got: ${resPara3.results[0]?.entityId}, score: ${resPara3.results[0]?.similarity})`
    );
  }

  // ----------------------------------------------------
  // TEST 6: EntityType & Topic Filtering
  // ----------------------------------------------------
  console.log("\n[Test Suite 6: Filtering by EntityType & Topics]");
  {
    // Filter by entityType: "professional-experience"
    const resType = await semanticSearch("technical SEO", {
      provider,
      store,
      entityType: "professional-experience",
    });
    assert(
      resType.results.every((r) => r.entityType === "professional-experience"),
      "EntityType filter restricts results strictly to professional-experience"
    );

    // Filter by entityType: "research" (currently unpublished, so should return 0)
    const resResearch = await semanticSearch("technical SEO", {
      provider,
      store,
      entityType: "research",
    });
    assert(
      resResearch.results.length === 0,
      "Filtering by currently unindexed/draft entityType 'research' returns 0 results safely"
    );

    // Filter by topics: TOP-006 (Entity Optimization & Knowledge Graphs - PE-001 only)
    const resTopic = await semanticSearch("healthcare and search architecture", {
      provider,
      store,
      topics: ["TOP-006"],
      threshold: 0.3,
    });
    assert(
      resTopic.results.length > 0 && resTopic.results.every((r) => r.topics?.includes("TOP-006")),
      "Topic filter TOP-006 restricts results strictly to entities tagged with TOP-006"
    );

    // Filter by non-existent or unindexed topic: TOP-999
    const resNoTopic = await semanticSearch("healthcare and search architecture", {
      provider,
      store,
      topics: ["TOP-999"],
      threshold: 0.1,
    });
    assert(
      resNoTopic.results.length === 0,
      "Filtering by non-indexed topic 'TOP-999' returns 0 results safely"
    );
  }

  // ----------------------------------------------------
  // TEST 7: Limit & Threshold Constraints
  // ----------------------------------------------------
  console.log("\n[Test Suite 7: Limit & Threshold Constraints]");
  {
    const resLimit1 = await semanticSearch("search architecture", {
      provider,
      store,
      limit: 1,
      threshold: 0.1,
    });
    assert(resLimit1.results.length === 1, "Limit = 1 returns exactly 1 result");

    const resLimit3 = await semanticSearch("search architecture", {
      provider,
      store,
      limit: 3,
      threshold: 0.1,
    });
    assert(
      resLimit3.results.length <= 3,
      `Limit = 3 returns at most 3 results (Got: ${resLimit3.results.length})`
    );

    // High threshold that cuts off all matches
    const resHighThreshold = await semanticSearch("search architecture", {
      provider,
      store,
      threshold: 0.99,
    });
    assert(
      resHighThreshold.results.length === 0,
      "Threshold of 0.99 excludes all results below 0.99"
    );
  }

  // ----------------------------------------------------
  // TEST 8: Determinism & Stable Tie-Breaking
  // ----------------------------------------------------
  console.log("\n[Test Suite 8: Determinism & Stable Tie-Breaking]");
  {
    const query = "knowledge graph and entity relations";
    const run1 = await semanticSearch(query, { provider, store, threshold: 0.4 });
    const run2 = await semanticSearch(query, { provider, store, threshold: 0.4 });
    const run3 = await semanticSearch(query, { provider, store, threshold: 0.4 });

    const ids1 = run1.results.map((r) => `${r.chunkId}:${r.similarity}`).join("|");
    const ids2 = run2.results.map((r) => `${r.chunkId}:${r.similarity}`).join("|");
    const ids3 = run3.results.map((r) => `${r.chunkId}:${r.similarity}`).join("|");

    assert(
      ids1 === ids2 && ids2 === ids3,
      "Repeated consecutive searches return identical chunks, similarities, and rank order"
    );
  }

  // ----------------------------------------------------
  // TEST 9: Out-of-Corpus No-Match Rejection
  // ----------------------------------------------------
  console.log("\n[Test Suite 9: Out-of-Corpus No-Match Handling]");
  {
    const unrelatedQuery = "how to bake sourdough bread with whole wheat flour at high altitude";
    const resUnrelated = await semanticSearch(unrelatedQuery, {
      provider,
      store,
      threshold: SEMANTIC_SEARCH_DEFAULT_THRESHOLD,
    });

    assert(
      resUnrelated.results.length === 0,
      "Unrelated out-of-corpus query returns 0 results at default threshold (0.5)"
    );
  }

  // ----------------------------------------------------
  // TEST 10: Missing Index Graceful Failure
  // ----------------------------------------------------
  console.log("\n[Test Suite 10: Missing Index Graceful Handling]");
  {
    const missingStore = new LocalVectorStore("data/derived/non-existent-index.json");
    const missingResponse = await semanticSearch("technical SEO", {
      provider,
      store: missingStore,
    });

    assert(
      missingResponse.available === false &&
        missingResponse.reason === "semantic_index_unavailable" &&
        missingResponse.results.length === 0,
      "Non-existent index file triggers 'semantic_index_unavailable' without crashing"
    );
  }

  // ----------------------------------------------------
  // TEST 11: Model & Dimension Mismatch Detection
  // ----------------------------------------------------
  console.log("\n[Test Suite 11: Index / Model Mismatch Detection]");
  {
    // Create a temporary mock file with incompatible dimensions (768 instead of 384)
    const tempIndexPath = "scratch/temp-incompatible-index.json";
    const incompatiblePayload = {
      version: 1,
      embeddingModel: "incompatible-model-v1",
      dimensions: 768,
      generatedAt: new Date().toISOString(),
      records: [],
    };
    fs.writeFileSync(tempIndexPath, JSON.stringify(incompatiblePayload, null, 2), "utf-8");

    const incompatibleStore = new LocalVectorStore(tempIndexPath);
    const mismatchResponse = await semanticSearch("technical SEO", {
      provider,
      store: incompatibleStore,
    });

    assert(
      mismatchResponse.available === false &&
        mismatchResponse.reason === "semantic_index_incompatible" &&
        mismatchResponse.results.length === 0,
      "Index with mismatched model or dimensions triggers 'semantic_index_incompatible'"
    );

    // Clean up temporary test file
    if (fs.existsSync(tempIndexPath)) {
      fs.unlinkSync(tempIndexPath);
    }
  }

  // ----------------------------------------------------
  // TEST 12: Model Initialization Failure Handling
  // ----------------------------------------------------
  console.log("\n[Test Suite 12: Model Failure Graceful Handling]");
  {
    const failingProvider = {
      name: "failing-provider",
      dimensions: 384,
      embedText: async () => {
        throw new Error("Simulated ONNX model initialization failure");
      },
      embedBatch: async () => {
        throw new Error("Simulated batch failure");
      },
    };

    const failingResponse = await semanticSearch("technical SEO", {
      provider: failingProvider,
      store,
    });

    assert(
      failingResponse.available === false &&
        failingResponse.reason === "model_initialization_failed" &&
        failingResponse.results.length === 0,
      "Model failure triggers 'model_initialization_failed' without crashing application"
    );
  }

  console.log("\n==================================================");
  console.log(` Test Results: ${passed} passed, ${failed} failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution encountered an unhandled error:", err);
  process.exit(1);
});
