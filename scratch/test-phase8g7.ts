/**
 * DIXITH Semantic Retrieval Evaluation & Benchmarking Harness
 * Phase 8G.7: Semantic Retrieval Evaluation & Benchmarking
 *
 * Implements a formal engineering evaluation harness for the local semantic retrieval pipeline:
 * 1. Executes the 24-query evaluation dataset across 4 categories:
 *    - Category A: Exact / Near-Exact Intent
 *    - Category B: Conceptual Paraphrase
 *    - Category C: Vocabulary / Acronym Variation
 *    - Category D: Negative Distractors
 * 2. Computes Top-1, Top-3, and Top-5 Hit Rates (entity-level & chunk-level).
 * 3. Evaluates Negative Query False Positive Rates.
 * 4. Conducts Threshold Calibration Experiments (0.40, 0.45, 0.50, 0.55, 0.60).
 * 5. Verifies Result Monotonicity across thresholds.
 * 6. Validates Score Bounds (-1.0 to 1.0, no NaN/Infinity).
 * 7. Measures Chunk Granularity and Entity Duplication in Top-5.
 * 8. Verifies Query Determinism and Publication Safety.
 * 9. Emits machine-readable data to `data/derived/semantic-evaluation.json`.
 */

import * as fs from "fs";
import * as path from "path";
import {
  semanticSearch,
  LocalEmbeddingProvider,
  LocalVectorStore,
  InMemoryVectorStore,
  MockEmbeddingProvider,
  EVALUATION_DATASET,
  SemanticEvaluationQuery,
  EvaluationCategory,
  SEMANTIC_SEARCH_DEFAULT_THRESHOLD,
  VectorRecord,
} from "../lib/semantic";
import { ContentStatus } from "../data/types";

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition: boolean, testName: string, extra?: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passedAssertions++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${extra || ""}`);
    failedAssertions++;
  }
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

interface QueryEvaluationRecord {
  id: string;
  query: string;
  category: EvaluationCategory;
  expectedRelevant: boolean;
  expectedEntityIds: string[];
  expectedChunkIds?: string[];
  totalResults: number;
  top1EntityHit: boolean;
  top3EntityHit: boolean;
  top5EntityHit: boolean;
  top1ChunkHit: boolean;
  topResultEntityId?: string;
  topResultChunkId?: string;
  topResultSection?: string;
  topResultScore?: number;
  scores: number[];
  uniqueEntitiesCount: number;
  durationMs: number;
}

interface ThresholdExperimentResult {
  threshold: number;
  positiveTop1HitRate: number;
  positiveTop3HitRate: number;
  positiveTop5HitRate: number;
  positiveZeroResultCount: number;
  negativeFalsePositiveCount: number;
  negativeFalsePositiveRate: number;
  negativeZeroResultCount: number;
}

async function runEvaluation() {
  console.log("================================================================================");
  console.log(" DIXITH Phase 8G.7 — Semantic Retrieval Evaluation & Benchmarking");
  console.log("================================================================================\n");

  const provider = new LocalEmbeddingProvider();
  const store = new LocalVectorStore();
  await store.load();

  const positiveQueries = EVALUATION_DATASET.filter((q) => q.expectedRelevant);
  const negativeQueries = EVALUATION_DATASET.filter((q) => !q.expectedRelevant);

  console.log(`Evaluation Dataset Summary:`);
  console.log(`- Total Queries         : ${EVALUATION_DATASET.length}`);
  console.log(`- Positive Queries      : ${positiveQueries.length}`);
  console.log(`- Negative Queries      : ${negativeQueries.length}`);
  console.log(`- Currently Published   : 3 Entities (PE-001, PE-002, PE-003) | 18 Chunks\n`);

  // ============================================================================
  // STEP 1: Baseline Evaluation Run (Default Threshold 0.50, Limit 5)
  // ============================================================================
  console.log("Executing Baseline Evaluation (threshold = 0.50, limit = 5)...");

  const evaluationRecords: QueryEvaluationRecord[] = [];
  const relevantScores: number[] = [];
  const irrelevantScores: number[] = [];
  const negativeScores: number[] = [];

  for (const q of EVALUATION_DATASET) {
    const res = await semanticSearch(q.query, {
      provider,
      store,
      threshold: SEMANTIC_SEARCH_DEFAULT_THRESHOLD,
      limit: 5,
    });

    const topResult = res.results[0];
    const scores = res.results.map((r) => r.similarity);
    const returnedEntityIds = res.results.map((r) => r.entityId);
    const returnedChunkIds = res.results.map((r) => r.chunkId);
    const uniqueEntities = new Set(returnedEntityIds);

    const top1EntityHit = Boolean(
      topResult && q.expectedEntityIds?.includes(topResult.entityId)
    );
    const top3EntityHit = returnedEntityIds
      .slice(0, 3)
      .some((id) => q.expectedEntityIds?.includes(id));
    const top5EntityHit = returnedEntityIds
      .slice(0, 5)
      .some((id) => q.expectedEntityIds?.includes(id));

    const top1ChunkHit = Boolean(
      topResult && q.expectedChunkIds && q.expectedChunkIds.includes(topResult.chunkId)
    );

    if (q.expectedRelevant) {
      if (top1EntityHit && topResult) {
        relevantScores.push(topResult.similarity);
      }
      for (const r of res.results) {
        if (!q.expectedEntityIds?.includes(r.entityId)) {
          irrelevantScores.push(r.similarity);
        }
      }
    } else {
      for (const r of res.results) {
        negativeScores.push(r.similarity);
      }
    }

    evaluationRecords.push({
      id: q.id,
      query: q.query,
      category: q.category,
      expectedRelevant: q.expectedRelevant,
      expectedEntityIds: q.expectedEntityIds || [],
      expectedChunkIds: q.expectedChunkIds,
      totalResults: res.results.length,
      top1EntityHit,
      top3EntityHit,
      top5EntityHit,
      top1ChunkHit,
      topResultEntityId: topResult?.entityId,
      topResultChunkId: topResult?.chunkId,
      topResultSection: topResult?.section,
      topResultScore: topResult?.similarity,
      scores,
      uniqueEntitiesCount: uniqueEntities.size,
      durationMs: res.durationMs,
    });
  }

  // ============================================================================
  // STEP 2: Calculate Positive Query Metrics (Overall & by Category)
  // ============================================================================
  const positiveRecords = evaluationRecords.filter((r) => r.expectedRelevant);
  const negativeRecords = evaluationRecords.filter((r) => !r.expectedRelevant);

  const overallTop1 = positiveRecords.filter((r) => r.top1EntityHit).length / positiveRecords.length;
  const overallTop3 = positiveRecords.filter((r) => r.top3EntityHit).length / positiveRecords.length;
  const overallTop5 = positiveRecords.filter((r) => r.top5EntityHit).length / positiveRecords.length;

  const categories: EvaluationCategory[] = [
    "exact_intent",
    "conceptual_paraphrase",
    "vocabulary_variation",
  ];

  const categoryMetrics: Record<string, { top1: number; top3: number; top5: number; count: number }> = {};

  for (const cat of categories) {
    const catRecords = positiveRecords.filter((r) => r.category === cat);
    categoryMetrics[cat] = {
      count: catRecords.length,
      top1: catRecords.filter((r) => r.top1EntityHit).length / catRecords.length,
      top3: catRecords.filter((r) => r.top3EntityHit).length / catRecords.length,
      top5: catRecords.filter((r) => r.top5EntityHit).length / catRecords.length,
    };
  }

  // Negative Metrics
  const falsePositives = negativeRecords.filter((r) => r.totalResults > 0);
  const falsePositiveRate = falsePositives.length / negativeRecords.length;
  const zeroResultRate = (negativeRecords.length - falsePositives.length) / negativeRecords.length;

  // ============================================================================
  // STEP 3: Threshold Calibration Experiments (0.40, 0.45, 0.50, 0.55, 0.60)
  // ============================================================================
  console.log("Executing Threshold Calibration Experiments across [0.40, 0.45, 0.50, 0.55, 0.60]...\n");

  const testThresholds = [0.40, 0.45, 0.50, 0.55, 0.60];
  const thresholdResults: ThresholdExperimentResult[] = [];
  const queryThresholdMap = new Map<string, Map<number, string[]>>();

  for (const thresh of testThresholds) {
    let posTop1 = 0;
    let posTop3 = 0;
    let posTop5 = 0;
    let posZeroCount = 0;
    let negFpCount = 0;

    for (const q of EVALUATION_DATASET) {
      const res = await semanticSearch(q.query, {
        provider,
        store,
        threshold: thresh,
        limit: 10,
      });

      const chunkIds = res.results.map((r) => r.chunkId);
      if (!queryThresholdMap.has(q.id)) {
        queryThresholdMap.set(q.id, new Map());
      }
      queryThresholdMap.get(q.id)!.set(thresh, chunkIds);

      const returnedEntityIds = res.results.map((r) => r.entityId);
      const topEntity = returnedEntityIds[0];

      if (q.expectedRelevant) {
        if (res.results.length === 0) {
          posZeroCount++;
        }
        if (topEntity && q.expectedEntityIds?.includes(topEntity)) {
          posTop1++;
        }
        if (returnedEntityIds.slice(0, 3).some((id) => q.expectedEntityIds?.includes(id))) {
          posTop3++;
        }
        if (returnedEntityIds.slice(0, 5).some((id) => q.expectedEntityIds?.includes(id))) {
          posTop5++;
        }
      } else {
        if (res.results.length > 0) {
          negFpCount++;
        }
      }
    }

    thresholdResults.push({
      threshold: thresh,
      positiveTop1HitRate: posTop1 / positiveQueries.length,
      positiveTop3HitRate: posTop3 / positiveQueries.length,
      positiveTop5HitRate: posTop5 / positiveQueries.length,
      positiveZeroResultCount: posZeroCount,
      negativeFalsePositiveCount: negFpCount,
      negativeFalsePositiveRate: negFpCount / negativeQueries.length,
      negativeZeroResultCount: negativeQueries.length - negFpCount,
    });
  }

  // ============================================================================
  // STEP 4: Monotonicity Verification
  // ============================================================================
  console.log("[Verification 1: Monotonicity Verification]");
  let isMonotonic = true;
  for (const q of EVALUATION_DATASET) {
    const threshMap = queryThresholdMap.get(q.id)!;
    for (let i = 0; i < testThresholds.length - 1; i++) {
      const lower = testThresholds[i];
      const higher = testThresholds[i + 1];
      const lowerIds = threshMap.get(lower)!;
      const higherIds = threshMap.get(higher)!;

      // Every result at higher threshold must be in lower threshold
      for (const id of higherIds) {
        if (!lowerIds.includes(id)) {
          isMonotonic = false;
          console.error(`Monotonicity violation for ${q.id} at ${lower} vs ${higher}: chunk ${id}`);
        }
      }
    }
  }
  assert(isMonotonic, "Result sets decrease monotonically as threshold increases");

  // ============================================================================
  // STEP 5: Score Bound & Value Validity
  // ============================================================================
  console.log("\n[Verification 2: Score Validity]");
  let allScoresValid = true;
  for (const r of evaluationRecords) {
    for (const s of r.scores) {
      if (typeof s !== "number" || Number.isNaN(s) || !Number.isFinite(s) || s < -1.0 || s > 1.0) {
        allScoresValid = false;
        console.error(`Invalid score detected in query ${r.id}: ${s}`);
      }
    }
  }
  assert(allScoresValid, "All similarity scores fall strictly within [-1.0, 1.0] and are finite");

  // ============================================================================
  // STEP 6: Query Determinism Verification
  // ============================================================================
  console.log("\n[Verification 3: Query Determinism]");
  let isDeterministic = true;
  const sampleQueries = ["EXACT-001", "PARA-002", "VOCAB-003", "DISTRACT-001"];
  for (const qid of sampleQueries) {
    const qObj = EVALUATION_DATASET.find((q) => q.id === qid)!;
    const r1 = await semanticSearch(qObj.query, { provider, store, threshold: 0.4, limit: 5 });
    const r2 = await semanticSearch(qObj.query, { provider, store, threshold: 0.4, limit: 5 });
    const r3 = await semanticSearch(qObj.query, { provider, store, threshold: 0.4, limit: 5 });

    const sig1 = r1.results.map((r) => `${r.chunkId}:${r.similarity}`).join("|");
    const sig2 = r2.results.map((r) => `${r.chunkId}:${r.similarity}`).join("|");
    const sig3 = r3.results.map((r) => `${r.chunkId}:${r.similarity}`).join("|");

    if (sig1 !== sig2 || sig2 !== sig3) {
      isDeterministic = false;
    }
  }
  assert(isDeterministic, "Repeated queries produce identical ranking and similarity scores");

  // ============================================================================
  // STEP 7: Publication Safety Regression
  // ============================================================================
  console.log("\n[Verification 4: Publication Safety Regression]");
  {
    const leakStore = new InMemoryVectorStore();
    const mockProv = new MockEmbeddingProvider(384);
    const pubText = "Canonical published knowledge verification item.";
    const vec = await mockProv.embedText(pubText);

    await leakStore.upsert([
      {
        id: "PUB-TEST#overview#0",
        values: vec,
        metadata: {
          chunkId: "PUB-TEST#overview#0",
          entityId: "PUB-TEST",
          entityType: "professional-experience",
          slug: "pub-test",
          title: "Pub Test",
          section: "overview",
          status: "PUBLISHED" as ContentStatus,
          contentHash: "hash-pub",
          content: pubText,
        },
      },
      {
        id: "DRAFT-TEST#overview#0",
        values: vec,
        metadata: {
          chunkId: "DRAFT-TEST#overview#0",
          entityId: "DRAFT-TEST",
          entityType: "research",
          slug: "draft-test",
          title: "Draft Test",
          section: "overview",
          status: "DRAFT" as ContentStatus,
          contentHash: "hash-draft",
          content: pubText,
        },
      },
      {
        id: "IN_REVIEW-TEST#overview#0",
        values: vec,
        metadata: {
          chunkId: "IN_REVIEW-TEST#overview#0",
          entityId: "IN_REVIEW-TEST",
          entityType: "article",
          slug: "review-test",
          title: "Review Test",
          section: "overview",
          status: "IN_REVIEW" as ContentStatus,
          contentHash: "hash-review",
          content: pubText,
        },
      },
    ]);

    const res = await semanticSearch(pubText, {
      provider: mockProv,
      store: leakStore,
      threshold: 0.1,
      limit: 10,
    });

    const returnedIds = res.results.map((r) => r.entityId);
    assert(
      returnedIds.includes("PUB-TEST") &&
        !returnedIds.includes("DRAFT-TEST") &&
        !returnedIds.includes("IN_REVIEW-TEST"),
      "DRAFT and IN_REVIEW entities are 100% excluded from retrieval"
    );
  }

  // ============================================================================
  // STEP 8: Failure Handling Regressions (Missing Index & Mismatches)
  // ============================================================================
  console.log("\n[Verification 5: Failure Handling Regressions]");
  {
    const missingStore = new LocalVectorStore("data/derived/missing-test-index.json");
    const missingRes = await semanticSearch("technical SEO", { provider, store: missingStore });
    assert(
      missingRes.available === false && missingRes.reason === "semantic_index_unavailable",
      "Missing index gracefully reports 'semantic_index_unavailable'"
    );

    const tempMismatchPath = "scratch/temp-eval-mismatch.json";
    fs.writeFileSync(
      tempMismatchPath,
      JSON.stringify({
        version: 1,
        embeddingModel: "mismatched-model",
        dimensions: 512,
        generatedAt: new Date().toISOString(),
        records: [],
      })
    );
    const mismatchStore = new LocalVectorStore(tempMismatchPath);
    const mismatchRes = await semanticSearch("technical SEO", { provider, store: mismatchStore });
    assert(
      mismatchRes.available === false && mismatchRes.reason === "semantic_index_incompatible",
      "Model/dimension mismatch gracefully reports 'semantic_index_incompatible'"
    );
    if (fs.existsSync(tempMismatchPath)) fs.unlinkSync(tempMismatchPath);
  }

  // ============================================================================
  // STEP 9: Summary & Descriptive Statistics
  // ============================================================================
  console.log("\n================================================================================");
  console.log(" EVALUATION RESULTS SUMMARY (Threshold = 0.50, Limit = 5)");
  console.log("================================================================================");
  console.log(`Overall Positive Hit Rates (n=${positiveQueries.length}):`);
  console.log(`- Top-1 Hit Rate : ${(overallTop1 * 100).toFixed(1)}% (${positiveRecords.filter((r) => r.top1EntityHit).length}/${positiveQueries.length})`);
  console.log(`- Top-3 Hit Rate : ${(overallTop3 * 100).toFixed(1)}% (${positiveRecords.filter((r) => r.top3EntityHit).length}/${positiveQueries.length})`);
  console.log(`- Top-5 Hit Rate : ${(overallTop5 * 100).toFixed(1)}% (${positiveRecords.filter((r) => r.top5EntityHit).length}/${positiveQueries.length})`);

  console.log(`\nCategory Breakdown:`);
  for (const cat of categories) {
    const m = categoryMetrics[cat];
    console.log(`- ${cat} (n=${m.count}):`);
    console.log(`    Top-1: ${(m.top1 * 100).toFixed(1)}% | Top-3: ${(m.top3 * 100).toFixed(1)}% | Top-5: ${(m.top5 * 100).toFixed(1)}%`);
  }

  console.log(`\nNegative Distractor Metrics (n=${negativeQueries.length}):`);
  console.log(`- False Positive Rate : ${(falsePositiveRate * 100).toFixed(1)}% (${falsePositives.length}/${negativeQueries.length})`);
  console.log(`- Zero Result Rate    : ${(zeroResultRate * 100).toFixed(1)}% (${negativeQueries.length - falsePositives.length}/${negativeQueries.length})`);

  console.log(`\nSimilarity Distributions:`);
  console.log(`- Relevant Top-1 Matches (n=${relevantScores.length}):`);
  console.log(`    Min: ${Math.min(...relevantScores).toFixed(4)} | Max: ${Math.max(...relevantScores).toFixed(4)} | Mean: ${calculateMean(relevantScores).toFixed(4)} | Median: ${calculateMedian(relevantScores).toFixed(4)}`);
  if (negativeScores.length > 0) {
    console.log(`- False Positive Scores (n=${negativeScores.length}):`);
    console.log(`    Min: ${Math.min(...negativeScores).toFixed(4)} | Max: ${Math.max(...negativeScores).toFixed(4)} | Mean: ${calculateMean(negativeScores).toFixed(4)}`);
  } else {
    console.log(`- Negative Distractor Scores: Zero matches surfaced above 0.50 threshold.`);
  }

  console.log(`\nThreshold Sensitivity Comparison:`);
  console.log(`Threshold | Top-1 Hit | Top-3 Hit | Top-5 Hit | Pos Zero-Res | Neg False-Pos`);
  console.log(`----------+-----------+-----------+-----------+--------------+--------------`);
  for (const tr of thresholdResults) {
    console.log(
      `  ${tr.threshold.toFixed(2)}    |   ${(tr.positiveTop1HitRate * 100).toFixed(1)}%   |   ${(tr.positiveTop3HitRate * 100).toFixed(1)}%   |   ${(tr.positiveTop5HitRate * 100).toFixed(1)}%   |      ${tr.positiveZeroResultCount}       |    ${tr.negativeFalsePositiveCount} (${(tr.negativeFalsePositiveRate * 100).toFixed(1)}%)`
    );
  }

  // ============================================================================
  // STEP 10: Serialize Output JSON to data/derived/semantic-evaluation.json
  // ============================================================================
  const outputPayload = {
    generatedAt: new Date().toISOString(),
    evaluationMetadata: {
      corpusSize: {
        publishedEntities: 3,
        totalChunks: 18,
      },
      model: "Xenova/all-MiniLM-L6-v2",
      dimensions: 384,
      totalQueries: EVALUATION_DATASET.length,
      positiveQueriesCount: positiveQueries.length,
      negativeQueriesCount: negativeQueries.length,
    },
    baselineMetrics: {
      threshold: SEMANTIC_SEARCH_DEFAULT_THRESHOLD,
      limit: 5,
      overallTop1HitRate: overallTop1,
      overallTop3HitRate: overallTop3,
      overallTop5HitRate: overallTop5,
      negativeFalsePositiveRate: falsePositiveRate,
      negativeZeroResultRate: zeroResultRate,
      categoryMetrics,
      similarityDistributions: {
        relevantTop1: {
          count: relevantScores.length,
          min: Math.min(...relevantScores),
          max: Math.max(...relevantScores),
          mean: calculateMean(relevantScores),
          median: calculateMedian(relevantScores),
        },
        negativeSurfaced: {
          count: negativeScores.length,
          scores: negativeScores,
        },
      },
    },
    thresholdSensitivity: thresholdResults,
    queryDetails: evaluationRecords,
  };

  const outputDir = path.join(process.cwd(), "data", "derived");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "semantic-evaluation.json");
  fs.writeFileSync(outputPath, JSON.stringify(outputPayload, null, 2), "utf-8");
  console.log(`\nMachine-readable evaluation emitted to: ${outputPath}`);

  console.log(`\n================================================================================`);
  console.log(` Invariant Checks: ${passedAssertions} passed, ${failedAssertions} failed`);
  console.log("================================================================================\n");

  if (failedAssertions > 0) {
    process.exit(1);
  }
}

runEvaluation().catch((err) => {
  console.error("Evaluation harness encountered an unhandled error:", err);
  process.exit(1);
});
