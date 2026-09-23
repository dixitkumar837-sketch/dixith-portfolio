import { GuideEntityModel, isIndexable } from "./types";

/**
 * Canonical Implementation Guides Registry for DIXITH
 * Evergreen technical architectures, practical frameworks, and implementation resources.
 * Structural draft items are maintained for architecture verification and static routing.
 */
export const GUIDES: GuideEntityModel[] = [
  {
    id: "GUI-001",
    slug: "schema-org-entity-graph-implementation",
    title: "Implementing Structured Entity Graphs with Schema.org",
    category: "Technical Architecture",
    summary:
      "Architectural implementation guide for establishing connected Schema.org entity graphs, canonical node disambiguation, and JSON-LD integration.",
    status: "DRAFT",
    authorId: "AUT-001",
    readTime: "15 min",
    readingTime: "15 min",
    difficultyLevel: "INTERMEDIATE",
    topics: ["TOP-002", "TOP-006"],
    targetSystems: [
      "Google AI Overview",
      "ChatGPT",
      "Perplexity",
      "Claude",
      "Gemini",
      "Microsoft Copilot",
    ],
    prerequisites: [
      "Understanding of JSON-LD data structures",
      "Familiarity with Schema.org type inheritance",
      "Access to site head injection or root template architecture",
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Define the Root Entity Identity",
        description:
          "Establish the canonical Person or Organization node with a permanent @id fragment (e.g. /#person) in the root layout to prevent multi-node identity fragmentation.",
      },
      {
        stepNumber: 2,
        title: "Model WebSite and WebPage Hierarchies",
        description:
          "Construct reciprocal relationships between the WebSite node and each individual WebPage node using isPartOf and mainEntityOfPage pointers.",
      },
      {
        stepNumber: 3,
        title: "Ground Deep Entities and Author References",
        description:
          "Bind specific content nodes (TechArticle, Research, HowTo) directly to the root entity using typed author and publisher @id references.",
      },
      {
        stepNumber: 4,
        title: "Validate Node Disambiguation Across Parsers",
        description:
          "Test structured graph extraction across Google Rich Results Test, Schema.org Validator, and non-personalized LLM query prompts.",
      },
    ],
    entityReferences: [
      { type: "research", id: "EXP-013", relation: "applies" },
    ],
    relatedResearchIds: ["EXP-013"],
    sourceIds: ["SRC-001", "SRC-002"],
  },
  {
    id: "GUI-002",
    slug: "crawler-access-and-index-hygiene-for-ai-search",
    title: "Crawler Access and Index Hygiene for AI Search Engines",
    category: "Crawl Optimization",
    summary:
      "Systematic configuration guide for robots.txt rules, DOM cleanliness, and server-side rendering pipelines for generative AI crawlers.",
    status: "DRAFT",
    authorId: "AUT-001",
    readTime: "12 min",
    readingTime: "12 min",
    difficultyLevel: "ADVANCED",
    topics: ["TOP-001", "TOP-002"],
    targetSystems: [
      "Google AI Overview",
      "ChatGPT",
      "Perplexity",
      "Claude",
      "Gemini",
      "Microsoft Copilot",
    ],
    prerequisites: [
      "Server configuration or CDN edge rule access",
      "Basic understanding of HTTP user-agent header handling",
      "Robots.txt protocol specifications",
    ],
    steps: [
      {
        stepNumber: 1,
        title: "Audit AI Search Bot User-Agent Directives",
        description:
          "Explicitly configure permissions for GPTBot, ClaudeBot, PerplexityBot, and Google-Extended to control retrieval indexation without impacting traditional search.",
      },
      {
        stepNumber: 2,
        title: "Eliminate Client-Side DOM Rendering Bottlenecks",
        description:
          "Ensure primary informational passages and direct answers are pre-rendered into the initial HTML payload (SSG/SSR) rather than relying on delayed client hydration.",
      },
      {
        stepNumber: 3,
        title: "Standardize Canonical and Sitemap Indexing Pipelines",
        description:
          "Enforce self-referential canonical tags and synchronize dynamic XML sitemaps to reflect strictly published, verified content assets.",
      },
    ],
    entityReferences: [
      { type: "research", id: "EXP-014", relation: "applies" },
    ],
    relatedResearchIds: ["EXP-014"],
    sourceIds: ["SRC-003", "SRC-004"],
  },
];

export function getAllGuides(): GuideEntityModel[] {
  return GUIDES;
}

export function getGuideBySlug(slug: string): GuideEntityModel | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}

export function getGuideById(id: string): GuideEntityModel | undefined {
  return GUIDES.find((guide) => guide.id === id);
}

export function getPublishedGuides(): GuideEntityModel[] {
  return GUIDES.filter((guide) => isIndexable(guide.status));
}
