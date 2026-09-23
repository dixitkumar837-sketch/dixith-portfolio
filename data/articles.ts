import { ArticleEntityModel, InsightArticle, isIndexable } from "./types";

export const LATEST_INSIGHTS: (ArticleEntityModel & InsightArticle)[] = [
  {
    id: "INS-001",
    title: "Understanding Retrieval Augmented Generation in Modern Search Engines",
    category: "AI Search",
    readTime: "7 min",
    readingTime: "7 min",
    summary:
      "How RAG pipelines extract, rank, and summarize web information before rendering generative responses.",
    slug: "understanding-rag-in-modern-search",
    status: "DRAFT",
    authorId: "AUT-001",
    topics: ["TOP-001", "TOP-005"],
    relatedResearchIds: ["EXP-014"],
    entityReferences: [
      { type: "research", id: "EXP-014", relation: "explains" },
    ],
    sourceIds: ["SRC-001", "SRC-002"],
  },
  {
    id: "INS-002",
    title: "The Shift from Page Rank to Entity Trust in Generative Search",
    category: "GEO",
    readTime: "9 min",
    readingTime: "9 min",
    summary:
      "Evaluating why entity authority and knowledge graph validation are surpassing traditional link signals.",
    slug: "shift-from-page-rank-to-entity-trust",
    status: "DRAFT",
    authorId: "AUT-001",
    topics: ["TOP-004", "TOP-006"],
    relatedResearchIds: ["EXP-013"],
    entityReferences: [
      { type: "research", id: "EXP-013", relation: "explains" },
    ],
    sourceIds: ["SRC-001", "SRC-002"],
  },
  {
    id: "INS-003",
    title: "Technical SEO Auditing for AI Engine Crawlers",
    category: "Technical SEO",
    readTime: "11 min",
    readingTime: "11 min",
    summary:
      "Configuring robots protocols, clean DOM structures, and semantic data layers for next-generation search bots.",
    slug: "technical-seo-auditing-for-ai-crawlers",
    status: "DRAFT",
    authorId: "AUT-001",
    topics: ["TOP-002", "TOP-001"],
    relatedResearchIds: ["EXP-012"],
    entityReferences: [
      { type: "research", id: "EXP-012", relation: "explains" },
    ],
    sourceIds: ["SRC-003", "SRC-004"],
  },
];

export function getAllArticles(): (ArticleEntityModel & InsightArticle)[] {
  return LATEST_INSIGHTS;
}

export function getArticleBySlug(
  slug: string
): (ArticleEntityModel & InsightArticle) | undefined {
  return LATEST_INSIGHTS.find((article) => article.slug === slug);
}

export function getArticleById(
  id: string
): (ArticleEntityModel & InsightArticle) | undefined {
  return LATEST_INSIGHTS.find((article) => article.id === id);
}

export function getPublishedArticles(): (ArticleEntityModel & InsightArticle)[] {
  return LATEST_INSIGHTS.filter((article) => isIndexable(article.status));
}
