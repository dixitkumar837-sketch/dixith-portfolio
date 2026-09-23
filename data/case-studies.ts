import { CaseStudyItem } from "./types";
import { PROFESSIONAL_EXPERIENCES } from "./professional-experience";

/**
 * Legacy Case Studies compatibility layer
 * Maps to professional experience frameworks without claiming independent client ownership
 */
export const CASE_STUDIES: CaseStudyItem[] = [
  {
    id: "CS-001",
    slug: "healthcare-search-architecture",
    title: "Healthcare Search Architecture",
    category: "Healthcare",
    summary:
      "Technical experience structuring clinical taxonomy hierarchies, medical schema architectures, and entity disambiguation for diagnostic and healthcare environments.",
    status: "PUBLISHED",
    challenge:
      "Complex medical diagnostic terminology and multi-department facility services require clear entity disambiguation and taxonomy organization.",
    objective:
      "Structure clinical taxonomies to Schema.org standards, organize diagnostic discovery pathways, and establish consistent entity recognition across search engines.",
    strategy:
      "Mapped clinical service relationships across diagnostic modalities (imaging, pathology, testing) and structured localized geographical facility signals.",
    implementation:
      "Structured Schema.org MedicalEntity and LocalBusiness configurations, organized clinical taxonomy hierarchies, and aligned sitemap discovery.",
    measurement:
      "Monitored search engine crawler indexation, evaluated knowledge graph entity recognition, and audited regional discovery consistency.",
    outcome:
      "Technical search architecture and structured schema framework established. Specific client and commercial details are intentionally omitted.",
    limitations: [
      "Medical search algorithms enforce strict E-E-A-T verification parameters requiring continuous clinical author review.",
      "Knowledge graph ingest latency varies between regional health indices and commercial search engines.",
    ],
    services: [
      "Medical SEO",
      "Knowledge Graph Structuring",
      "Schema.org Architecture",
      "Technical SEO",
    ],
    technologies: [
      "Schema.org Standards",
      "JSON-LD",
      "Google Search Console",
      "Technical SEO Crawlers",
    ],
    topics: [
      "Healthcare SEO",
      "Entity Recognition",
      "Local Search",
      "Knowledge Graphs",
    ],
    relatedResearch: [
      "how-entities-influence-ai-search-visibility",
      "citation-patterns-across-ai-search-systems",
    ],
    author: "Dixith Kumar",
    problemPlaceholder:
      "Medical service taxonomies with entity disambiguation challenges across clinical diagnostic areas.",
    strategyPlaceholder:
      "Structured medical service taxonomies and established semantic schema frameworks.",
    implementationPlaceholder:
      "Configured Schema.org medical entities, local facility schemas, and URL hierarchy models.",
    measurementPlaceholder:
      "Evaluated search crawler indexation and entity recognition consistency.",
    outcomePlaceholder:
      "Structured technical frameworks developed through professional employment.",
  },
  {
    id: "CS-002",
    slug: "international-search-architecture",
    title: "International Search Architecture",
    category: "Enterprise",
    summary:
      "Technical experience designing multi-regional routing, reciprocal hreflang synchronization, and crawl efficiency frameworks for cross-border enterprise platforms.",
    status: "PUBLISHED",
    challenge:
      "Multi-language enterprise web architectures require coordinated regional indexation, reciprocal hreflang clustering, and crawl budget management.",
    objective:
      "Consolidate regional indexing signals into a coordinated technical architecture with reciprocal hreflang validation and clear canonical routing.",
    strategy:
      "Engineered centralized hreflang mapping matrices, standardized language endpoints, and coordinated international sitemap architectures.",
    implementation:
      "Configured automated XML sitemap hreflang clusters, resolved canonical self-referential conflicts, and audited server response latency for crawlers.",
    measurement:
      "Audited international crawling logs via crawler log analysis, tracked indexation efficiency, and validated reciprocal tag parity across regional endpoints.",
    outcome:
      "Multi-regional search architecture framework established. Specific client and commercial details are intentionally omitted.",
    limitations: [
      "International search indexing behavior varies across non-Google regional search engines.",
      "Edge caching layers require synchronized purge rules during multilingual content updates.",
    ],
    services: [
      "International SEO",
      "Technical Architecture",
      "Crawl Budget Optimization",
      "Hreflang Synchronization",
    ],
    technologies: [
      "XML Sitemap Protocol",
      "Screaming Frog & Crawler Log Analysis",
      "Schema.org Internationalization",
      "Cloudflare / CDN Edge Rules",
    ],
    topics: [
      "International SEO",
      "Hreflang",
      "Crawl Budget",
      "Enterprise Search",
    ],
    relatedResearch: [
      "citation-patterns-across-ai-search-systems",
    ],
    author: "Dixith Kumar",
    problemPlaceholder:
      "Multi-regional web platforms requiring coordinated language routing and reciprocal hreflang alignment.",
    strategyPlaceholder:
      "Designed international hreflang mapping matrices and regional crawl optimization workflows.",
    implementationPlaceholder:
      "Configured multi-language XML sitemaps, canonical rules, and crawler accessibility parameters.",
    measurementPlaceholder:
      "Audited international crawling efficiency and tag reciprocity across regions.",
    outcomePlaceholder:
      "Enterprise multi-regional search frameworks developed through professional employment.",
  },
  {
    id: "CS-003",
    slug: "ecommerce-search-generative-discovery",
    title: "E-Commerce Search & Generative Discovery",
    category: "E-commerce",
    summary:
      "Experience structuring product catalogs, merchant entity data feeds, and semantic content layers to enhance product visibility in traditional and AI search systems.",
    status: "PUBLISHED",
    challenge:
      "Large product catalogs require structured entity modeling and clean data feeds to ensure visibility across conversational AI and search engines.",
    objective:
      "Structure detailed product entity graphs, establish clean merchant specification feeds, and enhance conversational discovery in AI answer engines.",
    strategy:
      "Configured comprehensive Product, Offer, and MerchantReturnPolicy structured data layers aligned with merchant specifications.",
    implementation:
      "Structured product variant schemas, pricing and availability indicators, and streamlined DOM hierarchy for search bots and AI parsers.",
    measurement:
      "Evaluated product specification clarity, structured markup validation, and entity inclusion for conversational discovery queries.",
    outcome:
      "E-commerce search architecture and structured product framework established. Specific client and commercial details are intentionally omitted.",
    limitations: [
      "E-commerce product availability and pricing change rapidly, requiring low-latency merchant feed updates.",
      "AI search engines prioritize aggregated marketplaces for high-competition commercial queries.",
    ],
    services: [
      "Generative Engine Optimization (GEO)",
      "E-Commerce SEO",
      "Product Graph Structuring",
      "Structured Data",
    ],
    technologies: [
      "Schema.org (Product Specification)",
      "JSON-LD",
      "Shopify Liquid / E-Commerce Architecture",
      "Google Merchant Center Data Specifications",
    ],
    topics: [
      "E-Commerce SEO",
      "GEO",
      "Product Graphs",
      "AI Recommendations",
    ],
    relatedResearch: [
      "testing-generative-engine-visibility",
      "citation-patterns-across-ai-search-systems",
    ],
    author: "Dixith Kumar",
    problemPlaceholder:
      "E-commerce product catalogs requiring structured data modeling for traditional and AI search discovery.",
    strategyPlaceholder:
      "Structured product entity schemas, merchant data feeds, and semantic content hierarchies.",
    implementationPlaceholder:
      "Configured Schema.org Product markup, merchant return policies, and clean DOM structures.",
    measurementPlaceholder:
      "Evaluated product schema validation and generative engine retrieval compatibility.",
    outcomePlaceholder:
      "E-commerce search and generative discovery frameworks developed through professional employment.",
  },
];

export function getAllCaseStudies(): CaseStudyItem[] {
  return CASE_STUDIES;
}

export function getCaseStudyBySlug(slug: string): CaseStudyItem | undefined {
  return CASE_STUDIES.find((cs) => cs.slug === slug);
}

export function getPublishedCaseStudies(): CaseStudyItem[] {
  return CASE_STUDIES.filter((cs) => cs.status === "PUBLISHED");
}
