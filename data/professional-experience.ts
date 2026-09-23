import { ProfessionalExperienceItem, isIndexable } from "./types";

export const PROFESSIONAL_EXPERIENCES: ProfessionalExperienceItem[] = [
  {
    id: "PE-001",
    slug: "healthcare-search-architecture",
    title: "Healthcare Search Architecture",
    domain: "Healthcare & Clinical Systems",
    roleContext: "Technical SEO & Information Architecture",
    summary:
      "Technical experience structuring clinical taxonomy hierarchies, medical schema architectures, and entity disambiguation for diagnostic and healthcare environments.",
    overview:
      "Professional technical work focused on organizing complex healthcare taxonomies, establishing structured schema frameworks for diagnostic services, and enhancing medical entity recognition across modern search engines.",
    responsibilities: [
      "Reviewed and structured clinical service taxonomies across medical diagnostic departments.",
      "Structured Schema.org MedicalEntity and LocalBusiness configurations for multi-department facilities.",
      "Mapped entity relationships connecting diagnostic modalities (imaging, pathology, testing) to clinical knowledge concepts.",
      "Evaluated localized search discoverability and regional facility landing page hierarchies.",
      "Monitored search engine crawler access and resolved terminology indexation conflicts.",
    ],
    technicalFocus: [
      "Schema.org medical entity modeling (MedicalCondition, MedicalTest, LocalBusiness)",
      "Clinical taxonomy hierarchy organization and URL path modeling",
      "Knowledge graph grounding and entity disambiguation",
      "Local business structured data and multi-location geographical signals",
    ],
    searchFocus: [
      "Healthcare search discoverability and high-standard content clarity",
      "E-E-A-T alignment for clinical entity disambiguation",
      "Local search visibility for multi-department clinical facilities",
      "AI overview and generative answer engine citation retrieval",
    ],
    technologies: [
      "Schema.org Standards",
      "JSON-LD",
      "Google Search Console",
      "Technical SEO Crawlers",
    ],
    professionalContext:
      "Experience developed through professional employment focusing on healthcare services, diagnostic clinics, and medical taxonomy architectures.",
    disclosure: "Specific client and commercial details are intentionally omitted.",
    relatedResearch: [
      "how-entities-influence-ai-search-visibility",
      "citation-patterns-across-ai-search-systems",
    ],
    relatedResearchIds: ["EXP-013", "EXP-014"],
    entityReferences: [
      { type: "research", id: "EXP-013", relation: "references" },
      { type: "research", id: "EXP-014", relation: "references" },
    ],
    authorId: "AUT-001",
    topics: ["TOP-002", "TOP-006"],
    status: "PUBLISHED",
  },
  {
    id: "PE-002",
    slug: "international-search-architecture",
    title: "International Search Architecture",
    domain: "Enterprise & Global Platforms",
    roleContext: "International Technical SEO & Crawl Optimization",
    summary:
      "Technical experience designing multi-regional routing, reciprocal hreflang synchronization, and crawl efficiency frameworks for cross-border enterprise platforms.",
    overview:
      "Technical search architecture experience addressing international indexing signals, multi-language routing, hreflang cluster synchronization, and crawl budget distribution across global web environments.",
    responsibilities: [
      "Structured cross-border hreflang mapping matrices and reciprocal tag validation workflows.",
      "Analyzed international search bot crawl patterns and server latency across geographic endpoints.",
      "Standardized multi-regional canonicalization rules to prevent cross-language content cannibalization.",
      "Engineered multi-language XML sitemap architectures for scalable regional indexation.",
      "Audited multi-currency and regional language switcher DOM structures for search bot accessibility.",
    ],
    technicalFocus: [
      "Hreflang implementation and reciprocal link cluster integrity",
      "Self-referential canonicalization and international duplication resolution",
      "Crawl budget management and crawler request optimization",
      "Multi-regional sitemap index partitioning and automation",
    ],
    searchFocus: [
      "International SEO and regional market index consolidation",
      "Cross-border search duplication prevention",
      "Search engine crawler efficiency and international routing accuracy",
      "Language-specific entity recognition and local market search visibility",
    ],
    technologies: [
      "XML Sitemap Protocol",
      "Screaming Frog & Crawler Log Analysis",
      "Schema.org Internationalization",
      "Web Platform Routing",
      "Cloudflare / CDN Edge Rules",
    ],
    professionalContext:
      "Experience developed through professional employment working on enterprise digital platforms operating across multiple international regions and languages.",
    disclosure: "Specific client and commercial details are intentionally omitted.",
    relatedResearch: [
      "citation-patterns-across-ai-search-systems",
    ],
    relatedResearchIds: ["EXP-014"],
    entityReferences: [
      { type: "research", id: "EXP-014", relation: "references" },
    ],
    authorId: "AUT-001",
    topics: ["TOP-002", "TOP-007"],
    status: "PUBLISHED",
  },
  {
    id: "PE-003",
    slug: "ecommerce-search-generative-discovery",
    title: "E-Commerce Search & Generative Discovery",
    domain: "Retail & Catalog Systems",
    roleContext: "E-Commerce Technical SEO & Generative Discovery",
    summary:
      "Experience structuring product catalogs, merchant entity data feeds, and semantic content layers to enhance product visibility in traditional and AI search systems.",
    overview:
      "Professional technical experience in catalog information architecture, structured product data modeling, and preparing e-commerce systems for generative search engines and conversational shopping discovery.",
    responsibilities: [
      "Structured comprehensive Product, Offer, and MerchantReturnPolicy Schema.org layers.",
      "Aligned product variant attribute architectures with structured merchant data specifications.",
      "Designed semantic category guide structures to capture informational and commercial search intent.",
      "Evaluated product specification clarity and entity inclusion in generative AI answer responses.",
      "Audited client-side rendering bottlenecks and DOM depth affecting search crawler extraction.",
    ],
    technicalFocus: [
      "Schema.org Product, AggregateOffer, and MerchantReturnPolicy schemas",
      "Product catalog taxonomy structuring and variant attribute modeling",
      "DOM optimization for search bot and LLM retrieval parsers",
      "Merchant specification feeds and structured data validation",
    ],
    searchFocus: [
      "E-Commerce SEO and commercial product query visibility",
      "Generative Engine Optimization (GEO) for retail catalogs",
      "Conversational discovery query inclusion and product attribution",
      "Brand and product entity association across search engines",
    ],
    technologies: [
      "Schema.org (Product Specification)",
      "JSON-LD",
      "Shopify Liquid / E-Commerce Architecture",
      "Google Merchant Center Data Specifications",
      "Google Search Console",
    ],
    professionalContext:
      "Experience developed through professional employment analyzing large-scale catalog e-commerce platforms and modern AI search discovery pathways.",
    disclosure: "Specific client and commercial details are intentionally omitted.",
    relatedResearch: [
      "testing-generative-engine-visibility",
      "citation-patterns-across-ai-search-systems",
    ],
    relatedResearchIds: ["EXP-012", "EXP-014"],
    entityReferences: [
      { type: "research", id: "EXP-012", relation: "references" },
      { type: "research", id: "EXP-014", relation: "references" },
    ],
    authorId: "AUT-001",
    topics: ["TOP-002", "TOP-004"],
    status: "PUBLISHED",
  },
];

export function getAllProfessionalExperiences(): ProfessionalExperienceItem[] {
  return PROFESSIONAL_EXPERIENCES;
}

export function getProfessionalExperienceBySlug(
  slug: string
): ProfessionalExperienceItem | undefined {
  return PROFESSIONAL_EXPERIENCES.find((pe) => pe.slug === slug);
}

export function getProfessionalExperienceById(
  id: string
): ProfessionalExperienceItem | undefined {
  return PROFESSIONAL_EXPERIENCES.find((pe) => pe.id === id);
}

export function getPublishedProfessionalExperiences(): ProfessionalExperienceItem[] {
  return PROFESSIONAL_EXPERIENCES.filter((pe) => isIndexable(pe.status));
}
