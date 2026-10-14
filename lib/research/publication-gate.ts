/**
 * DIXITH Phase 8J.3 — Publication Gate & Content Eligibility Architecture
 *
 * Implements the strict, fail-closed validation boundary between the internal
 * knowledge corpus and public discovery channels (Google Indexing, XML Sitemap,
 * Lexical Search, Semantic Vector Store, Hybrid Retrieval, and Future Ask DIXITH).
 *
 * Epistemological Gating Rules:
 * 1. Only content with status === "PUBLISHED" is publicly indexable or retrievable.
 * 2. Status "EVIDENCE_READY" indicates completed empirical verification, but remains
 *    STRICTLY NON-PUBLIC until explicit editorial transition to "PUBLISHED".
 * 3. Research studies require verified empirical EvidencePacks with zero unsupported findings.
 * 4. Articles require substantive body text (>100 words).
 * 5. Guides require structured, verified implementation steps and code snippets.
 * 6. Quarantined evidence artifacts are rejected with fatal integrity violations.
 */

import {
  ContentStatus,
  isIndexable,
  EntityType,
  BaseContentEntity,
  ResearchEntityModel,
  ExperimentItem,
  ArticleEntityModel,
  GuideEntityModel,
  ProfessionalExperienceItem,
} from "../../data/types";
import {
  EvidencePack,
  EvidenceItem,
  validateEvidencePack,
  validateFinding,
  validateInterpretation,
  validateQuarantineIsolation,
} from "./evidence-model";
import { getSourceById } from "../../data/sources";
import { resolveEntity } from "../content-utils";

// ============================================================================
// 1. Publication Eligibility Result Contract
// ============================================================================

export interface PublicationEligibilityResult {
  eligible: boolean;
  status: ContentStatus;
  entityId: string;
  entityType: EntityType | string;
  blockers: string[];
  warnings: string[];
  gateDetails: {
    hasRequiredMetadata: boolean;
    hasSubstantiveContent: boolean;
    hasValidRelationships: boolean;
    hasEvidencePack: boolean;
    evidencePackComplete: boolean;
    hasUnsupportedFindings: boolean;
    isQuarantined: boolean;
    isExplicitlyPublished: boolean;
    isPublicRetrievalEligible: boolean;
  };
}

// ============================================================================
// 2. Publication State Machine Transitions
// ============================================================================

export const VALID_STATUS_TRANSITIONS: Record<ContentStatus, ContentStatus[]> = {
  DRAFT: ["IN_REVIEW", "ARCHIVED"],
  IN_REVIEW: ["EVIDENCE_READY", "DRAFT", "ARCHIVED"],
  EVIDENCE_READY: ["PUBLISHED", "IN_REVIEW", "DRAFT", "ARCHIVED"],
  ACTIVE: ["COMPLETED", "IN_REVIEW", "ARCHIVED"],
  COMPLETED: ["EVIDENCE_READY", "IN_REVIEW", "ARCHIVED"],
  PUBLISHED: ["ARCHIVED", "IN_REVIEW"],
  ARCHIVED: ["DRAFT", "IN_REVIEW"],
};

/**
 * Validates whether a requested lifecycle status transition is formally permitted.
 * Guarantees no implicit or automatic promotion to PUBLISHED.
 */
export function validateStatusTransition(
  from: ContentStatus,
  to: ContentStatus,
  eligibility?: PublicationEligibilityResult
): { allowed: boolean; reason?: string } {
  if (from === to) {
    return { allowed: true, reason: `Status unchanged (${from}).` };
  }

  const allowedTargets = VALID_STATUS_TRANSITIONS[from] || [];
  if (!allowedTargets.includes(to)) {
    return {
      allowed: false,
      reason: `Illegal lifecycle transition: cannot move directly from '${from}' to '${to}'.`,
    };
  }

  // Moving to PUBLISHED requires full eligibility compliance
  if (to === "PUBLISHED") {
    if (!eligibility || !eligibility.eligible) {
      const blockerSummary = eligibility ? eligibility.blockers.join("; ") : "No eligibility report provided";
      return {
        allowed: false,
        reason: `Cannot transition to 'PUBLISHED': failed publication gate (${blockerSummary}).`,
      };
    }
  }

  return { allowed: true };
}

// ============================================================================
// 3. Fail-Closed Metadata & Relationship Helpers
// ============================================================================

function checkRequiredMetadata(entity: Partial<BaseContentEntity>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!entity.id || !entity.id.trim()) errors.push("Missing required entity 'id'");
  if (!entity.slug || !entity.slug.trim()) errors.push("Missing required 'slug'");
  if (!entity.title || !entity.title.trim()) errors.push("Missing required 'title'");
  if (!entity.status) errors.push("Missing required 'status'");
  return { valid: errors.length === 0, errors };
}

function checkRelationshipValidity(entity: Partial<BaseContentEntity>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check source references
  if (entity.sourceIds) {
    for (const srcId of entity.sourceIds) {
      const src = getSourceById(srcId);
      if (!src) {
        errors.push(`Broken source reference: '${srcId}' does not exist in canonical sources registry`);
      }
    }
  }

  // Check entity references
  if (entity.entityReferences) {
    for (const ref of entity.entityReferences) {
      const target = resolveEntity(ref.type, ref.id);
      if (!target) {
        errors.push(`Broken entity reference: [${ref.type}] '${ref.id}' could not be resolved`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

// ============================================================================
// 4. Content-Specific Publication Gate Validators
// ============================================================================

/**
 * Validates a Research Study for Publication Readiness
 * Rule: A research study cannot be published without a complete, verified EvidencePack.
 */
export function validateResearchPublication(
  research: ResearchEntityModel,
  evidencePack?: EvidencePack
): PublicationEligibilityResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const metaCheck = checkRequiredMetadata(research);
  blockers.push(...metaCheck.errors);

  const relCheck = checkRelationshipValidity(research);
  blockers.push(...relCheck.errors);

  if (!research.authorId) {
    blockers.push("Research requires an explicit 'authorId' for E-E-A-T attribution");
  }

  if (!research.question || research.question.length < 20) {
    blockers.push("Research requires a formal research question (min 20 chars)");
  }

  if (!research.methodology || research.methodology.length < 30) {
    blockers.push("Research requires a documented methodology specification (min 30 chars)");
  }

  if (!research.limitations || research.limitations.length === 0) {
    blockers.push("Research requires documented methodological limitations");
  }

  // Evidence Pack Evaluation
  let hasEvidencePack = Boolean(evidencePack);
  let evidencePackComplete = false;
  let hasUnsupportedFindings = false;
  let isQuarantined = false;

  if (!evidencePack) {
    blockers.push("Research lacks an empirical EvidencePack (methodology alone cannot be published)");
  } else {
    const packValidation = validateEvidencePack(evidencePack);
    evidencePackComplete = packValidation.complete;
    if (!packValidation.valid) {
      blockers.push(...packValidation.errors);
    }

    // Inspect individual findings
    for (const finding of evidencePack.findings) {
      const fCheck = validateFinding(finding);
      if (!fCheck.valid) {
        hasUnsupportedFindings = true;
        blockers.push(...fCheck.errors);
      }
    }

    // Inspect quarantine isolation
    for (const ev of evidencePack.evidenceItems) {
      const qCheck = validateQuarantineIsolation(ev);
      if (!qCheck.valid) {
        isQuarantined = true;
        blockers.push(...qCheck.errors);
      }
    }
  }

  // Status Check: Must be PUBLISHED to be public
  const isExplicitlyPublished = research.status === "PUBLISHED";
  if (!isExplicitlyPublished) {
    blockers.push(`Research status is '${research.status}'; must be 'PUBLISHED' for public retrieval`);
  }

  const eligible = blockers.length === 0;

  return {
    eligible,
    status: research.status,
    entityId: research.id,
    entityType: "research",
    blockers,
    warnings,
    gateDetails: {
      hasRequiredMetadata: metaCheck.valid,
      hasSubstantiveContent: Boolean(research.methodology && research.question),
      hasValidRelationships: relCheck.valid,
      hasEvidencePack,
      evidencePackComplete,
      hasUnsupportedFindings,
      isQuarantined,
      isExplicitlyPublished,
      isPublicRetrievalEligible: eligible && isIndexable(research.status),
    },
  };
}

/**
 * Validates a Lab Experiment for Publication Readiness
 */
export function validateExperimentPublication(
  experiment: ExperimentItem,
  evidencePack?: EvidencePack
): PublicationEligibilityResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const metaCheck = checkRequiredMetadata(experiment);
  blockers.push(...metaCheck.errors);

  const relCheck = checkRelationshipValidity(experiment);
  blockers.push(...relCheck.errors);

  if (experiment.status === "ACTIVE") {
    blockers.push("Experiment is currently in 'ACTIVE' laboratory execution; cannot be published");
  }

  if (!experiment.purpose || experiment.purpose.length < 20) {
    blockers.push("Experiment requires an explicit purpose statement");
  }

  if (!experiment.variables || experiment.variables.length === 0) {
    blockers.push("Experiment requires declared experimental variables");
  }

  if (!evidencePack) {
    blockers.push("Experiment requires a compiled EvidencePack from benchmark runs");
  }

  const isExplicitlyPublished = experiment.status === "PUBLISHED";
  if (!isExplicitlyPublished) {
    blockers.push(`Experiment status is '${experiment.status}'; must be 'PUBLISHED' for public retrieval`);
  }

  const eligible = blockers.length === 0;

  return {
    eligible,
    status: experiment.status,
    entityId: experiment.id,
    entityType: "experiment",
    blockers,
    warnings,
    gateDetails: {
      hasRequiredMetadata: metaCheck.valid,
      hasSubstantiveContent: Boolean(experiment.methodology && experiment.purpose),
      hasValidRelationships: relCheck.valid,
      hasEvidencePack: Boolean(evidencePack),
      evidencePackComplete: Boolean(evidencePack && evidencePack.verificationStatus === "EVIDENCE_COMPLETE"),
      hasUnsupportedFindings: false,
      isQuarantined: false,
      isExplicitlyPublished,
      isPublicRetrievalEligible: eligible && isIndexable(experiment.status),
    },
  };
}

/**
 * Validates an Article for Publication Readiness
 * Rule: An article cannot be published based on metadata alone; requires body > 100 words.
 */
export function validateArticlePublication(article: ArticleEntityModel): PublicationEligibilityResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const metaCheck = checkRequiredMetadata(article);
  blockers.push(...metaCheck.errors);

  const relCheck = checkRelationshipValidity(article);
  blockers.push(...relCheck.errors);

  // Substantive Body Rule
  const bodyText = (article.body || "").trim();
  const wordCount = bodyText.length > 0 ? bodyText.split(/\s+/).length : 0;

  if (wordCount < 100) {
    blockers.push(
      `Article has insufficient body content (${wordCount} words; minimum 100 words required for publication)`
    );
  }

  if (!article.authorId) {
    blockers.push("Article requires an explicit 'authorId' for attribution");
  }

  const isExplicitlyPublished = article.status === "PUBLISHED";
  if (!isExplicitlyPublished) {
    blockers.push(`Article status is '${article.status}'; must be 'PUBLISHED' for public retrieval`);
  }

  const eligible = blockers.length === 0;

  return {
    eligible,
    status: article.status,
    entityId: article.id,
    entityType: "article",
    blockers,
    warnings,
    gateDetails: {
      hasRequiredMetadata: metaCheck.valid,
      hasSubstantiveContent: wordCount >= 100,
      hasValidRelationships: relCheck.valid,
      hasEvidencePack: false,
      evidencePackComplete: false,
      hasUnsupportedFindings: false,
      isQuarantined: false,
      isExplicitlyPublished,
      isPublicRetrievalEligible: eligible && isIndexable(article.status),
    },
  };
}

/**
 * Validates an Implementation Guide for Publication Readiness
 */
export function validateGuidePublication(guide: GuideEntityModel): PublicationEligibilityResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const metaCheck = checkRequiredMetadata(guide);
  blockers.push(...metaCheck.errors);

  const relCheck = checkRelationshipValidity(guide);
  blockers.push(...relCheck.errors);

  if (!guide.steps || guide.steps.length === 0) {
    blockers.push("Guide requires at least one implementation step");
  }

  if (!guide.prerequisites || guide.prerequisites.length === 0) {
    blockers.push("Guide requires declared prerequisites");
  }

  const isExplicitlyPublished = guide.status === "PUBLISHED";
  if (!isExplicitlyPublished) {
    blockers.push(`Guide status is '${guide.status}'; must be 'PUBLISHED' for public retrieval`);
  }

  const eligible = blockers.length === 0;

  return {
    eligible,
    status: guide.status,
    entityId: guide.id,
    entityType: "guide",
    blockers,
    warnings,
    gateDetails: {
      hasRequiredMetadata: metaCheck.valid,
      hasSubstantiveContent: Boolean(guide.steps && guide.steps.length > 0),
      hasValidRelationships: relCheck.valid,
      hasEvidencePack: false,
      evidencePackComplete: false,
      hasUnsupportedFindings: false,
      isQuarantined: false,
      isExplicitlyPublished,
      isPublicRetrievalEligible: eligible && isIndexable(guide.status),
    },
  };
}

/**
 * Validates a Professional Experience Entity for Publication Readiness
 */
export function validateExperiencePublication(pe: ProfessionalExperienceItem): PublicationEligibilityResult {
  const blockers: string[] = [];
  const warnings: string[] = [];

  const metaCheck = checkRequiredMetadata(pe);
  blockers.push(...metaCheck.errors);

  const relCheck = checkRelationshipValidity(pe);
  blockers.push(...relCheck.errors);

  if (!pe.overview || pe.overview.length < 30) {
    blockers.push("Professional Experience requires a comprehensive overview (min 30 chars)");
  }

  if (!pe.responsibilities || pe.responsibilities.length === 0) {
    blockers.push("Professional Experience requires declared technical responsibilities");
  }

  if (!pe.technicalFocus || pe.technicalFocus.length === 0) {
    blockers.push("Professional Experience requires declared technical focus areas");
  }

  if (!pe.disclosure) {
    blockers.push("Professional Experience requires a client/commercial confidentiality disclosure");
  }

  const isExplicitlyPublished = pe.status === "PUBLISHED";
  if (!isExplicitlyPublished) {
    blockers.push(`Professional Experience status is '${pe.status}'; must be 'PUBLISHED' for public retrieval`);
  }

  const eligible = blockers.length === 0;

  return {
    eligible,
    status: pe.status,
    entityId: pe.id,
    entityType: "professional-experience",
    blockers,
    warnings,
    gateDetails: {
      hasRequiredMetadata: metaCheck.valid,
      hasSubstantiveContent: Boolean(pe.overview && pe.responsibilities && pe.responsibilities.length > 0),
      hasValidRelationships: relCheck.valid,
      hasEvidencePack: false,
      evidencePackComplete: false,
      hasUnsupportedFindings: false,
      isQuarantined: false,
      isExplicitlyPublished,
      isPublicRetrievalEligible: eligible && isIndexable(pe.status),
    },
  };
}

/**
 * Universal Publication Eligibility Dispatcher
 * Evaluates any entity across the corpus using its specific contract rules.
 */
export function validatePublicationEligibility(
  entity: any,
  options: { evidencePack?: EvidencePack } = {}
): PublicationEligibilityResult {
  if (!entity || typeof entity !== "object") {
    return {
      eligible: false,
      status: "DRAFT",
      entityId: "UNKNOWN",
      entityType: "unknown",
      blockers: ["Invalid or null entity object passed to publication gate"],
      warnings: [],
      gateDetails: {
        hasRequiredMetadata: false,
        hasSubstantiveContent: false,
        hasValidRelationships: false,
        hasEvidencePack: false,
        evidencePackComplete: false,
        hasUnsupportedFindings: false,
        isQuarantined: false,
        isExplicitlyPublished: false,
        isPublicRetrievalEligible: false,
      },
    };
  }

  // Detect entity type
  if ("researchArea" in entity && "question" in entity) {
    return validateResearchPublication(entity as ResearchEntityModel, options.evidencePack);
  }

  if ("purpose" in entity && "systemsTested" in entity && !("domain" in entity)) {
    return validateExperimentPublication(entity as ExperimentItem, options.evidencePack);
  }

  if ("domain" in entity && "responsibilities" in entity) {
    return validateExperiencePublication(entity as ProfessionalExperienceItem);
  }

  if ("steps" in entity && "difficultyLevel" in entity) {
    return validateGuidePublication(entity as GuideEntityModel);
  }

  if ("category" in entity && !("overview" in entity) && !("researchArea" in entity)) {
    return validateArticlePublication(entity as ArticleEntityModel);
  }

  // Generic fallback: fail closed
  return {
    eligible: false,
    status: entity.status || "DRAFT",
    entityId: entity.id || "UNKNOWN",
    entityType: "unrecognized",
    blockers: [`Unrecognized content entity type for id '${entity.id || "unknown"}'`],
    warnings: [],
    gateDetails: {
      hasRequiredMetadata: false,
      hasSubstantiveContent: false,
      hasValidRelationships: false,
      hasEvidencePack: false,
      evidencePackComplete: false,
      hasUnsupportedFindings: false,
      isQuarantined: false,
      isExplicitlyPublished: false,
      isPublicRetrievalEligible: false,
    },
  };
}

/**
 * Evaluates whether an entity is eligible for public discovery/retrieval.
 * Enforces that eligibility requires BOTH valid content criteria AND status === "PUBLISHED".
 */
export function isPublicRetrievalEligible(
  entity: any,
  options: { evidencePack?: EvidencePack } = {}
): boolean {
  const result = validatePublicationEligibility(entity, options);
  return result.eligible && isIndexable(result.status);
}
