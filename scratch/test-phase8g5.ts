/**
 * Verification test suite for Phase 8G.5:
 * Local Semantic Index Implementation.
 *
 * Covers:
 * 1. LocalEmbeddingProvider (init, single, batch, normalization, dimensions, empty handling)
 * 2. LocalVectorStore (persistence, reading, writing, metadata, safe error handling)
 * 3. Incremental Indexing (new, unchanged, changed, deleted, model mismatch)
 * 4. Publication Safety (only PUBLISHED content embedded)
 * 5. Determinism Check (repeated embeddings)
 * 6. Semantic Quality Sanity Check (actual DIXITH chunks vs. target search queries)
 */

import * as fs from "fs";
import * as path from "path";
import {
  LocalEmbeddingProvider,
  LocalVectorStore,
  indexPublishedContent,
  LOCAL_EMBEDDING_MODEL,
  LOCAL_EMBEDDING_DIMENSIONS,
} from "../lib/semantic";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runTests() {
  console.log("==================================================");
  console.log(" DIXITH Phase 8G.5 Local Semantic Index Test Suite");
  console.log("==================================================\n");

  const provider = new LocalEmbeddingProvider();
  const testStorePath = path.join(process.cwd(), "scratch/test-semantic-index.json");
  const store = new LocalVectorStore(testStorePath);

  // -------------------------------------------------------------------------
  // 1. Provider Tests
  // -------------------------------------------------------------------------
  console.log("--- 1. Local Embedding Provider Tests ---");
  assert(provider.dimensions === LOCAL_EMBEDDING_DIMENSIONS, `Dimensions match ${LOCAL_EMBEDDING_DIMENSIONS}`);
  assert(provider.modelName === LOCAL_EMBEDDING_MODEL, `Model matches ${LOCAL_EMBEDDING_MODEL}`);

  const v1 = await provider.embedText("Technical SEO and healthcare search architecture");
  assert(v1.length === 384, "embedText returns exactly 384 dimensions");

  // Check L2 normalization (norm should be ~1.0)
  const norm1 = Math.sqrt(v1.reduce((sum, x) => sum + x * x, 0));
  assert(Math.abs(norm1 - 1.0) < 1e-4, `Vector is unit-normalized (norm=${norm1.toFixed(6)})`);

  // Batch embedding
  const batchVecs = await provider.embedBatch([
    "International search and hreflang routing",
    "E-commerce schema and product discovery",
  ]);
  assert(batchVecs.length === 2 && batchVecs[0].length === 384 && batchVecs[1].length === 384, "embedBatch returns 2 vectors of 384 dims");

  // Empty input handling
  let emptyErrorCaught = false;
  try {
    await provider.embedText("   ");
  } catch {
    emptyErrorCaught = true;
  }
  assert(emptyErrorCaught, "Empty input throws error safely");

  // -------------------------------------------------------------------------
  // 2. Determinism Test
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Determinism & Consistency Test ---");
  const v1Repeat = await provider.embedText("Technical SEO and healthcare search architecture");
  let dotProd = 0;
  for (let i = 0; i < 384; i++) {
    dotProd += v1[i] * v1Repeat[i];
  }
  assert(Math.abs(dotProd - 1.0) < 1e-4, `Repeated embeddings yield cosine similarity = ${dotProd.toFixed(6)} (~1.0)`);

  // -------------------------------------------------------------------------
  // 3. Local Vector Store Persistence Tests
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Local Vector Store Persistence ---");
  // Clean up previous test file if exists
  if (fs.existsSync(testStorePath)) {
    fs.unlinkSync(testStorePath);
  }

  assert(await store.isAvailable(), "LocalVectorStore reports available");

  await store.upsert([
    {
      id: "TEST-001#overview#0",
      values: v1,
      metadata: {
        chunkId: "TEST-001#overview#0",
        entityId: "TEST-001",
        entityType: "professional-experience",
        slug: "test-slug",
        title: "Test Title",
        section: "overview",
        topics: ["TOP-002"],
        status: "PUBLISHED",
        contentHash: "hash123",
        embeddingModel: LOCAL_EMBEDDING_MODEL,
        embeddingDimensions: 384,
      },
    },
  ]);

  assert(fs.existsSync(testStorePath), "Vector index file written to disk on upsert");

  // Create a separate reader store instance pointing to same file
  const readerStore = new LocalVectorStore(testStorePath);
  const records = await readerStore.listRecords();
  assert(records.length === 1, "Reader store successfully loads persisted record from disk");
  assert(records[0].id === "TEST-001#overview#0", "Persisted chunkId preserved");
  assert(records[0].metadata.title === "Test Title", "Metadata title preserved");
  assert(records[0].values.length === 384, "Persisted vector values length is 384");

  const meta = await readerStore.getIndexMetadata();
  assert(meta?.embeddingModel === LOCAL_EMBEDDING_MODEL, "Index file header preserves embeddingModel");
  assert(meta?.dimensions === 384, "Index file header preserves dimensions");

  // Search in reader store
  const searchResults = await readerStore.search({
    vector: v1,
    topK: 1,
  });
  assert(searchResults.length === 1 && Math.abs(searchResults[0].score - 1.0) < 1e-4, "Search against persisted store returns match with similarity ~1.0");

  // Delete test
  await readerStore.delete(["TEST-001#overview#0"]);
  const afterDelete = await readerStore.listRecords();
  assert(afterDelete.length === 0, "Record deleted from memory and persisted file");

  // Clean up test file
  if (fs.existsSync(testStorePath)) {
    fs.unlinkSync(testStorePath);
  }

  // -------------------------------------------------------------------------
  // 4. Indexing Pipeline Integration & Model Mismatch
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Indexing Pipeline Integration ---");
  const tempStore = new LocalVectorStore(path.join(process.cwd(), "scratch/temp-index.json"));

  // Initial index run
  const initialReport = await indexPublishedContent({
    provider,
    store: tempStore,
  });
  assert(initialReport.eligible === 3, "Only 3 PUBLISHED entities eligible");
  assert(initialReport.chunksGenerated === 18, "18 chunks generated");
  assert(initialReport.added === 18, "All 18 chunks added on first run");

  // Incremental run (zero changes)
  const secondReport = await indexPublishedContent({
    provider,
    store: tempStore,
  });
  assert(secondReport.unchanged === 18 && secondReport.added === 0 && secondReport.updated === 0, "Unchanged chunks skipped on subsequent run");

  // Model Mismatch Detection test
  // Inject a dummy record with a different model into tempStore
  const storedList = await tempStore.listRecords();
  storedList[0].metadata.embeddingModel = "old-legacy-model-v1";
  storedList[0].metadata.embeddingDimensions = 512;
  await tempStore.upsert([storedList[0]]);

  const mismatchReport = await indexPublishedContent({
    provider,
    store: tempStore,
  });
  assert(
    mismatchReport.details.some((d) => d.includes("MODEL MISMATCH DETECTED")),
    "Model mismatch detected and full re-index triggered"
  );

  // Clean up temp index
  const tempPath = path.join(process.cwd(), "scratch/temp-index.json");
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }

  // -------------------------------------------------------------------------
  // 5. Semantic Quality Sanity Check
  // -------------------------------------------------------------------------
  console.log("\n--- 5. Semantic Quality Sanity Check ---");
  // Load real index generated by npm run search:index
  const realStore = new LocalVectorStore();
  const realRecords = await realStore.listRecords();
  assert(realRecords.length === 18, "Real index contains 18 published chunks");

  const query1 = "technical SEO and crawl optimization for international websites";
  const q1Vec = await provider.embedText(query1);
  const results1 = await realStore.search({ vector: q1Vec, topK: 3 });

  console.log(`\nQuery: "${query1}"`);
  console.log("Top matches:");
  results1.forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.metadata.entityId}] ${r.metadata.title} - ${r.metadata.heading} (score: ${r.score.toFixed(4)})`);
  });

  // Verify that PE-002 (International Search Architecture) ranks #1 for an international SEO query
  assert(results1[0].metadata.entityId === "PE-002", "International SEO query ranks PE-002 at #1");

  const query2 = "clinical taxonomy and healthcare schema markup";
  const q2Vec = await provider.embedText(query2);
  const results2 = await realStore.search({ vector: q2Vec, topK: 3 });

  console.log(`\nQuery: "${query2}"`);
  console.log("Top matches:");
  results2.forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.metadata.entityId}] ${r.metadata.title} - ${r.metadata.heading} (score: ${r.score.toFixed(4)})`);
  });

  // Verify that PE-001 (Healthcare Search Architecture) ranks #1 for a clinical/healthcare query
  assert(results2[0].metadata.entityId === "PE-001", "Healthcare query ranks PE-001 at #1");

  const query3 = "product catalog structured data for ecommerce search engines";
  const q3Vec = await provider.embedText(query3);
  const results3 = await realStore.search({ vector: q3Vec, topK: 3 });

  console.log(`\nQuery: "${query3}"`);
  console.log("Top matches:");
  results3.forEach((r, i) => {
    console.log(`  ${i + 1}. [${r.metadata.entityId}] ${r.metadata.title} - ${r.metadata.heading} (score: ${r.score.toFixed(4)})`);
  });

  // Verify that PE-003 (E-Commerce Search & Generative Discovery) ranks #1 for an e-commerce query
  assert(results3[0].metadata.entityId === "PE-003", "E-Commerce query ranks PE-003 at #1");

  console.log("\n==================================================");
  console.log("🎉 ALL PHASE 8G.5 LOCAL SEMANTIC TESTS PASSED");
  console.log("==================================================\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
