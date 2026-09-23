import { isIndexable } from "@/data/types";
import { getAllResearch } from "@/data/research";
import { getAllExperiments } from "@/data/experiments";
import { getAllArticles } from "@/data/articles";
import { getAllGuides } from "@/data/guides";
import { getAllProfessionalExperiences } from "@/data/professional-experience";
import {
  IndexingOptions,
  IndexingReport,
  ContentChunk,
  VectorRecord,
} from "./types";
import { chunkContent, CanonicalEntity } from "./chunking";
import { getEmbeddingProvider } from "./provider-factory";
import { getVectorStore } from "./vector-store-factory";

/**
 * Executes the derived semantic indexing pipeline for canonical DIXITH content.
 * Strictly enforces publication gating (only isIndexable() content is processed).
 * Operates incrementally: unchanged content is never re-embedded.
 */
export async function indexPublishedContent(
  options: IndexingOptions = {}
): Promise<IndexingReport> {
  const startTime = Date.now();
  const isDryRun = Boolean(options.dryRun);
  const forceReindex = Boolean(options.forceReindex);
  const details: string[] = [];

  const report: IndexingReport = {
    scanned: 0,
    eligible: 0,
    chunksGenerated: 0,
    unchanged: 0,
    added: 0,
    updated: 0,
    deleted: 0,
    skipped: 0,
    errors: 0,
    details,
    durationMs: 0,
    isDryRun,
  };

  // 1. Scan all canonical content sources
  const allEntities: { entity: CanonicalEntity; type: CanonicalEntity["status"] extends string ? string : never }[] = [];

  const research = getAllResearch();
  const experiments = getAllExperiments();
  const articles = getAllArticles();
  const guides = getAllGuides();
  const experiences = getAllProfessionalExperiences();

  research.forEach((e) => allEntities.push({ entity: e, type: "research" }));
  experiments.forEach((e) => allEntities.push({ entity: e, type: "experiment" }));
  articles.forEach((e) => allEntities.push({ entity: e, type: "article" }));
  guides.forEach((e) => allEntities.push({ entity: e, type: "guide" }));
  experiences.forEach((e) => allEntities.push({ entity: e, type: "professional-experience" }));

  report.scanned = allEntities.length;

  // 2. Publication Gate: evaluate isIndexable()
  const eligibleEntities: CanonicalEntity[] = [];
  for (const { entity } of allEntities) {
    if (isIndexable(entity.status)) {
      eligibleEntities.push(entity);
      report.eligible++;
    } else {
      report.skipped++;
    }
  }

  // 3. Generate Chunks for Eligible Entities
  const desiredChunks: ContentChunk[] = [];
  for (const entity of eligibleEntities) {
    const chunks = chunkContent(entity);
    desiredChunks.push(...chunks);
  }
  report.chunksGenerated = desiredChunks.length;

  // 4. Resolve Infrastructure
  const store = options.store || getVectorStore();
  const provider = options.provider || getEmbeddingProvider();

  // If Store is unavailable
  if (!store) {
    if (isDryRun) {
      report.added = desiredChunks.length;
      details.push(
        `[DRY RUN] Vector store is not configured or offline. Scanned ${report.scanned} entities, ${report.eligible} eligible, generated ${desiredChunks.length} chunks.`
      );
      report.durationMs = Date.now() - startTime;
      return report;
    }
    report.errors++;
    details.push(
      "Vector store is not configured or unavailable. Indexing halted safely without modifications."
    );
    report.durationMs = Date.now() - startTime;
    return report;
  }

  const isStoreAvailable = await store.isAvailable();
  if (!isStoreAvailable) {
    if (isDryRun) {
      report.added = desiredChunks.length;
      details.push(
        `[DRY RUN] Vector store '${store.name}' reported unavailable. Generated ${desiredChunks.length} potential chunks.`
      );
      report.durationMs = Date.now() - startTime;
      return report;
    }
    report.errors++;
    details.push(`Vector store '${store.name}' is unavailable. Indexing aborted.`);
    report.durationMs = Date.now() - startTime;
    return report;
  }

  // 5. Inspect existing records for incremental change detection
  let existingRecords: VectorRecord[] = [];
  if (typeof store.listRecords === "function") {
    existingRecords = await store.listRecords();
  } else if (typeof store.getRecords === "function") {
    const records = await store.getRecords(desiredChunks.map((c) => c.chunkId));
    existingRecords = records.filter((r): r is VectorRecord => r !== null);
  }

  const existingMap = new Map<string, VectorRecord>();
  for (const record of existingRecords) {
    existingMap.set(record.id, record);
  }

  // Model & Dimension Compatibility Check
  const storedModel = existingRecords[0]?.metadata?.embeddingModel;
  const storedDims = existingRecords[0]?.metadata?.embeddingDimensions;
  const isModelMismatch =
    Boolean(storedModel && provider && storedModel !== provider.name) ||
    Boolean(storedDims && provider && storedDims !== provider.dimensions);

  if (isModelMismatch) {
    details.push(
      `[MODEL MISMATCH DETECTED] Stored vectors were generated with '${storedModel}' (${storedDims}d), but current provider is '${provider?.name}' (${provider?.dimensions}d). Triggering automatic full re-index.`
    );
    existingMap.clear();
  }

  const chunksToEmbed: ContentChunk[] = [];
  const desiredChunkIds = new Set<string>();

  for (const chunk of desiredChunks) {
    desiredChunkIds.add(chunk.chunkId);
    const existing = existingMap.get(chunk.chunkId);

    if (!existing) {
      // New chunk
      report.added++;
      chunksToEmbed.push(chunk);
    } else if (forceReindex || existing.metadata.contentHash !== chunk.contentHash) {
      // Changed content
      report.updated++;
      chunksToEmbed.push(chunk);
    } else {
      // Identical content hash — skip re-embedding
      report.unchanged++;
    }
  }

  // Detect removed / unpublished chunks to delete from store
  const idsToDelete: string[] = [];
  for (const [id] of existingMap.entries()) {
    if (!desiredChunkIds.has(id)) {
      idsToDelete.push(id);
      report.deleted++;
    }
  }

  // 6. Handle Dry-Run Mode
  if (isDryRun) {
    details.push(
      `[DRY RUN] Plan: ${report.added} to add, ${report.updated} to update, ${report.unchanged} unchanged, ${report.deleted} to delete.`
    );
    report.durationMs = Date.now() - startTime;
    return report;
  }

  // 7. Live Execution: Check Provider
  if (chunksToEmbed.length > 0 && !provider) {
    report.errors++;
    details.push(
      "Embedding provider is not configured or unavailable. Cannot generate vectors. Halting safely."
    );
    report.durationMs = Date.now() - startTime;
    return report;
  }

  // 8. Generate Embeddings & Upsert Records
  if (chunksToEmbed.length > 0 && provider) {
    try {
      const batchSize = 16;
      for (let i = 0; i < chunksToEmbed.length; i += batchSize) {
        const batch = chunksToEmbed.slice(i, i + batchSize);
        const texts = batch.map((c) => `${c.heading ? c.heading + "\n" : ""}${c.content}`);
        const vectors = await provider.embedBatch(texts);

        const newRecords: VectorRecord[] = batch.map((chunk, idx) => ({
          id: chunk.chunkId,
          values: vectors[idx],
          metadata: {
            chunkId: chunk.chunkId,
            entityId: chunk.entityId,
            entityType: chunk.entityType,
            slug: chunk.slug,
            title: chunk.title,
            section: chunk.section,
            heading: chunk.heading,
            topics: chunk.topics,
            sourceIds: chunk.sourceIds,
            status: chunk.status,
            contentHash: chunk.contentHash,
            content: chunk.content,
            embeddingModel: provider.name,
            embeddingDimensions: provider.dimensions,
          },
        }));

        await store.upsert(newRecords);
      }
      details.push(`Successfully upserted ${chunksToEmbed.length} vector records into '${store.name}'.`);
    } catch (err) {
      report.errors++;
      const message = err instanceof Error ? err.message : String(err);
      details.push(`Embedding generation failed: ${message}`);
      report.durationMs = Date.now() - startTime;
      return report;
    }
  }

  // 9. Execute Deletions for Removed or Unpublished Chunks
  if (idsToDelete.length > 0) {
    try {
      await store.delete(idsToDelete);
      details.push(`Successfully removed ${idsToDelete.length} obsolete vector records from '${store.name}'.`);
    } catch (err) {
      report.errors++;
      const message = err instanceof Error ? err.message : String(err);
      details.push(`Deletion failed: ${message}`);
    }
  }

  report.durationMs = Date.now() - startTime;
  return report;
}
