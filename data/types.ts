export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

/**
 * Canonical Content Lifecycle Status
 * Governing publication, sitemap inclusion, and robots indexing.
 */
export type ContentStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "ACTIVE"
  | "COMPLETED"
  | "PUBLISHED"
  | "ARCHIVED";

/**
 * Indexability gatekeeper: Only PUBLISHED content is publicly indexable.
 */
export function isIndexable(status: ContentStatus): boolean {
  return status === "PUBLISHED";
}

/**
 * Canonical Entity Type for disambiguating collections and relational targets
 */
export type EntityType =
  | "research"
  | "experiment"
  | "article"
  | "guide"
  | "professional-experience"
  | "source"
  | "topic"
  | "author";

/**
 * Standardized relationship verbs between knowledge entities
 */
export type RelationType =
  | "validates"
  | "tests"
  | "explains"
  | "applies"
  | "references"
  | "builds_on";

/**
 * Canonical Entity Reference
 * Disambiguates entity resolution using explicit EntityType + stable ID,
 * ensuring no heuristic ID prefix guessing (e.g. historical 'EXP-' prefix
 * shared between Research and Experiments).
 */
export interface EntityReference {
  type: EntityType;
  id: string;
  relation?: RelationType;
}

/**
 * Canonical Author Entity
 */
export interface AuthorEntity {
  id: string; // e.g. "AUT-001"
  name: string;
  role: string;
  tagline: string;
  url: string;
  sameAs: string[];
  bio?: string;
}

/**
 * Canonical Source Entity for evidence provenance & verification
 */
export interface SourceEntity {
  id: string; // e.g. "SRC-001"
  title: string;
  url: string;
  publisher?: string;
  authors?: string[];
  publicationDate?: string;
  accessedDate?: string;
  sourceType?:
    | "ACADEMIC_PAPER"
    | "OFFICIAL_DOCUMENTATION"
    | "ENGINE_ANNOUNCEMENT"
    | "BENCHMARK_STUDY"
    | "STANDARD_SPEC";
  verificationStatus?: "VERIFIED" | "ARCHIVED_MIRROR" | "UNCONFIRMED";
  doiOrIdentifier?: string;
}

/**
 * Lightweight Canonical Topic Entity
 */
export interface TopicEntity {
  id: string; // e.g. "TOP-001"
  slug: string;
  name: string;
  description?: string;
}

/**
 * Shared Base Content Model
 * Stable IDs (relational key) are strictly separated from Slugs (URL tokens).
 */
export interface BaseContentEntity {
  id: string; // e.g. "RES-001", "EXP-001", "ART-001", "GUI-001", "PE-001"
  slug: string; // Canonical URL path token
  title: string;
  summary?: string;
  status: ContentStatus;
  authorId?: string; // Relational link to Author (e.g. "AUT-001")
  topics?: string[];
  entityReferences?: EntityReference[]; // Explicit type + ID relational links
  sourceIds?: string[]; // Standardized stable Source IDs: ["SRC-001"]
  publishedAt?: string;
  updatedAt?: string;
  readingTime?: string;
}

/**
 * Standardized Research Item for archives and index displays
 */
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

/**
 * Full Research Entity Model for Scalable Deep-Dive Publishing
 * Aligned with AEO (Direct Answers) and GEO (Evidence & Methodology)
 */
export interface ResearchEntityModel extends BaseContentEntity, ResearchItem {
  status: ContentStatus;
  researchArea: string;
  question?: string; // AEO Query Framing
  shortAnswer?: string; // AEO Ground Truth Answer
  detailedExplanation?: string;
  methodology?: string;
  systems?: string[];
  systemsTested?: string[];
  topics?: string[];
  publishedAt?: string;
  updatedAt?: string;
  readingTime?: string;
  variables?: string[];
  observations?: string[];
  findings?: string[];
  limitations?: string[];
  relatedResearch?: string[]; // Backwards compatibility: slugs
  relatedExperiments?: string[]; // Backwards compatibility: IDs
  relatedResearchIds?: string[]; // Standardized stable IDs: ["EXP-013"]
  relatedExperimentIds?: string[]; // Standardized stable IDs: ["EXP-001"]
  sources?: (SourceEntity | { title: string; url?: string })[];
  sourceIds?: string[]; // Standardized stable Source IDs: ["SRC-001"]
  datePublished?: string;
  dateModified?: string;
  author: string;
  authorId?: string; // "AUT-001"
}

/**
 * Active AI Search Lab Experiment
 */
export interface ExperimentItem extends BaseContentEntity {
  category?: string;
  status: ContentStatus;
  summary?: string;
  purpose: string;
  researchQuestion?: string;
  objective?: string;
  systems?: string[];
  systemsTested: string[];
  query?: string;
  methodology?: string;
  variables?: string[];
  activeVariables?: string[];
  evidence?: string[];
  observations?: string[];
  findings?: string[];
  limitations?: string[];
  startedAt?: string;
  completedAt?: string;
  relatedResearch?: string[]; // Backwards compatibility: slugs
  relatedExperiments?: string[]; // Backwards compatibility: IDs
  relatedResearchIds?: string[]; // Standardized stable IDs
  relatedExperimentIds?: string[]; // Standardized stable IDs
  hypothesis?: string;
  queryVectorCount?: number;
  author?: string;
  authorId?: string; // "AUT-001"
}

/**
 * Professional Experience Architecture
 * Represents technical roles, responsibilities, and methodologies developed through employment
 */
export interface ProfessionalExperienceItem extends BaseContentEntity {
  domain: string; // e.g. "Healthcare & Clinical Systems"
  roleContext?: string; // e.g. "Technical SEO & Information Architecture"
  summary: string;
  overview: string;
  responsibilities: string[];
  technicalFocus: string[];
  searchFocus: string[];
  technologies: string[];
  professionalContext: string;
  disclosure?: string;
  relatedResearch?: string[]; // Backwards compatibility: slugs
  relatedExperiments?: string[]; // Backwards compatibility: IDs
  relatedResearchIds?: string[]; // Standardized stable IDs
  relatedExperimentIds?: string[]; // Standardized stable IDs
  status: ContentStatus;
}

export interface CaseStudyCategory {
  name: "Healthcare" | "E-commerce" | "Enterprise" | string;
}

/**
 * Empirical Case Study Architecture (Legacy / Compatibility)
 */
export interface CaseStudyItem {
  id: string; // e.g. "CS-001"
  slug: string;
  title: string;
  client?: string;
  category: string;
  summary: string;
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
  challenge?: string;
  objective?: string;
  strategy?: string;
  implementation?: string;
  measurement?: string;
  outcome?: string;
  limitations?: string[];
  services?: string[];
  technologies?: string[];
  topics?: string[];
  relatedResearch?: string[];
  relatedExperiments?: string[];
  publishedAt?: string;
  updatedAt?: string;
  author: string;
  // Backward compatibility fields
  problemPlaceholder?: string;
  strategyPlaceholder?: string;
  implementationPlaceholder?: string;
  measurementPlaceholder?: string;
  outcomePlaceholder?: string;
}

/**
 * Canonical Article Entity Model (Analytical Dispatches & Strategic Analyses)
 */
export interface ArticleEntityModel extends BaseContentEntity {
  category: "AI Search" | "Technical SEO" | "AEO" | "GEO" | "Enterprise SEO" | "Research Notes" | string;
  readTime: string;
  body?: string;
  sourceIds?: string[];
  relatedResearchIds?: string[];
  relatedExperimentIds?: string[];
  relatedGuideIds?: string[];
}

/**
 * Editorial Perspectives & Articles (Backwards Compatibility Stub)
 */
export interface InsightArticle extends Partial<BaseContentEntity> {
  id: string;
  title: string;
  category: "AI Search" | "Technical SEO" | "AEO" | "GEO" | "Enterprise SEO" | "Research Notes" | string;
  readTime: string;
  summary: string;
  slug: string;
  datePublished?: string;
  authorId?: string;
}

/**
 * Implementation Guide Step Definition
 */
export interface GuideStep {
  stepNumber: number;
  title: string;
  description: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
}

/**
 * Canonical Implementation Guide Model
 */
export interface GuideEntityModel extends BaseContentEntity {
  category: string;
  readTime?: string;
  difficultyLevel?: "FUNDAMENTAL" | "INTERMEDIATE" | "ADVANCED";
  targetSystems?: string[];
  prerequisites?: string[];
  steps?: GuideStep[];
  body?: string;
  sourceIds?: string[];
  relatedResearchIds?: string[];
  relatedArticleIds?: string[];
}
