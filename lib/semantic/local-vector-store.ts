import * as fs from "fs";
import * as path from "path";
import {
  VectorStore,
  VectorRecord,
  VectorSearchQuery,
  VectorSearchResult,
  LocalVectorIndexFile,
} from "./types";
import {
  LOCAL_EMBEDDING_MODEL,
  LOCAL_EMBEDDING_DIMENSIONS,
  LOCAL_VECTOR_INDEX_PATH,
} from "./config";

/**
 * Persistent local file-based vector store.
 * Stores derived vectors in a deterministic JSON file (e.g. data/derived/semantic-index.json).
 * Implements the VectorStore interface with in-memory caching and disk synchronization.
 */
export class LocalVectorStore implements VectorStore {
  public readonly name = "local-file";
  public readonly filePath: string;
  public readonly modelName: string;
  public readonly dimensions: number;

  private recordsMap: Map<string, VectorRecord> = new Map();
  private isLoaded = false;
  private fileMetadata: Omit<LocalVectorIndexFile, "records"> | null = null;

  constructor(
    filePath: string = LOCAL_VECTOR_INDEX_PATH,
    modelName: string = LOCAL_EMBEDDING_MODEL,
    dimensions: number = LOCAL_EMBEDDING_DIMENSIONS
  ) {
    this.filePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    this.modelName = modelName;
    this.dimensions = dimensions;
  }

  /**
   * Loads records from the JSON file if it exists.
   */
  public async load(): Promise<void> {
    if (this.isLoaded) return;

    if (!fs.existsSync(this.filePath)) {
      this.isLoaded = true;
      return;
    }

    try {
      const raw = fs.readFileSync(this.filePath, "utf-8");
      if (!raw || raw.trim().length === 0) {
        this.isLoaded = true;
        return;
      }

      const data = JSON.parse(raw) as LocalVectorIndexFile;
      if (!data || !Array.isArray(data.records)) {
        throw new Error("Invalid semantic index file format: missing 'records' array");
      }

      this.fileMetadata = {
        version: data.version ?? 1,
        embeddingModel: data.embeddingModel ?? this.modelName,
        dimensions: data.dimensions ?? this.dimensions,
        generatedAt: data.generatedAt ?? new Date().toISOString(),
      };

      this.recordsMap.clear();
      for (const rec of data.records) {
        if (rec && rec.id && Array.isArray(rec.values)) {
          this.recordsMap.set(rec.id, rec);
        }
      }

      this.isLoaded = true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to load local vector index at '${this.filePath}': ${msg}`);
    }
  }

  /**
   * Persists the in-memory records map to disk as structured JSON.
   */
  private async persist(): Promise<void> {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const payload: LocalVectorIndexFile = {
      version: 1,
      embeddingModel: this.modelName,
      dimensions: this.dimensions,
      generatedAt: new Date().toISOString(),
      records: Array.from(this.recordsMap.values()),
    };

    fs.writeFileSync(this.filePath, JSON.stringify(payload, null, 2), "utf-8");
    this.fileMetadata = {
      version: payload.version,
      embeddingModel: payload.embeddingModel,
      dimensions: payload.dimensions,
      generatedAt: payload.generatedAt,
    };
  }

  /**
   * Returns current index file metadata (if file exists).
   */
  public async getIndexMetadata(): Promise<Omit<LocalVectorIndexFile, "records"> | null> {
    await this.load();
    return this.fileMetadata;
  }

  /**
   * Checks whether the underlying physical index file exists on disk.
   */
  public hasIndexFile(): boolean {
    return fs.existsSync(this.filePath);
  }

  /**
   * Validates whether the persisted file matches current model and dimension settings.
   */
  public async isModelCompatible(): Promise<boolean> {
    await this.load();
    if (!this.fileMetadata) return true; // Empty / not yet created is compatible
    return (
      this.fileMetadata.embeddingModel === this.modelName &&
      this.fileMetadata.dimensions === this.dimensions
    );
  }

  public async upsert(records: VectorRecord[]): Promise<void> {
    await this.load();

    for (const record of records) {
      if (!record.id) {
        throw new Error("Cannot upsert VectorRecord with missing id");
      }
      if (!Array.isArray(record.values) || record.values.length !== this.dimensions) {
        throw new Error(
          `Cannot upsert VectorRecord '${record.id}': vector length ${record.values?.length} does not match expected dimensions ${this.dimensions}`
        );
      }
      this.recordsMap.set(record.id, record);
    }

    await this.persist();
  }

  public async delete(ids: string[]): Promise<void> {
    await this.load();

    let changed = false;
    for (const id of ids) {
      if (this.recordsMap.has(id)) {
        this.recordsMap.delete(id);
        changed = true;
      }
    }

    if (changed) {
      await this.persist();
    }
  }

  public async search(query: VectorSearchQuery): Promise<VectorSearchResult[]> {
    await this.load();

    const results: VectorSearchResult[] = [];
    const topK = query.topK ?? 5;
    const minScore = query.minScore ?? 0.0;

    for (const record of this.recordsMap.values()) {
      // 1. Mandatory Publication / Status Filtering
      if (query.filter?.status && record.metadata.status !== query.filter.status) {
        continue;
      }

      // 2. EntityType Filtering
      if (query.filter?.entityType && record.metadata.entityType !== query.filter.entityType) {
        continue;
      }

      // 3. Topic Filtering
      if (query.filter?.topics && query.filter.topics.length > 0) {
        const recordTopics = record.metadata.topics || [];
        const matchesTopic = query.filter.topics.some((t) => recordTopics.includes(t));
        if (!matchesTopic) continue;
      }

      // 4. Cosine Similarity Calculation
      const score = this.calculateCosineSimilarity(query.vector, record.values);
      if (score >= minScore) {
        results.push({
          id: record.id,
          score,
          metadata: record.metadata,
        });
      }
    }

    // Sort descending by similarity score with deterministic tie-breaking
    results.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const entityCmp = (a.metadata.entityId || "").localeCompare(b.metadata.entityId || "");
      if (entityCmp !== 0) return entityCmp;
      return a.id.localeCompare(b.id);
    });
    return results.slice(0, topK);
  }

  public async isAvailable(): Promise<boolean> {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return true;
    } catch {
      return false;
    }
  }

  public async getRecord(id: string): Promise<VectorRecord | null> {
    await this.load();
    return this.recordsMap.get(id) || null;
  }

  public async getRecords(ids: string[]): Promise<(VectorRecord | null)[]> {
    await this.load();
    return ids.map((id) => this.recordsMap.get(id) || null);
  }

  public async listRecords(): Promise<VectorRecord[]> {
    await this.load();
    return Array.from(this.recordsMap.values());
  }

  /**
   * Calculates cosine similarity between two numeric vectors.
   */
  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0 || !Number.isFinite(denominator)) return 0;
    return dotProduct / denominator;
  }
}
