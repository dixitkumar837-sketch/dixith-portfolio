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
