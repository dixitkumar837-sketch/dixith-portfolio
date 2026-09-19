export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export interface ResearchItem {
  id: string; // e.g. "EXP-014"
  category: string; // e.g. "AI SEARCH"
  title: string;
  type: string; // e.g. "Research"
  readTime: string; // e.g. "12 min"
  summary?: string;
  date?: string;
  slug: string;
}

export interface ExperimentItem {
  id: string; // e.g. "EXP-001"
  title: string;
  status: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  systemsTested: string[];
  purpose: string;
  slug: string;
}

export interface CaseStudyCategory {
  name: "Healthcare" | "E-commerce" | "Enterprise" | string;
}

export interface CaseStudyItem {
  id: string;
  title: string;
  category: string;
  problemPlaceholder: string;
  strategyPlaceholder: string;
  implementationPlaceholder: string;
  measurementPlaceholder: string;
  outcomePlaceholder: string;
  slug: string;
}

export interface InsightArticle {
  id: string;
  title: string;
  category: "AI Search" | "Technical SEO" | "AEO" | "GEO" | "Enterprise SEO" | "Research Notes";
  readTime: string;
  summary: string;
  slug: string;
}
