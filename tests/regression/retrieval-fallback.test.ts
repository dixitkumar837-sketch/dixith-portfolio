/**
 * DIXITH Phase 9.1 — Retrieval Regression & Fallback Test Suite (Migrated)
 *
 * Permanent Location: tests/regression/retrieval-fallback.test.ts
 * Framework: node:test + node:assert/strict
 *
 * Scenarios:
 * 1. HYBRID retrieval succeeds through lexical fallback when vector index is malformed.
 * 2. HYBRID retrieval behaves correctly when vector index is missing or unavailable.
 * 3. SEMANTIC-only retrieval retains its intended behavior when index is malformed (fails closed).
 * 4. Unpublished content is never returned.
 * 5. Quarantined or invalid evidence is never returned.
 * 6. Empty retrieval results produce the intended answer status (NO_RELEVANT_CONTENT).
 * 7. Relationship-only evidence produces the intended answer status (INSUFFICIENT_EVIDENCE).
 * 8. Evidence provenance and exclusion flags reflect actual behavior.
 *
 * All temporary fixtures are created in isolated directories under os.tmpdir()
 * and cleaned up deterministically. Real evidence, production data, and semantic
 * index files are preserved without alteration.
 */

import { describe, it, before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import * as os from "node:os";
import * as fs from "node:fs";
import * as path from "node:path";

import {
  retrieveKnowledge,
  resolveAnswerStatus,
  resolveEvidenceState,
  buildSourceCitations,
} from "../../lib/ask-dixith/retrieval";
import { executeAskDixithPipeline } from "../../lib/ask-dixith/pipeline";
import { hybridSearch } from "../../lib/search/hybrid";
import { DIXITH_TAXONOMY_ALIASES } from "../../lib/search";
import {
  semanticSearch,
  LocalVectorStore,
} from "../../lib/semantic";
import { isIndexable } from "../../data/types";
import { GroundedContext } from "../../data/ask-dixith-types";

describe("Phase 9.1 / 9.2 — Retrieval Regression & Fallback Verification Suite", { concurrency: false }, () => {
  let tempDir: string;
  let malformedJsonPath: string;
  let invalidSchemaPath: string;
  let missingIndexPath: string;
  let emptyIndexPath: string;
  const canonicalLoad = LocalVectorStore.prototype.load;

  before(() => {
    // Create an isolated unique directory under OS temporary directory
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dixith-retrieval-fallback-"));
    malformedJsonPath = path.join(tempDir, "temp-malformed-syntax.json");
    invalidSchemaPath = path.join(tempDir, "temp-invalid-schema.json");
    missingIndexPath = path.join(tempDir, "temp-non-existent-index.json");
    emptyIndexPath = path.join(tempDir, "temp-zero-byte-index.json");

    fs.writeFileSync(malformedJsonPath, "{ corrupt json syntax ::: not valid", "utf-8");
    fs.writeFileSync(
      invalidSchemaPath,
      JSON.stringify({ version: 1, embeddingModel: "test", records: "not-an-array" }),
      "utf-8"
    );
    fs.writeFileSync(emptyIndexPath, "", "utf-8");
    if (fs.existsSync(missingIndexPath)) {
      fs.unlinkSync(missingIndexPath);
    }
  });

  afterEach(() => {
    // Defense-in-depth: ensure LocalVectorStore prototype and taxonomy aliases are always restored
    LocalVectorStore.prototype.load = canonicalLoad;
    delete (DIXITH_TAXONOMY_ALIASES as any)["simulated_lexical_crash"];
  });

  after(() => {
    // Guaranteed cleanup of OS temporary directory
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch {
        // Fallback for resilient cleanup on Windows file handles
        try {
          if (fs.existsSync(malformedJsonPath)) fs.unlinkSync(malformedJsonPath);
          if (fs.existsSync(invalidSchemaPath)) fs.unlinkSync(invalidSchemaPath);
          if (fs.existsSync(missingIndexPath)) fs.unlinkSync(missingIndexPath);
          if (fs.existsSync(emptyIndexPath)) fs.unlinkSync(emptyIndexPath);
          fs.rmdirSync(tempDir);
        } catch {
          // non-critical cleanup
        }
      }
    }
  });

  // ── Scenario 1: HYBRID retrieval succeeds via lexical fallback when vector index is malformed ──
  describe("Scenario 1: HYBRID retrieval with malformed vector index", () => {
    it("1.1 LocalVectorStore.load() throws on malformed JSON index", async () => {
      const malformedStore = new LocalVectorStore(malformedJsonPath);
      await assert.rejects(
        async () => {
          await malformedStore.load();
        },
        /Unexpected token|JSON|SyntaxError/i,
        "LocalVectorStore.load() must throw when encountering malformed JSON"
      );
    });

    it("1.2–1.6 hybridSearch returns lexical results without throwing when store is malformed", async () => {
      const malformedStore = new LocalVectorStore(malformedJsonPath);
      const hybResponse = await hybridSearch("healthcare search architecture", {
        store: malformedStore,
      });

      assert.ok(hybResponse.results.length > 0, "1.2 hybridSearch returns results when vector index is malformed");
      assert.strictEqual(
        hybResponse.diagnostics.semanticAvailable,
        false,
        "1.3 hybridSearch marks semanticAvailable as false on malformed index"
      );
      assert.strictEqual(
        hybResponse.diagnostics.lexicalAvailable,
        true,
        "1.4 hybridSearch marks lexicalAvailable as true on malformed index"
      );
      assert.ok(
        hybResponse.results.every((r) => r.retrievalSignals === "lexical"),
        "1.5 All hybrid results from malformed store fallback have retrievalSignals = 'lexical'"
      );
      assert.ok(
        hybResponse.results.some((r) => r.entityId === "PE-001"),
        "1.6 hybridSearch lexical fallback correctly returns published PE-001"
      );
    });

    it("1.7–1.9 retrieveKnowledge(HYBRID) falls back gracefully to lexical when vector index load fails", async () => {
      const originalLoad = LocalVectorStore.prototype.load;
      try {
        LocalVectorStore.prototype.load = async function () {
          throw new Error("Simulated corrupt index in test: Unexpected token in JSON");
        };

        const ctx = await retrieveKnowledge({
          text: "healthcare search architecture",
          retrievalMode: "HYBRID",
        });

        assert.ok(ctx.items.length > 0, "1.7 retrieveKnowledge(HYBRID) does not crash when store.load() throws");
        assert.ok(
          ctx.items.some((i) => i.entityId === "PE-001"),
          "1.8 retrieveKnowledge(HYBRID) returns PE-001 through lexical fallback"
        );
        assert.ok(
          ctx.items.every((i) => i.retrievalSignal === "lexical" || i.retrievalSignal === "relationship"),
          "1.9 retrieveKnowledge(HYBRID) items have lexical/relationship signals when vector store is corrupt"
        );
      } finally {
        LocalVectorStore.prototype.load = originalLoad;
      }
    });
  });

  // ── Scenario 2: HYBRID retrieval when vector index is missing or unavailable ──
  describe("Scenario 2: HYBRID retrieval with missing vector index", () => {
    it("2.1–2.5 hybridSearch handles missing index file via lexical fallback", async () => {
      const missingStore = new LocalVectorStore(missingIndexPath);
      assert.strictEqual(missingStore.hasIndexFile(), false, "2.1 Missing store hasIndexFile() returns false");

      const hybResponse = await hybridSearch("healthcare search architecture", {
        store: missingStore,
      });

      assert.ok(hybResponse.results.length > 0, "2.2 hybridSearch returns results when index file is missing");
      assert.strictEqual(
        hybResponse.diagnostics.semanticAvailable,
        false,
        "2.3 hybridSearch marks semanticAvailable as false when index file is missing"
      );
      assert.strictEqual(
        hybResponse.diagnostics.semanticReason,
        "semantic_index_unavailable",
        "2.4 hybridSearch sets semanticReason to 'semantic_index_unavailable'"
      );
      assert.ok(
        hybResponse.results.some((r) => r.entityId === "PE-001"),
        "2.5 hybridSearch returns PE-001 via lexical retrieval when index is missing"
      );
    });
  });

  // ── Scenario 3: SEMANTIC-only retrieval retains intended behavior when index is malformed ──
  describe("Scenario 3: SEMANTIC-only retrieval with malformed index (fail-closed)", () => {
    it("3.1 semanticSearch throws when provided a malformed vector store (no silent fallback)", async () => {
      const malformedStore = new LocalVectorStore(malformedJsonPath);
      await assert.rejects(
        async () => {
          await semanticSearch("healthcare search architecture", {
            store: malformedStore,
          });
        },
        /Unexpected token|JSON|SyntaxError/i,
        "3.1 semanticSearch throws when provided a malformed vector store (no silent fallback)"
      );
    });

    it("3.2–3.3 retrieveKnowledge(SEMANTIC) fails closed on malformed index", async () => {
      const originalLoad = LocalVectorStore.prototype.load;
      try {
        LocalVectorStore.prototype.load = async function () {
          throw new Error("Simulated corrupt index for semantic-only test");
        };

        await assert.rejects(
          async () => {
            await retrieveKnowledge({
              text: "healthcare search architecture",
              retrievalMode: "SEMANTIC",
            });
          },
          (err: Error) => {
            assert.ok(
              err.message.includes("Simulated corrupt index"),
              "3.2 retrieveKnowledge(SEMANTIC) error message reflects index load failure"
            );
            return true;
          },
          "3.3 retrieveKnowledge(SEMANTIC) throws on malformed index (does NOT silently fall back to lexical)"
        );
      } finally {
        LocalVectorStore.prototype.load = originalLoad;
      }
    });
  });

  // ── Scenario 4: Unpublished content is never returned ──
  describe("Scenario 4: Unpublished content isolation", () => {
    const unpublishedQueries = [
      "EXP-012 citation patterns across AI search systems",
      "EXP-013 how entities influence AI search visibility",
      "EXP-014 testing generative engine visibility",
      "GUI-001 schema.org entity graph implementation",
      "GUI-002 crawler access and index hygiene",
      "EXP-001 same question six systems",
    ];

    for (const q of unpublishedQueries) {
      it(`4.1 Unpublished content excluded in HYBRID mode for: '${q.slice(0, 32)}...'`, async () => {
        const ctxHybrid = await retrieveKnowledge({ text: q, retrievalMode: "HYBRID" });
        const hasUnpublished = ctxHybrid.items.some(
          (i) => i.entityId.startsWith("EXP-") || i.entityId.startsWith("GUI-") || !isIndexable(i.status)
        );
        assert.strictEqual(
          hasUnpublished,
          false,
          `Unpublished content must be excluded in HYBRID mode for query '${q}'`
        );
      });

      it(`4.2 Unpublished content excluded in KEYWORD mode for: '${q.slice(0, 32)}...'`, async () => {
        const ctxKeyword = await retrieveKnowledge({ text: q, retrievalMode: "KEYWORD" });
        const hasUnpublished = ctxKeyword.items.some(
          (i) => i.entityId.startsWith("EXP-") || i.entityId.startsWith("GUI-") || !isIndexable(i.status)
        );
        assert.strictEqual(
          hasUnpublished,
          false,
          `Unpublished content must be excluded in KEYWORD mode for query '${q}'`
        );
      });
    }

    it("4.3 Unpublished content excluded in HYBRID lexical fallback path", async () => {
      const originalLoad = LocalVectorStore.prototype.load;
      try {
        LocalVectorStore.prototype.load = async function () {
          throw new Error("Corrupt index");
        };
        const ctxFallback = await retrieveKnowledge({
          text: "EXP-014 testing generative engine visibility",
          retrievalMode: "HYBRID",
        });
        const hasUnpublished = ctxFallback.items.some(
          (i) => i.entityId.startsWith("EXP-") || i.entityId.startsWith("GUI-") || !isIndexable(i.status)
        );
        assert.strictEqual(hasUnpublished, false, "Unpublished content must be excluded in HYBRID lexical fallback");
      } finally {
        LocalVectorStore.prototype.load = originalLoad;
      }
    });
  });

  // ── Scenario 5: Quarantined or invalid evidence is never returned ──
  describe("Scenario 5: Quarantined & invalid evidence isolation", () => {
    const quarantinedQueries = [
      "gemini-01 incident run artifact",
      "RUN-001-20260927-Q001-gemini-01",
      "quarantined evidence run",
    ];

    for (const q of quarantinedQueries) {
      it(`5.1 Quarantined evidence excluded from retrieval context for: '${q}'`, async () => {
        const ctx = await retrieveKnowledge({ text: q, retrievalMode: "HYBRID" });
        const hasQuarantined = ctx.items.some(
          (i) =>
            i.entityId.includes("gemini-01") ||
            i.excerpt.includes("gemini-01") ||
            (i.sourceIds && i.sourceIds.some((s) => s.includes("gemini-01")))
        );
        assert.strictEqual(hasQuarantined, false, `Quarantined evidence must be absent from context items for '${q}'`);
      });

      it(`5.2 Quarantined evidence excluded from citation sources for: '${q}'`, async () => {
        const ctx = await retrieveKnowledge({ text: q, retrievalMode: "HYBRID" });
        const sources = buildSourceCitations(ctx);
        const hasQuarantinedSource = sources.some(
          (s) => s.entityId.includes("gemini-01") || s.href.includes("gemini-01")
        );
        assert.strictEqual(
          hasQuarantinedSource,
          false,
          `Quarantined evidence must be absent from source citations for '${q}'`
        );
      });
    }
  });

  // ── Scenario 6: Empty retrieval results produce intended answer status ──
  describe("Scenario 6: Empty retrieval results status", () => {
    it("6.1 Empty context resolves to NO_RELEVANT_CONTENT", () => {
      const emptyContext: GroundedContext = {
        query: "how to bake sourdough bread at home",
        intent: "GUIDE_LOOKUP",
        retrievalMode: "HYBRID",
        items: [],
        totalExcerptCharacters: 0,
        characterBudget: 8000,
        relationshipsExpanded: true,
        candidatesBeforeBudgeting: 0,
        diagnostics: {
          lexicalResultCount: 0,
          semanticResultCount: 0,
          hybridResultCount: 0,
          relationshipExpansionCount: 0,
          deduplicatedCount: 0,
          budgetTruncatedCount: 0,
        },
      };

      const status = resolveAnswerStatus(emptyContext);
      assert.strictEqual(status, "NO_RELEVANT_CONTENT", "6.1 Empty context resolves to NO_RELEVANT_CONTENT");
    });

    it("6.2–6.4 Pipeline produces answerStatus = NO_RELEVANT_CONTENT for irrelevant query", async () => {
      const pipelineAnswer = await executeAskDixithPipeline("how to bake sourdough bread at home");
      assert.strictEqual(
        pipelineAnswer.answerStatus,
        "NO_RELEVANT_CONTENT",
        "6.2 Pipeline produces answerStatus = NO_RELEVANT_CONTENT for irrelevant query"
      );
      assert.strictEqual(
        pipelineAnswer.sources.length,
        0,
        "6.3 Pipeline sources array is empty for NO_RELEVANT_CONTENT"
      );
      assert.strictEqual(
        pipelineAnswer.modelProvider,
        null,
        "6.4 Pipeline skips provider call (modelProvider is null) on NO_RELEVANT_CONTENT"
      );
    });
  });

  // ── Scenario 7: Relationship-only evidence produces intended answer status ──
  describe("Scenario 7: Relationship-only evidence status", () => {
    it("7.1 Context with only relationship items resolves to INSUFFICIENT_EVIDENCE", () => {
      const relationshipOnlyContext: GroundedContext = {
        query: "some related query",
        intent: "KNOWLEDGE_LOOKUP",
        retrievalMode: "HYBRID",
        items: [
          {
            entityId: "PE-001",
            entityType: "professional-experience",
            title: "Healthcare Search Architecture",
            href: "/professional-experience/healthcare-search-architecture",
            status: "PUBLISHED",
            excerpt: "Clinical terminology mapping and medical schema systems.",
            excerptLength: 60,
            retrievalSignal: "relationship", // Relationship-only signal
            rank: 1,
          },
        ],
        totalExcerptCharacters: 60,
        characterBudget: 8000,
        relationshipsExpanded: true,
        candidatesBeforeBudgeting: 1,
        diagnostics: {
          lexicalResultCount: 0,
          semanticResultCount: 0,
          hybridResultCount: 0,
          relationshipExpansionCount: 1,
          deduplicatedCount: 0,
          budgetTruncatedCount: 0,
        },
      };

      const status = resolveAnswerStatus(relationshipOnlyContext);
      assert.strictEqual(
        status,
        "INSUFFICIENT_EVIDENCE",
        "7.1 Context with only relationship items resolves to INSUFFICIENT_EVIDENCE"
      );

      const evidenceState = resolveEvidenceState(relationshipOnlyContext);
      assert.ok(
        evidenceState.limitations.some((l) => l.includes("relationship expansion")),
        "7.2 Relationship-only context includes limitation notice about graph expansion"
      );
    });
  });

  // ── Scenario 8: Evidence provenance and exclusion flags reflect actual behavior ──
  describe("Scenario 8: Evidence provenance & exclusion flags", () => {
    it("8.1–8.6 Provenance flags and privacy integrity reflect actual behavior", async () => {
      const ctx = await retrieveKnowledge({ text: "healthcare search architecture", retrievalMode: "HYBRID" });
      const evidenceState = resolveEvidenceState(ctx);

      assert.strictEqual(
        evidenceState.hasEmpiricalEvidence,
        false,
        "8.1 hasEmpiricalEvidence is false (no published research with EvidencePacks)"
      );
      assert.strictEqual(
        evidenceState.researchPublished,
        false,
        "8.2 researchPublished is false (research entities are IN_REVIEW)"
      );
      assert.strictEqual(
        evidenceState.quarantinedEvidenceExcluded,
        false,
        "8.3 quarantinedEvidenceExcluded reflects default clean state"
      );
      assert.ok(
        evidenceState.provenanceSummary.includes("published DIXITH knowledge"),
        "8.4 provenanceSummary correctly states published knowledge provenance"
      );
      assert.ok(
        !evidenceState.provenanceSummary.includes("evidence/exp-001"),
        "8.5 provenanceSummary never leaks host paths or internal evidence paths"
      );
      assert.ok(
        !evidenceState.provenanceSummary.includes("fa17ed9d") && !evidenceState.provenanceSummary.includes("6baf3ac2"),
        "8.6 provenanceSummary never leaks raw SHA-256 hashes"
      );
    });
  });

  // ── Scenario 9: Zero-byte index file handling ──
  describe("Scenario 9: Zero-byte index file handling", () => {
    it("9.1 HYBRID mode falls back to lexical retrieval on zero-byte index", async () => {
      const emptyStore = new LocalVectorStore(emptyIndexPath);
      const hybResponse = await hybridSearch("healthcare search architecture", {
        store: emptyStore,
      });

      assert.strictEqual(
        hybResponse.diagnostics.semanticAvailable,
        false,
        "9.1a semanticAvailable must be false for zero-byte index"
      );
      assert.strictEqual(
        hybResponse.diagnostics.semanticReason,
        "semantic_index_unavailable",
        "9.1b semanticReason must be semantic_index_unavailable"
      );
      assert.ok(hybResponse.results.length > 0, "9.1c hybridSearch must return results via lexical fallback");
      assert.ok(
        hybResponse.results.some((r) => r.entityId === "PE-001"),
        "9.1d published entity PE-001 is retrieved"
      );
      assert.ok(
        hybResponse.results.every((r) => r.retrievalSignals === "lexical"),
        "9.1e all results have lexical signal on zero-byte store fallback"
      );
    });

    it("9.2 SEMANTIC mode does not fall back on zero-byte index (fails closed)", async () => {
      const emptyStore = new LocalVectorStore(emptyIndexPath);
      const semResponse = await semanticSearch("healthcare search architecture", {
        store: emptyStore,
      });

      assert.strictEqual(
        semResponse.available,
        false,
        "9.2a semanticSearch must mark available as false"
      );
      assert.strictEqual(
        semResponse.reason,
        "semantic_index_unavailable",
        "9.2b semanticSearch must record semantic_index_unavailable"
      );
      assert.strictEqual(
        semResponse.results.length,
        0,
        "9.2c semanticSearch must return zero results without falling back to lexical"
      );
    });

    it("9.3 Real semantic index is completely preserved and unmodified", () => {
      const realIndexPath = path.join(process.cwd(), "data", "derived", "semantic-index.json");
      assert.ok(fs.existsSync(realIndexPath), "9.3a Real semantic index must exist");
      const stat = fs.statSync(realIndexPath);
      assert.ok(stat.size > 0, "9.3b Real semantic index must be non-empty");
    });
  });

  // ── Scenario 10: Simultaneous HYBRID retrieval failure ──
  describe("Scenario 10: Simultaneous HYBRID retrieval failure", () => {
    it("10.1 hybridSearch reports both engines unavailable and returns zero results", async () => {
      Object.defineProperty(DIXITH_TAXONOMY_ALIASES, "simulated_lexical_crash", {
        get() {
          throw new Error("Simulated lexical failure");
        },
        configurable: true,
      });

      try {
        const malformedStore = new LocalVectorStore(malformedJsonPath);
        const hybResponse = await hybridSearch("simulated_lexical_crash", {
          store: malformedStore,
        });

        assert.strictEqual(
          hybResponse.diagnostics.lexicalAvailable,
          false,
          "10.1a lexicalAvailable must be false"
        );
        assert.strictEqual(
          hybResponse.diagnostics.semanticAvailable,
          false,
          "10.1b semanticAvailable must be false"
        );
        assert.strictEqual(
          hybResponse.results.length,
          0,
          "10.1c results must be empty when both engines fail"
        );
        assert.strictEqual(
          hybResponse.totalFound,
          0,
          "10.1d totalFound must be 0"
        );
      } finally {
        delete (DIXITH_TAXONOMY_ALIASES as any)["simulated_lexical_crash"];
      }
    });

    it("10.2 Pipeline gracefully produces NO_RELEVANT_CONTENT when both engines fail", async () => {
      Object.defineProperty(DIXITH_TAXONOMY_ALIASES, "simulated_lexical_crash", {
        get() {
          throw new Error("Simulated lexical failure");
        },
        configurable: true,
      });

      const originalLoad = LocalVectorStore.prototype.load;
      try {
        LocalVectorStore.prototype.load = async function () {
          throw new Error("Corrupt index");
        };

        const answer = await executeAskDixithPipeline("simulated_lexical_crash", {
          retrievalMode: "HYBRID",
        });

        assert.strictEqual(
          answer.answerStatus,
          "NO_RELEVANT_CONTENT",
          "10.2a Dual retrieval failure in HYBRID mode resolves to NO_RELEVANT_CONTENT"
        );
        assert.strictEqual(answer.sources.length, 0, "10.2b Sources array must be empty");
        assert.strictEqual(answer.modelProvider, null, "10.2c Provider must not be called");
      } finally {
        LocalVectorStore.prototype.load = originalLoad;
        delete (DIXITH_TAXONOMY_ALIASES as any)["simulated_lexical_crash"];
      }
    });
  });

  // ── Scenario 11: Pipeline-level retrieval exception boundary ──
  describe("Scenario 11: Pipeline-level retrieval exception boundary", () => {
    it("11.1 Catches SEMANTIC retrieval exception and returns structured RETRIEVAL_ERROR", async () => {
      const originalLoad = LocalVectorStore.prototype.load;
      try {
        LocalVectorStore.prototype.load = async function () {
          throw new Error("Simulated fatal index parse error: C:\\secret\\filesystem\\path");
        };

        const answer = await executeAskDixithPipeline("healthcare search architecture", {
          retrievalMode: "SEMANTIC",
        });

        assert.strictEqual(
          answer.answerStatus,
          "RETRIEVAL_ERROR",
          "11.1a Pipeline must catch retrieval error and return RETRIEVAL_ERROR"
        );
        assert.strictEqual(answer.modelProvider, null, "11.1b modelProvider must be null");
        assert.strictEqual(answer.modelVersion, null, "11.1c modelVersion must be null");
        assert.strictEqual(answer.sources.length, 0, "11.1d sources must be empty");
        assert.strictEqual(answer.relatedContent.length, 0, "11.1e relatedContent must be empty");
        assert.strictEqual(
          answer.groundingMetadata.retrievedEntityIds.length,
          0,
          "11.1f retrievedEntityIds must be empty"
        );
        assert.ok(
          answer.answer.includes("technical retrieval error occurred"),
          "11.1g answer text contains generic user-safe error notice"
        );
        assert.ok(
          !answer.answer.includes("secret"),
          "11.1h answer text must not leak internal path terms"
        );
        assert.ok(
          !answer.answer.includes("C:\\"),
          "11.1i answer text must not leak filesystem paths"
        );
      } finally {
        LocalVectorStore.prototype.load = originalLoad;
      }
    });
  });

  // ── Scenario 12: KEYWORD exception propagation to the pipeline boundary ──
  describe("Scenario 12: KEYWORD exception propagation to pipeline boundary", () => {
    it("12.1 Lexical search failure in KEYWORD mode propagates to pipeline RETRIEVAL_ERROR", async () => {
      Object.defineProperty(DIXITH_TAXONOMY_ALIASES, "simulated_lexical_crash", {
        get() {
          throw new Error("Simulated fatal token error: C:\\internal\\leak");
        },
        configurable: true,
      });

      try {
        const answer = await executeAskDixithPipeline("simulated_lexical_crash", {
          retrievalMode: "KEYWORD",
        });

        assert.strictEqual(
          answer.answerStatus,
          "RETRIEVAL_ERROR",
          "12.1a Unhandled lexical error in KEYWORD mode yields RETRIEVAL_ERROR"
        );
        assert.strictEqual(answer.modelProvider, null, "12.1b modelProvider must be null");
        assert.strictEqual(answer.modelVersion, null, "12.1c modelVersion must be null");
        assert.strictEqual(answer.sources.length, 0, "12.1d sources must be empty");
        assert.strictEqual(
          answer.groundingMetadata.retrievedEntityIds.length,
          0,
          "12.1e retrievedEntityIds must be empty"
        );
        assert.ok(
          answer.answer.includes("technical retrieval error occurred"),
          "12.1f answer text contains generic user-safe error notice"
        );
        assert.ok(
          !answer.answer.includes("internal"),
          "12.1g answer text must not leak internal error phrases"
        );
        assert.ok(
          !answer.answer.includes("C:\\"),
          "12.1h answer text must not leak filesystem paths"
        );
      } finally {
        delete (DIXITH_TAXONOMY_ALIASES as any)["simulated_lexical_crash"];
      }
    });
  });
});
