import { ExperimentItem, isIndexable } from "./types";

export const LAB_EXPERIMENTS: ExperimentItem[] = [
  {
    id: "EXP-001",
    slug: "same-question-six-systems",
    title: "SAME QUESTION / SIX SYSTEMS",
    category: "CROSS-ENGINE RETRIEVAL BENCHMARK",
    status: "ACTIVE",
    summary:
      "Testing output divergence, citation sourcing, entity confidence, and answer structure across 6 major AI answer engines using standardized query vectors.",
    purpose:
      "Testing output divergence, citation sourcing, entity confidence, and answer structure across 6 major search engines using standardized query vectors.",
    researchQuestion:
      "How do identical informational and commercial queries diverge in citation density, entity alignment, and synthesis structure across six modern AI search engines?",
    objective:
      "Establish reproducible baselines for measuring how different search and AI synthesis engines cite third-party domains, extract structured entities, and formulate direct answers.",
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
    query:
      "Standardized multi-tier query vectors evaluating informational definitions, entity disambiguation prompts, technical specifications, and enterprise service comparisons.",
    methodology:
      "Multi-system parallel query execution. Identical prompt vectors submitted simultaneously under non-personalized session environments across all six evaluated platforms. Complete response payloads, cited URLs, source domains, and entity mentions are systematically recorded.",
    variables: [
      "Query intent classification (Informational, Commercial, Navigational)",
      "Temporal freshness requirement",
      "Citation anchor placement (Inline citation, Footnote, Card)",
      "Structured Schema presence on cited domains",
    ],
    activeVariables: [
      "Query intent classification",
      "Citation anchor placement",
      "Entity graph alignment",
    ],
    evidence: [
      "Complete response text captures from each platform",
      "Extracted citation URLs and source domain authority distribution",
      "Cross-engine domain overlap matrices for primary citations",
      "Execution timestamp logs and parameter controls",
    ],
    observations: [
      "High variance observed in citation source overlap between search-native engines (Google AI Overview, Perplexity) and reasoning-centric LLM engines (ChatGPT, Claude).",
      "Direct source citation occurs significantly more frequently when source domains feature unambiguous Schema.org entity graph markup.",
      "Synthesis brevity and citation density vary substantially based on detected query intent.",
    ],
    limitations: [
      "Search engines roll out algorithmic and UI updates continuously without public notice.",
      "Geographic location and session IP affect retrieval index partition and citation candidates.",
      "Non-deterministic generation parameters introduce subtle variance across repeated query instances.",
    ],
    relatedResearch: [
      "citation-patterns-across-ai-search-systems",
      "how-entities-influence-ai-search-visibility",
    ],
    relatedResearchIds: ["EXP-014", "EXP-013"],
    entityReferences: [
      { type: "research", id: "EXP-014", relation: "tests" },
      { type: "research", id: "EXP-013", relation: "tests" },
    ],
    author: "Dixith Kumar",
    authorId: "AUT-001",
    topics: ["TOP-001", "TOP-005"],
    sourceIds: ["SRC-001", "SRC-002"],
  },
];

export function getAllExperiments(): ExperimentItem[] {
  return LAB_EXPERIMENTS;
}

export function getExperimentBySlug(slug: string): ExperimentItem | undefined {
  return LAB_EXPERIMENTS.find((exp) => exp.slug === slug);
}

export function getExperimentById(id: string): ExperimentItem | undefined {
  return LAB_EXPERIMENTS.find((exp) => exp.id === id);
}

export function getPublishedExperiments(): ExperimentItem[] {
  return LAB_EXPERIMENTS.filter((exp) => isIndexable(exp.status));
}
