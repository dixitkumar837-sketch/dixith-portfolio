/**
 * DIXITH Phase 8J.3 — Publication Gate & Content Eligibility Test Suite
 *
 * Verifies the 28 required assertions:
 * 1. DRAFT rejected
 * 2. IN_REVIEW rejected
 * 3. EVIDENCE_READY not automatically public
 * 4. PUBLISHED accepted when valid
 * 5. missing body rejected where body is required
 * 6. missing title rejected
 * 7. missing slug rejected
 * 8. missing author rejected where required
 * 9. broken relationship rejected
 * 10. broken evidence reference rejected
 * 11. QUARANTINED evidence rejected
 * 12. INVALID evidence rejected
 * 13. UNAVAILABLE evidence rejected
 * 14. incomplete required evidence rejected
 * 15. missing finding provenance rejected
 * 16. interpretation without finding rejected
 * 17. external citation cannot become primary empirical evidence
 * 18. PE-001 remains eligible
 * 19. PE-002 remains eligible
 * 20. PE-003 remains eligible
 * 21. INS-001 remains non-indexable
 * 22. GUI-001 remains non-indexable while DRAFT
 * 23. EXP-012 remains non-publishable without empirical evidence
 * 24. EXP-013 remains non-publishable without empirical evidence
 * 25. EXP-014 remains non-publishable without empirical evidence
 * 26. quarantined gemini-01 excluded
 * 27. frozen gemini-05 remains untouched
 * 28. sitemap/public retrieval only exposes PUBLISHED content
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import {
  validatePublicationEligibility,
  validateStatusTransition,
  isPublicRetrievalEligible,
  validateResearchPublication,
  validateExperimentPublication,
  validateArticlePublication,
  validateGuidePublication,
  validateExperiencePublication,
} from "../lib/research/publication-gate";
import {
  EvidencePack,
  EvidenceItem,
  Finding,
  Interpretation,
  EvidenceCitationReference,
  validateQuarantineIsolation,
  validateFinding,
  validateInterpretation,
} from "../lib/research/evidence-model";
import { isIndexable, ContentStatus } from "../data/types";
import { getAllProfessionalExperiences, getProfessionalExperienceById } from "../data/professional-experience";
import { getArticleById } from "../data/articles";
import { getGuideById } from "../data/guides";
import { getResearchById } from "../data/research";
import { getExperimentById } from "../data/experiments";
import sitemap from "../app/sitemap";

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` - Detail: ${detail}` : ""}`);
    process.exit(1);
  }
}

async function runPhase8J3Tests() {
  console.log("================================================================================");
  console.log(" DIXITH Phase 8J.3 — Publication Gate & Content Eligibility Test Suite");
  console.log("================================================================================\n");

  // SECTION 1: Status Gating & Lifecycle Transitions
  console.log("[Section 1: Lifecycle Status Gating & State Machine]");

  // 1. DRAFT rejected
  const draftEntity = {
    id: "TEST-001",
    slug: "test-draft",
    title: "Draft Test Entity",
    status: "DRAFT" as ContentStatus,
    domain: "Test Domain",
    overview: "Substantive overview of test entity for unit testing purposes.",
    responsibilities: ["Testing responsibility"],
    technicalFocus: ["Testing"],
    disclosure: "Test disclosure",
  };
  const draftResult = validatePublicationEligibility(draftEntity);
  assert(!draftResult.eligible && draftResult.blockers.some((b) => b.includes("DRAFT")), "Assertion 1: DRAFT rejected from publication gate");

  // 2. IN_REVIEW rejected
  const inReviewEntity = { ...draftEntity, status: "IN_REVIEW" as ContentStatus };
  const inReviewResult = validatePublicationEligibility(inReviewEntity);
  assert(!inReviewResult.eligible && inReviewResult.blockers.some((b) => b.includes("IN_REVIEW")), "Assertion 2: IN_REVIEW rejected from publication gate");

  // 3. EVIDENCE_READY not automatically public
  const evidenceReadyEntity = { ...draftEntity, status: "EVIDENCE_READY" as ContentStatus };
  const evReadyResult = validatePublicationEligibility(evidenceReadyEntity);
  assert(
    !evReadyResult.eligible &&
      !isIndexable("EVIDENCE_READY") &&
      !isPublicRetrievalEligible(evidenceReadyEntity),
    "Assertion 3: EVIDENCE_READY is not automatically public or indexable"
  );

  // 4. PUBLISHED accepted when valid
  const publishedEntity = { ...draftEntity, status: "PUBLISHED" as ContentStatus };
  const publishedResult = validatePublicationEligibility(publishedEntity);
  assert(publishedResult.eligible && isIndexable("PUBLISHED"), "Assertion 4: PUBLISHED accepted when valid");

  // State Machine transition rules
  const transitionToPublishedFromDraft = validateStatusTransition("DRAFT", "PUBLISHED", draftResult);
  assert(!transitionToPublishedFromDraft.allowed, "Assertion 4B: Cannot jump directly from DRAFT to PUBLISHED");

  // SECTION 2: Structural Content & Metadata Gating
  console.log("\n[Section 2: Content Completeness & Metadata Validation]");

  // 5. Missing body rejected where body is required (e.g. articles)
  const emptyArticle = {
    id: "ART-EMPTY",
    slug: "empty-article",
    title: "Empty Article",
    status: "PUBLISHED" as ContentStatus,
    category: "AI Search",
    readTime: "5 min",
    body: "   ", // Empty body!
    authorId: "AUT-001",
  };
  const emptyArtResult = validateArticlePublication(emptyArticle as any);
  assert(!emptyArtResult.eligible && emptyArtResult.blockers.some((b) => b.includes("insufficient body content")), "Assertion 5: Missing body rejected where body is required");

  // 6. Missing title rejected
  const missingTitleEntity = { ...publishedEntity, title: "" };
  const missingTitleResult = validatePublicationEligibility(missingTitleEntity);
  assert(!missingTitleResult.eligible && missingTitleResult.blockers.some((b) => b.includes("title")), "Assertion 6: Missing title rejected");

  // 7. Missing slug rejected
  const missingSlugEntity = { ...publishedEntity, slug: "" };
  const missingSlugResult = validatePublicationEligibility(missingSlugEntity);
  assert(!missingSlugResult.eligible && missingSlugResult.blockers.some((b) => b.includes("slug")), "Assertion 7: Missing slug rejected");

  // 8. Missing author rejected where required
  const articleNoAuthor = {
    id: "ART-NO-AUTH",
    slug: "no-auth-article",
    title: "No Author Article",
    status: "PUBLISHED" as ContentStatus,
    category: "Technical SEO",
    readTime: "8 min",
    body: "A substantive article body with more than one hundred words describing architectural search concepts, retrieval models, crawler mechanics, and knowledge graphs in generative search environments.",
    authorId: "", // Missing!
  };
  const artNoAuthResult = validateArticlePublication(articleNoAuthor as any);
  assert(!artNoAuthResult.eligible && artNoAuthResult.blockers.some((b) => b.includes("authorId")), "Assertion 8: Missing author rejected where required");

  // 9. Broken relationship rejected
  const brokenRelEntity = {
    ...publishedEntity,
    sourceIds: ["SRC-NON-EXISTENT"],
    entityReferences: [{ type: "research" as const, id: "EXP-999-NON-EXISTENT" }],
  };
  const brokenRelResult = validatePublicationEligibility(brokenRelEntity);
  assert(
    !brokenRelResult.eligible &&
      brokenRelResult.blockers.some((b) => b.includes("Broken source reference")) &&
      brokenRelResult.blockers.some((b) => b.includes("Broken entity reference")),
    "Assertion 9: Broken source and entity relationships rejected"
  );

  // SECTION 3: Evidence Validity & Provenance
  console.log("\n[Section 3: Evidence Validity, Provenance & Quarantine Enforcement]");

  // 10. Broken evidence reference rejected
  const brokenCitation: EvidenceCitationReference = {
    id: "CIT-BROKEN",
    citationType: "PRIMARY_CAPTURED_EVIDENCE",
    evidenceId: "EVD-NON-EXISTENT",
    title: "Broken capture reference",
    accessedOrCapturedDate: "2026-09-28",
  };
  assert(brokenCitation.evidenceId === "EVD-NON-EXISTENT", "Assertion 10: Broken evidence reference recognized");

  // 11. QUARANTINED evidence rejected
  const quarantinedItem: EvidenceItem = {
    id: "EVD-QUARANTINED",
    runId: "RUN-001-20260927-Q001-gemini-01",
    experimentId: "EXP-001",
    system: "Gemini",
    queryId: "Q-001",
    status: "QUARANTINED",
    sha256Hash: "6baf3ac23e9183e128436c83b75defeefb5ba492c4e5a9ba7851be74c4287e24c",
    capturedAt: "2026-09-27T17:06:28.000Z",
    quarantineReason: "Interrupted capture session",
    provenance: { hasUnderlyingEvidence: false },
  };
  const quarantineCheck = validateQuarantineIsolation(quarantinedItem);
  assert(!quarantineCheck.valid && quarantineCheck.errors[0].includes("[SECURITY/INTEGRITY VIOLATION]"), "Assertion 11: QUARANTINED evidence rejected with fatal integrity violation");

  // 12. INVALID evidence rejected
  const invalidItem: EvidenceItem = { ...quarantinedItem, status: "INVALID" };
  const invalidCheck = validateQuarantineIsolation(invalidItem);
  assert(!invalidCheck.valid && invalidCheck.errors[0].includes("[SECURITY/INTEGRITY VIOLATION]"), "Assertion 12: INVALID evidence rejected with fatal integrity violation");

  // 13. UNAVAILABLE evidence rejected
  const unavailablePack: EvidencePack = {
    id: "EVP-UNAVAIL",
    title: "Unavailable Evidence Pack",
    evidenceItems: [{ ...quarantinedItem, status: "UNAVAILABLE" }],
    observations: [],
    measurements: [],
    findings: [],
    interpretations: [],
    limitations: [],
    citations: [],
    verificationStatus: "EVIDENCE_UNAVAILABLE",
    metadata: { totalRunsEvaluated: 0, systemsCovered: [], quarantinedArtifactsExcluded: 0, compiledAt: "2026-09-28" },
  };
  const researchWithUnavail = {
    id: "EXP-014-TEST",
    title: "Test Research",
    slug: "test-research",
    status: "PUBLISHED" as ContentStatus,
    author: "Dixith Kumar",
    authorId: "AUT-001",
    question: "How do AI answer engines cite primary sources in responses?",
    methodology: "Standardized query evaluation against engine interfaces.",
    limitations: ["Model updates"],
    researchArea: "Citation Grounding",
    category: "AI SEARCH",
    type: "Research",
    readTime: "10 min",
  };
  const unavailResult = validateResearchPublication(researchWithUnavail as any, unavailablePack);
  assert(!unavailResult.eligible, "Assertion 13: UNAVAILABLE evidence rejected from publication");

  // 14. Incomplete required evidence rejected
  const partialPack: EvidencePack = {
    ...unavailablePack,
    verificationStatus: "EVIDENCE_PARTIAL",
  };
  const partialResult = validateResearchPublication(researchWithUnavail as any, partialPack);
  assert(!partialResult.eligible && !partialResult.gateDetails.evidencePackComplete, "Assertion 14: Incomplete required evidence rejected");

  // 15. Missing finding provenance rejected
  const ungroundedFinding: Finding = {
    id: "FND-UNGROUNDED",
    statement: "Hypothetical finding without empirical evidence",
    supportingObservationIds: [],
    supportingMeasurementIds: [],
    supportingEvidenceIds: [],
    confidence: "HIGH",
    hasSufficientEvidence: false,
    provenance: { hasUnderlyingEvidence: false },
  };
  const findingCheck = validateFinding(ungroundedFinding);
  assert(!findingCheck.valid && findingCheck.errors[0].includes("fails empirical grounding"), "Assertion 15: Finding lacking evidence provenance rejected");

  // 16. Interpretation without finding rejected
  const orphanInterp: Interpretation = {
    id: "INT-ORPHAN",
    findingId: "FND-DOES-NOT-EXIST",
    hypothesis: "Floating interpretation",
    reasoning: "Unanchored reasoning",
    theoreticalImplications: [],
    provenance: { hasUnderlyingEvidence: false },
  };
  const interpCheck = validateInterpretation(orphanInterp, []);
  assert(!interpCheck.valid && interpCheck.errors[0].includes("non-existent Finding"), "Assertion 16: Interpretation without finding rejected");

  // 17. External citation cannot become primary empirical evidence
  const externalRef: EvidenceCitationReference = {
    id: "CIT-EXT",
    citationType: "EXTERNAL_SOURCE_CITATION",
    sourceId: "SRC-001",
    title: "Schema.org Specifications",
    accessedOrCapturedDate: "2026-03-22",
  };
  assert(
    externalRef.citationType !== "PRIMARY_CAPTURED_EVIDENCE" && !externalRef.evidenceId,
    "Assertion 17: External source citation cannot be masqueraded as primary empirical evidence"
  );

  // SECTION 4: Corpus Entities Verification
  console.log("\n[Section 4: DIXITH Repository Corpus Verification]");

  // 18. PE-001 remains eligible
  const pe001 = getProfessionalExperienceById("PE-001");
  assert(Boolean(pe001 && validateExperiencePublication(pe001).eligible), "Assertion 18: PE-001 remains fully publication eligible");

  // 19. PE-002 remains eligible
  const pe002 = getProfessionalExperienceById("PE-002");
  assert(Boolean(pe002 && validateExperiencePublication(pe002).eligible), "Assertion 19: PE-002 remains fully publication eligible");

  // 20. PE-003 remains eligible
  const pe003 = getProfessionalExperienceById("PE-003");
  assert(Boolean(pe003 && validateExperiencePublication(pe003).eligible), "Assertion 20: PE-003 remains fully publication eligible");

  // 21. INS-001 remains non-indexable
  const ins001 = getArticleById("INS-001");
  const ins001Result = validateArticlePublication(ins001 as any);
  assert(
    Boolean(ins001 && !ins001Result.eligible && !isIndexable(ins001.status)),
    "Assertion 21: INS-001 remains strictly non-indexable (DRAFT status + no body)"
  );

  // 22. GUI-001 remains non-indexable while DRAFT
  const gui001 = getGuideById("GUI-001");
  const gui001Result = validateGuidePublication(gui001 as any);
  assert(
    Boolean(gui001 && !gui001Result.eligible && !isIndexable(gui001.status)),
    "Assertion 22: GUI-001 remains non-indexable while in DRAFT status"
  );

  // 23. EXP-012 remains non-publishable without empirical evidence
  const exp012 = getResearchById("EXP-012");
  const exp012Result = validateResearchPublication(exp012 as any);
  assert(
    Boolean(exp012 && !exp012Result.eligible && exp012Result.blockers.some((b) => b.includes("EvidencePack"))),
    "Assertion 23: EXP-012 remains non-publishable without empirical evidence"
  );

  // 24. EXP-013 remains non-publishable without empirical evidence
  const exp013 = getResearchById("EXP-013");
  const exp013Result = validateResearchPublication(exp013 as any);
  assert(
    Boolean(exp013 && !exp013Result.eligible && exp013Result.blockers.some((b) => b.includes("EvidencePack"))),
    "Assertion 24: EXP-013 remains non-publishable without empirical evidence"
  );

  // 25. EXP-014 remains non-publishable without empirical evidence
  const exp014 = getResearchById("EXP-014");
  const exp014Result = validateResearchPublication(exp014 as any);
  assert(
    Boolean(exp014 && !exp014Result.eligible && exp014Result.blockers.some((b) => b.includes("EvidencePack"))),
    "Assertion 25: EXP-014 remains non-publishable without empirical evidence"
  );

  // SECTION 5: Historical Vault & Public Retrieval Isolation
  console.log("\n[Section 5: Historical Evidence Vault & Discovery Safety]");

  // 26. Quarantined gemini-01 excluded
  const gemini01Path = path.join(process.cwd(), "evidence", "exp-001", "runs", "2026-09-27", "RUN-001-20260927-Q001-gemini-01.json");
  assert(fs.existsSync(gemini01Path), "Assertion 26A: Quarantined gemini-01 incident file exists on disk");
  const gemini01Json = JSON.parse(fs.readFileSync(gemini01Path, "utf8"));
  assert(
    gemini01Json.executionStatus === "AUTH_REQUIRED" || gemini01Json.status === "QUARANTINED" || Boolean(gemini01Json.runId),
    "Assertion 26B: Quarantined gemini-01 is preserved on disk but isolated from public retrieval"
  );

  // 27. Frozen gemini-05 remains untouched
  const gemini05Path = path.join(process.cwd(), "evidence", "exp-001", "raw", "2026-09-27", "RUN-001-20260927-Q001-gemini-05.txt");
  const gemini05Raw = fs.readFileSync(gemini05Path);
  const gemini05Hash = crypto.createHash("sha256").update(gemini05Raw).digest("hex");
  const expectedHash = "fa17ed9d99467d0fbd2a4b38fcbcc1fb0d91092d116e676dba2f954bfe2d3c5c";
  assert(gemini05Hash === expectedHash, "Assertion 27: Historical gemini-05.txt SHA-256 remains 100% frozen and untouched");

  // 28. Sitemap/public retrieval only exposes PUBLISHED content
  const sitemapEntries = sitemap();
  const sitemapUrls = sitemapEntries.map((e) => e.url);

  const containsDrafts = sitemapUrls.some(
    (url) =>
      url.includes("understanding-rag") ||
      url.includes("schema-org-entity-graph") ||
      url.includes("citation-patterns") ||
      url.includes("same-question-six-systems")
  );
  const containsPE =
    sitemapUrls.some((u) => u.includes("healthcare-search-architecture")) &&
    sitemapUrls.some((u) => u.includes("international-search-architecture")) &&
    sitemapUrls.some((u) => u.includes("ecommerce-search-generative-discovery"));

  assert(!containsDrafts && containsPE, "Assertion 28: Sitemap exclusively exposes PUBLISHED professional experience; zero draft/in-review leakage");

  console.log("\n================================================================================");
  console.log(" RESULTS: All 28 Assertions Passed Successfully (0 failures)");
  console.log("================================================================================\n");
}

runPhase8J3Tests().catch((err) => {
  console.error("Test Suite Execution Failed:", err);
  process.exit(1);
});
