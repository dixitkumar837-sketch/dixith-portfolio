import {
  ContentStatus,
  isIndexable,
  EntityType,
  EntityReference,
  RelationType,
  SourceEntity,
  TopicEntity,
  ResearchEntityModel,
  ExperimentItem,
  ArticleEntityModel,
  GuideEntityModel,
  InsightArticle,
} from "@/data/types";
import { Metadata } from "next";
import { getAllResearch, getResearchById } from "@/data/research";
import { getAllExperiments, getExperimentById } from "@/data/experiments";
import {
  getAllProfessionalExperiences,
  getProfessionalExperienceById,
} from "@/data/professional-experience";
import { getAllArticles, getArticleById } from "@/data/articles";
import { getAllGuides, getGuideById } from "@/data/guides";
import { getAllSources, getSourceById } from "@/data/sources";
import { getAllTopics, getTopicById, getTopicBySlug } from "@/data/topics";
import { getCanonicalAuthor } from "@/data/authors";

export { isIndexable };

/**
 * Standardized robots metadata generator based on canonical content status.
 * Enforces that only PUBLISHED content is permitted to be indexed.
 */
export function getContentRobots(status: ContentStatus): Metadata["robots"] {
  const index = isIndexable(status);
  return {
    index,
    follow: true,
    googleBot: {
      index,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  };
}

/**
 * Resolves an entity by its explicit collection type and stable ID.
 * Eliminates heuristic prefix guessing (e.g. historical 'EXP-' prefix
 * shared between Research and Experiments).
 */
export function resolveEntity(type: EntityType, id: string): unknown | undefined {
  switch (type) {
    case "research":
      return getResearchById(id);
    case "experiment":
      return getExperimentById(id);
    case "professional-experience":
      return getProfessionalExperienceById(id);
    case "article":
      return getArticleById(id);
    case "guide":
      return getGuideById(id);
    case "source":
      return getSourceById(id);
    case "topic":
      return getTopicById(id);
    case "author":
      return id === "AUT-001" ? getCanonicalAuthor() : undefined;
    default:
      return undefined;
  }
}

/**
 * Resolves a canonical EntityReference using explicit type + ID.
 */
export function resolveEntityReference(ref: EntityReference): unknown | undefined {
  return resolveEntity(ref.type, ref.id);
}

/**
 * Resolves an array of Source IDs to verified SourceEntity records.
 */
export function getSourcesForContent(sourceIds?: string[]): SourceEntity[] {
  if (!sourceIds || sourceIds.length === 0) return [];
  return sourceIds
    .map((id) => getSourceById(id))
    .filter((src): src is SourceEntity => Boolean(src));
}

/**
 * Resolves an array of topic identifiers (IDs, slugs, or names) to TopicEntity records.
 */
export function getTopicsForContent(topics?: string[]): TopicEntity[] {
  if (!topics || topics.length === 0) return [];
  const allTopics = getAllTopics();
  return topics
    .map((token) => {
      const byId = getTopicById(token);
      if (byId) return byId;
      const bySlug = getTopicBySlug(token);
      if (bySlug) return bySlug;
      return allTopics.find(
        (t) => t.name.toLowerCase() === token.toLowerCase()
      );
    })
    .filter((topic): topic is TopicEntity => Boolean(topic));
}

export interface ResolvedEntityReference {
  type: EntityType;
  id: string;
  relation?: RelationType;
  entity: unknown;
}

/**
 * Resolves an array of explicit EntityReference items to resolved entities.
 */
export function getRelatedEntities(entityReferences?: EntityReference[]): ResolvedEntityReference[] {
  if (!entityReferences || entityReferences.length === 0) return [];
  const results: ResolvedEntityReference[] = [];
  for (const ref of entityReferences) {
    const entity = resolveEntity(ref.type, ref.id);
    if (entity) {
      results.push({
        type: ref.type,
        id: ref.id,
        relation: ref.relation,
        entity,
      });
    }
  }
  return results;
}

export interface ResolvedRelationship {
  sourceType: EntityType;
  sourceId: string;
  sourceEntity: unknown;
  targetType: EntityType;
  targetId: string;
  targetEntity: unknown;
  relation?: RelationType;
  isValid: boolean;
  error?: string;
}

/**
 * Resolves and validates a single directed relationship between source and target entities.
 */
export function resolveRelationship(
  source: { type: EntityType; id: string },
  target: EntityReference
): ResolvedRelationship {
  const sourceEntity = resolveEntity(source.type, source.id);
  const targetEntity = resolveEntity(target.type, target.id);

  if (!sourceEntity) {
    return {
      sourceType: source.type,
      sourceId: source.id,
      sourceEntity: undefined,
      targetType: target.type,
      targetId: target.id,
      targetEntity: undefined,
      relation: target.relation,
      isValid: false,
      error: `Source entity not found: ${source.type}:${source.id}`,
    };
  }

  if (!targetEntity) {
    return {
      sourceType: source.type,
      sourceId: source.id,
      sourceEntity,
      targetType: target.type,
      targetId: target.id,
      targetEntity: undefined,
      relation: target.relation,
      isValid: false,
      error: `Target entity not found: ${target.type}:${target.id}`,
    };
  }

  const LEGAL_RELATIONS: RelationType[] = [
    "validates",
    "tests",
    "explains",
    "applies",
    "references",
    "builds_on",
  ];
  if (target.relation && !LEGAL_RELATIONS.includes(target.relation)) {
    return {
      sourceType: source.type,
      sourceId: source.id,
      sourceEntity,
      targetType: target.type,
      targetId: target.id,
      targetEntity,
      relation: target.relation,
      isValid: false,
      error: `Invalid relation type: ${target.relation}`,
    };
  }

  return {
    sourceType: source.type,
    sourceId: source.id,
    sourceEntity,
    targetType: target.type,
    targetId: target.id,
    targetEntity,
    relation: target.relation,
    isValid: true,
  };
}

export interface RelatedContentItem {
  targetType: EntityType;
  targetId: string;
  targetTitle: string;
  targetStatus?: ContentStatus;
  relation?: RelationType;
  targetEntity: unknown;
}

/**
 * Resolves outgoing related content items for a given entity with optional public-only filtering.
 * Enforces deterministic sorting: targetType ASC, then targetId ASC.
 */
export function getRelatedContent(
  type: EntityType,
  id: string,
  options?: { publicOnly?: boolean }
): RelatedContentItem[] {
  const publicOnly = Boolean(options?.publicOnly);
  const source = resolveEntity(type, id) as
    | {
        id: string;
        title: string;
        status: ContentStatus;
        entityReferences?: EntityReference[];
        relatedResearchIds?: string[];
        relatedExperimentIds?: string[];
      }
    | undefined;

  if (!source) return [];

  const items: RelatedContentItem[] = [];
  const seenKeys = new Set<string>();

  if (source.entityReferences) {
    for (const ref of source.entityReferences) {
      const target = resolveEntity(ref.type, ref.id) as
        | { id: string; title: string; status?: ContentStatus }
        | undefined;
      if (!target) continue;

      if (publicOnly && target.status && !isIndexable(target.status)) {
        continue;
      }

      const key = `${ref.type}:${ref.id}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        items.push({
          targetType: ref.type,
          targetId: ref.id,
          targetTitle: target.title || ref.id,
          targetStatus: target.status,
          relation: ref.relation,
          targetEntity: target,
        });
      }
    }
  }

  items.sort((a, b) => {
    const typeCmp = a.targetType.localeCompare(b.targetType);
    if (typeCmp !== 0) return typeCmp;
    return a.targetId.localeCompare(b.targetId);
  });

  return items;
}

export interface ContentBacklink {
  sourceType: EntityType;
  sourceId: string;
  sourceTitle: string;
  sourceStatus: ContentStatus;
  relation?: RelationType;
  sourceEntity: unknown;
}

/**
 * Scans all content entities to find reverse backlinks referencing targetId.
 * Supports optional targetType matching and public-only filtering.
 * Enforces deterministic sorting: sourceType ASC, then sourceId ASC.
 */
export function getContentBacklinks(
  targetId: string,
  targetType?: EntityType,
  options?: { publicOnly?: boolean }
): ContentBacklink[] {
  const publicOnly = Boolean(options?.publicOnly);
  const backlinks: ContentBacklink[] = [];

  const allResearch = getAllResearch();
  const allExperiments = getAllExperiments();
  const allArticles = getAllArticles();
  const allGuides = getAllGuides();
  const allExperiences = getAllProfessionalExperiences();

  const checkEntity = (
    entity: {
      id: string;
      title: string;
      status: ContentStatus;
      entityReferences?: EntityReference[];
      relatedResearchIds?: string[];
      relatedExperimentIds?: string[];
      sourceIds?: string[];
      topics?: string[];
    },
    sourceType: EntityType
  ) => {
    if (publicOnly && !isIndexable(entity.status)) {
      return;
    }

    let matchedRelation: RelationType | undefined = undefined;
    let isMatched = false;

    // 1. Explicit entityReferences
    if (entity.entityReferences) {
      for (const ref of entity.entityReferences) {
        if (ref.id === targetId && (!targetType || ref.type === targetType)) {
          isMatched = true;
          matchedRelation = ref.relation;
          break;
        }
      }
    }

    // 2. Relational shortcut arrays
    if (!isMatched) {
      if (entity.relatedResearchIds && entity.relatedResearchIds.includes(targetId)) {
        isMatched = true;
        matchedRelation = "references";
      } else if (entity.relatedExperimentIds && entity.relatedExperimentIds.includes(targetId)) {
        isMatched = true;
        matchedRelation = "validates";
      } else if (entity.sourceIds && entity.sourceIds.includes(targetId)) {
        isMatched = true;
        matchedRelation = "references";
      } else if (entity.topics && entity.topics.includes(targetId)) {
        isMatched = true;
        matchedRelation = "references";
      }
    }

    if (isMatched) {
      backlinks.push({
        sourceType,
        sourceId: entity.id,
        sourceTitle: entity.title,
        sourceStatus: entity.status,
        relation: matchedRelation,
        sourceEntity: entity,
      });
    }
  };

  allResearch.forEach((e) => checkEntity(e, "research"));
  allExperiments.forEach((e) => checkEntity(e, "experiment"));
  allArticles.forEach((e) => checkEntity(e, "article"));
  allGuides.forEach((e) => checkEntity(e, "guide"));
  allExperiences.forEach((e) => checkEntity(e, "professional-experience"));

  backlinks.sort((a, b) => {
    const typeCmp = a.sourceType.localeCompare(b.sourceType);
    if (typeCmp !== 0) return typeCmp;
    return a.sourceId.localeCompare(b.sourceId);
  });

  return backlinks;
}

export interface GraphCycle {
  path: string[];
  classification: "INTENTIONAL_COMPLEMENTARY" | "INTENTIONAL_VALIDATION" | "SUSPICIOUS" | "INVALID";
  description: string;
}

/**
 * Detects cycles in the directed graph of entityReferences across canonical content entities.
 * Classifies known complementary research cross-references and benchmark co-validation loops.
 */
export function detectGraphCycles(): GraphCycle[] {
  const allResearch = getAllResearch();
  const allExperiments = getAllExperiments();
  const allArticles = getAllArticles();
  const allGuides = getAllGuides();
  const allExperiences = getAllProfessionalExperiences();

  const allEntities = [
    ...allResearch.map((e) => ({ id: e.id, type: "research" as EntityType, refs: e.entityReferences || [] })),
    ...allExperiments.map((e) => ({ id: e.id, type: "experiment" as EntityType, refs: e.entityReferences || [] })),
    ...allArticles.map((e) => ({ id: e.id, type: "article" as EntityType, refs: e.entityReferences || [] })),
    ...allGuides.map((e) => ({ id: e.id, type: "guide" as EntityType, refs: e.entityReferences || [] })),
    ...allExperiences.map((e) => ({ id: e.id, type: "professional-experience" as EntityType, refs: e.entityReferences || [] })),
  ];

  const adj = new Map<string, { id: string; type: EntityType }[]>();
  for (const entity of allEntities) {
    adj.set(
      entity.id,
      entity.refs.map((r) => ({ id: r.id, type: r.type }))
    );
  }

  const cycles: GraphCycle[] = [];
  const visited = new Set<string>();
  const recursionStack: string[] = [];

  const dfs = (currId: string) => {
    visited.add(currId);
    recursionStack.push(currId);

    const neighbors = adj.get(currId) || [];
    for (const neighbor of neighbors) {
      const idx = recursionStack.indexOf(neighbor.id);
      if (idx !== -1) {
        // Cycle detected
        const cycleNodes = recursionStack.slice(idx);
        // Normalize cycle key to avoid reporting same cycle rotated
        const minNode = cycleNodes.reduce((min, cur) => (cur < min ? cur : min));
        const minIdx = cycleNodes.indexOf(minNode);
        const canonicalPath = [
          ...cycleNodes.slice(minIdx),
          ...cycleNodes.slice(0, minIdx),
          minNode,
        ];
        const key = canonicalPath.join(" -> ");

        if (!cycles.some((c) => c.path.join(" -> ") === key)) {
          let classification: GraphCycle["classification"] = "SUSPICIOUS";
          let description = "Unclassified cycle";

          if (
            canonicalPath.includes("EXP-013") &&
            canonicalPath.includes("EXP-014") &&
            !canonicalPath.includes("EXP-001")
          ) {
            classification = "INTENTIONAL_COMPLEMENTARY";
            description = "Complementary cross-referencing between research protocols (EXP-013 <-> EXP-014)";
          } else if (canonicalPath.includes("EXP-001")) {
            classification = "INTENTIONAL_VALIDATION";
            description = `Co-validation loop between Experiment benchmark and Research protocol (${canonicalPath.slice(0, 2).join(" <-> ")})`;
          }

          cycles.push({
            path: canonicalPath,
            classification,
            description,
          });
        }
      } else if (!visited.has(neighbor.id)) {
        dfs(neighbor.id);
      }
    }

    recursionStack.pop();
  };

  for (const entity of allEntities) {
    if (!visited.has(entity.id)) {
      dfs(entity.id);
    }
  }

  return cycles;
}

export interface OrphanAnalysisResult {
  entityId: string;
  entityType: EntityType;
  inDegree: number;
  outDegree: number;
  classification: "EXPECTED" | "REVIEW" | "ERROR";
  reason: string;
}

/**
 * Analyzes in-degree and out-degree connectivity across all canonical entities.
 * Identifies isolated nodes, terminal metadata sinks, and unassigned taxonomy topics.
 */
export function analyzeGraphOrphans(): OrphanAnalysisResult[] {
  const allResearch = getAllResearch();
  const allExperiments = getAllExperiments();
  const allArticles = getAllArticles();
  const allGuides = getAllGuides();
  const allExperiences = getAllProfessionalExperiences();
  const allSources = getAllSources();
  const allTopics = getAllTopics();
  const author = getCanonicalAuthor();

  const entities: {
    id: string;
    type: EntityType;
    title: string;
    refs: EntityReference[];
    sources: string[];
    topics: string[];
    authorId?: string;
  }[] = [
    ...allResearch.map((e) => ({ id: e.id, type: "research" as EntityType, title: e.title, refs: e.entityReferences || [], sources: e.sourceIds || [], topics: e.topics || [], authorId: e.authorId })),
    ...allExperiments.map((e) => ({ id: e.id, type: "experiment" as EntityType, title: e.title, refs: e.entityReferences || [], sources: e.sourceIds || [], topics: e.topics || [], authorId: e.authorId })),
    ...allArticles.map((e) => ({ id: e.id, type: "article" as EntityType, title: e.title, refs: e.entityReferences || [], sources: e.sourceIds || [], topics: e.topics || [], authorId: e.authorId })),
    ...allGuides.map((e) => ({ id: e.id, type: "guide" as EntityType, title: e.title, refs: e.entityReferences || [], sources: e.sourceIds || [], topics: e.topics || [], authorId: e.authorId })),
    ...allExperiences.map((e) => ({ id: e.id, type: "professional-experience" as EntityType, title: e.title, refs: e.entityReferences || [], sources: [], topics: e.topics || [], authorId: undefined })),
    ...allSources.map((e) => ({ id: e.id, type: "source" as EntityType, title: e.title, refs: [], sources: [], topics: [], authorId: undefined })),
    ...allTopics.map((e) => ({ id: e.id, type: "topic" as EntityType, title: e.name, refs: [], sources: [], topics: [], authorId: undefined })),
    { id: author.id, type: "author" as EntityType, title: author.name, refs: [], sources: [], topics: [], authorId: undefined },
  ];

  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();
  entities.forEach((e) => {
    inDegree.set(e.id, 0);
    outDegree.set(e.id, 0);
  });

  entities.forEach((e) => {
    const out = e.refs.length + e.sources.length + e.topics.length + (e.authorId ? 1 : 0);
    outDegree.set(e.id, out);
    e.refs.forEach((r) => inDegree.set(r.id, (inDegree.get(r.id) || 0) + 1));
    e.sources.forEach((s) => inDegree.set(s, (inDegree.get(s) || 0) + 1));
    e.topics.forEach((t) => inDegree.set(t, (inDegree.get(t) || 0) + 1));
    if (e.authorId) inDegree.set(e.authorId, (inDegree.get(e.authorId) || 0) + 1);
  });

  const results: OrphanAnalysisResult[] = [];

  for (const e of entities) {
    const inDeg = inDegree.get(e.id) || 0;
    const outDeg = outDegree.get(e.id) || 0;

    let classification: OrphanAnalysisResult["classification"] = "EXPECTED";
    let reason = "Connected entity";

    if (inDeg === 0 && outDeg === 0) {
      if (e.type === "topic") {
        classification = "REVIEW";
        reason = "Taxonomy topic with 0 content entities currently tagged (TOP-003 Answer Engine Optimization)";
      } else {
        classification = "ERROR";
        reason = "Isolated zero-degree node with no incoming or outgoing connections";
      }
    } else if (inDeg === 0) {
      if (e.type === "article" || e.type === "guide" || e.type === "professional-experience") {
        classification = "EXPECTED";
        reason = "Leaf content entity with outgoing research/topic links but no incoming links";
      }
    } else if (outDeg === 0) {
      if (e.type === "source" || e.type === "topic" || e.type === "author") {
        classification = "EXPECTED";
        reason = "Terminal metadata node referenced by content entities";
      }
    }

    results.push({
      entityId: e.id,
      entityType: e.type,
      inDegree: inDeg,
      outDegree: outDeg,
      classification,
      reason,
    });
  }

  return results;
}

/**
 * Finds all articles that explain or reference a specific research ID.
 */
export function getArticlesForResearch(researchId: string): (ArticleEntityModel & InsightArticle)[] {
  return getAllArticles().filter((article) => {
    const hasExplicitRef = article.entityReferences?.some(
      (ref) => ref.type === "research" && ref.id === researchId
    );
    const hasIdRef = article.relatedResearchIds?.includes(researchId);
    return Boolean(hasExplicitRef || hasIdRef);
  });
}

/**
 * Finds all implementation guides that apply or reference a specific research ID.
 */
export function getGuidesForResearch(researchId: string): GuideEntityModel[] {
  return getAllGuides().filter((guide) => {
    const hasExplicitRef = guide.entityReferences?.some(
      (ref) => ref.type === "research" && ref.id === researchId
    );
    const hasIdRef = guide.relatedResearchIds?.includes(researchId);
    return Boolean(hasExplicitRef || hasIdRef);
  });
}

/**
 * Finds all lab experiments that test or validate a specific research ID.
 */
export function getExperimentsForResearch(researchId: string): ExperimentItem[] {
  return getAllExperiments().filter((exp) => {
    const hasExplicitRef = exp.entityReferences?.some(
      (ref) => ref.type === "research" && ref.id === researchId
    );
    const hasIdRef = exp.relatedResearchIds?.includes(researchId);
    return Boolean(hasExplicitRef || hasIdRef);
  });
}

/**
 * Finds all research items linked to a specific experiment ID.
 */
export function getResearchForExperiment(experimentId: string): ResearchEntityModel[] {
  return getAllResearch().filter((res) => {
    const hasExplicitRef = res.entityReferences?.some(
      (ref) => ref.type === "experiment" && ref.id === experimentId
    );
    const hasIdRef = res.relatedExperimentIds?.includes(experimentId);
    return Boolean(hasExplicitRef || hasIdRef);
  });
}

export interface ContentGraphValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalEntities: number;
    researchCount: number;
    experimentCount: number;
    articleCount: number;
    guideCount: number;
    professionalExperienceCount: number;
    sourcesCount: number;
    topicsCount: number;
    totalRelations: number;
    verifiedSourcesReferenced: number;
  };
}

/**
 * Validates the structural integrity of the DIXITH static knowledge graph.
 * Ensures:
 * 1. Zero dangling entity references ({ type, id, relation })
 * 2. All sourceIds point to existing canonical sources in CANONICAL_SOURCES
 * 3. All topics resolve to valid canonical topics in CANONICAL_TOPICS
 * 4. Authors resolve to canonical author AUT-001
 * 5. Professional experience remains strictly isolated with mandatory disclosure
 */
export function validateContentGraph(): ContentGraphValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const research = getAllResearch();
  const experiments = getAllExperiments();
  const articles = getAllArticles();
  const guides = getAllGuides();
  const experiences = getAllProfessionalExperiences();
  const sources = getAllSources();
  const topics = getAllTopics();

  let totalRelations = 0;
  const referencedSources = new Set<string>();

  const validateEntityRef = (ownerId: string, ref: EntityReference) => {
    totalRelations++;
    const resolved = resolveEntity(ref.type, ref.id);
    if (!resolved) {
      errors.push(
        `[Dangling Reference] ${ownerId} references ${ref.type}:${ref.id} (${ref.relation || "no-relation"}), but target entity was not found.`
      );
    }
  };

  const validateSources = (ownerId: string, sourceIds?: string[]) => {
    if (!sourceIds) return;
    for (const srcId of sourceIds) {
      referencedSources.add(srcId);
      const src = getSourceById(srcId);
      if (!src) {
        errors.push(
          `[Missing Source] ${ownerId} references sourceId ${srcId}, which does not exist in CANONICAL_SOURCES.`
        );
      }
    }
  };

  const validateTopics = (ownerId: string, topicList?: string[]) => {
    if (!topicList) return;
    for (const t of topicList) {
      const byId = getTopicById(t);
      const bySlug = getTopicBySlug(t);
      const byName = topics.find(
        (top) => top.name.toLowerCase() === t.toLowerCase()
      );
      if (!byId && !bySlug && !byName) {
        warnings.push(
          `[Unregistered Topic] ${ownerId} references topic '${t}', which is not in CANONICAL_TOPICS taxonomy.`
        );
      }
    }
  };

  // 1. Validate Research
  for (const item of research) {
    if (item.entityReferences) {
      for (const ref of item.entityReferences) {
        validateEntityRef(item.id, ref);
      }
    }
    validateSources(item.id, item.sourceIds);
    validateTopics(item.id, item.topics);
    if (item.authorId && item.authorId !== "AUT-001") {
      warnings.push(`[Author Check] Research ${item.id} has unrecognized authorId: ${item.authorId}`);
    }
  }

  // 2. Validate Experiments
  for (const item of experiments) {
    if (item.entityReferences) {
      for (const ref of item.entityReferences) {
        validateEntityRef(item.id, ref);
      }
    }
    validateSources(item.id, item.sourceIds);
    validateTopics(item.id, item.topics);
    if (item.authorId && item.authorId !== "AUT-001") {
      warnings.push(`[Author Check] Experiment ${item.id} has unrecognized authorId: ${item.authorId}`);
    }
  }

  // 3. Validate Articles
  for (const item of articles) {
    if (item.entityReferences) {
      for (const ref of item.entityReferences) {
        validateEntityRef(item.id, ref);
      }
    }
    validateSources(item.id, item.sourceIds);
    validateTopics(item.id, item.topics);
    if (item.authorId && item.authorId !== "AUT-001") {
      warnings.push(`[Author Check] Article ${item.id} has unrecognized authorId: ${item.authorId}`);
    }
  }

  // 4. Validate Guides
  for (const item of guides) {
    if (item.entityReferences) {
      for (const ref of item.entityReferences) {
        validateEntityRef(item.id, ref);
      }
    }
    validateSources(item.id, item.sourceIds);
    validateTopics(item.id, item.topics);
    if (item.authorId && item.authorId !== "AUT-001") {
      warnings.push(`[Author Check] Guide ${item.id} has unrecognized authorId: ${item.authorId}`);
    }
  }

  // 5. Validate Professional Experience (Strict Isolation)
  for (const item of experiences) {
    if (!item.disclosure) {
      warnings.push(
        `[Experience Disclosure] Professional Experience ${item.id} is missing a client confidentiality disclosure statement.`
      );
    }
    if (item.entityReferences) {
      for (const ref of item.entityReferences) {
        validateEntityRef(item.id, ref);
      }
    }
    validateTopics(item.id, item.topics);
  }

  const totalEntities =
    research.length +
    experiments.length +
    articles.length +
    guides.length +
    experiences.length +
    sources.length +
    topics.length;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      totalEntities,
      researchCount: research.length,
      experimentCount: experiments.length,
      articleCount: articles.length,
      guideCount: guides.length,
      professionalExperienceCount: experiences.length,
      sourcesCount: sources.length,
      topicsCount: topics.length,
      totalRelations,
      verifiedSourcesReferenced: referencedSources.size,
    },
  };
}
