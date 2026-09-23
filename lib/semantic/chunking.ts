import { createHash } from "crypto";
import {
  ContentStatus,
  EntityType,
  ResearchEntityModel,
  ExperimentItem,
  ArticleEntityModel,
  GuideEntityModel,
  ProfessionalExperienceItem,
} from "@/data/types";
import { ContentChunk } from "./types";

/**
 * Union of all canonical content entities supported by DIXITH.
 */
export type CanonicalEntity =
  | ResearchEntityModel
  | ExperimentItem
  | ArticleEntityModel
  | GuideEntityModel
  | ProfessionalExperienceItem;

/**
 * Normalizes text content for consistent tokenization and cryptographic hashing.
 */
export function normalizeChunkText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Estimates token count for English technical prose and code snippets.
 * Approximately 1 token per 4 characters or ~1.3 tokens per word.
 */
export function estimateTokens(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charEstimate = Math.ceil(text.length / 4);
  const wordEstimate = Math.ceil(wordCount * 1.3);
  return Math.max(charEstimate, wordEstimate);
}

/**
 * Generates a deterministic SHA-256 hash representing a chunk's content and provenance.
 * Independent of timestamps, runtime, or non-deterministic IDs.
 */
export function computeChunkHash(params: {
  entityId: string;
  entityType: EntityType;
  section: string;
  heading?: string;
  content: string;
  topics?: string[];
  sourceIds?: string[];
  status: ContentStatus;
}): string {
  const normalizedContent = normalizeChunkText(params.content);
  const normalizedHeading = params.heading ? normalizeChunkText(params.heading) : "";
  const sortedTopics = [...(params.topics || [])].sort().join(",");
  const sortedSources = [...(params.sourceIds || [])].sort().join(",");

  const payload = [
    params.entityId,
    params.entityType,
    params.section,
    normalizedHeading,
    normalizedContent,
    sortedTopics,
    sortedSources,
    params.status,
  ].join("::");

  return createHash("sha256").update(payload, "utf8").digest("hex");
}

/**
 * Splits large textual blocks into smaller chunks targeting 300–600 tokens.
 * Only splits when necessary along paragraph boundaries to maintain semantic integrity.
 */
function splitTextIntoSegments(text: string, maxTokens = 600): string[] {
  const normalized = text.trim();
  if (estimateTokens(normalized) <= maxTokens) {
    return [normalized];
  }

  // Split by double newline (paragraphs) first
  const paragraphs = normalized.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  if (paragraphs.length <= 1) {
    // Fall back to sentence boundaries if single long block
    const sentences = normalized.match(/[^.!?]+[.!?]+(\s+|$)/g) || [normalized];
    const segments: string[] = [];
    let current = "";

    for (const sentence of sentences) {
      if (estimateTokens(current + " " + sentence) > maxTokens && current.length > 0) {
        segments.push(current.trim());
        current = sentence;
      } else {
        current = current ? current + " " + sentence : sentence;
      }
    }
    if (current.trim().length > 0) {
      segments.push(current.trim());
    }
    return segments;
  }

  const segments: string[] = [];
  let currentBlock = "";

  for (const paragraph of paragraphs) {
    if (estimateTokens(currentBlock + "\n\n" + paragraph) > maxTokens && currentBlock.length > 0) {
      segments.push(currentBlock.trim());
      currentBlock = paragraph;
    } else {
      currentBlock = currentBlock ? currentBlock + "\n\n" + paragraph : paragraph;
    }
  }

  if (currentBlock.trim().length > 0) {
    segments.push(currentBlock.trim());
  }

  return segments;
}

interface SectionDescriptor {
  sectionKey: string;
  heading?: string;
  content?: string | string[];
}

/**
 * Builds ContentChunk records from defined sections, preserving stable IDs and deterministic hashes.
 */
function buildChunksForEntity(
  base: {
    id: string;
    entityType: EntityType;
    slug: string;
    title: string;
    topics?: string[];
    sourceIds?: string[];
    status: ContentStatus;
  },
  sections: SectionDescriptor[]
): ContentChunk[] {
  const chunks: ContentChunk[] = [];
  const seenChunkIds = new Set<string>();

  for (const sec of sections) {
    if (!sec.content) continue;

    let textContent = "";
    if (Array.isArray(sec.content)) {
      textContent = sec.content.filter(Boolean).join("\n");
    } else {
      textContent = sec.content;
    }

    if (!textContent || textContent.trim().length === 0) {
      continue; // Skip empty sections
    }

    const segments = splitTextIntoSegments(textContent, 600);

    for (let index = 0; index < segments.length; index++) {
      const segmentText = segments[index];
      const chunkId = `${base.id}#${sec.sectionKey}#${index}`;

      if (seenChunkIds.has(chunkId)) {
        continue; // Prevent duplicates
      }
      seenChunkIds.add(chunkId);

      const contentHash = computeChunkHash({
        entityId: base.id,
        entityType: base.entityType,
        section: sec.sectionKey,
        heading: sec.heading,
        content: segmentText,
        topics: base.topics,
        sourceIds: base.sourceIds,
        status: base.status,
      });

      chunks.push({
        chunkId,
        entityId: base.id,
        entityType: base.entityType,
        slug: base.slug,
        title: base.title,
        section: sec.sectionKey,
        heading: sec.heading,
        content: segmentText,
        topics: base.topics || [],
        sourceIds: base.sourceIds || [],
        status: base.status,
        contentHash,
        tokenCount: estimateTokens(segmentText),
      });
    }
  }

  return chunks;
}

/**
 * Chunks a Research entity along canonical research boundaries.
 */
export function chunkResearch(item: ResearchEntityModel): ContentChunk[] {
  const sections: SectionDescriptor[] = [
    {
      sectionKey: "overview",
      heading: "Overview & Abstract",
      content: item.summary || item.detailedExplanation,
    },
    {
      sectionKey: "question",
      heading: "Research Question",
      content: item.question,
    },
    {
      sectionKey: "methodology",
      heading: "Methodology",
      content: item.methodology,
    },
    {
      sectionKey: "observations",
      heading: "Key Observations",
      content: item.observations,
    },
    {
      sectionKey: "findings",
      heading: "Empirical Findings",
      content: item.findings,
    },
    {
      sectionKey: "limitations",
      heading: "Research Limitations",
      content: item.limitations,
    },
  ];

  return buildChunksForEntity(
    {
      id: item.id,
      entityType: "research",
      slug: item.slug,
      title: item.title,
      topics: item.topics,
      sourceIds: item.sourceIds,
      status: item.status,
    },
    sections
  );
}

/**
 * Chunks an Experiment entity along canonical experiment lab boundaries.
 */
export function chunkExperiment(item: ExperimentItem): ContentChunk[] {
  const sections: SectionDescriptor[] = [
    {
      sectionKey: "objective",
      heading: "Objective & Purpose",
      content: item.summary || item.purpose || item.objective,
    },
    {
      sectionKey: "question",
      heading: "Research Question",
      content: item.researchQuestion,
    },
    {
      sectionKey: "methodology",
      heading: "Experimental Methodology",
      content: item.methodology,
    },
    {
      sectionKey: "variables",
      heading: "Test Variables",
      content: item.variables,
    },
    {
      sectionKey: "evidence",
      heading: "Empirical Evidence & Captures",
      content: item.evidence,
    },
    {
      sectionKey: "observations",
      heading: "Observations",
      content: item.observations,
    },
    {
      sectionKey: "findings",
      heading: "Findings",
      content: item.findings,
    },
    {
      sectionKey: "limitations",
      heading: "Experiment Limitations",
      content: item.limitations,
    },
  ];

  return buildChunksForEntity(
    {
      id: item.id,
      entityType: "experiment",
      slug: item.slug,
      title: item.title,
      topics: item.topics,
      sourceIds: item.sourceIds,
      status: item.status,
    },
    sections
  );
}

/**
 * Chunks an Article entity along analytical and editorial boundaries.
 */
export function chunkArticle(item: ArticleEntityModel): ContentChunk[] {
  const sections: SectionDescriptor[] = [
    {
      sectionKey: "overview",
      heading: "Article Summary",
      content: item.summary,
    },
  ];

  if (item.body && item.body.trim().length > 0) {
    sections.push({
      sectionKey: "body",
      heading: item.title,
      content: item.body,
    });
  }

  return buildChunksForEntity(
    {
      id: item.id,
      entityType: "article",
      slug: item.slug,
      title: item.title,
      topics: item.topics,
      sourceIds: item.sourceIds,
      status: item.status,
    },
    sections
  );
}

/**
 * Chunks an Implementation Guide entity preserving step structure and code snippets.
 */
export function chunkGuide(item: GuideEntityModel): ContentChunk[] {
  const sections: SectionDescriptor[] = [
    {
      sectionKey: "overview",
      heading: "Guide Overview",
      content: item.summary,
    },
    {
      sectionKey: "prerequisites",
      heading: "Prerequisites",
      content: item.prerequisites,
    },
  ];

  if (item.steps && item.steps.length > 0) {
    for (const step of item.steps) {
      let stepContent = `${step.title}\n\n${step.description}`;
      if (step.codeSnippet) {
        stepContent += `\n\n\`\`\`${step.codeSnippet.language}\n${step.codeSnippet.code}\n\`\`\``;
      }
      sections.push({
        sectionKey: `step-${step.stepNumber}`,
        heading: `Step ${step.stepNumber}: ${step.title}`,
        content: stepContent,
      });
    }
  }

  return buildChunksForEntity(
    {
      id: item.id,
      entityType: "guide",
      slug: item.slug,
      title: item.title,
      topics: item.topics,
      sourceIds: item.sourceIds,
      status: item.status,
    },
    sections
  );
}

/**
 * Chunks a Professional Experience entity along architecture and responsibility boundaries.
 * Strictly respects client confidentiality disclosure.
 */
export function chunkProfessionalExperience(
  item: ProfessionalExperienceItem
): ContentChunk[] {
  const contextParts = [item.roleContext, item.professionalContext]
    .filter(Boolean)
    .join(" — ");

  const sections: SectionDescriptor[] = [
    {
      sectionKey: "overview",
      heading: "Architecture Overview",
      content: item.overview || item.summary,
    },
    {
      sectionKey: "context",
      heading: "Professional Role & Context",
      content: contextParts,
    },
    {
      sectionKey: "responsibilities",
      heading: "Key Architecture Responsibilities",
      content: item.responsibilities,
    },
    {
      sectionKey: "technical-focus",
      heading: "Technical Architecture & Focus Areas",
      content: item.technicalFocus,
    },
    {
      sectionKey: "search-focus",
      heading: "Search & Retrieval Engineering",
      content: item.searchFocus,
    },
    {
      sectionKey: "technologies",
      heading: "Technologies & Standards",
      content: item.technologies?.join(", "),
    },
  ];

  return buildChunksForEntity(
    {
      id: item.id,
      entityType: "professional-experience",
      slug: item.slug,
      title: item.title,
      topics: item.topics,
      sourceIds: item.sourceIds,
      status: item.status,
    },
    sections
  );
}

/**
 * Unified chunking function dispatching to content-type specific chunkers.
 */
export function chunkContent(
  entity: CanonicalEntity,
  explicitType?: EntityType
): ContentChunk[] {
  // Infer or use explicit entity type
  if (explicitType === "research" || ("researchArea" in entity && "question" in entity)) {
    return chunkResearch(entity as ResearchEntityModel);
  }
  if (
    explicitType === "experiment" ||
    ("purpose" in entity && "systemsTested" in entity)
  ) {
    return chunkExperiment(entity as ExperimentItem);
  }
  if (explicitType === "guide" || ("steps" in entity || "prerequisites" in entity)) {
    return chunkGuide(entity as GuideEntityModel);
  }
  if (
    explicitType === "professional-experience" ||
    ("domain" in entity && "technicalFocus" in entity)
  ) {
    return chunkProfessionalExperience(entity as ProfessionalExperienceItem);
  }
  if (explicitType === "article" || ("readTime" in entity && "category" in entity)) {
    return chunkArticle(entity as ArticleEntityModel);
  }

  return [];
}
