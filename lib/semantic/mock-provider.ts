import { EmbeddingProvider } from "./types";

/**
 * Deterministic mock embedding provider for tests and safe local development.
 * Produces unit-normalized pseudo-vectors based on string hash.
 * Never connects to external networks or costs credits.
 */
export class MockEmbeddingProvider implements EmbeddingProvider {
  public readonly name = "mock";
  public readonly dimensions: number;

  constructor(dimensions = 768) {
    this.dimensions = dimensions;
  }

  /**
   * Generates a deterministic unit-length vector for a given string.
   */
  public async embedText(text: string): Promise<number[]> {
    return this.generateDeterministicVector(text);
  }

  /**
   * Generates deterministic unit-length vectors for a batch of strings.
   */
  public async embedBatch(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.generateDeterministicVector(t));
  }

  private generateDeterministicVector(text: string): number[] {
    const vector = new Array<number>(this.dimensions).fill(0);
    const clean = text.trim().toLowerCase();

    // Generate deterministic seed values from character codes
    let hash = 5381;
    for (let i = 0; i < clean.length; i++) {
      hash = ((hash << 5) + hash + clean.charCodeAt(i)) & 0xffffffff;
    }

    let sumSquares = 0;
    for (let i = 0; i < this.dimensions; i++) {
      // Deterministic linear congruential sequence
      hash = (1664525 * hash + 1013904223) & 0xffffffff;
      const val = (hash / 0x7fffffff) - 1.0;
      vector[i] = val;
      sumSquares += val * val;
    }

    // Normalize to unit length (L2 norm)
    const norm = Math.sqrt(sumSquares) || 1;
    return vector.map((v) => v / norm);
  }
}
