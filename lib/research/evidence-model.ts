/**
 * DIXITH Phase 8J.2 — Evidence & Publication Domain Model
 * Strongly typed contracts for empirical research, provenance tracking,
 * observations, measurements, findings, interpretations, and publication gating.
 *
 * Epistemological Chain:
 * Research -> Experiment -> Research Run -> Evidence Item -> Observation -> Measurement -> Finding -> Interpretation -> Limitation
 */

import { ContentStatus, isIndexable } from "../../data/types";
import { CanonicalAISearchSystem } from "../../data/research-protocol-types";

// ============================================================================
// 1. Evidence States & Validity Taxonomy
// ============================================================================

/**
 * Standardized Evidence Item Verification and Usability States
 */
export type EvidenceStatus =
  | "CAPTURED"      // Raw artifact successfully persisted to vault
  | "VERIFIED"      // SHA-256 and DOM checksum independently verified
  | "INCOMPLETE"    // Artifact collection interrupted or partially captured
  | "UNAVAILABLE"   // Engine blocked, timed out, or unobservable
  | "INVALID"       // Artifact corrupted, misattributed, or rejected
  | "QUARANTINED";  // Artifact isolated due to integrity defect (e.g. historical run-id collision)

/**
 * Typology of Citation References to distinguish empirical captures from theoretical sources
 */
export type CitationType =
  | "PRIMARY_CAPTURED_EVIDENCE"  // Verifiable raw artifact (txt, html, png, json) from live/automated capture
  | "EXTERNAL_SOURCE_CITATION"   // Canonical third-party standard, academic paper, or specification (e.g. RFC, W3C)
  | "SUPPORTING_DOCUMENTATION"   // Official search engine help center, API guide, or crawler doc
  | "METHODOLOGY_REFERENCE";     // Published benchmark protocol or evaluation framework

// ============================================================================
// 2. Provenance Chain Contract
// ============================================================================

/**
 * Explicit Provenance Pointer establishing backward traceability
 * from any finding or measurement to its originating evidence artifact.
 */
export interface EvidenceProvenance {
  researchId?: string;      // e.g. "EXP-014"
  experimentId?: string;    // e.g. "EXP-001"
  runId?: string;           // e.g. "RUN-001-20260927-Q001-gemini-05"
  evidenceId?: string;      // e.g. "EVD-20260927-gemini-05"
  observationIds?: string[];
  measurementIds?: string[];
  findingId?: string;
  hasUnderlyingEvidence: boolean;
  absenceReason?: string;   // Explicitly recorded if evidence is not yet captured
}

// ============================================================================
// 3. Evidence Item Contract
// ============================================================================

/**
 * Cryptographically Verified Evidence Item stored in the physical vault
 */
export interface EvidenceItem {
  id: string; // e.g. "EVD-001-20260927-Q001-gemini-05"
  runId: string; // e.g. "RUN-001-20260927-Q001-gemini-05"
  experimentId: string; // e.g. "EXP-001"
  system: CanonicalAISearchSystem | string;
  queryId: string; // e.g. "Q-001"
  status: EvidenceStatus;
  sha256Hash: string; // Hexadecimal SHA-256 digest
  rawTextPath?: string; // Relative path from evidence vault
  domSnapshotPath?: string;
  screenshotPath?: string;
  runRecordPath?: string;
  capturedAt: string; // ISO 8601 UTC timestamp
  provenance: EvidenceProvenance;
  quarantineReason?: string; // Populated only if status === "QUARANTINED"
  notes?: string;
}

// ============================================================================
// 4. Observation Contract
// ============================================================================

export type ObservationType =
  | "TEXT_RESPONSE"
  | "CITATION_LINK"
  | "DOM_STRUCTURE"
  | "UI_RENDER_FORMAT"
  | "AUTH_GATE_DISPLAYED"
  | "CHALLENGE_DISPLAYED"
  | "SEARCH_MODE_SELECTED"
  | "OTHER";

/**
 * Empirical Observation: What was directly perceived or captured from a system interface.
 * Must NOT contain interpretations or model-quality claims.
 */
export interface Observation {
  id: string; // e.g. "OBS-001-001"
  evidenceId?: string;
  runId?: string;
  system: CanonicalAISearchSystem | string;
  queryId: string;
  observationType: ObservationType;
  observedValue: string | number | boolean | Record<string, unknown>;
  rawSnippet?: string; // Contextual text directly from engine response
  capturedAt: string;
  provenance: EvidenceProvenance;
}

// ============================================================================
// 5. Measurement Contract
// ============================================================================

/**
 * Empirical Measurement: A quantifiable recorded metric derived deterministically from evidence/observations.
 */
export interface Measurement {
  id: string; // e.g. "MEA-001-001"
  metricName: string; // e.g. "citation_density_per_1000_words", "distinct_domains_count"
  numericValue: number;
  unit?: string; // e.g. "domains", "words", "ms", "percentage"
  supportingObservationIds: string[];
  supportingEvidenceIds: string[];
  calculationMethod: string; // Explicit reproducible mathematical formula or algorithm
  provenance: EvidenceProvenance;
}

// ============================================================================
// 6. Finding Contract
// ============================================================================

export type FindingConfidence = "HIGH" | "MODERATE" | "PRELIMINARY";

/**
 * Research Finding: A supported research conclusion derived directly from observations and measurements.
 * Fails closed if underlying supporting evidence is absent.
 */
export interface Finding {
  id: string; // e.g. "FND-001-001"
  statement: string; // Grounded empirical claim
  supportingObservationIds: string[];
  supportingMeasurementIds: string[];
  supportingEvidenceIds: string[];
  confidence: FindingConfidence;
  hasSufficientEvidence: boolean; // Must be true to pass publication gate
  provenance: EvidenceProvenance;
}

// ============================================================================
// 7. Interpretation Contract
// ============================================================================

/**
 * Research Interpretation: A reasoned hypothesis or architectural deduction explaining why a finding occurs.
 * Must reference an existing, validated Finding.
 */
export interface Interpretation {
  id: string; // e.g. "INT-001-001"
  findingId: string; // Required pointer to underlying Finding
  hypothesis: string;
  reasoning: string;
  theoreticalImplications: string[];
  provenance: EvidenceProvenance;
}

// ============================================================================
// 8. Limitation Contract
// ============================================================================

export type LimitationScope =
  | "ALGORITHMIC_DRIFT"
  | "GEOGRAPHIC_VARIATION"
  | "SESSION_PERSONALIZATION"
  | "INTERFACE_VOLATILITY"
  | "SAMPLE_SIZE"
  | "BLACK_BOX_ENVIRONMENT"
  | "NON_DETERMINISM";

/**
 * Documented constraint or confounding factor affecting interpretation or reproducibility.
 */
export interface Limitation {
  id: string; // e.g. "LIM-001-001"
  scope: LimitationScope;
  description: string;
  impactOnFindings: string;
}

// ============================================================================
// 9. Citation & Source Reference Contract
// ============================================================================

/**
 * Formal Citation Reference distinguishing primary captured evidence from secondary literature
 */
export interface EvidenceCitationReference {
  id: string; // e.g. "CIT-001"
  citationType: CitationType;
  sourceId?: string; // Points to SRC-* in CANONICAL_SOURCES if external
  evidenceId?: string; // Points to EVD-* in vault if primary
  title: string;
  url?: string;
  authorOrPublisher?: string;
  accessedOrCapturedDate: string;
  relevanceExplanation?: string;
}

// ============================================================================
// 10. Canonical EvidencePack Contract
// ============================================================================

/**
 * Assembled Evidence Package for a research study, experiment, or publication unit
 */
export interface EvidencePack {
  id: string; // e.g. "EVP-001"
  title: string;
  researchId?: string;
  experimentId?: string;
  evidenceItems: EvidenceItem[];
  observations: Observation[];
  measurements: Measurement[];
  findings: Finding[];
  interpretations: Interpretation[];
  limitations: Limitation[];
  citations: EvidenceCitationReference[];
  verificationStatus: "EVIDENCE_COMPLETE" | "EVIDENCE_PARTIAL" | "EVIDENCE_UNAVAILABLE";
  metadata: {
    totalRunsEvaluated: number;
    systemsCovered: string[];
    quarantinedArtifactsExcluded: number;
    compiledAt: string;
  };
}

// ============================================================================
// 11. Publication Gate & Model Validation Functions
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates that an EvidenceItem is internally consistent and not corrupted.
 */
export function validateEvidenceItem(item: EvidenceItem): ValidationResult {
  const errors: string[] = [];

  if (!item.id || !item.id.trim()) errors.push("EvidenceItem requires a non-empty id.");
  if (!item.runId || !item.runId.trim()) errors.push("EvidenceItem requires a non-empty runId.");
  if (!item.experimentId || !item.experimentId.trim()) errors.push("EvidenceItem requires a non-empty experimentId.");
  if (!item.system || !item.system.trim()) errors.push("EvidenceItem requires a system identifier.");
  if (!item.sha256Hash || item.sha256Hash.length !== 64) {
    errors.push("EvidenceItem requires a valid 64-character hexadecimal SHA-256 digest.");
  }

  // Quarantined items must have an explicit reason
  if (item.status === "QUARANTINED" && (!item.quarantineReason || !item.quarantineReason.trim())) {
    errors.push("Quarantined EvidenceItem must specify a quarantineReason.");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates that an Observation has verified provenance.
 */
export function validateObservation(obs: Observation): ValidationResult {
  const errors: string[] = [];

  if (!obs.id || !obs.id.trim()) errors.push("Observation requires an id.");
  if (!obs.system || !obs.system.trim()) errors.push("Observation requires a system.");
  if (!obs.queryId || !obs.queryId.trim()) errors.push("Observation requires a queryId.");
  if (obs.observedValue === undefined || obs.observedValue === null) {
    errors.push("Observation requires an observedValue.");
  }

  if (obs.provenance && !obs.provenance.hasUnderlyingEvidence && !obs.provenance.absenceReason) {
    errors.push("Observation with missing evidence must state an explicit absenceReason.");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates that a Measurement is backed by observations and evidence.
 */
export function validateMeasurement(mea: Measurement): ValidationResult {
  const errors: string[] = [];

  if (!mea.id || !mea.id.trim()) errors.push("Measurement requires an id.");
  if (!mea.metricName || !mea.metricName.trim()) errors.push("Measurement requires a metricName.");
  if (typeof mea.numericValue !== "number" || isNaN(mea.numericValue)) {
    errors.push("Measurement requires a valid numericValue.");
  }
  if (!mea.calculationMethod || !mea.calculationMethod.trim()) {
    errors.push("Measurement requires an explicit calculationMethod.");
  }

  if (mea.supportingEvidenceIds.length === 0) {
    errors.push("Measurement must reference at least one supporting evidence ID.");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Enforces the core scientific rule: A Finding MUST be supported by empirical evidence.
 * Fail-closed: Unsupported findings are rejected.
 */
export function validateFinding(finding: Finding): ValidationResult {
  const errors: string[] = [];

  if (!finding.id || !finding.id.trim()) errors.push("Finding requires an id.");
  if (!finding.statement || !finding.statement.trim()) errors.push("Finding requires a claim statement.");

  // Empirical Grounding Rule: Must have evidence and observations or measurements
  const hasEvidence = finding.supportingEvidenceIds && finding.supportingEvidenceIds.length > 0;
  const hasObservables =
    (finding.supportingObservationIds && finding.supportingObservationIds.length > 0) ||
    (finding.supportingMeasurementIds && finding.supportingMeasurementIds.length > 0);

  if (!hasEvidence || !hasObservables || !finding.hasSufficientEvidence) {
    errors.push(
      `Finding [${finding.id}] fails empirical grounding: must have supporting evidence IDs and observation/measurement IDs with hasSufficientEvidence: true.`
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates that an Interpretation references an existing, valid Finding.
 */
export function validateInterpretation(
  interp: Interpretation,
  existingFindings: Finding[]
): ValidationResult {
  const errors: string[] = [];

  if (!interp.id || !interp.id.trim()) errors.push("Interpretation requires an id.");
  if (!interp.findingId || !interp.findingId.trim()) errors.push("Interpretation requires a findingId pointer.");
  if (!interp.reasoning || !interp.reasoning.trim()) errors.push("Interpretation requires explanatory reasoning.");

  const targetFinding = existingFindings.find((f) => f.id === interp.findingId);
  if (!targetFinding) {
    errors.push(`Interpretation [${interp.id}] points to non-existent Finding [${interp.findingId}].`);
  } else {
    const findingValidation = validateFinding(targetFinding);
    if (!findingValidation.valid) {
      errors.push(`Interpretation [${interp.id}] points to an invalid/unsupported Finding [${interp.findingId}].`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates that quarantined or invalid evidence can NEVER be admitted as publishable evidence.
 */
export function validateQuarantineIsolation(item: EvidenceItem): ValidationResult {
  const errors: string[] = [];

  if (item.status === "QUARANTINED" || item.status === "INVALID") {
    errors.push(
      `[SECURITY/INTEGRITY VIOLATION] Artifact [${item.id}] has status "${item.status}" and cannot be admitted to publishable evidence packs or retrieval indices.`
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates an assembled EvidencePack for consistency and completeness.
 */
export function validateEvidencePack(pack: EvidencePack): { valid: boolean; errors: string[]; complete: boolean } {
  const errors: string[] = [];

  if (!pack.id || !pack.id.trim()) errors.push("EvidencePack requires a non-empty id.");
  if (!pack.title || !pack.title.trim()) errors.push("EvidencePack requires a non-empty title.");

  if (!pack.evidenceItems || pack.evidenceItems.length === 0) {
    errors.push("EvidencePack contains zero evidence items.");
  } else {
    for (const item of pack.evidenceItems) {
      const itemValidation = validateEvidenceItem(item);
      if (!itemValidation.valid) {
        errors.push(...itemValidation.errors);
      }
      const qCheck = validateQuarantineIsolation(item);
      if (!qCheck.valid) {
        errors.push(...qCheck.errors);
      }
    }
  }

  if (pack.findings && pack.findings.length > 0) {
    for (const finding of pack.findings) {
      const fCheck = validateFinding(finding);
      if (!fCheck.valid) {
        errors.push(...fCheck.errors);
      }
    }
  }

  const complete = pack.verificationStatus === "EVIDENCE_COMPLETE" && errors.length === 0;

  return {
    valid: errors.length === 0,
    errors,
    complete,
  };
}

/**
 * Comprehensive Publication Gatekeeper
 * Evaluates whether an entity meets all criteria to transition to or remain in PUBLISHED status.
 */
export function isPublishableContent(
  status: ContentStatus,
  options: {
    entityType?: string;
    hasEvidencePack?: boolean;
    evidencePackComplete?: boolean;
    bodyLengthWords?: number;
    hasSteps?: boolean;
    hasOverview?: boolean;
  } = {}
): { publishable: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Gating Rule 1: EVIDENCE_READY is an intermediate drafting state, NOT publicly indexable
  if (status === "EVIDENCE_READY") {
    reasons.push("Status 'EVIDENCE_READY' indicates evidence complete but awaiting final editorial sign-off; not yet eligible for public indexing.");
    return { publishable: false, reasons };
  }

  if (status === "DRAFT" || status === "IN_REVIEW" || status === "ACTIVE") {
    reasons.push(`Content in status '${status}' cannot be published or indexed.`);
    return { publishable: false, reasons };
  }

  if (status !== "PUBLISHED") {
    reasons.push(`Status '${status}' is not eligible for publication.`);
    return { publishable: false, reasons };
  }

  // Type-specific requirements
  const type = options.entityType || "generic";

  if (type === "research" || type === "experiment") {
    if (!options.hasEvidencePack || !options.evidencePackComplete) {
      reasons.push(`Empirical ${type} requires a verified, complete EvidencePack before public indexation.`);
    }
  }

  if (type === "article") {
    if (options.bodyLengthWords === undefined || options.bodyLengthWords < 100) {
      reasons.push("Articles require a substantive body (>100 words) for publication.");
    }
  }

  if (type === "guide") {
    if (!options.hasSteps) {
      reasons.push("Guides require verified implementation steps for publication.");
    }
  }

  if (type === "professional-experience") {
    if (!options.hasOverview) {
      reasons.push("Professional Experience requires substantive overview and responsibilities.");
    }
  }

  return {
    publishable: reasons.length === 0,
    reasons,
  };
}

/**
 * Deterministic Relational Symmetry Inspector
 * Audits cross-references between research and experiments.
 */
export function auditRelationshipSymmetry(
  sourceId: string,
  sourceDeclaredTargets: string[] = [],
  targetId: string,
  targetDeclaredSources: string[] = []
): { symmetric: boolean; severity: "NONE" | "ASYMMETRIC_CITATION_WARNING" | "FATAL_ERROR"; notes: string } {
  const sourceDeclaresTarget = sourceDeclaredTargets.includes(targetId);
  const targetDeclaresSource = targetDeclaredSources.includes(sourceId);

  if (sourceDeclaresTarget && targetDeclaresSource) {
    return { symmetric: true, severity: "NONE", notes: `Symmetric mutual relationship established between ${sourceId} and ${targetId}.` };
  }

  if (sourceDeclaresTarget && !targetDeclaresSource) {
    return {
      symmetric: false,
      severity: "ASYMMETRIC_CITATION_WARNING",
      notes: `${sourceId} references ${targetId}, but ${targetId} does not declare reciprocal link back to ${sourceId}. (Dynamic query resolution handles this safely; static symmetry recommended).`,
    };
  }

  return { symmetric: true, severity: "NONE", notes: "No relationship declared." };
}
