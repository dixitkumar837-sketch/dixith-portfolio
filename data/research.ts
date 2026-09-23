import { ResearchEntityModel, isIndexable } from "./types";

export const FEATURED_RESEARCH: ResearchEntityModel[] = [
  {
    id: "EXP-014",
    category: "AI SEARCH",
    title: "Citation Patterns Across AI Search Systems",
    type: "Research",
    readTime: "12 min",
    readingTime: "12 min",
    summary:
      "Structural analysis of direct citation pathways, domain authority weights, and retrieval grounding across modern AI answer engines.",
    slug: "citation-patterns-across-ai-search-systems",
    status: "IN_REVIEW",
    researchArea: "Citation Grounding & RAG Retrieval",
    question:
      "How do citation frequency, domain authority, and structured entity graphs influence inclusion across generative answer engines?",
    methodology:
      "Standardized multi-prompt query vectors evaluated against engine outputs to measure citation anchor density.",
    systems: [
      "Google AI Overview",
      "ChatGPT",
      "Perplexity",
      "Claude",
      "Gemini",
      "Microsoft Copilot",
    ],
    systemsTested: [
      "Google AI Overview",
      "ChatGPT",
      "Perplexity",
      "Claude",
      "Gemini",
      "Microsoft Copilot",
    ],
    topics: [
      "TOP-001",
      "TOP-005",
    ],
    limitations: [
      "Search engine citation interfaces change dynamically without public version releases.",
      "Personalized and geographical retrieval variations may influence response citations.",
      "Testing evaluates public interface responses, not internal model weights.",
    ],
    relatedExperiments: ["EXP-001"],
    relatedResearch: ["how-entities-influence-ai-search-visibility"],
    relatedExperimentIds: ["EXP-001"],
    relatedResearchIds: ["EXP-013"],
    entityReferences: [
      { type: "experiment", id: "EXP-001", relation: "validates" },
      { type: "research", id: "EXP-013", relation: "references" },
    ],
    sourceIds: ["SRC-001", "SRC-002"],
    author: "Dixith Kumar",
    authorId: "AUT-001",
  },
  {
    id: "EXP-013",
    category: "ENTITY SEARCH",
    title: "How Entities Influence AI Search Visibility",
    type: "Research",
    readTime: "9 min",
    readingTime: "9 min",
    summary:
      "Investigation into entity extraction, graph alignment, and knowledge node association in LLM search retrieval.",
    slug: "how-entities-influence-ai-search-visibility",
    status: "IN_REVIEW",
    researchArea: "Entity Recognition & Knowledge Graphs",
    question:
      "To what degree does unambiguous Schema entity markup correlate with accurate entity representation in generative LLM responses?",
    methodology:
      "Knowledge graph reconciliation and entity disambiguation tests across corporate and personal web properties.",
    systems: [
      "Google AI Overview",
      "ChatGPT",
      "Perplexity",
      "Claude",
      "Gemini",
      "Microsoft Copilot",
    ],
    systemsTested: [
      "Google AI Overview",
      "ChatGPT",
      "Perplexity",
      "Claude",
      "Gemini",
      "Microsoft Copilot",
    ],
    topics: [
      "TOP-001",
      "TOP-006",
    ],
    limitations: [
      "Knowledge graph ingest latency varies between 24 hours to multiple weeks across search systems.",
      "Entity association is influenced by co-occurrence across third-party sources outside test domains.",
    ],
    relatedExperiments: ["EXP-001"],
    relatedResearch: ["citation-patterns-across-ai-search-systems"],
    relatedExperimentIds: ["EXP-001"],
    relatedResearchIds: ["EXP-014"],
    entityReferences: [
      { type: "experiment", id: "EXP-001", relation: "validates" },
      { type: "research", id: "EXP-014", relation: "references" },
    ],
    sourceIds: ["SRC-001", "SRC-002"],
    author: "Dixith Kumar",
    authorId: "AUT-001",
  },
  {
    id: "EXP-012",
    category: "GEO",
    title: "Testing Generative Engine Visibility",
    type: "Research",
    readTime: "14 min",
    readingTime: "14 min",
    summary:
      "Empirical methodology for benchmarking brand presence, generative summaries, and retrieval frequency.",
    slug: "testing-generative-engine-visibility",
    status: "IN_REVIEW",
    researchArea: "Generative Engine Optimization (GEO)",
    question:
      "What architectural signals differentiate direct generative recommendations from passive link indexation?",
    methodology:
      "Systematic brand and concept inclusion tracking across conversational search engines using reproducible test prompts.",
    systems: [
      "Google AI Overview",
      "ChatGPT",
      "Perplexity",
      "Claude",
      "Gemini",
      "Microsoft Copilot",
    ],
    systemsTested: [
      "Google AI Overview",
      "ChatGPT",
      "Perplexity",
      "Claude",
      "Gemini",
      "Microsoft Copilot",
    ],
    topics: [
      "TOP-001",
      "TOP-004",
    ],
    limitations: [
      "LLM non-determinism introduces slight variation between identical queries.",
      "Model updates may alter benchmark thresholds between measurement intervals.",
    ],
    relatedExperiments: ["EXP-001"],
    relatedResearch: ["citation-patterns-across-ai-search-systems"],
    relatedExperimentIds: ["EXP-001"],
    relatedResearchIds: ["EXP-014"],
    entityReferences: [
      { type: "experiment", id: "EXP-001", relation: "validates" },
      { type: "research", id: "EXP-014", relation: "references" },
    ],
    sourceIds: ["SRC-001", "SRC-002"],
    author: "Dixith Kumar",
    authorId: "AUT-001",
  },
];

export function getAllResearch(): ResearchEntityModel[] {
  return FEATURED_RESEARCH;
}

export function getResearchBySlug(slug: string): ResearchEntityModel | undefined {
  return FEATURED_RESEARCH.find((item) => item.slug === slug);
}

export function getResearchById(id: string): ResearchEntityModel | undefined {
  return FEATURED_RESEARCH.find((item) => item.id === id);
}

export function getPublishedResearch(): ResearchEntityModel[] {
  return FEATURED_RESEARCH.filter((item) => isIndexable(item.status));
}
