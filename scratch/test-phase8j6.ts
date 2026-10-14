/**
 * DIXITH Phase 8J.6 — Research Readiness & End-to-End Evidence Pipeline Audit Test Suite
 *
 * Verifies all 45 required assertions across 11 core categories:
 * - Research Corpus Integrity (1-5)
 * - Research Protocol Specification (6-10)
 * - Query Battery Registry (11-18)
 * - System Registry Integrity (19-21)
 * - Capture Harness & Runner Integrity (22-26)
 * - Evidence & Epistemological Model (27-32)
 * - Publication Gate & Content Eligibility (33-35)
 * - Knowledge Graph & Traversal Integrity (36-37)
 * - Search & Discovery Isolation (38-40)
 * - Historical Evidence Preservation (41-42)
 * - Experimental Reproducibility & Namespace Safety (43-45)
 *
 * STRICT CONSTRAINTS:
 * - Offline only: zero external APIs, zero browser launches, zero CDP connections.
 * - Historical evidence untouched.
 * - Quarantined evidence excluded.
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// Corpus and Entity Imports
import { getAllResearch, getResearchById } from "../data/research";
import { getAllExperiments, getExperimentById } from "../data/experiments";
import { getAllProfessionalExperiences, getProfessionalExperienceById } from "../data/professional-experience";
import { isIndexable, ContentStatus } from "../data/types";
import { resolveEntity, getRelatedContent } from "../lib/content-utils";

// Capture & Runner Integrity Imports
import {
  executeAssistedDryRun,
  executeAssistedLiveCapture,
  verifyNoArtifactCollision,
  verifyHistoricalFolderProtection,
  getResearchLocalDate,
  RESEARCH_LOCAL_TIMEZONE,
  COMPLETED_PHASE_FOLDERS,
} from "../lib/research/assisted-capture";

// Evidence & Publication Gate Imports
import {
  validateEvidencePack,
  validateEvidenceItem,
  validateFinding,
  validateInterpretation,
  validateQuarantineIsolation,
  isPublishableContent,
  EvidencePack,
  EvidenceItem,
  Finding,
  Interpretation,
} from "../lib/research/evidence-model";
import {
  validateResearchPublication,
  validateExperiencePublication,
  isPublicRetrievalEligible,
} from "../lib/research/publication-gate";

// Search Engine Imports
import { searchContent, buildSearchIndex } from "../lib/search";
import { hybridSearch } from "../lib/search/hybrid";
import { semanticSearch, LocalEmbeddingProvider, LocalVectorStore } from "../lib/semantic";

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

async function runPhase8J6TestSuite() {
  console.log("================================================================================");
  console.log(" DIXITH Phase 8J.6 — Research Readiness & End-to-End Pipeline Audit Suite");
  console.log("================================================================================\n");

  const cwd = process.cwd();

  // ----------------------------------------------------
  // SECTION 1: RESEARCH CORPUS INTEGRITY (Assertions 1-5)
  // ----------------------------------------------------
  console.log("[Category 1: Research Corpus Integrity]");

  // 1. EXP-012 resolves from research corpus
  const exp012 = getResearchById("EXP-012");
  assert(
    Boolean(exp012 && exp012.id === "EXP-012"),
    "1. EXP-012 resolves from research corpus"
  );

  // 2. EXP-013 resolves from research corpus
  const exp013 = getResearchById("EXP-013");
  assert(
    Boolean(exp013 && exp013.id === "EXP-013"),
    "2. EXP-013 resolves from research corpus"
  );

  // 3. EXP-014 resolves from research corpus
  const exp014 = getResearchById("EXP-014");
  assert(
    Boolean(exp014 && exp014.id === "EXP-014"),
    "3. EXP-014 resolves from research corpus"
  );

  // 4. EXP-001 resolves from experiments corpus
  const exp001 = getExperimentById("EXP-001");
  assert(
    Boolean(exp001 && exp001.id === "EXP-001"),
    "4. EXP-001 resolves from experiments corpus"
  );

  // 5. Research statuses unchanged: EXP-012..014 = IN_REVIEW, EXP-001 = ACTIVE
  const statusesUnchanged =
    exp012?.status === "IN_REVIEW" &&
    exp013?.status === "IN_REVIEW" &&
    exp014?.status === "IN_REVIEW" &&
    exp001?.status === "ACTIVE";
  assert(
    statusesUnchanged,
    "5. Research statuses unchanged: EXP-012..014 = IN_REVIEW, EXP-001 = ACTIVE"
  );

  // ----------------------------------------------------
  // SECTION 2: RESEARCH PROTOCOL SPECIFICATION (Assertions 6-10)
  // ----------------------------------------------------
  console.log("\n[Category 2: Research Protocol Specification]");

  const protocolPath = path.join(cwd, "docs", "exp-001-research-protocol.md");
  const protocolExists = fs.existsSync(protocolPath);
  const protocolContent = protocolExists ? fs.readFileSync(protocolPath, "utf-8") : "";

  // 6. Protocol doc exists on disk
  assert(
    protocolExists && protocolContent.length > 500,
    "6. Research protocol document exists on disk (docs/exp-001-research-protocol.md)"
  );

  // 7. Protocol identifies experiment EXP-001
  assert(
    protocolContent.includes("EXP-001") && protocolContent.includes("Same Question / Six Systems"),
    "7. Protocol explicitly identifies experiment EXP-001 (Same Question / Six Systems)"
  );

  // 8. Protocol identifies all 6 canonical systems
  const hasAll6SystemsInProtocol =
    protocolContent.includes("Google AI Overview") &&
    protocolContent.includes("ChatGPT") &&
    protocolContent.includes("Perplexity") &&
    protocolContent.includes("Claude") &&
    protocolContent.includes("Gemini") &&
    protocolContent.includes("Microsoft Copilot");
  assert(
    hasAll6SystemsInProtocol,
    "8. Protocol explicitly identifies all 6 canonical AI search systems"
  );

  // 9. Protocol identifies query categories
  const hasQueryCategories =
    protocolContent.includes("FACTUAL") &&
    protocolContent.includes("EXPLANATORY") &&
    protocolContent.includes("COMPARISON") &&
    protocolContent.includes("ENTITY") &&
    protocolContent.includes("TECHNICAL") &&
    protocolContent.includes("CURRENT INFORMATION");
  assert(
    hasQueryCategories,
    "9. Protocol explicitly identifies all 6 query categories"
  );

  // 10. Protocol defines 5-tier epistemological hierarchy
  const hasEpistemologicalHierarchy =
    protocolContent.includes("OBSERVATION") &&
    protocolContent.includes("MEASUREMENT") &&
    protocolContent.includes("FINDING") &&
    protocolContent.includes("INTERPRETATION") &&
    protocolContent.includes("LIMITATION");
  assert(
    hasEpistemologicalHierarchy,
    "10. Protocol defines 5-tier epistemological evidence hierarchy (Observation -> Measurement -> Finding -> Interpretation -> Limitation)"
  );

  // ----------------------------------------------------
  // SECTION 3: QUERY BATTERY REGISTRY (Assertions 11-18)
  // ----------------------------------------------------
  console.log("\n[Category 3: Query Battery Registry]");

  const queriesJsonPath = path.join(cwd, "evidence", "exp-001", "registry", "queries.json");
  const queriesJsonExists = fs.existsSync(queriesJsonPath);
  const queriesData = queriesJsonExists ? JSON.parse(fs.readFileSync(queriesJsonPath, "utf-8")) : null;
  const queriesList: any[] = queriesData?.queries || [];

  // 11. Query registry exists and contains exactly 96 queries
  assert(
    queriesJsonExists && queriesList.length === 96,
    `11. Query registry contains exactly 96 queries (found: ${queriesList.length})`
  );

  // 12. Exactly 6 query categories defined across battery
  const uniqueCategories = new Set(queriesList.map((q: any) => q.category));
  assert(
    uniqueCategories.size === 6,
    `12. Query battery defines exactly 6 distinct categories (found: ${uniqueCategories.size})`
  );

  // 13. Exactly 16 queries per category (16 * 6 = 96)
  const categoryCounts: Record<string, number> = {};
  for (const q of queriesList) {
    categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
  }
  const all16PerCategory =
    Object.keys(categoryCounts).length === 6 &&
    Object.values(categoryCounts).every((count) => count === 16);
  assert(
    all16PerCategory,
    "13. Query battery has exactly 16 queries per category across all 6 categories"
  );

  // 14. All 96 query IDs are unique
  const uniqueQueryIds = new Set(queriesList.map((q: any) => q.id));
  assert(
    uniqueQueryIds.size === 96,
    `14. All 96 query IDs are strictly unique (unique IDs: ${uniqueQueryIds.size})`
  );

  // 15. All 96 queries are associated with EXP-001
  const allExp001 = queriesList.every((q: any) => q.experimentId === "EXP-001");
  assert(
    allExp001,
    "15. All 96 queries are explicitly associated with experiment EXP-001"
  );

  // 16. All 96 queries target the 6 canonical systems
  const allTarget6Systems = queriesList.every(
    (q: any) =>
      Array.isArray(q.systems) &&
      q.systems.length === 6 &&
      q.systems.includes("Google AI Overview") &&
      q.systems.includes("ChatGPT") &&
      q.systems.includes("Perplexity") &&
      q.systems.includes("Claude") &&
      q.systems.includes("Gemini") &&
      q.systems.includes("Microsoft Copilot")
  );
  assert(
    allTarget6Systems,
    "16. All 96 queries explicitly target all 6 canonical systems"
  );

  // 17. Zero forbidden systems in query battery (e.g. You.com, SearchGPT, Phind, Genspark)
  const forbiddenSystems = ["You.com", "SearchGPT", "Phind", "Genspark"];
  const hasForbiddenInQueries = queriesList.some((q: any) =>
    Array.isArray(q.systems) && q.systems.some((s: string) => forbiddenSystems.includes(s))
  );
  assert(
    !hasForbiddenInQueries,
    "17. Zero prohibited systems present in query battery target definitions"
  );

  // 18. Zero duplicate query text strings in battery
  const uniqueQueryTexts = new Set(queriesList.map((q: any) => q.query.trim().toLowerCase()));
  assert(
    uniqueQueryTexts.size === 96,
    `18. Zero duplicate query text strings across the battery (unique texts: ${uniqueQueryTexts.size})`
  );

  // ----------------------------------------------------
  // SECTION 4: SYSTEM REGISTRY INTEGRITY (Assertions 19-21)
  // ----------------------------------------------------
  console.log("\n[Category 4: System Registry Integrity]");

  const systemsJsonPath = path.join(cwd, "evidence", "exp-001", "registry", "systems.json");
  const systemsJsonExists = fs.existsSync(systemsJsonPath);
  const systemsData = systemsJsonExists ? JSON.parse(fs.readFileSync(systemsJsonPath, "utf-8")) : null;
  const systemsList: any[] = systemsData?.systems || [];

  // 19. Systems registry exists and contains exactly 6 canonical systems
  const canonicalNames = [
    "Google AI Overview",
    "ChatGPT",
    "Perplexity",
    "Claude",
    "Gemini",
    "Microsoft Copilot",
  ];
  const registeredNames = systemsList.map((s: any) => s.name);
  const exactly6Canonical =
    systemsList.length === 6 &&
    canonicalNames.every((cn) => registeredNames.includes(cn));
  assert(
    systemsJsonExists && exactly6Canonical,
    `19. Systems registry exists and contains exactly 6 canonical systems (found: ${systemsList.length})`
  );

  // 20. Zero prohibited systems registered
  const hasForbiddenInSystems = systemsList.some((s: any) =>
    forbiddenSystems.includes(s.name) || forbiddenSystems.includes(s.id)
  );
  assert(
    !hasForbiddenInSystems,
    "20. Zero prohibited systems registered in systems.json"
  );

  // 21. All 6 system registry entries are valid with required fields
  const allEntriesValid = systemsList.every(
    (s: any) =>
      Boolean(s.id && s.id.startsWith("SYS-")) &&
      Boolean(s.name) &&
      Boolean(s.provider) &&
      Boolean(s.architectureType) &&
      Boolean(s.retrievalPipeline) &&
      Boolean(s.primaryCitationUi) &&
      Boolean(s.defaultSearchMode) &&
      Array.isArray(s.knownLimitations)
  );
  assert(
    allEntriesValid,
    "21. All 6 system registry entries are valid with required schema fields (id, name, provider, architectureType, retrievalPipeline, primaryCitationUi)"
  );

  // ----------------------------------------------------
  // SECTION 5: CAPTURE HARNESS & RUNNER INTEGRITY (Assertions 22-26)
  // ----------------------------------------------------
  console.log("\n[Category 5: Capture Harness & Runner Integrity]");

  // 22. Dry-run harness executes deterministically
  const dryRunPlan = executeAssistedDryRun({
    queryId: "Q-001",
    systemName: "Gemini",
    runNumber: 1,
    dateFolderOverride: "2026-09-28",
  });
  assert(
    Boolean(dryRunPlan.valid && dryRunPlan.isDryRun && dryRunPlan.runId === "RUN-001-20260928-Q001-gemini-01"),
    `22. Dry-run harness executes deterministically (runId: ${dryRunPlan.runId})`
  );

  // 23. Assisted capture harness returns valid configuration plan
  assert(
    Boolean(
      dryRunPlan.plannedPaths.relative.rawText &&
      dryRunPlan.plannedPaths.relative.domSnapshot &&
      dryRunPlan.plannedPaths.relative.screenshot &&
      dryRunPlan.plannedPaths.relative.runRecord
    ),
    "23. Assisted capture harness plans valid relative artifact paths"
  );

  // 24. Live capture mode strictly gated (throws without assistedLive: true)
  let liveGatedCaught = false;
  try {
    await executeAssistedLiveCapture({
      queryId: "Q-001",
      systemName: "Gemini",
      runNumber: 1,
      // assistedLive omitted / false
    } as any);
  } catch (err: any) {
    if (err.message.includes("[EXECUTION BLOCKED]")) {
      liveGatedCaught = true;
    }
  }
  assert(
    liveGatedCaught,
    "24. Live capture mode is strictly gated (fails closed without explicit assistedLive flag)"
  );

  // 25. Runner integrity requires explicit positive run number
  let missingRunNumCaught = false;
  try {
    await executeAssistedLiveCapture({
      queryId: "Q-001",
      systemName: "Gemini",
      assistedLive: true,
      cohort: "COHORT_A_LOGGED_OUT",
      accountClass: "LOGGED_OUT",
      subscriptionTier: "FREE",
      // runNumber deliberately omitted
    } as any);
  } catch (err: any) {
    if (err.message.includes("[SAFETY VIOLATION]") && err.message.includes("--run-number")) {
      missingRunNumCaught = true;
    }
  }
  assert(
    missingRunNumCaught,
    "25. Runner integrity requires explicit positive run number (fails closed if omitted)"
  );

  // 26. Collision protection rejects existing run IDs
  let collisionCaught = false;
  try {
    verifyNoArtifactCollision("RUN-001-20260927-Q001-gemini-05", "2026-09-27");
  } catch (err: any) {
    if (err.message.includes("[COLLISION REFUSAL]")) {
      collisionCaught = true;
    }
  }
  assert(
    collisionCaught,
    "26. Collision protection rejects existing run IDs (throws [COLLISION REFUSAL])"
  );

  // ----------------------------------------------------
  // SECTION 6: EVIDENCE & EPISTEMOLOGICAL MODEL (Assertions 27-32)
  // ----------------------------------------------------
  console.log("\n[Category 6: Evidence & Epistemological Model]");

  // 27. EvidencePack validator exists and validates schema
  const mockPack: EvidencePack = {
    id: "EVP-TEST-001",
    title: "Test Evidence Pack",
    experimentId: "EXP-001",
    evidenceItems: [
      {
        id: "EVD-TEST-001",
        runId: "RUN-TEST-001",
        experimentId: "EXP-001",
        system: "Gemini",
        queryId: "Q-001",
        status: "VERIFIED",
        sha256Hash: "a".repeat(64),
        capturedAt: "2026-09-28T00:00:00.000Z",
        provenance: { hasUnderlyingEvidence: true },
      },
    ],
    observations: [],
    measurements: [],
    findings: [],
    interpretations: [],
    limitations: [],
    citations: [],
    verificationStatus: "EVIDENCE_COMPLETE",
    metadata: {
      totalRunsEvaluated: 1,
      systemsCovered: ["Gemini"],
      quarantinedArtifactsExcluded: 0,
      compiledAt: "2026-09-28T00:00:00.000Z",
    },
  };
  const packValidation = validateEvidencePack(mockPack);
  assert(
    packValidation.valid && packValidation.complete,
    "27. EvidencePack validator exists and validates schema completeness"
  );

  // 28. Quarantined evidence rejected by validation
  const quarantinedItem: EvidenceItem = {
    ...mockPack.evidenceItems[0],
    id: "EVD-QUARANTINED-001",
    status: "QUARANTINED",
    quarantineReason: "Account cohort mismatch",
  };
  const quarantineCheck = validateQuarantineIsolation(quarantinedItem);
  assert(
    !quarantineCheck.valid && quarantineCheck.errors.some((e) => e.includes("QUARANTINED")),
    "28. Quarantined evidence is rejected by quarantine isolation validation"
  );

  // 29. Invalid evidence rejected by validation
  const invalidItem: EvidenceItem = {
    ...mockPack.evidenceItems[0],
    id: "EVD-INVALID-001",
    status: "INVALID",
  };
  const invalidCheck = validateQuarantineIsolation(invalidItem);
  assert(
    !invalidCheck.valid && invalidCheck.errors.some((e) => e.includes("INVALID")),
    "29. Invalid evidence is rejected by quarantine isolation validation"
  );

  // 30. Missing provenance rejected for empirical findings
  const ungroundedFinding: Finding = {
    id: "FND-TEST-001",
    statement: "Engines show 50% citation divergence",
    supportingObservationIds: [],
    supportingMeasurementIds: [],
    supportingEvidenceIds: [],
    confidence: "HIGH",
    hasSufficientEvidence: false,
    provenance: { hasUnderlyingEvidence: false },
  };
  const findingCheck = validateFinding(ungroundedFinding);
  assert(
    !findingCheck.valid && findingCheck.errors.some((e) => e.includes("fails empirical grounding")),
    "30. Missing provenance and empty supporting evidence rejected for findings"
  );

  // 31. External citation cannot become empirical evidence
  // A finding must reference physical evidence items (supportingEvidenceIds) with hasSufficientEvidence = true
  const findingWithCitationOnly: Finding = {
    id: "FND-TEST-002",
    statement: "RFC 9110 specifies HTTP 301",
    supportingObservationIds: ["OBS-001"],
    supportingMeasurementIds: [],
    supportingEvidenceIds: [], // missing physical capture evidence
    confidence: "HIGH",
    hasSufficientEvidence: true,
    provenance: { hasUnderlyingEvidence: false, absenceReason: "Citing external RFC" },
  };
  const citationOnlyCheck = validateFinding(findingWithCitationOnly);
  assert(
    !citationOnlyCheck.valid && citationOnlyCheck.errors.some((e) => e.includes("fails empirical grounding")),
    "31. External citation cannot substitute for primary empirical evidence in findings"
  );

  // 32. Interpretation requires underlying validated Finding
  const orphanedInterpretation: Interpretation = {
    id: "INT-TEST-001",
    findingId: "NON-EXISTENT-FND",
    hypothesis: "Algorithmic bias in retrieval",
    reasoning: "Search engines favor direct schemas",
    theoreticalImplications: ["GEO impact"],
    provenance: { hasUnderlyingEvidence: false },
  };
  const interpCheck = validateInterpretation(orphanedInterpretation, []);
  assert(
    !interpCheck.valid && interpCheck.errors.some((e) => e.includes("points to non-existent Finding")),
    "32. Interpretation requires an existing, validated Finding"
  );

  // ----------------------------------------------------
  // SECTION 7: PUBLICATION GATE & CONTENT ELIGIBILITY (Assertions 33-35)
  // ----------------------------------------------------
  console.log("\n[Category 7: Publication Gate & Content Eligibility]");

  // 33. Unpublished research is blocked from publication gate
  const exp014PubCheck = validateResearchPublication(exp014!);
  assert(
    !exp014PubCheck.eligible && exp014PubCheck.blockers.some((b) => b.includes("EvidencePack")),
    "33. Unpublished research (EXP-014) is blocked from publication gate due to missing EvidencePack"
  );

  // 34. Published PE entities remain eligible
  const pe001 = getProfessionalExperienceById("PE-001");
  const pe001PubCheck = validateExperiencePublication(pe001!);
  assert(
    pe001PubCheck.eligible && isIndexable(pe001!.status),
    "34. Published Professional Experience (PE-001) remains eligible for publication and retrieval"
  );

  // 35. Publication gate is fail-closed
  const draftGateCheck = isPublishableContent("DRAFT");
  const inReviewGateCheck = isPublishableContent("IN_REVIEW");
  const evidenceReadyGateCheck = isPublishableContent("EVIDENCE_READY");
  assert(
    !draftGateCheck.publishable &&
    !inReviewGateCheck.publishable &&
    !evidenceReadyGateCheck.publishable,
    "35. Publication gate is fail-closed: DRAFT, IN_REVIEW, and EVIDENCE_READY are not publishable"
  );

  // ----------------------------------------------------
  // SECTION 8: KNOWLEDGE GRAPH & TRAVERSAL INTEGRITY (Assertions 36-37)
  // ----------------------------------------------------
  console.log("\n[Category 8: Knowledge Graph & Traversal Integrity]");

  // 36. Research relations resolve in content graph
  const exp001RelatedAll = getRelatedContent("experiment", "EXP-001");
  const resolvesRelations =
    exp001RelatedAll.length > 0 &&
    exp001RelatedAll.some((r) => r.targetId === "EXP-012" || r.targetId === "EXP-013" || r.targetId === "EXP-014");
  assert(
    resolvesRelations,
    `36. Research relations resolve in content graph (EXP-001 connects to ${exp001RelatedAll.map((r) => r.targetId).join(", ")})`
  );

  // 37. Public graph filtering excludes unpublished research/experiments
  const exp001RelatedPublic = getRelatedContent("experiment", "EXP-001", { publicOnly: true });
  assert(
    exp001RelatedPublic.length === 0,
    "37. Public graph filtering strictly excludes unpublished research entities (EXP-012..014 are IN_REVIEW)"
  );

  // ----------------------------------------------------
  // SECTION 9: SEARCH & DISCOVERY ISOLATION (Assertions 38-40)
  // ----------------------------------------------------
  console.log("\n[Category 9: Search & Discovery Isolation]");

  const provider = new LocalEmbeddingProvider();
  const store = new LocalVectorStore();
  await store.load();

  // 38. Unpublished research excluded from lexical search
  const lexResults = searchContent("Citation Patterns Across AI Search Systems");
  const hasUnpublishedLex = lexResults.some(
    (r) => r.id === "EXP-012" || r.id === "EXP-013" || r.id === "EXP-014" || r.id === "EXP-001"
  );
  assert(
    !hasUnpublishedLex,
    "38. Unpublished research is strictly excluded from lexical search results"
  );

  // 39. Unpublished research excluded from semantic search
  const semResponse = await semanticSearch("Citation Patterns Across AI Search Systems", {
    provider,
    store,
  });
  const hasUnpublishedSem = semResponse.results.some(
    (r) =>
      r.entityId === "EXP-012" ||
      r.entityId === "EXP-013" ||
      r.entityId === "EXP-014" ||
      r.entityId === "EXP-001"
  );
  assert(
    !hasUnpublishedSem,
    "39. Unpublished research is strictly excluded from semantic search results"
  );

  // 40. Unpublished research excluded from hybrid search
  const hybResponse = await hybridSearch("Citation Patterns Across AI Search Systems", {
    provider,
    store,
  });
  const hasUnpublishedHyb = hybResponse.results.some(
    (r) =>
      r.entityId === "EXP-012" ||
      r.entityId === "EXP-013" ||
      r.entityId === "EXP-014" ||
      r.entityId === "EXP-001"
  );
  assert(
    !hasUnpublishedHyb,
    "40. Unpublished research is strictly excluded from hybrid search results"
  );

  // ----------------------------------------------------
  // SECTION 10: HISTORICAL EVIDENCE PRESERVATION (Assertions 41-42)
  // ----------------------------------------------------
  console.log("\n[Category 10: Historical Evidence Preservation]");

  // 41. Historical gemini-05 raw text artifact SHA-256 matches expected
  const gemini05TxtPath = path.join(
    cwd,
    "evidence",
    "exp-001",
    "raw",
    "2026-09-27",
    "RUN-001-20260927-Q001-gemini-05.txt"
  );
  let gemini05Sha = "";
  if (fs.existsSync(gemini05TxtPath)) {
    const content = fs.readFileSync(gemini05TxtPath);
    gemini05Sha = crypto.createHash("sha256").update(content).digest("hex");
  }
  const expectedGemini05Sha = "fa17ed9d99467d0fbd2a4b38fcbcc1fb0d91092d116e676dba2f954bfe2d3c5c";
  assert(
    gemini05Sha === expectedGemini05Sha,
    `41. Historical gemini-05 raw text artifact SHA-256 matches expected (${expectedGemini05Sha.slice(0, 16)}...)`
  );

  // 42. Quarantined gemini-01 incident artifact exists on disk and remains quarantined
  const gemini01TxtPath = path.join(
    cwd,
    "evidence",
    "exp-001",
    "raw",
    "2026-09-27",
    "RUN-001-20260927-Q001-gemini-01.txt"
  );
  let gemini01Sha = "";
  if (fs.existsSync(gemini01TxtPath)) {
    const content = fs.readFileSync(gemini01TxtPath);
    gemini01Sha = crypto.createHash("sha256").update(content).digest("hex");
  }
  const expectedGemini01Sha = "6baf3ac23e9183e128436c83b75defefb5ba492c4e5a9ba7851be74c4287e24c";
  assert(
    gemini01Sha === expectedGemini01Sha,
    `42. Quarantined gemini-01 incident artifact exists on disk and preserved (${expectedGemini01Sha.slice(0, 16)}...)`
  );

  // ----------------------------------------------------
  // SECTION 11: EXPERIMENTAL REPRODUCIBILITY & NAMESPACE SAFETY (Assertions 43-45)
  // ----------------------------------------------------
  console.log("\n[Category 11: Experimental Reproducibility & Namespace Safety]");

  // 43. Deterministic run IDs generated from timestamp/date, query ID, system slug, and run number
  const sampleDry = executeAssistedDryRun({
    queryId: "Q-001",
    systemName: "ChatGPT",
    runNumber: 2,
    dateFolderOverride: "2026-09-28",
  });
  assert(
    sampleDry.runId === "RUN-001-20260928-Q001-chatgpt-02",
    `43. Deterministic run IDs generated correctly (${sampleDry.runId})`
  );

  // 44. Deterministic artifact naming follows convention
  const planned = sampleDry.plannedPaths.relative;
  const artifactNamingValid =
    planned.rawText.endsWith(".txt") &&
    planned.domSnapshot.endsWith(".html") &&
    planned.screenshot.endsWith(".png") &&
    planned.runRecord.endsWith(".json") &&
    planned.rawText.includes(sampleDry.runId);
  assert(
    artifactNamingValid,
    "44. Deterministic artifact naming follows RUN-001-<date>-<qid>-<sys>-<run>.<ext> convention"
  );

  // 45. Historical evidence folders are strictly protected from modification or write
  let historicalFolderBlockCaught = false;
  try {
    verifyHistoricalFolderProtection("2026-09-27", false);
  } catch (err: any) {
    if (err.message.includes("[HISTORICAL PROTECTION]")) {
      historicalFolderBlockCaught = true;
    }
  }
  assert(
    historicalFolderBlockCaught && COMPLETED_PHASE_FOLDERS.includes("2026-09-27"),
    "45. Historical evidence folders (2026-09-24, 2026-09-27) are strictly protected against modification"
  );

  // ----------------------------------------------------
  // FINAL SUMMARY
  // ----------------------------------------------------
  console.log("\n================================================================================");
  console.log(` RESULTS: ${passed} passed, ${failed} failed (Total: ${passed + failed}/45)`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8J6TestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
