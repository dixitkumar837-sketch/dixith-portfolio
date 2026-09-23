import {
  VectorStore,
  VectorRecord,
  VectorSearchQuery,
  VectorSearchResult,
} from "./types";

/**
 * In-memory vector store implementing the VectorStore interface.
 * Useful for local testing, verification, and offline test environments.
 */
export class InMemoryVectorStore implements VectorStore {
  public readonly name = "in-memory";
  private store: Map<string, VectorRecord> = new Map();

  public async upsert(records: VectorRecord[]): Promise<void> {
    for (const record of records) {
      this.store.set(record.id, record);
    }
  }

  public async delete(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.store.delete(id);
    }
  }

  public async search(query: VectorSearchQuery): Promise<VectorSearchResult[]> {
    const results: VectorSearchResult[] = [];
    const topK = query.topK ?? 5;
    const minScore = query.minScore ?? 0.0;

    for (const record of this.store.values()) {
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

    // Sort descending by similarity score
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async getRecords(ids: string[]): Promise<(VectorRecord | null)[]> {
    return ids.map((id) => this.store.get(id) || null);
  }

  public async listRecords(): Promise<VectorRecord[]> {
    return Array.from(this.store.values());
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
    if (denominator === 0) return 0;
    return dotProduct / denominator;
  }
}
