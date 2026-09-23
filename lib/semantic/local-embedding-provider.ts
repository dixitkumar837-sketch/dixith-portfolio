import { EmbeddingProvider } from "./types";
import {
  LOCAL_EMBEDDING_MODEL,
  LOCAL_EMBEDDING_DIMENSIONS,
  LOCAL_EMBEDDING_NORMALIZE,
} from "./config";

/**
 * Local embedding provider powered by Hugging Face Transformers.js.
 * Executes 100% locally using ONNX runtime without external API requests.
 * Model weights are loaded lazily on demand, ensuring Next.js builds remain offline.
 */
export class LocalEmbeddingProvider implements EmbeddingProvider {
  public readonly name: string;
  public readonly modelName: string;
  public readonly dimensions: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pipelineInstance: any = null;
  private isInitializing: Promise<void> | null = null;

  constructor(
    modelName: string = LOCAL_EMBEDDING_MODEL,
    dimensions: number = LOCAL_EMBEDDING_DIMENSIONS
  ) {
    this.modelName = modelName;
    this.dimensions = dimensions;
    this.name = `local:${modelName}`;
  }

  /**
   * Lazily initializes the feature extraction pipeline.
   */
  private async ensureInitialized(): Promise<void> {
    if (this.pipelineInstance) {
      return;
    }
    if (this.isInitializing) {
      return this.isInitializing;
    }

    this.isInitializing = (async () => {
      try {
        // Dynamically import to ensure builds without model usage remain completely detached
        const { pipeline } = await import("@huggingface/transformers");
        this.pipelineInstance = await pipeline("feature-extraction", this.modelName, {
          dtype: "fp32",
        });
      } catch (err) {
        this.pipelineInstance = null;
        this.isInitializing = null;
        const msg = err instanceof Error ? err.message : String(err);
        throw new Error(`Failed to initialize local embedding model '${this.modelName}': ${msg}`);
      }
    })();

    return this.isInitializing;
  }

  /**
   * Generates a normalized embedding vector for a single text string.
   */
  public async embedText(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      throw new Error("Cannot generate embedding for empty or whitespace-only text");
    }

    await this.ensureInitialized();

    const output = await this.pipelineInstance([text.trim()], {
      pooling: "mean",
      normalize: LOCAL_EMBEDDING_NORMALIZE,
    });

    const list = output.tolist();
    const vector: number[] = list[0];

    this.validateAndNormalizeVector(vector);
    return vector;
  }

  /**
   * Generates normalized embedding vectors for a batch of text strings.
   */
  public async embedBatch(texts: string[]): Promise<number[][]> {
    if (!texts || texts.length === 0) {
      return [];
    }

    for (let i = 0; i < texts.length; i++) {
      if (!texts[i] || texts[i].trim().length === 0) {
        throw new Error(`Cannot generate embedding: batch item at index ${i} is empty`);
      }
    }

    await this.ensureInitialized();

    const cleanTexts = texts.map((t) => t.trim());
    const output = await this.pipelineInstance(cleanTexts, {
      pooling: "mean",
      normalize: LOCAL_EMBEDDING_NORMALIZE,
    });

    const list: number[][] = output.tolist();

    for (let i = 0; i < list.length; i++) {
      this.validateAndNormalizeVector(list[i]);
    }

    return list;
  }

  /**
   * Validates vector length, checks for non-finite values, and enforces L2 normalization.
   */
  private validateAndNormalizeVector(vector: number[]): void {
    if (!Array.isArray(vector) || vector.length === 0) {
      throw new Error("Invalid embedding vector generated: empty array");
    }

    if (vector.length !== this.dimensions) {
      throw new Error(
        `Embedding dimension mismatch: model returned ${vector.length} dimensions, expected ${this.dimensions}`
      );
    }

    let sumSquares = 0;
    for (let i = 0; i < vector.length; i++) {
      const val = vector[i];
      if (typeof val !== "number" || Number.isNaN(val) || !Number.isFinite(val)) {
        throw new Error(`Invalid embedding vector element at index ${i}: ${val}`);
      }
      sumSquares += val * val;
    }

    const norm = Math.sqrt(sumSquares);
    if (norm === 0 || Number.isNaN(norm) || !Number.isFinite(norm)) {
      throw new Error("Invalid embedding vector: computed L2 norm is zero, NaN, or non-finite");
    }

    // Ensure strict unit-length normalization (within tolerance)
    if (Math.abs(norm - 1.0) > 1e-4) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] = vector[i] / norm;
      }
    }
  }
}
