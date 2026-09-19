import { InsightArticle } from "./types";

export const LATEST_INSIGHTS: InsightArticle[] = [
  {
    id: "INS-001",
    title: "Understanding Retrieval Augmented Generation in Modern Search Engines",
    category: "AI Search",
    readTime: "7 min",
    summary: "How RAG pipelines extract, rank, and summarize web information before rendering generative responses.",
    slug: "understanding-rag-in-modern-search",
  },
  {
    id: "INS-002",
    title: "The Shift from Page Rank to Entity Trust in Generative Search",
    category: "GEO",
    readTime: "9 min",
    summary: "Evaluating why entity authority and knowledge graph validation are surpassing traditional link signals.",
    slug: "shift-from-page-rank-to-entity-trust",
  },
  {
    id: "INS-003",
    title: "Technical SEO Auditing for AI Engine Crawlers",
    category: "Technical SEO",
    readTime: "11 min",
    summary: "Configuring robots protocols, clean DOM structures, and semantic data layers for next-generation search bots.",
    slug: "technical-seo-auditing-for-ai-crawlers",
  },
];
