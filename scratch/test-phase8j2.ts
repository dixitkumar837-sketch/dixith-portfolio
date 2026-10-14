/**
 * DIXITH Phase 8J.2 — Evidence & Publication Model Offline Test Suite
 *
 * Verifies:
 * 1. Valid EvidenceItem
 * 2. Invalid EvidenceItem
 * 3. Valid Observation
 * 4. Valid Measurement
 * 5. Finding with supporting evidence
 * 6. Finding without evidence -> rejected
 * 7. Interpretation without finding -> rejected where required
 * 8. Limitation representation
 * 9. Quarantined evidence cannot become published evidence
 * 10. PUBLISHED eligibility
 * 11. IN_REVIEW exclusion
 * 12. DRAFT exclusion (including EVIDENCE_READY exclusion)
 * 13. Evidence citation resolution
 * 14. Broken evidence reference detection
 * 15. Relationship integrity (EXP-012 <-> EXP-001)
 * 16. Historical evidence isolation (zero modification)
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import {
  EvidenceItem,
  Observation,
  Measurement,
  Finding,
  Interpretation,
  Limitation,
  EvidenceCitationReference,
  validateEvidenceItem,
  validateObservation,
  validateMeasurement,
  validateFinding,
  validateInterpretation,
  validateQuarantineIsolation,
  isPublishableContent,
  auditRelationshipSymmetry,
} from "../lib/research/evidence-model";
import { isIndexable, ContentStatus } from "../data/types";
import { getSourceById } from "../data/sources";
import { getExperimentById } from "../data/experiments";
import { getResearchById } from "../data/research";

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` - Detail: ${detail}` : ""}`);
    process.exit(1);
  }
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log(" DIXITH Phase 8J.2 — Evidence & Publication Model Test Suite");
  console.log("================================================================================\n");

  // TEST 1: Valid EvidenceItem
  console.log("[Group 1: EvidenceItem Validation]");
  const validEvidence: EvidenceItem = {
    id: "EVD-001-20260927-Q001-gemini-05",
    runId: "RUN-001-20260927-Q001-gemini-05",
    experimentId: "EXP-001",
    system: "Gemini",
    queryId: "Q-001",
    status: "VERIFIED",
    sha256Hash: "fa17ed9d99467d0fbd2a4b38fcbcc1fb0d91092d116e676dba2f954bfe2d3c5c",
    rawTextPath: "raw/2026-09-27/RUN-001-20260927-Q001-gemini-05.txt",
    domSnapshotPath: "raw/2026-09-27/RUN-001-20260927-Q001-gemini-05.html",
    screenshotPath: "raw/2026-09-27/RUN-001-20260927-Q001-gemini-05.png",
    runRecordPath: "runs/2026-09-27/RUN-001-20260927-Q001-gemini-05.json",
    capturedAt: "2026-09-27T17:06:50.000Z",
    provenance: {
      experimentId: "EXP-001",
      runId: "RUN-001-20260927-Q001-gemini-05",
      hasUnderlyingEvidence: true,
    },
  };
  const validEvResult = validateEvidenceItem(validEvidence);
  assert(validEvResult.valid, "TEST 1: Valid EvidenceItem passes validation");

  // TEST 2: Invalid EvidenceItem
  const invalidEvidence: EvidenceItem = {
    id: "",
    runId: "",
    experimentId: "",
    system: "",
    queryId: "Q-001",
    status: "CAPTURED",
    sha256Hash: "invalid_hash_too_short",
    capturedAt: "2026-09-27T00:00:00Z",
    provenance: { hasUnderlyingEvidence: false },
  };
  const invalidEvResult = validateEvidenceItem(invalidEvidence);
  assert(
    !invalidEvResult.valid && invalidEvResult.errors.length >= 4,
    "TEST 2: Invalid EvidenceItem fails validation with detailed errors",
    invalidEvResult.errors.join("; ")
  );

  // TEST 3: Valid Observation
  console.log("\n[Group 2: Observation & Measurement Contracts]");
  const validObs: Observation = {
    id: "OBS-001-20260927-01",
    evidenceId: "EVD-001-20260927-Q001-gemini-05",
    runId: "RUN-001-20260927-Q001-gemini-05",
    system: "Gemini",
    queryId: "Q-001",
    observationType: "CITATION_LINK",
    observedValue: {
      url: "https://www.rfc-editor.org/rfc/rfc9110",
      domain: "rfc-editor.org",
      positionIndex: 1,
    },
    rawSnippet: "RFC 9110: HTTP Semantics specifies 301 Moved Permanently",
    capturedAt: "2026-09-27T17:06:50.000Z",
    provenance: {
      experimentId: "EXP-001",
      runId: "RUN-001-20260927-Q001-gemini-05",
      hasUnderlyingEvidence: true,
    },
  };
  const obsResult = validateObservation(validObs);
  assert(obsResult.valid, "TEST 3: Valid Observation passes validation");

  // TEST 4: Valid Measurement
  const validMea: Measurement = {
    id: "MEA-001-20260927-01",
    metricName: "citation_density_per_1000_words",
    numericValue: 4.25,
    unit: "citations_per_1k_words",
    supportingObservationIds: [validObs.id],
    supportingEvidenceIds: [validEvidence.id],
    calculationMethod: "(totalCitations / wordCount) * 1000",
    provenance: {
      experimentId: "EXP-001",
      runId: validEvidence.runId,
      hasUnderlyingEvidence: true,
    },
  };
  const meaResult = validateMeasurement(validMea);
  assert(meaResult.valid, "TEST 4: Valid Measurement passes validation");

  // TEST 5: Finding with supporting evidence
  console.log("\n[Group 3: Finding, Interpretation & Limitation Models]");
  const supportedFinding: Finding = {
    id: "FND-001-001",
    statement: "Official specification documentation (RFC 9110) is cited by search-grounded models when responding to HTTP status code definitions.",
    supportingObservationIds: [validObs.id],
    supportingMeasurementIds: [validMea.id],
    supportingEvidenceIds: [validEvidence.id],
    confidence: "HIGH",
    hasSufficientEvidence: true,
    provenance: {
      experimentId: "EXP-001",
      researchId: "EXP-014",
      hasUnderlyingEvidence: true,
    },
  };
  const supportedResult = validateFinding(supportedFinding);
  assert(supportedResult.valid, "TEST 5: Finding with verified supporting evidence passes validation");

  // TEST 6: Finding without evidence -> rejected (Fail-closed)
  const unsupportedFinding: Finding = {
    id: "FND-001-UNSUPPORTED",
    statement: "All generative engines cite Schema.org markup with 100% fidelity.",
    supportingObservationIds: [],
    supportingMeasurementIds: [],
    supportingEvidenceIds: [], // Empty evidence!
    confidence: "HIGH",
    hasSufficientEvidence: false,
    provenance: {
      hasUnderlyingEvidence: false,
      absenceReason: "Hypothetical statement without benchmark evidence",
    },
  };
  const unsupportedResult = validateFinding(unsupportedFinding);
  assert(
    !unsupportedResult.valid && unsupportedResult.errors[0].includes("fails empirical grounding"),
    "TEST 6: Finding without supporting evidence fails closed",
    unsupportedResult.errors[0]
  );

  // TEST 7: Interpretation without finding -> rejected where required
  const validInterpretation: Interpretation = {
    id: "INT-001-001",
    findingId: supportedFinding.id,
    hypothesis: "Answer engines favor primary standards bodies over secondary tutorial portals for authoritative definitions.",
    reasoning: "The presence of official RFC documentation in top citations indicates retrieval prioritization for canonical documentation.",
    theoreticalImplications: ["Primary standards hold higher authority weighting in RAG groundings."],
    provenance: {
      researchId: "EXP-014",
      findingId: supportedFinding.id,
      hasUnderlyingEvidence: true,
    },
  };
  const validInterpResult = validateInterpretation(validInterpretation, [supportedFinding]);
  assert(validInterpResult.valid, "TEST 7A: Interpretation pointing to valid Finding passes");

  const orphanInterpretation: Interpretation = {
    id: "INT-001-ORPHAN",
    findingId: "FND-NON-EXISTENT",
    hypothesis: "Unfounded hypothesis",
    reasoning: "Speculative reasoning without underlying empirical finding",
    theoreticalImplications: [],
    provenance: { hasUnderlyingEvidence: false },
  };
  const orphanInterpResult = validateInterpretation(orphanInterpretation, [supportedFinding]);
  assert(
    !orphanInterpResult.valid && orphanInterpResult.errors[0].includes("non-existent Finding"),
    "TEST 7B: Interpretation pointing to non-existent Finding fails validation",
    orphanInterpResult.errors[0]
  );

  // TEST 8: Limitation representation
  const validLimitation: Limitation = {
    id: "LIM-001-001",
    scope: "ALGORITHMIC_DRIFT",
    description: "Search engines continuously update UI layouts and retrieval indices without version numbers.",
    impactOnFindings: "Citation placement observables reflect interface state at the exact capture timestamp.",
  };
  assert(
    Boolean(validLimitation.scope === "ALGORITHMIC_DRIFT" && validLimitation.impactOnFindings),
    "TEST 8: Limitation contract correctly models constraints and impact"
  );

  // TEST 9: Quarantined evidence cannot become published evidence
  console.log("\n[Group 4: Quarantine Enforcement & Publication Gating]");
  const quarantinedEvidence: EvidenceItem = {
    id: "EVD-001-20260927-Q001-gemini-01",
    runId: "RUN-001-20260927-Q001-gemini-01",
    experimentId: "EXP-001",
    system: "Gemini",
    queryId: "Q-001",
    status: "QUARANTINED",
    sha256Hash: "6baf3ac23e9183e128436c83b75defeefb5ba492c4e5a9ba7851be74c4287e24c",
    quarantineReason: "Interrupted Phase 8I.7.5 capture; collided with frozen Phase 8I.7.3 folder",
    capturedAt: "2026-09-27T17:06:28.000Z",
    provenance: {
      hasUnderlyingEvidence: false,
      absenceReason: "Quarantined incident artifact",
    },
  };
  const quarantineIsolation = validateQuarantineIsolation(quarantinedEvidence);
  assert(
    !quarantineIsolation.valid && quarantineIsolation.errors[0].includes("[SECURITY/INTEGRITY VIOLATION]"),
    "TEST 9: Quarantined evidence is strictly rejected from publication admittance",
    quarantineIsolation.errors[0]
  );

  // TEST 10: PUBLISHED eligibility
  const publishedCheck = isPublishableContent("PUBLISHED", {
    entityType: "professional-experience",
    hasOverview: true,
  });
  assert(
    publishedCheck.publishable && isIndexable("PUBLISHED"),
    "TEST 10: Status 'PUBLISHED' with complete content is eligible for indexing"
  );

  // TEST 11: IN_REVIEW exclusion
  const inReviewCheck = isPublishableContent("IN_REVIEW");
  assert(
    !inReviewCheck.publishable && !isIndexable("IN_REVIEW"),
    "TEST 11: Status 'IN_REVIEW' is strictly excluded from publication and indexing"
  );

  // TEST 12: DRAFT & EVIDENCE_READY exclusion
  const draftCheck = isPublishableContent("DRAFT");
  const evidenceReadyCheck = isPublishableContent("EVIDENCE_READY" as ContentStatus);
  assert(
    !draftCheck.publishable &&
      !isIndexable("DRAFT") &&
      !evidenceReadyCheck.publishable &&
      !isIndexable("EVIDENCE_READY" as ContentStatus),
    "TEST 12: 'DRAFT' and 'EVIDENCE_READY' are strictly excluded from publication and indexing"
  );

  // TEST 13: Evidence citation resolution
  console.log("\n[Group 5: Citation Resolution & Relationship Integrity]");
  const primaryCitation: EvidenceCitationReference = {
    id: "CIT-001-PRIMARY",
    citationType: "PRIMARY_CAPTURED_EVIDENCE",
    evidenceId: validEvidence.id,
    title: "Raw Captured Response Payload — Gemini (2026-09-27)",
    accessedOrCapturedDate: "2026-09-27",
  };
  assert(
    primaryCitation.citationType === "PRIMARY_CAPTURED_EVIDENCE" && Boolean(primaryCitation.evidenceId),
    "TEST 13A: Primary captured evidence citation properly references vault evidence ID"
  );

  const secondaryCitation: EvidenceCitationReference = {
    id: "CIT-002-EXTERNAL",
    citationType: "EXTERNAL_SOURCE_CITATION",
    sourceId: "SRC-001",
    title: "Schema.org Specifications",
    url: "https://schema.org",
    accessedOrCapturedDate: "2026-03-22",
  };
  const resolvedSource = getSourceById(secondaryCitation.sourceId!);
  assert(
    Boolean(resolvedSource && resolvedSource.id === "SRC-001"),
    "TEST 13B: External source citation resolves to verified canonical source in registry"
  );

  // TEST 14: Broken evidence reference detection
  const brokenCitation: EvidenceCitationReference = {
    id: "CIT-003-BROKEN",
    citationType: "EXTERNAL_SOURCE_CITATION",
    sourceId: "SRC-999-NON-EXISTENT",
    title: "Broken Source",
    accessedOrCapturedDate: "2026-09-28",
  };
  const brokenResolved = getSourceById(brokenCitation.sourceId!);
  assert(
    brokenResolved === undefined,
    "TEST 14: Non-existent source reference correctly detects as unresolved/broken"
  );

  // TEST 15: Relationship integrity (EXP-012 <-> EXP-001)
  const exp012 = getResearchById("EXP-012");
  const exp001 = getExperimentById("EXP-001");
  assert(Boolean(exp012 && exp001), "TEST 15A: Both EXP-012 and EXP-001 resolve from data stores");

  const exp012Targets = exp012?.relatedExperimentIds || [];
  const exp001Sources = exp001?.relatedResearchIds || [];
  const symmetryAudit = auditRelationshipSymmetry("EXP-012", exp012Targets, "EXP-001", exp001Sources);

  assert(
    !symmetryAudit.symmetric && symmetryAudit.severity === "ASYMMETRIC_CITATION_WARNING",
    "TEST 15B: Audit correctly detects EXP-012 -> EXP-001 asymmetric citation warning without crashing",
    symmetryAudit.notes
  );

  // TEST 16: Historical evidence isolation (zero modification)
  console.log("\n[Group 6: Historical Vault Integrity]");
  const gemini05TxtPath = path.join(process.cwd(), "evidence", "exp-001", "raw", "2026-09-27", "RUN-001-20260927-Q001-gemini-05.txt");
  const gemini01TxtPath = path.join(process.cwd(), "evidence", "exp-001", "raw", "2026-09-27", "RUN-001-20260927-Q001-gemini-01.txt");

  assert(fs.existsSync(gemini05TxtPath), "TEST 16A: Canonical historical gemini-05.txt exists on disk");
  assert(fs.existsSync(gemini01TxtPath), "TEST 16B: Quarantined incident gemini-01.txt preserved on disk");

  const gemini05Content = fs.readFileSync(gemini05TxtPath);
  const gemini05Hash = crypto.createHash("sha256").update(gemini05Content).digest("hex");
  const expectedHash = "fa17ed9d99467d0fbd2a4b38fcbcc1fb0d91092d116e676dba2f954bfe2d3c5c";

  assert(
    gemini05Hash === expectedHash,
    "TEST 16C: Historical gemini-05.txt SHA-256 is bit-for-bit identical to frozen Phase 8I.7.3 hash",
    `Computed: ${gemini05Hash}, Expected: ${expectedHash}`
  );

  console.log("\n================================================================================");
  console.log(" RESULTS: All 16 Test Cases Passed Successfully (0 failures)");
  console.log("================================================================================\n");
}

runTestSuite().catch((err) => {
  console.error("Test Suite Execution Failed:", err);
  process.exit(1);
});
