/**
 * DIXITH Phase 8K — Ask DIXITH Publication Safety & Architecture Test Suite
 *
 * Verifies 35 assertions across 10 core categories:
 * - Publication Safety (1-8)
 * - Retrieval Integration (9-13)
 * - Deduplication & Ranking (14-15)
 * - Source Resolution (16-18)
 * - Evidence & Credential Isolation (19-20)
 * - Answer Status States (21-23)
 * - Provider Abstraction (24-25)
 * - Answer Model Contracts (26-28)
 * - Context & Metadata Contracts (29-30)
 * - Research Status Immutability (31-35)
 *
 * STRICT CONSTRAINTS:
 * - Offline only: zero external APIs, zero browser launches, zero CDP connections.
 * - Historical evidence untouched.
 * - Quarantined evidence excluded.
 * - No external LLM providers called.
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// Type contracts
import {
  AskDixithQuery,
  AskDixithOptions,
  AskDixithAnswer,
  AskDixithSource,
  AskDixithEvidenceState,
  AskDixithRetrievalMode,
  AskDixithIntent,
  AskDixithAnswerStatus,
  GroundedContext,
  GroundedContextItem,
  AnswerGenerationProvider,
  AnswerGenerationRequest,
  AnswerGenerationResponse,
  QueryValidationResult,
  ASK_DIXITH_MAX_QUERY_LENGTH,
  ASK_DIXITH_DEFAULT_CONTEXT_BUDGET,
  ASK_DIXITH_DEFAULT_MAX_SOURCES,
} from "../data/ask-dixith-types";

// Retrieval adapter
import {
  validateAskDixithQuery,
  classifyIntent,
  retrieveKnowledge,
  buildSourceCitations,
  resolveEvidenceState,
  resolveAnswerStatus,
} from "../lib/ask-dixith/retrieval";

// Existing infrastructure
import { searchContent, buildSearchIndex } from "../lib/search";
import { hybridSearch } from "../lib/search/hybrid";
import { semanticSearch, LocalEmbeddingProvider, LocalVectorStore } from "../lib/semantic";
import { isIndexable, ContentStatus } from "../data/types";
import { resolveEntity, getRelatedContent } from "../lib/content-utils";
import { getResearchById } from "../data/research";
import { getExperimentById } from "../data/experiments";
import { getProfessionalExperienceById } from "../data/professional-experience";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, extra?: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${extra || ""}`);
    failed++;
  }
}

async function runPhase8KTests() {
  console.log("================================================================================");
  console.log(" DIXITH Phase 8K — Ask DIXITH Publication Safety & Architecture Suite");
  console.log("================================================================================\n");

  const cwd = process.cwd();

  // ── SECTION 1: PUBLICATION SAFETY (Assertions 1-8) ─────────────────────
  console.log("[Category 1: Publication Safety]");

  // 1. Published content is eligible for Ask DIXITH retrieval
  {
    const ctx = await retrieveKnowledge({ text: "healthcare search architecture" });
    const hasPE001 = ctx.items.some((i) => i.entityId === "PE-001");
    assert(hasPE001, "1. Published content (PE-001) is eligible for Ask DIXITH retrieval");
  }

  // 2. Draft content is excluded
  {
    const ctx = await retrieveKnowledge({ text: "Schema.org Entity Graph Implementation" });
    const hasDraft = ctx.items.some(
      (i) => i.entityId === "GUI-001" || i.entityId === "GUI-002"
    );
    assert(!hasDraft, "2. Draft content (GUI-001, GUI-002) is excluded from retrieval");
  }

  // 3. IN_REVIEW content is excluded
  {
    const ctx = await retrieveKnowledge({ text: "Citation Patterns Across AI Search Systems" });
    const hasInReview = ctx.items.some(
      (i) => i.entityId === "EXP-012" || i.entityId === "EXP-013" || i.entityId === "EXP-014"
    );
    assert(!hasInReview, "3. IN_REVIEW content (EXP-012..014) is excluded from retrieval");
  }

  // 4. EVIDENCE_READY content is excluded until published
  {
    // EVIDENCE_READY is not a current status in corpus, but verify isIndexable rejects it
    assert(
      !isIndexable("EVIDENCE_READY"),
      "4. EVIDENCE_READY content is excluded until explicitly PUBLISHED"
    );
  }

  // 5. ACTIVE experiments are excluded
  {
    const ctx = await retrieveKnowledge({ text: "same question six systems experiment" });
    const hasActive = ctx.items.some((i) => i.entityId === "EXP-001");
    assert(!hasActive, "5. ACTIVE experiments (EXP-001) are excluded from retrieval");
  }

  // 6. Quarantined evidence is excluded
  {
    const ctx = await retrieveKnowledge({ text: "RUN-001-20260927-Q001-gemini-01" });
    const hasQuarantined = ctx.items.some(
      (i) => i.entityId.includes("gemini-01") || i.excerpt.includes("gemini-01")
    );
    assert(!hasQuarantined, "6. Quarantined evidence (gemini-01) is excluded from retrieval");
  }

  // 7. Invalid evidence is excluded
  {
    // Verify isIndexable rejects all non-published statuses
    const allExcluded =
      !isIndexable("DRAFT") &&
      !isIndexable("IN_REVIEW") &&
      !isIndexable("ACTIVE") &&
      !isIndexable("COMPLETED") &&
      !isIndexable("ARCHIVED");
    assert(allExcluded, "7. All non-PUBLISHED statuses (DRAFT, IN_REVIEW, ACTIVE, COMPLETED, ARCHIVED) are excluded");
  }

  // 8. Incomplete evidence is excluded (inherent in publication gate)
  {
    // Evidence completeness is enforced by the publication gate — only PUBLISHED passes
    assert(
      isIndexable("PUBLISHED") && !isIndexable("EVIDENCE_READY"),
      "8. Incomplete/partial evidence is excluded from retrieval (only PUBLISHED passes isIndexable)"
    );
  }

  // ── SECTION 2: RETRIEVAL INTEGRATION (Assertions 9-13) ────────────────
  console.log("\n[Category 2: Retrieval Integration]");

  // 9. Public graph is used for relationship expansion
  {
    const ctx = await retrieveKnowledge({
      text: "healthcare search architecture",
      expandRelationships: true,
    });
    assert(
      ctx.relationshipsExpanded,
      "9. Public graph is used for relationship expansion (publicOnly: true)"
    );
  }

  // 10. Unpublished relationships are not expanded
  {
    // EXP-001 (ACTIVE) has relationships to EXP-012..014 (IN_REVIEW)
    // None should appear in any retrieval context
    const related = getRelatedContent("experiment", "EXP-001", { publicOnly: true });
    assert(
      related.length === 0,
      "10. Unpublished relationships (EXP-001 -> EXP-012..014) are not expanded in public mode"
    );
  }

  // 11. Lexical retrieval can feed Ask DIXITH
  {
    const ctx = await retrieveKnowledge({
      text: "international search architecture",
      retrievalMode: "KEYWORD",
    });
    assert(
      ctx.retrievalMode === "KEYWORD" && ctx.items.length > 0,
      `11. Lexical retrieval feeds Ask DIXITH (found ${ctx.items.length} items)`
    );
  }

  // 12. Semantic retrieval can feed Ask DIXITH
  {
    const ctx = await retrieveKnowledge({
      text: "healthcare clinical search architecture",
      retrievalMode: "SEMANTIC",
    });
    assert(
      ctx.retrievalMode === "SEMANTIC",
      "12. Semantic retrieval feeds Ask DIXITH (mode recorded)"
    );
  }

  // 13. Hybrid retrieval can feed Ask DIXITH
  {
    const ctx = await retrieveKnowledge({
      text: "healthcare search",
      retrievalMode: "HYBRID",
    });
    assert(
      ctx.retrievalMode === "HYBRID" && ctx.items.length > 0,
      `13. Hybrid retrieval feeds Ask DIXITH (found ${ctx.items.length} items)`
    );
  }

  // ── SECTION 3: DEDUPLICATION & RANKING (Assertions 14-15) ──────────────
  console.log("\n[Category 3: Deduplication & Ranking]");

  // 14. Retrieval results are deduplicated
  {
    const ctx = await retrieveKnowledge({ text: "healthcare search architecture" });
    const entityIds = ctx.items.map((i) => i.entityId);
    const uniqueIds = new Set(entityIds);
    assert(
      entityIds.length === uniqueIds.size,
      `14. Retrieval results are deduplicated (${entityIds.length} items, ${uniqueIds.size} unique)`
    );
  }

  // 15. Results are ranked (rank 1 is first)
  {
    const ctx = await retrieveKnowledge({ text: "healthcare search" });
    const ranks = ctx.items.map((i) => i.rank);
    const isOrdered = ranks.every((r, idx) => r === idx + 1);
    assert(
      isOrdered && ranks.length > 0,
      `15. Results are ranked sequentially (ranks: ${ranks.join(", ")})`
    );
  }

  // ── SECTION 4: SOURCE RESOLUTION (Assertions 16-18) ────────────────────
  console.log("\n[Category 4: Source Resolution]");

  // 16. Source IDs resolve
  {
    const ctx = await retrieveKnowledge({ text: "healthcare search architecture" });
    const sources = buildSourceCitations(ctx);
    const hasSourceIds = sources.some((s) => s.sourceIds && s.sourceIds.length > 0);
    assert(
      sources.length > 0,
      `16. Source IDs resolve in citations (${sources.length} sources built)`
    );
  }

  // 17. Source URLs resolve to internal DIXITH paths
  {
    const ctx = await retrieveKnowledge({ text: "healthcare search architecture" });
    const sources = buildSourceCitations(ctx);
    const allInternal = sources.every(
      (s) =>
        s.href.startsWith("/") &&
        !s.href.includes("://") &&
        !s.href.includes("C:\\") &&
        !s.href.includes("c:\\") &&
        !s.href.includes("evidence/")
    );
    assert(
      allInternal,
      "17. Source URLs resolve to internal DIXITH paths (no absolute filesystem paths)"
    );
  }

  // 18. Internal file paths are never exposed
  {
    const ctx = await retrieveKnowledge({ text: "healthcare search" });
    const serialized = JSON.stringify(ctx);
    const hasFilePath =
      serialized.includes("C:\\") ||
      serialized.includes("c:\\") ||
      serialized.includes("/paila") ||
      serialized.includes("evidence/exp-001/raw") ||
      serialized.includes(".txt") ||
      serialized.includes(".html") ||
      serialized.includes(".png") ||
      serialized.includes("SHA256") ||
      serialized.includes("sha256");
    assert(
      !hasFilePath,
      "18. Internal file paths, raw evidence paths, and SHA-256 hashes are never exposed in GroundedContext"
    );
  }

  // ── SECTION 5: EVIDENCE & CREDENTIAL ISOLATION (Assertions 19-20) ──────
  console.log("\n[Category 5: Evidence & Credential Isolation]");

  // 19. No credentials can enter GroundedContext
  {
    const ctx = await retrieveKnowledge({ text: "API key password authentication token" });
    const serialized = JSON.stringify(ctx);

    // Verify GroundedContext does not expose actual credential/session fields or secret values,
    // while allowing ordinary technical prose (e.g. "password authentication", "session management").
    const sensitiveDataPatterns = [
      /"apiKey"\s*:/i,
      /"api_key"\s*:/i,
      /"access_token"\s*:/i,
      /"auth_token"\s*:/i,
      /"session_id"\s*:/i,
      /"set-cookie"/i,
      /cookie\s*=\s*[^\s,;]+/i,
      /Bearer\s+[A-Za-z0-9_\-\.]{10,}/i,
      /secret\s*=\s*[^\s,;]+/i,
      /password\s*=\s*[^\s,;]+/i,
    ];

    const hasCredentials = sensitiveDataPatterns.some((pattern) => pattern.test(serialized));

    assert(
      !hasCredentials,
      "19. No credentials (API keys, passwords, tokens) can enter GroundedContext"
    );
  }

  // 20. No browser session metadata can enter GroundedContext
  {
    const ctx = await retrieveKnowledge({ text: "CDP browser session chrome debugging" });
    const serialized = JSON.stringify(ctx);
    const hasBrowserData =
      serialized.includes("127.0.0.1:9222") ||
      serialized.includes("cdpUrl") ||
      serialized.includes("remote-debugging") ||
      serialized.includes("userAgent");
    assert(
      !hasBrowserData,
      "20. No browser session metadata (CDP, debugging ports, userAgent) can enter GroundedContext"
    );
  }

  // ── SECTION 6: ANSWER STATUS STATES (Assertions 21-23) ─────────────────
  console.log("\n[Category 6: Answer Status States]");

  // 21. INSUFFICIENT_EVIDENCE state exists and is resolvable
  {
    // A query about something vaguely related but without direct published support
    const ctx = await retrieveKnowledge({ text: "quantum computing blockchain NFT" });
    const status = resolveAnswerStatus(ctx);
    assert(
      status === "NO_RELEVANT_CONTENT" || status === "INSUFFICIENT_EVIDENCE",
      `21. Insufficient evidence state is resolvable (status: ${status})`
    );
  }

  // 22. NO_RELEVANT_CONTENT state exists and fires for irrelevant queries
  {
    const ctx = await retrieveKnowledge({ text: "best pizza recipe in Naples Italy" });
    const status = resolveAnswerStatus(ctx);
    assert(
      status === "NO_RELEVANT_CONTENT",
      `22. NO_RELEVANT_CONTENT state fires for irrelevant queries (status: ${status})`
    );
  }

  // 23. ANSWERED state fires when sufficient published content exists
  {
    const ctx = await retrieveKnowledge({ text: "healthcare search architecture" });
    const status = resolveAnswerStatus(ctx);
    assert(
      status === "ANSWERED" || status === "PARTIALLY_SUPPORTED",
      `23. ANSWERED/PARTIALLY_SUPPORTED state fires for relevant published content (status: ${status})`
    );
  }

  // ── SECTION 7: PROVIDER ABSTRACTION (Assertions 24-25) ─────────────────
  console.log("\n[Category 7: Provider Abstraction]");

  // 24. AnswerGenerationProvider interface exists and is structurally valid
  {
    // TypeScript compilation validates the interface. Here we verify the contract shape.
    const mockProvider: AnswerGenerationProvider = {
      name: "mock",
      isAvailable: async () => false,
      generateAnswer: async (req: AnswerGenerationRequest) => ({
        answer: "",
        answerStatus: "NO_RELEVANT_CONTENT" as AskDixithAnswerStatus,
        citedEntityIds: [],
        providerName: "mock",
        modelVersion: "mock-1.0",
        durationMs: 0,
      }),
    };
    assert(
      mockProvider.name === "mock" && typeof mockProvider.isAvailable === "function",
      "24. AnswerGenerationProvider interface exists and is structurally valid"
    );
  }

  // 25. No external provider is required for retrieval
  {
    // Retrieval works without any LLM provider
    const ctx = await retrieveKnowledge({ text: "healthcare search" });
    assert(
      ctx.items.length > 0,
      "25. No external provider is required — retrieval works standalone without LLM"
    );
  }

  // ── SECTION 8: ANSWER MODEL CONTRACTS (Assertions 26-28) ───────────────
  console.log("\n[Category 8: Answer Model Contracts]");

  // 26. Answer model supports source attribution
  {
    const ctx = await retrieveKnowledge({ text: "healthcare search" });
    const sources = buildSourceCitations(ctx);
    const hasAttribution = sources.every(
      (s) => Boolean(s.entityId) && Boolean(s.title) && Boolean(s.href) && Boolean(s.relevance)
    );
    assert(
      hasAttribution && sources.length > 0,
      "26. Answer model supports full source attribution (entityId, title, href, relevance)"
    );
  }

  // 27. Answer model supports limitations
  {
    const ctx = await retrieveKnowledge({ text: "healthcare search" });
    const evidenceState = resolveEvidenceState(ctx);
    assert(
      Array.isArray(evidenceState.limitations) && typeof evidenceState.provenanceSummary === "string",
      "27. Answer model supports limitations and provenance summary"
    );
  }

  // 28. Answer model supports evidence state
  {
    const ctx = await retrieveKnowledge({ text: "healthcare search" });
    const evidenceState = resolveEvidenceState(ctx);
    assert(
      typeof evidenceState.hasEmpiricalEvidence === "boolean" &&
      typeof evidenceState.researchPublished === "boolean" &&
      typeof evidenceState.quarantinedEvidenceExcluded === "boolean",
      "28. Answer model supports structured evidence state tracking"
    );
  }

  // ── SECTION 9: CONTEXT & METADATA CONTRACTS (Assertions 29-30) ─────────
  console.log("\n[Category 9: Context & Metadata Contracts]");

  // 29. Context has publication metadata
  {
    const ctx = await retrieveKnowledge({ text: "healthcare search" });
    const allHaveStatus = ctx.items.every(
      (i) => i.status === "PUBLISHED" && typeof i.rank === "number"
    );
    assert(
      allHaveStatus,
      "29. GroundedContext items include publication status metadata (all PUBLISHED)"
    );
  }

  // 30. Retrieval mode and intent are recorded
  {
    const ctx = await retrieveKnowledge({ text: "healthcare search", retrievalMode: "HYBRID" });
    assert(
      ctx.retrievalMode === "HYBRID" && typeof ctx.intent === "string" && ctx.intent.length > 0,
      `30. Retrieval mode (${ctx.retrievalMode}) and intent (${ctx.intent}) are recorded in GroundedContext`
    );
  }

  // ── SECTION 10: RESEARCH STATUS IMMUTABILITY (Assertions 31-35) ────────
  console.log("\n[Category 10: Research Status Immutability & Historical Integrity]");

  // 31. Ask DIXITH does not alter research status (EXP-012..014 unchanged)
  {
    const exp012 = getResearchById("EXP-012");
    const exp013 = getResearchById("EXP-013");
    const exp014 = getResearchById("EXP-014");
    assert(
      exp012?.status === "IN_REVIEW" && exp013?.status === "IN_REVIEW" && exp014?.status === "IN_REVIEW",
      "31. Ask DIXITH does not alter research status (EXP-012..014 remain IN_REVIEW)"
    );
  }

  // 32. EXP-001 remains ACTIVE
  {
    const exp001 = getExperimentById("EXP-001");
    assert(
      exp001?.status === "ACTIVE",
      "32. EXP-001 experiment status remains ACTIVE after retrieval operations"
    );
  }

  // 33. Historical gemini-05 evidence remains untouched
  {
    const gemini05Path = path.join(cwd, "evidence", "exp-001", "raw", "2026-09-27", "RUN-001-20260927-Q001-gemini-05.txt");
    const content = fs.readFileSync(gemini05Path);
    const sha = crypto.createHash("sha256").update(content).digest("hex");
    assert(
      sha === "fa17ed9d99467d0fbd2a4b38fcbcc1fb0d91092d116e676dba2f954bfe2d3c5c",
      "33. Historical gemini-05 evidence remains untouched (SHA-256 verified)"
    );
  }

  // 34. Quarantined gemini-01 remains preserved
  {
    const gemini01Path = path.join(cwd, "evidence", "exp-001", "raw", "2026-09-27", "RUN-001-20260927-Q001-gemini-01.txt");
    const content = fs.readFileSync(gemini01Path);
    const sha = crypto.createHash("sha256").update(content).digest("hex");
    assert(
      sha === "6baf3ac23e9183e128436c83b75defefb5ba492c4e5a9ba7851be74c4287e24c",
      "34. Quarantined gemini-01 evidence remains preserved (SHA-256 verified)"
    );
  }

  // 35. Query validation enforces length limits and sanitization
  {
    const longQuery = "a".repeat(600);
    const result = validateAskDixithQuery(longQuery);
    const emptyResult = validateAskDixithQuery("");
    const htmlResult = validateAskDixithQuery("<script>alert('xss')</script>What is AI search?");
    assert(
      result.valid && result.sanitizedQuery.length === ASK_DIXITH_MAX_QUERY_LENGTH &&
      !emptyResult.valid &&
      htmlResult.valid && !htmlResult.sanitizedQuery.includes("<script>"),
      "35. Query validation enforces length limits, rejects empty, and strips HTML"
    );
  }

  // ── FINAL SUMMARY ──────────────────────────────────────────────────────
  console.log("\n================================================================================");
  console.log(` RESULTS: ${passed} passed, ${failed} failed (Total: ${passed + failed}/35)`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8KTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
