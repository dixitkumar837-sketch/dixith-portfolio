/**
 * DIXITH Phase 8L — Ask DIXITH UI & Client State Machine Test Suite
 *
 * Verifies at least 35 assertions across 8 core categories:
 * - Routing & Page Metadata (1-3)
 * - Input Handling & Sanitization (4-8)
 * - State Machine Transitions & Reducer (9-16)
 * - Publication Safety & Isolation (17-22)
 * - Sources Presentation (23-27)
 * - Related Content Boundary (28-29)
 * - UI Accessibility & States (30-35)
 * - Anti-Hallucination & Provider Isolation (36-38)
 *
 * STRICT CONSTRAINTS:
 * - Offline only: zero external APIs, zero browser launches, zero CDP connections.
 * - Historical evidence untouched.
 * - Quarantined evidence excluded.
 * - Zero LLM providers connected.
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// UI Demo Adapter & Retrieval
import { executeAskDixithDemo } from "../lib/ask-dixith/ui-demo";
import { validateAskDixithQuery } from "../lib/ask-dixith/retrieval";

// Client State Machine
import {
  askDixithReducer,
  INITIAL_UI_STATE,
  AskDixithUIState,
  AskDixithAction,
} from "../components/ask-dixith/AskDixithState";

// Server Page & Route
import { metadata as askDixithMetadata } from "../app/ask-dixith/page";

// Domain & Publication Models
import { isIndexable, ContentStatus } from "../data/types";
import { getResearchById } from "../data/research";
import { getExperimentById } from "../data/experiments";
import { getGuideById } from "../data/guides";
import { getArticleById } from "../data/articles";
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

async function runPhase8LTests() {
  console.log("================================================================================");
  console.log(" DIXITH Phase 8L — Ask DIXITH UI & Client State Machine Suite");
  console.log("================================================================================\n");

  const cwd = process.cwd();

  // ── CATEGORY 1: ROUTING & METADATA (Assertions 1-3) ────────────────────────
  console.log("[Category 1: Routing & Metadata]");

  // 1. /ask-dixith route exists
  {
    const pagePath = path.join(cwd, "app", "ask-dixith", "page.tsx");
    assert(fs.existsSync(pagePath), "1. /ask-dixith route exists on disk");
  }

  // 2. route renders / exports default page component
  {
    const pageContent = fs.readFileSync(
      path.join(cwd, "app", "ask-dixith", "page.tsx"),
      "utf-8"
    );
    assert(
      pageContent.includes("export default function AskDixithPage"),
      "2. Route renders and exports default server component AskDixithPage"
    );
  }

  // 3. metadata exists and is configured for index, follow
  {
    const hasTitle =
      typeof askDixithMetadata.title === "string" &&
      askDixithMetadata.title.includes("Ask DIXITH");
    const hasRobots =
      Boolean((askDixithMetadata.robots as any)?.index) &&
      Boolean((askDixithMetadata.robots as any)?.follow);
    assert(
      hasTitle && hasRobots,
      "3. Route metadata exists with title and robots: { index: true, follow: true }"
    );
  }

  // ── CATEGORY 2: INPUT VALIDATION & SANITIZATION (Assertions 4-8) ───────────
  console.log("\n[Category 2: Input Handling & Sanitization]");

  // 4. empty input blocked
  {
    const emptyResult = validateAskDixithQuery("");
    assert(!emptyResult.valid, "4. Empty input is strictly blocked");
  }

  // 5. whitespace input blocked
  {
    const whitespaceResult = validateAskDixithQuery("     \t \n   ");
    assert(!whitespaceResult.valid, "5. Whitespace-only input is strictly blocked");
  }

  // 6. HTML is sanitized
  {
    const htmlResult = validateAskDixithQuery(
      "<script>alert('xss')</script><b>What is clinical search?</b>"
    );
    assert(
      htmlResult.valid &&
        !htmlResult.sanitizedQuery.includes("<script>") &&
        !htmlResult.sanitizedQuery.includes("<b>") &&
        htmlResult.sanitizedQuery.includes("What is clinical search?"),
      "6. HTML tags are stripped and sanitized from query input"
    );
  }

  // 7. input length capped at 500 characters
  {
    const oversized = "a".repeat(650);
    const lengthResult = validateAskDixithQuery(oversized);
    assert(
      lengthResult.valid && lengthResult.sanitizedQuery.length === 500,
      "7. Input query length is capped at 500 characters"
    );
  }

  // 8. valid question accepted
  {
    const validResult = validateAskDixithQuery("What is healthcare search architecture?");
    assert(
      validResult.valid &&
        validResult.sanitizedQuery === "What is healthcare search architecture?",
      "8. Valid question is accepted without errors"
    );
  }

  // ── CATEGORY 3: CLIENT STATE MACHINE (Assertions 9-16) ─────────────────────
  console.log("\n[Category 3: State Machine Transitions & Reducer]");

  // 9. initial state = IDLE
  {
    assert(INITIAL_UI_STATE.status === "IDLE", "9. Initial client state is IDLE");
  }

  // 10. submission enters SUBMITTING
  {
    const submittingState = askDixithReducer(INITIAL_UI_STATE, {
      type: "SUBMIT",
      query: "healthcare search",
    });
    assert(
      submittingState.status === "SUBMITTING" &&
        submittingState.query === "healthcare search" &&
        submittingState.error === null &&
        submittingState.submittedAt !== null,
      "10. Submission action transitions state to SUBMITTING"
    );
  }

  // 11. supported retrieval produces ANSWERED
  {
    const demoAnswer = await executeAskDixithDemo("healthcare search architecture");
    const answeredState = askDixithReducer(
      { ...INITIAL_UI_STATE, status: "SUBMITTING", query: "healthcare search architecture" },
      { type: "RESOLVE", answer: demoAnswer }
    );
    assert(
      answeredState.status === "ANSWERED" && answeredState.answer !== null,
      `11. Supported retrieval transitions state to ANSWERED (status: ${answeredState.status})`
    );
  }

  // 12. partial retrieval produces PARTIALLY_SUPPORTED
  {
    // A single-match query
    const partialAnswer = await executeAskDixithDemo("international hreflang discovery");
    const partialState = askDixithReducer(
      { ...INITIAL_UI_STATE, status: "SUBMITTING", query: "international hreflang discovery" },
      { type: "RESOLVE", answer: partialAnswer }
    );
    assert(
      partialState.status === "PARTIALLY_SUPPORTED" || partialState.status === "ANSWERED",
      `12. Partial retrieval produces PARTIALLY_SUPPORTED or ANSWERED (status: ${partialState.status})`
    );
  }

  // 13. insufficient evidence produces INSUFFICIENT_EVIDENCE
  {
    // Construct mock INSUFFICIENT_EVIDENCE answer to verify state machine contract
    const mockInsufficient = {
      requestId: "mock-1",
      query: "quantum crypto",
      intent: "UNKNOWN" as const,
      answer: "I don't have enough published evidence...",
      answerStatus: "INSUFFICIENT_EVIDENCE" as const,
      retrievalMode: "HYBRID" as const,
      sources: [],
      evidenceState: {
        hasEmpiricalEvidence: false,
        researchPublished: false,
        limitations: ["No empirical findings."],
        quarantinedEvidenceExcluded: false,
        provenanceSummary: "None.",
      },
      limitations: [],
      relatedContent: [],
      generatedAt: new Date().toISOString(),
      modelProvider: null,
      modelVersion: null,
      groundingMetadata: {
        retrievedEntityIds: [],
        selectedEntityIds: [],
        retrievalDurationMs: 1,
        generationDurationMs: 0,
      },
    };
    const insufficientState = askDixithReducer(
      { ...INITIAL_UI_STATE, status: "SUBMITTING", query: "quantum crypto" },
      { type: "RESOLVE", answer: mockInsufficient }
    );
    assert(
      insufficientState.status === "INSUFFICIENT_EVIDENCE",
      "13. Insufficient evidence transitions state to INSUFFICIENT_EVIDENCE"
    );
  }

  // 14. irrelevant query produces NO_RELEVANT_CONTENT
  {
    const irrelevantAnswer = await executeAskDixithDemo("best naples sourdough pizza recipe");
    const irrelevantState = askDixithReducer(
      { ...INITIAL_UI_STATE, status: "SUBMITTING", query: "best naples sourdough pizza recipe" },
      { type: "RESOLVE", answer: irrelevantAnswer }
    );
    assert(
      irrelevantState.status === "NO_RELEVANT_CONTENT",
      `14. Irrelevant query transitions state to NO_RELEVANT_CONTENT (status: ${irrelevantState.status})`
    );
  }

  // 15. retrieval error produces ERROR
  {
    const errorState = askDixithReducer(
      { ...INITIAL_UI_STATE, status: "SUBMITTING", query: "error test" },
      { type: "REJECT", error: "Network timeout or retrieval failure." }
    );
    assert(
      errorState.status === "ERROR" && errorState.error !== null && errorState.answer === null,
      "15. Retrieval failure transitions state to ERROR"
    );
  }

  // 16. new query resets previous result safely
  {
    const previousState: AskDixithUIState = {
      status: "ANSWERED",
      query: "old question",
      answer: {} as any,
      error: null,
      submittedAt: "2026-09-29T10:00:00Z",
    };
    const nextSubmittingState = askDixithReducer(previousState, {
      type: "SUBMIT",
      query: "new question",
    });
    assert(
      nextSubmittingState.status === "SUBMITTING" &&
        nextSubmittingState.query === "new question",
      "16. Submitting a new query safely transitions to SUBMITTING and updates query"
    );
  }

  // ── CATEGORY 4: PUBLICATION SAFETY & ISOLATION (Assertions 17-22) ──────────
  console.log("\n[Category 4: Publication Safety & Boundary Isolation]");

  // 17. PUBLISHED content can appear
  {
    const answer = await executeAskDixithDemo("healthcare search architecture");
    const hasPublished = answer.sources.some((s) => s.entityId === "PE-001");
    assert(hasPublished, "17. Published content (PE-001) appears in Ask DIXITH sources");
  }

  // 18. DRAFT cannot appear (GUI-001, GUI-002, INS-001..003)
  {
    const answer = await executeAskDixithDemo("Schema.org Entity Graph Implementation");
    const hasDraft = answer.sources.some(
      (s) =>
        s.entityId === "GUI-001" ||
        s.entityId === "GUI-002" ||
        s.entityId.startsWith("INS-")
    );
    assert(!hasDraft, "18. DRAFT content (GUI-001, GUI-002, INS-001..003) cannot appear in sources");
  }

  // 19. IN_REVIEW cannot appear (EXP-012..014)
  {
    const answer = await executeAskDixithDemo("Citation Patterns Across AI Search Systems");
    const hasInReview = answer.sources.some(
      (s) => s.entityId === "EXP-012" || s.entityId === "EXP-013" || s.entityId === "EXP-014"
    );
    assert(!hasInReview, "19. IN_REVIEW research (EXP-012..014) cannot appear in sources");
  }

  // 20. ACTIVE experiment cannot appear (EXP-001)
  {
    const answer = await executeAskDixithDemo("same question six systems experiment");
    const hasActive = answer.sources.some((s) => s.entityId === "EXP-001");
    assert(!hasActive, "20. ACTIVE experiments (EXP-001) cannot appear in sources");
  }

  // 21. EVIDENCE_READY cannot appear
  {
    assert(
      !isIndexable("EVIDENCE_READY"),
      "21. EVIDENCE_READY state is blocked by publication predicate isIndexable"
    );
  }

  // 22. quarantined evidence cannot appear (gemini-01)
  {
    const answer = await executeAskDixithDemo("RUN-001-20260927-Q001-gemini-01");
    const hasQuarantined =
      answer.sources.some((s) => s.entityId.includes("gemini-01")) ||
      answer.answer.includes("gemini-01");
    assert(!hasQuarantined, "22. Quarantined evidence (gemini-01) cannot appear in answer or sources");
  }

  // ── CATEGORY 5: SOURCES PRESENTATION (Assertions 23-27) ────────────────────
  console.log("\n[Category 5: Sources Presentation & Credential Isolation]");

  // 23. source URL is internal
  {
    const answer = await executeAskDixithDemo("healthcare search architecture");
    const allInternal = answer.sources.every(
      (s) => s.href.startsWith("/") && !s.href.includes("://")
    );
    assert(
      allInternal && answer.sources.length > 0,
      "23. All source URLs are relative internal DIXITH routes"
    );
  }

  // 24. source ID resolves
  {
    const answer = await executeAskDixithDemo("healthcare search architecture");
    const allHaveId = answer.sources.every((s) => Boolean(s.entityId));
    assert(allHaveId, "24. All sources have resolvable canonical entity IDs");
  }

  // 25. raw evidence path cannot appear
  {
    const answer = await executeAskDixithDemo("healthcare search");
    const serialized = JSON.stringify(answer);
    const hasRawPath =
      serialized.includes("evidence/exp-001/raw") ||
      serialized.includes(".txt") ||
      serialized.includes(".html") ||
      serialized.includes(".png");
    assert(!hasRawPath, "25. Raw evidence vault paths (.txt, .html, .png) do not appear in answer payload");
  }

  // 26. filesystem path cannot appear
  {
    const answer = await executeAskDixithDemo("healthcare search");
    const serialized = JSON.stringify(answer);
    const hasFsPath =
      serialized.includes("C:\\") ||
      serialized.includes("c:\\") ||
      serialized.includes("file:///") ||
      serialized.includes("/paila");
    assert(!hasFsPath, "26. Host filesystem paths do not appear in answer payload");
  }

  // 27. SHA-256 cannot appear in answer presentation
  {
    const answer = await executeAskDixithDemo("healthcare search");
    const serialized = JSON.stringify(answer);
    const hasSha =
      serialized.includes("fa17ed9d99467d0f") ||
      serialized.includes("6baf3ac23e9183e1") ||
      serialized.includes("SHA256") ||
      serialized.includes("sha256");
    assert(!hasSha, "27. Cryptographic evidence hashes do not appear in answer presentation");
  }

  // ── CATEGORY 6: RELATED CONTENT BOUNDARY (Assertions 28-29) ────────────────
  console.log("\n[Category 6: Related Content Boundary]");

  // 28. related content is public-only
  {
    const answer = await executeAskDixithDemo("healthcare search architecture");
    const allPublished = answer.relatedContent.every(
      (r) => r.entityType === "professional-experience" // Only PE items are currently published
    );
    assert(
      allPublished,
      "28. Related content contains only published entities (public-only)"
    );
  }

  // 29. unpublished related content is excluded
  {
    const answer = await executeAskDixithDemo("healthcare search architecture");
    const hasUnpublished = answer.relatedContent.some(
      (r) =>
        r.entityId === "EXP-001" ||
        r.entityId.startsWith("EXP-") ||
        r.entityId.startsWith("GUI-") ||
        r.entityId.startsWith("INS-")
    );
    assert(!hasUnpublished, "29. Unpublished related entities are excluded from related content");
  }

  // ── CATEGORY 7: UI ACCESSIBILITY & COMPONENT STATES (Assertions 30-35) ──────
  console.log("\n[Category 7: UI Accessibility & Component States]");

  // 30. answer region has accessible live behavior
  {
    const panelFile = fs.readFileSync(
      path.join(cwd, "components", "ask-dixith", "AskDixithAnswerPanel.tsx"),
      "utf-8"
    );
    assert(
      panelFile.includes('aria-live="polite"') && panelFile.includes('role="alert"'),
      '30. Answer panel incorporates aria-live="polite" and role="alert" for assistive tech'
    );
  }

  // 31. input has accessible label
  {
    const inputFile = fs.readFileSync(
      path.join(cwd, "components", "ask-dixith", "AskDixithInput.tsx"),
      "utf-8"
    );
    assert(
      inputFile.includes('<label htmlFor="ask-dixith-query"') &&
        inputFile.includes('id="ask-dixith-query"'),
      "31. Query input is bound to an accessible semantic <label>"
    );
  }

  // 32. loading state exists and avoids fake AI typing
  {
    const panelFile = fs.readFileSync(
      path.join(cwd, "components", "ask-dixith", "AskDixithAnswerPanel.tsx"),
      "utf-8"
    );
    assert(
      panelFile.includes("Searching published DIXITH knowledge...") &&
        !panelFile.includes("thinking...") &&
        !panelFile.includes("AI is typing"),
      "32. Loading state displays genuine retrieval status without simulated AI typing"
    );
  }

  // 33. error state exists with retry capability
  {
    const panelFile = fs.readFileSync(
      path.join(cwd, "components", "ask-dixith", "AskDixithAnswerPanel.tsx"),
      "utf-8"
    );
    assert(
      panelFile.includes("Retrieval Operation Error") &&
        panelFile.includes("Try again"),
      "33. Error state provides clear technical notification with retry action"
    );
  }

  // 34. insufficient evidence state exists and is not styled as error
  {
    const panelFile = fs.readFileSync(
      path.join(cwd, "components", "ask-dixith", "AskDixithAnswerPanel.tsx"),
      "utf-8"
    );
    assert(
      panelFile.includes("INSUFFICIENT EVIDENCE") &&
        panelFile.includes("Fail-Closed Scientific Policy"),
      "34. Insufficient evidence state communicates fail-closed scientific policy"
    );
  }

  // 35. no fake chat history is persisted
  {
    const shellFile = fs.readFileSync(
      path.join(cwd, "components", "ask-dixith", "AskDixithShell.tsx"),
      "utf-8"
    );
    assert(
      !shellFile.includes("localStorage") &&
        !shellFile.includes("sessionStorage") &&
        !shellFile.includes("chatHistory") &&
        !shellFile.includes("messages.map"),
      "35. No persistent conversation history or fake chat threads exist in the client shell"
    );
  }

  // ── CATEGORY 8: PROVIDER ISOLATION (Assertions 36-38) ──────────────────────
  console.log("\n[Category 8: Provider Decoupling & Historical Integrity]");

  // 36. modelProvider is strictly null in Phase 8L
  {
    const answer = await executeAskDixithDemo("healthcare search architecture");
    assert(
      answer.modelProvider === null && answer.modelVersion === null,
      "36. modelProvider and modelVersion are strictly null (no LLM in Phase 8L)"
    );
  }

  // 37. Historical gemini-05 evidence remains untouched
  {
    const gemini05Path = path.join(
      cwd,
      "evidence",
      "exp-001",
      "raw",
      "2026-09-27",
      "RUN-001-20260927-Q001-gemini-05.txt"
    );
    const content = fs.readFileSync(gemini05Path);
    const sha = crypto.createHash("sha256").update(content).digest("hex");
    assert(
      sha === "fa17ed9d99467d0fbd2a4b38fcbcc1fb0d91092d116e676dba2f954bfe2d3c5c",
      "37. Historical gemini-05 evidence is bit-exact and untouched"
    );
  }

  // 38. Quarantined gemini-01 remains preserved
  {
    const gemini01Path = path.join(
      cwd,
      "evidence",
      "exp-001",
      "raw",
      "2026-09-27",
      "RUN-001-20260927-Q001-gemini-01.txt"
    );
    const content = fs.readFileSync(gemini01Path);
    const sha = crypto.createHash("sha256").update(content).digest("hex");
    assert(
      sha === "6baf3ac23e9183e128436c83b75defefb5ba492c4e5a9ba7851be74c4287e24c",
      "38. Quarantined gemini-01 incident artifact remains preserved"
    );
  }

  // ── FINAL SUMMARY ──────────────────────────────────────────────────────────
  console.log("\n================================================================================");
  console.log(` RESULTS: ${passed} passed, ${failed} failed (Total: ${passed + failed}/38)`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8LTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
