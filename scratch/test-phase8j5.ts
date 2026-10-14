/**
 * DIXITH Phase 8J.5 — Knowledge Graph & Relationship Integrity Test Suite
 *
 * Verifies 40 assertions across 8 core categories:
 * - Entity Integrity (1-6)
 * - Relationship Integrity (7-12)
 * - Known Graph Traversal (13-22)
 * - Backlink & Reverse Traversal (23-25)
 * - Source, Topic & Author Graph (26-30)
 * - Publication & Quarantine Safety (31-34)
 * - Graph Traversal Determinism (35-37)
 * - Cycle & Orphan Detection (38-40)
 *
 * STRICT CONSTRAINTS:
 * - Offline only: zero external APIs, zero browser launches, zero CDP connections.
 * - Historical evidence untouched.
 * - Quarantined evidence excluded.
 */

import {
  resolveEntity,
  resolveEntityReference,
  resolveRelationship,
  getRelatedContent,
  getContentBacklinks,
  getSourcesForContent,
  getTopicsForContent,
  getResearchForExperiment,
  getArticlesForResearch,
  getGuidesForResearch,
  getExperimentsForResearch,
  validateContentGraph,
  detectGraphCycles,
  analyzeGraphOrphans,
} from "../lib/content-utils";
import { getAllResearch, getResearchById } from "../data/research";
import { getAllExperiments, getExperimentById } from "../data/experiments";
import { getAllArticles, getArticleById } from "../data/articles";
import { getAllGuides, getGuideById } from "../data/guides";
import {
  getAllProfessionalExperiences,
  getProfessionalExperienceById,
} from "../data/professional-experience";
import { getAllSources, getSourceById } from "../data/sources";
import { getAllTopics, getTopicById } from "../data/topics";
import { getCanonicalAuthor } from "../data/authors";
import { EntityType, RelationType, EntityReference } from "../data/types";

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

async function runTestSuite() {
  console.log("================================================================================");
  console.log(" DIXITH Phase 8J.5 — Knowledge Graph & Relationship Integrity Suite");
  console.log("================================================================================\n");

  // ----------------------------------------------------
  // SECTION 1: ENTITY INTEGRITY (Assertions 1-6)
  // ----------------------------------------------------
  console.log("[Category 1: Entity Integrity]");

  // 1. all canonical entities load
  {
    const research = getAllResearch();
    const experiments = getAllExperiments();
    const articles = getAllArticles();
    const guides = getAllGuides();
    const pe = getAllProfessionalExperiences();
    const sources = getAllSources();
    const topics = getAllTopics();
    const author = getCanonicalAuthor();

    const totalCount =
      research.length +
      experiments.length +
      articles.length +
      guides.length +
      pe.length +
      sources.length +
      topics.length +
      (author ? 1 : 0);

    assert(
      research.length === 3 &&
      experiments.length === 1 &&
      articles.length === 3 &&
      guides.length === 2 &&
      pe.length === 3 &&
      sources.length === 6 &&
      topics.length === 7 &&
      totalCount === 26,
      "1. All 26 canonical entities load cleanly across 8 entity types"
    );
  }

  // 2. all entity IDs unique within their types
  {
    const allCollections: { type: EntityType; items: { id: string }[] }[] = [
      { type: "research", items: getAllResearch() },
      { type: "experiment", items: getAllExperiments() },
      { type: "article", items: getAllArticles() },
      { type: "guide", items: getAllGuides() },
      { type: "professional-experience", items: getAllProfessionalExperiences() },
      { type: "source", items: getAllSources() },
      { type: "topic", items: getAllTopics() },
      { type: "author", items: [getCanonicalAuthor()] },
    ];

    let allUnique = true;
    for (const col of allCollections) {
      const ids = col.items.map((i) => i.id);
      const unique = new Set(ids);
      if (unique.size !== ids.length) {
        allUnique = false;
        break;
      }
    }
    assert(allUnique, "2. All entity IDs are unique within their respective entity types");
  }

  // 3. Research IDs resolve as research
  {
    const r12 = resolveEntity("research", "EXP-012");
    const r13 = resolveEntity("research", "EXP-013");
    const r14 = resolveEntity("research", "EXP-014");
    assert(
      Boolean(r12 && r13 && r14),
      "3. Research IDs (EXP-012, EXP-013, EXP-014) resolve cleanly under 'research' namespace"
    );
  }

  // 4. EXP-001 resolves as experiment
  {
    const e1 = resolveEntity("experiment", "EXP-001");
    assert(
      Boolean(e1),
      "4. EXP-001 resolves cleanly under 'experiment' namespace"
    );
  }

  // 5. EXP-012 does not resolve as experiment
  {
    const wrongRes = resolveEntity("experiment", "EXP-012");
    assert(
      wrongRes === undefined,
      "5. EXP-012 fails to resolve as 'experiment' (namespace disambiguation enforced)"
    );
  }

  // 6. EXP-001 does not resolve as research
  {
    const wrongExp = resolveEntity("research", "EXP-001");
    assert(
      wrongExp === undefined,
      "6. EXP-001 fails to resolve as 'research' (namespace disambiguation enforced)"
    );
  }

  // ----------------------------------------------------
  // SECTION 2: RELATIONSHIP INTEGRITY (Assertions 7-12)
  // ----------------------------------------------------
  console.log("\n[Category 2: Relationship Integrity]");

  // 7. all relationship references resolve
  {
    const content = [
      ...getAllResearch(),
      ...getAllExperiments(),
      ...getAllArticles(),
      ...getAllGuides(),
      ...getAllProfessionalExperiences(),
    ];
    let allResolved = true;
    for (const item of content) {
      if (item.entityReferences) {
        for (const ref of item.entityReferences) {
          if (!resolveEntityReference(ref)) {
            allResolved = false;
            break;
          }
        }
      }
    }
    assert(allResolved, "7. All explicit EntityReference targets resolve to real canonical entities");
  }

  // 8. all relation types are valid
  {
    const LEGAL_RELATIONS: RelationType[] = [
      "validates",
      "tests",
      "explains",
      "applies",
      "references",
      "builds_on",
    ];
    const content = [
      ...getAllResearch(),
      ...getAllExperiments(),
      ...getAllArticles(),
      ...getAllGuides(),
      ...getAllProfessionalExperiences(),
    ];
    let allLegal = true;
    for (const item of content) {
      if (item.entityReferences) {
        for (const ref of item.entityReferences) {
          if (ref.relation && !LEGAL_RELATIONS.includes(ref.relation)) {
            allLegal = false;
            break;
          }
        }
      }
    }
    assert(allLegal, "8. All relationship verbs conform to the canonical RelationType vocabulary");
  }

  // 9. no invalid target type
  {
    const LEGAL_TYPES: EntityType[] = [
      "research",
      "experiment",
      "article",
      "guide",
      "professional-experience",
      "source",
      "topic",
      "author",
    ];
    const content = [
      ...getAllResearch(),
      ...getAllExperiments(),
      ...getAllArticles(),
      ...getAllGuides(),
      ...getAllProfessionalExperiences(),
    ];
    let allValidTypes = true;
    for (const item of content) {
      if (item.entityReferences) {
        for (const ref of item.entityReferences) {
          if (!LEGAL_TYPES.includes(ref.type)) {
            allValidTypes = false;
            break;
          }
        }
      }
    }
    assert(allValidTypes, "9. All entity reference target types match valid EntityType declarations");
  }

  // 10. no broken IDs in graph validation
  {
    const validation = validateContentGraph();
    assert(
      validation.isValid && validation.errors.length === 0,
      "10. validateContentGraph() reports 0 broken IDs across the entire graph"
    );
  }

  // 11. no exact duplicate relationships
  {
    const content = [
      ...getAllResearch(),
      ...getAllExperiments(),
      ...getAllArticles(),
      ...getAllGuides(),
      ...getAllProfessionalExperiences(),
    ];
    let duplicateCount = 0;
    for (const item of content) {
      const seen = new Set<string>();
      if (item.entityReferences) {
        for (const ref of item.entityReferences) {
          const key = `${ref.type}:${ref.id}:${ref.relation || "none"}`;
          if (seen.has(key)) duplicateCount++;
          seen.add(key);
        }
      }
    }
    assert(duplicateCount === 0, "11. Zero exact duplicate relationship tuples exist in content entities");
  }

  // 12. invalid reference fails safely
  {
    const invalidRef = resolveRelationship(
      { type: "research", id: "EXP-014" },
      { type: "research", id: "NON-EXISTENT-ID", relation: "references" }
    );
    assert(
      !invalidRef.isValid && Boolean(invalidRef.error),
      "12. resolveRelationship() fails safely with descriptive error when target is missing"
    );
  }

  // ----------------------------------------------------
  // SECTION 3: KNOWN GRAPH TRAVERSAL (Assertions 13-22)
  // ----------------------------------------------------
  console.log("\n[Category 3: Known Graph Traversal]");

  // 13. EXP-014 -> EXP-001 resolves
  {
    const rel = resolveRelationship(
      { type: "research", id: "EXP-014" },
      { type: "experiment", id: "EXP-001", relation: "validates" }
    );
    assert(rel.isValid, "13. Known relationship: EXP-014 (Research) validates EXP-001 (Experiment)");
  }

  // 14. EXP-014 -> EXP-013 resolves
  {
    const rel = resolveRelationship(
      { type: "research", id: "EXP-014" },
      { type: "research", id: "EXP-013", relation: "references" }
    );
    assert(rel.isValid, "14. Known relationship: EXP-014 (Research) references EXP-013 (Research)");
  }

  // 15. EXP-013 -> EXP-001 resolves
  {
    const rel = resolveRelationship(
      { type: "research", id: "EXP-013" },
      { type: "experiment", id: "EXP-001", relation: "validates" }
    );
    assert(rel.isValid, "15. Known relationship: EXP-013 (Research) validates EXP-001 (Experiment)");
  }

  // 16. EXP-013 -> EXP-014 resolves
  {
    const rel = resolveRelationship(
      { type: "research", id: "EXP-013" },
      { type: "research", id: "EXP-014", relation: "references" }
    );
    assert(rel.isValid, "16. Known relationship: EXP-013 (Research) references EXP-014 (Research)");
  }

  // 17. EXP-012 -> EXP-001 resolves
  {
    const rel = resolveRelationship(
      { type: "research", id: "EXP-012" },
      { type: "experiment", id: "EXP-001", relation: "validates" }
    );
    assert(rel.isValid, "17. Known relationship: EXP-012 (Research) validates EXP-001 (Experiment)");
  }

  // 18. GUI-001 -> EXP-013 resolves
  {
    const rel = resolveRelationship(
      { type: "guide", id: "GUI-001" },
      { type: "research", id: "EXP-013", relation: "applies" }
    );
    assert(rel.isValid, "18. Known relationship: GUI-001 (Guide) applies EXP-013 (Research)");
  }

  // 19. GUI-001 -> SRC-001 resolves
  {
    const src = getSourceById("SRC-001");
    const guide = getGuideById("GUI-001");
    assert(
      Boolean(src && guide?.sourceIds?.includes("SRC-001")),
      "19. Known citation: GUI-001 cites canonical source SRC-001 (Schema.org Specs)"
    );
  }

  // 20. GUI-001 -> SRC-002 resolves
  {
    const src = getSourceById("SRC-002");
    const guide = getGuideById("GUI-001");
    assert(
      Boolean(src && guide?.sourceIds?.includes("SRC-002")),
      "20. Known citation: GUI-001 cites canonical source SRC-002 (Google Search Central)"
    );
  }

  // 21. GUI-002 -> EXP-014 resolves
  {
    const rel = resolveRelationship(
      { type: "guide", id: "GUI-002" },
      { type: "research", id: "EXP-014", relation: "applies" }
    );
    assert(rel.isValid, "21. Known relationship: GUI-002 (Guide) applies EXP-014 (Research)");
  }

  // 22. GUI-002 source references resolve
  {
    const guide = getGuideById("GUI-002");
    const sources = getSourcesForContent(guide?.sourceIds);
    assert(
      sources.length === 4 &&
      sources.some((s) => s.id === "SRC-003") &&
      sources.some((s) => s.id === "SRC-004") &&
      sources.some((s) => s.id === "SRC-005") &&
      sources.some((s) => s.id === "SRC-006"),
      "22. Known citations: GUI-002 resolves all 4 web crawler sources (SRC-003..SRC-006)"
    );
  }

  // ----------------------------------------------------
  // SECTION 4: BACKLINKS & REVERSE TRAVERSAL (Assertions 23-25)
  // ----------------------------------------------------
  console.log("\n[Category 4: Backlinks & Reverse Traversal]");

  // 23. reverse lookup for EXP-013 finds GUI-001
  {
    const backlinks = getContentBacklinks("EXP-013");
    assert(
      backlinks.some((b) => b.sourceId === "GUI-001" && b.sourceType === "guide"),
      "23. Reverse lookup: getContentBacklinks('EXP-013') identifies GUI-001"
    );
  }

  // 24. reverse lookup for EXP-014 finds GUI-002
  {
    const backlinks = getContentBacklinks("EXP-014");
    assert(
      backlinks.some((b) => b.sourceId === "GUI-002" && b.sourceType === "guide"),
      "24. Reverse lookup: getContentBacklinks('EXP-014') identifies GUI-002"
    );
  }

  // 25. reverse lookup for EXP-001 resolves known research relationships
  {
    const backlinks = getContentBacklinks("EXP-001");
    const sourceIds = backlinks.map((b) => b.sourceId);
    assert(
      sourceIds.includes("EXP-012") &&
      sourceIds.includes("EXP-013") &&
      sourceIds.includes("EXP-014"),
      "25. Reverse lookup: getContentBacklinks('EXP-001') identifies EXP-012, EXP-013, and EXP-014"
    );
  }

  // ----------------------------------------------------
  // SECTION 5: SOURCE, TOPIC & AUTHOR GRAPH (Assertions 26-30)
  // ----------------------------------------------------
  console.log("\n[Category 5: Source, Topic & Author Graph]");

  // 26. all sources resolve
  {
    const sources = getAllSources();
    const allValid = sources.every(
      (s) => s.id && s.title && s.url && s.verificationStatus === "VERIFIED"
    );
    assert(
      sources.length === 6 && allValid,
      "26. All 6 canonical sources resolve with valid URLs and VERIFIED status"
    );
  }

  // 27. all topics resolve
  {
    const topics = getAllTopics();
    const allValid = topics.every((t) => t.id && t.name && t.slug);
    assert(
      topics.length === 7 && allValid,
      "27. All 7 canonical topics resolve with valid IDs, names, and slugs"
    );
  }

  // 28. canonical author resolves
  {
    const author = getCanonicalAuthor();
    assert(
      author.id === "AUT-001" &&
      author.name === "Dixith Kumar" &&
      author.role === "AI Search Strategist",
      "28. Canonical author AUT-001 resolves to Dixith Kumar"
    );
  }

  // 29. no dangling topic references
  {
    const content = [
      ...getAllResearch(),
      ...getAllExperiments(),
      ...getAllArticles(),
      ...getAllGuides(),
      ...getAllProfessionalExperiences(),
    ];
    let allTopicsResolved = true;
    for (const item of content) {
      if (item.topics) {
        for (const t of item.topics) {
          if (!getTopicById(t)) {
            allTopicsResolved = false;
            break;
          }
        }
      }
    }
    assert(allTopicsResolved, "29. Zero dangling topic references across all content entities");
  }

  // 30. no dangling author references
  {
    const content = [
      ...getAllResearch(),
      ...getAllExperiments(),
      ...getAllArticles(),
      ...getAllGuides(),
    ];
    const allAuthorsValid = content.every(
      (item) => item.authorId === "AUT-001"
    );
    assert(allAuthorsValid, "30. All content authorId fields reference canonical author AUT-001");
  }

  // ----------------------------------------------------
  // SECTION 6: PUBLICATION & QUARANTINE SAFETY (Assertions 31-34)
  // ----------------------------------------------------
  console.log("\n[Category 6: Publication & Quarantine Safety]");

  // 31. unpublished entities remain excluded from public graph traversal
  {
    const publicBacklinks = getContentBacklinks("EXP-013", undefined, { publicOnly: true });
    const hasUnpublished = publicBacklinks.some(
      (b) => b.sourceStatus !== "PUBLISHED"
    );
    assert(
      !hasUnpublished,
      "31. Public graph traversal excludes unpublished entities from reverse backlink results"
    );
  }

  // 32. quarantined gemini-01 cannot resolve as public evidence
  {
    const quarantinedLookup = resolveEntity("source" as any, "RUN-001-20260927-Q001-gemini-01");
    const inGraph = Boolean(quarantinedLookup);
    assert(
      !inGraph,
      "32. Quarantined incident artifact (gemini-01) cannot resolve as a graph node or source"
    );
  }

  // 33. PUBLISHED PE entities remain graph-accessible
  {
    const publicBacklinks = getContentBacklinks("EXP-013", undefined, { publicOnly: true });
    assert(
      publicBacklinks.some((b) => b.sourceId === "PE-001"),
      "33. Published entity PE-001 remains accessible in public reverse graph traversal"
    );
  }

  // 34. no public graph traversal exposes DRAFT entities
  {
    const relatedFromDraft = getRelatedContent("guide", "GUI-001", { publicOnly: true });
    assert(
      relatedFromDraft.length === 0,
      "34. Public forward graph traversal returns 0 targets when targets are unpublished"
    );
  }

  // ----------------------------------------------------
  // SECTION 7: GRAPH TRAVERSAL DETERMINISM (Assertions 35-37)
  // ----------------------------------------------------
  console.log("\n[Category 7: Graph Traversal Determinism]");

  // 35. repeated graph validation is identical
  {
    const val1 = validateContentGraph();
    const val2 = validateContentGraph();
    assert(
      JSON.stringify(val1) === JSON.stringify(val2),
      "35. validateContentGraph() is 100% deterministic across repeated runs"
    );
  }

  // 36. repeated backlink traversal is identical
  {
    const bl1 = getContentBacklinks("EXP-014");
    const bl2 = getContentBacklinks("EXP-014");
    const bl3 = getContentBacklinks("EXP-014");
    assert(
      JSON.stringify(bl1) === JSON.stringify(bl2) &&
      JSON.stringify(bl1) === JSON.stringify(bl3),
      "36. getContentBacklinks() yields bit-exact identical ordering and records"
    );
  }

  // 37. repeated related-content resolution is identical
  {
    const rc1 = getRelatedContent("research", "EXP-014");
    const rc2 = getRelatedContent("research", "EXP-014");
    assert(
      JSON.stringify(rc1) === JSON.stringify(rc2),
      "37. getRelatedContent() yields bit-exact identical ordering and records"
    );
  }

  // ----------------------------------------------------
  // SECTION 8: CYCLE & ORPHAN DETECTION (Assertions 38-40)
  // ----------------------------------------------------
  console.log("\n[Category 8: Cycle & Orphan Detection]");

  // 38. cycle detection completes without infinite recursion
  {
    const cycles = detectGraphCycles();
    assert(
      cycles.length > 0 &&
      cycles.every((c) => c.classification.startsWith("INTENTIONAL")),
      "38. detectGraphCycles() completes cleanly and classifies known co-validation loops"
    );
  }

  // 39. orphan detection completes
  {
    const orphans = analyzeGraphOrphans();
    assert(
      orphans.length === 26,
      "39. analyzeGraphOrphans() evaluates all 26 canonical entities"
    );
  }

  // 40. expected standalone entities are classified correctly
  {
    const orphans = analyzeGraphOrphans();
    const reviewItems = orphans.filter((o) => o.classification === "REVIEW");
    const errorItems = orphans.filter((o) => o.classification === "ERROR");
    assert(
      reviewItems.length === 1 &&
      reviewItems[0].entityId === "TOP-003" &&
      errorItems.length === 0,
      "40. Orphan analysis correctly identifies TOP-003 as REVIEW and reports 0 graph ERRORS"
    );
  }

  console.log("\n================================================================================");
  console.log(` RESULTS: ${passed} passed, ${failed} failed`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test suite fatal error:", err);
  process.exit(1);
});
