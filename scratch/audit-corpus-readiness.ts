import { getAllResearch } from "../data/research";
import { getAllExperiments } from "../data/experiments";
import { getAllArticles } from "../data/articles";
import { getAllGuides } from "../data/guides";
import { getAllProfessionalExperiences } from "../data/professional-experience";
import { getAllSources } from "../data/sources";
import { getAllTopics } from "../data/topics";
import { getCanonicalAuthor } from "../data/authors";
import { validateContentGraph, isIndexable } from "../lib/content-utils";
import * as fs from "fs";
import * as path from "path";

export interface EntityAuditItem {
  type: string;
  id: string;
  slug: string;
  title: string;
  status: string;
  indexable: boolean;
  hasSubstantiveContent: boolean;
  hasEvidence: boolean;
  hasSources: boolean;
  hasRelationships: boolean;
  retrievalReady: boolean;
  publicationReady: boolean;
  classification: string;
  blockers: string[];
}

function runAudit() {
  console.log("==================================================");
  console.log("DIXITH PHASE 8H: CONTENT CORPUS & EVIDENCE AUDIT");
  console.log("==================================================\n");

  const research = getAllResearch();
  const experiments = getAllExperiments();
  const articles = getAllArticles();
  const guides = getAllGuides();
  const experiences = getAllProfessionalExperiences();
  const sources = getAllSources();
  const topics = getAllTopics();
  const author = getCanonicalAuthor();

  console.log(`Corpus Totals:`);
  console.log(`- Research: ${research.length}`);
  console.log(`- Experiments: ${experiments.length}`);
  console.log(`- Articles: ${articles.length}`);
  console.log(`- Guides: ${guides.length}`);
  console.log(`- Professional Experience: ${experiences.length}`);
  console.log(`- Sources: ${sources.length}`);
  console.log(`- Topics: ${topics.length}`);
  console.log(`- Canonical Author: ${author.name} (${author.id})\n`);

  const auditItems: EntityAuditItem[] = [];

  // Audit Research
  for (const r of research) {
    const blockers: string[] = [];
    const hasSubstantiveContent = Boolean(
      (r.methodology && r.methodology.length > 30) &&
      (r.question && r.question.length > 20) &&
      (r.limitations && r.limitations.length > 0)
    );
    const hasEvidence = Boolean(
      (r.findings && r.findings.length > 0) ||
      (r.observations && r.observations.length > 0)
    );
    const hasSources = Boolean(r.sourceIds && r.sourceIds.length > 0);
    const hasRelationships = Boolean(
      (r.entityReferences && r.entityReferences.length > 0) ||
      (r.relatedExperimentIds && r.relatedExperimentIds.length > 0) ||
      (r.relatedResearchIds && r.relatedResearchIds.length > 0)
    );

    if (!hasSubstantiveContent) blockers.push("NEEDS_CONTENT");
    if (!hasEvidence) blockers.push("NEEDS_EVIDENCE");
    if (!hasSources) blockers.push("NEEDS_SOURCES");
    if (!hasRelationships) blockers.push("NEEDS_RELATIONSHIPS");
    if (r.status !== "PUBLISHED") blockers.push(`STATUS_${r.status}`);

    let classification = "READY_FOR_PUBLICATION_REVIEW";
    if (blockers.includes("NEEDS_EVIDENCE")) classification = "NEEDS_EVIDENCE";
    else if (blockers.includes("NEEDS_CONTENT")) classification = "NEEDS_CONTENT";
    else if (blockers.includes("NEEDS_SOURCES")) classification = "NEEDS_SOURCES";
    else if (blockers.includes("NEEDS_RELATIONSHIPS")) classification = "NEEDS_RELATIONSHIPS";
    else if (r.status === "DRAFT" || r.status === "IN_REVIEW") classification = "READY_FOR_PUBLICATION_REVIEW";

    auditItems.push({
      type: "research",
      id: r.id,
      slug: r.slug,
      title: r.title,
      status: r.status,
      indexable: isIndexable(r.status),
      hasSubstantiveContent,
      hasEvidence,
      hasSources,
      hasRelationships,
      retrievalReady: false, // only published can be in index
      publicationReady: isIndexable(r.status),
      classification,
      blockers,
    });
  }

  // Audit Experiments
  for (const e of experiments) {
    const blockers: string[] = [];
    const hasSubstantiveContent = Boolean(
      (e.methodology && e.methodology.length > 30) &&
      (e.researchQuestion && e.researchQuestion.length > 20) &&
      (e.variables && e.variables.length > 0)
    );
    const hasEvidence = Boolean(
      (e.evidence && e.evidence.length > 0) &&
      (e.observations && e.observations.length > 0)
    );
    const hasSources = Boolean(e.sourceIds && e.sourceIds.length > 0);
    const hasRelationships = Boolean(
      (e.entityReferences && e.entityReferences.length > 0) ||
      (e.relatedResearchIds && e.relatedResearchIds.length > 0)
    );

    if (!hasSubstantiveContent) blockers.push("NEEDS_CONTENT");
    if (!hasEvidence) blockers.push("NEEDS_EVIDENCE");
    if (!hasSources) blockers.push("NEEDS_SOURCES");
    if (!hasRelationships) blockers.push("NEEDS_RELATIONSHIPS");
    if (e.status !== "PUBLISHED") blockers.push(`STATUS_${e.status}`);

    let classification = "READY_FOR_PUBLICATION_REVIEW";
    if (blockers.includes("NEEDS_EVIDENCE")) classification = "NEEDS_EVIDENCE";
    else if (blockers.includes("NEEDS_CONTENT")) classification = "NEEDS_CONTENT";
    else if (blockers.includes("NEEDS_SOURCES")) classification = "NEEDS_SOURCES";
    else if (blockers.includes("NEEDS_RELATIONSHIPS")) classification = "NEEDS_RELATIONSHIPS";
    else if (e.status === "ACTIVE") classification = "NOT_READY (ACTIVE_IN_LAB)";

    auditItems.push({
      type: "experiment",
      id: e.id,
      slug: e.slug,
      title: e.title,
      status: e.status,
      indexable: isIndexable(e.status),
      hasSubstantiveContent,
      hasEvidence,
      hasSources,
      hasRelationships,
      retrievalReady: false,
      publicationReady: isIndexable(e.status),
      classification,
      blockers,
    });
  }

  // Audit Articles
  for (const a of articles) {
    const blockers: string[] = [];
    const hasSubstantiveContent = Boolean(a.body && a.body.length > 100);
    const hasEvidence = false; // Articles currently have no empirical evidence block or body text
    const hasSources = Boolean(a.sourceIds && a.sourceIds.length > 0);
    const hasRelationships = Boolean(
      (a.entityReferences && a.entityReferences.length > 0) ||
      (a.relatedResearchIds && a.relatedResearchIds.length > 0)
    );

    if (!hasSubstantiveContent) blockers.push("NEEDS_CONTENT");
    if (!hasEvidence) blockers.push("NEEDS_EVIDENCE");
    if (!hasSources) blockers.push("NEEDS_SOURCES");
    if (!hasRelationships) blockers.push("NEEDS_RELATIONSHIPS");
    if (a.status !== "PUBLISHED") blockers.push(`STATUS_${a.status}`);

    let classification = "NEEDS_CONTENT";
    if (!hasSubstantiveContent) classification = "NEEDS_CONTENT";
    else if (!hasEvidence) classification = "NEEDS_EVIDENCE";

    auditItems.push({
      type: "article",
      id: a.id,
      slug: a.slug,
      title: a.title,
      status: a.status,
      indexable: isIndexable(a.status),
      hasSubstantiveContent,
      hasEvidence,
      hasSources,
      hasRelationships,
      retrievalReady: false,
      publicationReady: isIndexable(a.status),
      classification,
      blockers,
    });
  }

  // Audit Guides
  for (const g of guides) {
    const blockers: string[] = [];
    const hasSubstantiveContent = Boolean(
      g.steps && g.steps.length > 0 &&
      g.prerequisites && g.prerequisites.length > 0
    );
    const hasEvidence = true; // Technical architectural implementation steps & code
    const hasSources = Boolean(g.sourceIds && g.sourceIds.length > 0);
    const hasRelationships = Boolean(
      (g.entityReferences && g.entityReferences.length > 0) ||
      (g.relatedResearchIds && g.relatedResearchIds.length > 0)
    );

    if (!hasSubstantiveContent) blockers.push("NEEDS_CONTENT");
    if (!hasSources) blockers.push("NEEDS_SOURCES");
    if (!hasRelationships) blockers.push("NEEDS_RELATIONSHIPS");
    if (g.status !== "PUBLISHED") blockers.push(`STATUS_${g.status}`);

    let classification = "READY_FOR_PUBLICATION_REVIEW";
    if (!hasSubstantiveContent) classification = "NEEDS_CONTENT";
    else if (!hasSources) classification = "NEEDS_SOURCES";
    else if (!hasRelationships) classification = "NEEDS_RELATIONSHIPS";
    else if (g.status === "DRAFT") classification = "READY_FOR_PUBLICATION_REVIEW";

    auditItems.push({
      type: "guide",
      id: g.id,
      slug: g.slug,
      title: g.title,
      status: g.status,
      indexable: isIndexable(g.status),
      hasSubstantiveContent,
      hasEvidence,
      hasSources,
      hasRelationships,
      retrievalReady: false,
      publicationReady: isIndexable(g.status),
      classification,
      blockers,
    });
  }

  // Audit Professional Experience
  for (const pe of experiences) {
    const blockers: string[] = [];
    const hasSubstantiveContent = Boolean(
      pe.overview && pe.responsibilities && pe.responsibilities.length > 0 &&
      pe.technicalFocus && pe.technicalFocus.length > 0 &&
      pe.searchFocus && pe.searchFocus.length > 0
    );
    const hasEvidence = Boolean(pe.technologies && pe.technologies.length > 0);
    const hasSources = false; // PE is professional experience, not research backed by third-party academic sources
    const hasRelationships = Boolean(
      (pe.entityReferences && pe.entityReferences.length > 0) ||
      (pe.relatedResearchIds && pe.relatedResearchIds.length > 0)
    );

    if (!hasSubstantiveContent) blockers.push("NEEDS_CONTENT");
    if (!hasRelationships) blockers.push("NEEDS_RELATIONSHIPS");
    if (pe.status !== "PUBLISHED") blockers.push(`STATUS_${pe.status}`);

    let classification = "PUBLISHED_ACTIVE";
    if (pe.status === "PUBLISHED") classification = "PUBLISHED_ACTIVE";

    auditItems.push({
      type: "professional-experience",
      id: pe.id,
      slug: pe.slug,
      title: pe.title,
      status: pe.status,
      indexable: isIndexable(pe.status),
      hasSubstantiveContent,
      hasEvidence,
      hasSources,
      hasRelationships,
      retrievalReady: isIndexable(pe.status),
      publicationReady: isIndexable(pe.status),
      classification,
      blockers,
    });
  }

  console.log("Entity Inventory & Readiness Summary:");
  console.log("---------------------------------------------------------------------------------------------------------------------------------");
  console.log("Type       | ID      | Status     | Substantive | Evidence | Sources | Relations | Indexable | Retrieval Ready | Classification");
  console.log("-----------+---------+------------+-------------+----------+---------+-----------+-----------+-----------------+------------------------------");
  for (const item of auditItems) {
    console.log(
      `${item.type.padEnd(10)} | ${item.id.padEnd(7)} | ${item.status.padEnd(10)} | ` +
      `${String(item.hasSubstantiveContent).padEnd(11)} | ${String(item.hasEvidence).padEnd(8)} | ` +
      `${String(item.hasSources).padEnd(7)} | ${String(item.hasRelationships).padEnd(9)} | ` +
      `${String(item.indexable).padEnd(9)} | ${String(item.retrievalReady).padEnd(15)} | ${item.classification}`
    );
  }
  console.log("---------------------------------------------------------------------------------------------------------------------------------\n");

  // Validate Knowledge Graph
  console.log("Validating Knowledge Graph Structure:");
  const graphValidation = validateContentGraph();
  console.log(`- Graph Valid: ${graphValidation.isValid}`);
  console.log(`- Errors: ${graphValidation.errors.length}`);
  console.log(`- Warnings: ${graphValidation.warnings.length}`);
  console.log(`- Stats:`, graphValidation.stats);
  if (graphValidation.errors.length > 0) {
    console.log("Errors:", graphValidation.errors);
  }
  if (graphValidation.warnings.length > 0) {
    console.log("Warnings:", graphValidation.warnings);
  }

  // Check derived semantic index
  console.log("\nChecking Derived Semantic Index Safety:");
  const indexPath = path.join(process.cwd(), "data", "derived", "semantic-index.json");
  if (fs.existsSync(indexPath)) {
    const raw = JSON.parse(fs.readFileSync(indexPath, "utf8"));
    const records = raw.records || [];
    console.log(`- Stored records: ${records.length}`);
    const entityTypes = new Set(records.map((r: any) => r.metadata.entityType));
    const entityIds = new Set(records.map((r: any) => r.metadata.entityId));
    const statuses = new Set(records.map((r: any) => r.metadata.status));
    console.log(`- Indexed Entity Types: ${Array.from(entityTypes).join(", ")}`);
    console.log(`- Indexed Entity IDs: ${Array.from(entityIds).join(", ")}`);
    console.log(`- Indexed Statuses: ${Array.from(statuses).join(", ")}`);

    const leakedNonPublished = records.filter((r: any) => r.metadata.status !== "PUBLISHED");
    console.log(`- Leaked non-published chunks: ${leakedNonPublished.length}`);
  } else {
    console.log("- Semantic index file not found!");
  }
}

runAudit();
