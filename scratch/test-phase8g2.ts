/**
 * Verification test suite for Phase 8G.2 Semantic Retrieval Infrastructure.
 * Runs in Node.js via tsx.
 */

import {
  MockEmbeddingProvider,
  InMemoryVectorStore,
  getSemanticConfig,
  getSemanticStatus,
  getServerOnlyCredentials,
  getEmbeddingProvider,
  getVectorStore,
  resetEmbeddingProvider,
  resetVectorStore,
  VectorRecord,
} from "../lib/semantic";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runTests() {
  console.log("=== DIXITH Phase 8G.2 Test Suite ===\n");

  // 1. Mock Embedding Provider Test
  console.log("--- 1. Embedding Provider & Determinism ---");
  const provider = new MockEmbeddingProvider(768);
  assert(provider.name === "mock", "Provider name is 'mock'");
  assert(provider.dimensions === 768, "Provider dimensions is 768");

  const vec1 = await provider.embedText("Generative Engine Optimization");
  const vec2 = await provider.embedText("Generative Engine Optimization");
  const vec3 = await provider.embedText("Something completely different");

  assert(vec1.length === 768, "Vector dimension matches 768");
  assert(
    JSON.stringify(vec1) === JSON.stringify(vec2),
    "Mock vectors are 100% deterministic for identical input"
  );
  assert(
    JSON.stringify(vec1) !== JSON.stringify(vec3),
    "Different inputs produce different vectors"
  );

  // Check unit normalization (L2 norm should be ~1.0)
  const norm1 = Math.sqrt(vec1.reduce((sum, v) => sum + v * v, 0));
  assert(Math.abs(norm1 - 1.0) < 1e-6, `Vector is unit-normalized (norm=${norm1.toFixed(6)})`);

  const batchVecs = await provider.embedBatch(["A", "B"]);
  assert(batchVecs.length === 2 && batchVecs[0].length === 768, "embedBatch works correctly");

  // 2. Vector Store Test (In-Memory)
  console.log("\n--- 2. Vector Store In-Memory Implementation ---");
  const store = new InMemoryVectorStore();
  assert(store.name === "in-memory", "Store name is 'in-memory'");
  assert(await store.isAvailable(), "Store reports available");

  const sampleRecords: VectorRecord[] = [
    {
      id: "PE-001#overview#0",
      values: vec1, // matches "Generative Engine Optimization"
      metadata: {
        chunkId: "PE-001#overview#0",
        entityId: "PE-001",
        entityType: "article",
        slug: "geo-optimization",
        title: "Introduction to GEO",
        section: "overview",
        topics: ["AI Search", "GEO"],
        status: "PUBLISHED",
        contentHash: "hash123",
      },
    },
    {
      id: "PE-002#methodology#0",
      values: vec3, // different vector
      metadata: {
        chunkId: "PE-002#methodology#0",
        entityId: "PE-002",
        entityType: "guide",
        slug: "retrieval-architecture",
        title: "Retrieval Architecture Guide",
        section: "methodology",
        topics: ["RAG", "Architecture"],
        status: "PUBLISHED",
        contentHash: "hash456",
      },
    },
    {
      id: "PE-003#draft#0",
      values: vec1, // identical vector, but draft!
      metadata: {
        chunkId: "PE-003#draft#0",
        entityId: "PE-003",
        entityType: "article",
        slug: "unpublished-draft",
        title: "Draft Article",
        section: "draft",
        topics: ["AI Search"],
        status: "DRAFT",
        contentHash: "hash789",
      },
    },
  ];

  await store.upsert(sampleRecords);

  // 3. Search & Similarity Ranking
  console.log("\n--- 3. Vector Similarity & Filtering ---");
  // Querying with vec1 should rank PE-001 first with score ~1.0
  const resultsAll = await store.search({
    vector: vec1,
    topK: 5,
  });
  assert(resultsAll.length === 3, "Retrieved 3 records without filter");
  assert(resultsAll[0].id === "PE-001#overview#0" || resultsAll[0].id === "PE-003#draft#0", "Top match has highest similarity");
  assert(Math.abs(resultsAll[0].score - 1.0) < 1e-4, `Top match score is ~1.0 (${resultsAll[0].score})`);

  // 4. Publication Status Gate Enforcement
  const publishedOnly = await store.search({
    vector: vec1,
    filter: { status: "PUBLISHED" },
  });
  assert(
    publishedOnly.every((r) => r.metadata.status === "PUBLISHED"),
    "Filter correctly excludes draft content (Publication Gate)"
  );
  assert(
    !publishedOnly.some((r) => r.id === "PE-003#draft#0"),
    "Draft record PE-003 is filtered out"
  );

  // 5. Entity Type Filter
  const articlesOnly = await store.search({
    vector: vec1,
    filter: { status: "PUBLISHED", entityType: "article" },
  });
  assert(
    articlesOnly.every((r) => r.metadata.entityType === "article"),
    "EntityType filter correctly returns articles only"
  );

  // 6. Topics Filter
  const ragOnly = await store.search({
    vector: vec1,
    filter: { topics: ["RAG"] },
  });
  assert(
    ragOnly.length === 1 && ragOnly[0].metadata.entityId === "PE-002",
    "Topics filter correctly matches topic tags"
  );

  // 7. Delete Test
  await store.delete(["PE-001#overview#0"]);
  const afterDelete = await store.search({ vector: vec1 });
  assert(
    !afterDelete.some((r) => r.id === "PE-001#overview#0"),
    "Vector deleted successfully"
  );

  // 8. Configuration & Factory Behavior
  console.log("\n--- 4. Configuration & Factory Behavior ---");
  // Default environment (none configured)
  delete process.env.EMBEDDING_PROVIDER;
  delete process.env.VECTOR_STORE;
  delete process.env.EMBEDDING_API_KEY;
  delete process.env.VECTOR_STORE_URL;
  resetEmbeddingProvider();
  resetVectorStore();

  const defaultConfig = getSemanticConfig();
  assert(defaultConfig.embeddingProvider === "none", "Default embeddingProvider is 'none'");
  assert(defaultConfig.vectorStore === "none", "Default vectorStore is 'none'");
  assert(!defaultConfig.isEnabled, "Semantic system is disabled by default");
  assert(!defaultConfig.isMockMode, "Semantic system is not mock mode by default");

  const defaultStatus = getSemanticStatus();
  assert(defaultStatus.mode === "disabled", "Semantic status reports mode='disabled'");
  assert(!defaultStatus.isFullyOperational, "Reports isFullyOperational=false when unconfigured");

  const unconfiguredProvider = getEmbeddingProvider();
  assert(unconfiguredProvider === null, "Factory returns null for unconfigured provider (safe offline)");

  const unconfiguredStore = getVectorStore();
  assert(unconfiguredStore === null, "Factory returns null for unconfigured vector store (safe offline)");

  // Mock environment configuration
  process.env.EMBEDDING_PROVIDER = "mock";
  process.env.VECTOR_STORE = "mock";
  resetEmbeddingProvider();
  resetVectorStore();

  const mockConfig = getSemanticConfig();
  assert(mockConfig.isMockMode, "Mock mode detected when configured with 'mock'");
  const mockStatus = getSemanticStatus();
  assert(mockStatus.mode === "mock", "Semantic status reports mode='mock'");
  assert(mockStatus.isFullyOperational, "Mock mode reports isFullyOperational=true");

  const factoryProvider = getEmbeddingProvider();
  assert(factoryProvider !== null && factoryProvider.name === "mock", "Factory creates MockEmbeddingProvider");

  const factoryStore = getVectorStore();
  assert(factoryStore !== null && factoryStore.name === "in-memory", "Factory creates InMemoryVectorStore");

  // Clean up
  delete process.env.EMBEDDING_PROVIDER;
  delete process.env.VECTOR_STORE;
  resetEmbeddingProvider();
  resetVectorStore();

  // 9. Secret Protection Check
  console.log("\n--- 5. Secret Protection Check ---");
  process.env.EMBEDDING_API_KEY = "super-secret-key-12345";
  const safeConfig = getSemanticConfig();
  assert(
    !("apiKey" in safeConfig) && !("EMBEDDING_API_KEY" in safeConfig),
    "getSemanticConfig does not leak raw secrets"
  );
  assert(safeConfig.hasApiKey === true, "getSemanticConfig reports boolean flag hasApiKey");

  const creds = getServerOnlyCredentials();
  assert(creds.apiKey === "super-secret-key-12345", "getServerOnlyCredentials retrieves secret safely");
  delete process.env.EMBEDDING_API_KEY;

  console.log("\n=========================================");
  console.log("🎉 ALL PHASE 8G.2 TESTS PASSED SUCCESSFULLY");
  console.log("=========================================\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
