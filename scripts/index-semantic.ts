#!/usr/bin/env node
/**
 * DIXITH Semantic Indexing CLI
 * Phase 8G.5: Local Semantic Index
 *
 * Runs the incremental semantic indexing pipeline over canonical published content.
 * Defaults to the real local embedding provider (Xenova/all-MiniLM-L6-v2) and local vector store.
 * Supports --dry-run mode for previewing index changes without mutating vector storage.
 * Supports --force mode to rebuild all embeddings regardless of unchanged content.
 */

import {
  indexPublishedContent,
  getEmbeddingProvider,
  getVectorStore,
  LocalEmbeddingProvider,
  LocalVectorStore,
  LOCAL_EMBEDDING_MODEL,
  LOCAL_EMBEDDING_DIMENSIONS,
  LOCAL_VECTOR_INDEX_PATH,
} from "../lib/semantic";

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes("--dry-run") || args.includes("-d");
  const forceReindex = args.includes("--force") || args.includes("-f");
  const isVerbose = args.includes("--verbose") || args.includes("-v");

  console.log("==================================================");
  console.log(" DIXITH Semantic Search — Local Indexing Pipeline");
  console.log("==================================================");

  // In the CLI context, default to LocalEmbeddingProvider and LocalVectorStore
  const provider = getEmbeddingProvider() || new LocalEmbeddingProvider();
  const store = getVectorStore() || new LocalVectorStore();

  console.log(`Model       : ${provider.name} (${provider.dimensions} dimensions)`);
  console.log(`Store       : ${store.name} (${LOCAL_VECTOR_INDEX_PATH})`);

  if (isDryRun) {
    console.log("Mode        : DRY RUN (Preview diff only — zero embeddings, zero mutations)\n");
  } else if (forceReindex) {
    console.log("Mode        : FORCE RE-INDEX (Re-embedding all published content)\n");
  } else {
    console.log("Mode        : INCREMENTAL SYNCHRONIZATION\n");
  }

  const report = await indexPublishedContent({
    dryRun: isDryRun,
    forceReindex,
    provider,
    store,
  });

  console.log("Indexing Results:");
  console.log(`- Canonical Entities Scanned : ${report.scanned}`);
  console.log(`- Indexable Entities (PUBLISHED) : ${report.eligible}`);
  console.log(`- Excluded Entities (Non-Published) : ${report.skipped}`);
  console.log(`- Semantic Chunks Generated : ${report.chunksGenerated}`);
  console.log("--- Incremental Synchronization ---");
  console.log(`- New Chunks (Added)        : ${report.added}`);
  console.log(`- Changed Chunks (Updated)  : ${report.updated}`);
  console.log(`- Unchanged Chunks (Skipped): ${report.unchanged}`);
  console.log(`- Obsolete Chunks (Deleted) : ${report.deleted}`);
  console.log(`- Pipeline Errors           : ${report.errors}`);
  console.log(`- Execution Time            : ${report.durationMs}ms`);

  if (report.details.length > 0) {
    console.log("\nDetails:");
    for (const line of report.details) {
      console.log(`  * ${line}`);
    }
  }

  if (isDryRun) {
    console.log("\n[DRY RUN COMPLETE] Zero embeddings were generated and zero vector stores were modified.");
  } else if (report.errors === 0) {
    console.log(`\n[INDEXING COMPLETE] Local vector index successfully written to '${LOCAL_VECTOR_INDEX_PATH}'.`);
  } else {
    console.warn("\n[INDEXING HALTED WITH ISSUES] Review error details above.");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Fatal error during indexing:", err);
  process.exit(1);
});
