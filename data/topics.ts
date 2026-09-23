import { TopicEntity } from "./types";

/**
 * Lightweight Canonical Topic Taxonomy
 * Standardized topic identifiers and names for consistent taxonomy mapping.
 */
export const CANONICAL_TOPICS: Record<string, TopicEntity> = {
  "TOP-001": {
    id: "TOP-001",
    slug: "ai-search",
    name: "AI Search",
    description:
      "Architectural mechanics, retrieval models, and discovery behavior of modern AI answer engines.",
  },
  "TOP-002": {
    id: "TOP-002",
    slug: "technical-seo",
    name: "Technical SEO",
    description:
      "Crawl optimization, indexing architectures, structured schemas, and rendering pipelines.",
  },
  "TOP-003": {
    id: "TOP-003",
    slug: "aeo",
    name: "Answer Engine Optimization",
    description:
      "Formatting information for direct factual extraction and answer synthesis.",
  },
  "TOP-004": {
    id: "TOP-004",
    slug: "geo",
    name: "Generative Engine Optimization",
    description:
      "Optimizing content visibility and entity inclusion across generative LLM discovery engines.",
  },
  "TOP-005": {
    id: "TOP-005",
    slug: "rag-retrieval",
    name: "RAG & Retrieval Grounding",
    description:
      "Retrieval-Augmented Generation architectures, chunking, citation density, and factual grounding.",
  },
  "TOP-006": {
    id: "TOP-006",
    slug: "knowledge-graphs",
    name: "Knowledge Graphs & Entities",
    description:
      "Entity disambiguation, Schema.org modeling, and machine-readable identity alignment.",
  },
  "TOP-007": {
    id: "TOP-007",
    slug: "search-architecture",
    name: "Search Systems Architecture",
    description:
      "Cross-border routing, international indexation, enterprise taxonomies, and multi-domain web footprints.",
  },
};

export function getAllTopics(): TopicEntity[] {
  return Object.values(CANONICAL_TOPICS);
}

export function getTopicById(id: string): TopicEntity | undefined {
  return CANONICAL_TOPICS[id];
}

export function getTopicBySlug(slug: string): TopicEntity | undefined {
  return Object.values(CANONICAL_TOPICS).find((t) => t.slug === slug);
}
