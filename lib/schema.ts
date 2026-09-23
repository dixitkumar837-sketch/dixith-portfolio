import { SITE_CONFIG } from "./site-config";

/**
 * Generate Schema.org Person structured data
 */
export function generatePersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_CONFIG.url}/#person`,
    name: SITE_CONFIG.author.name,
    alternateName: SITE_CONFIG.author.alternateName,
    url: SITE_CONFIG.author.url,
    jobTitle: SITE_CONFIG.author.jobTitle,
    description: SITE_CONFIG.author.description,
    sameAs: SITE_CONFIG.author.sameAs,
    knowsAbout: SITE_CONFIG.author.knowsAbout,
  };
}

/**
 * Generate Schema.org WebSite structured data with author linkage
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.url}/#website`,
    url: SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    publisher: {
      "@id": `${SITE_CONFIG.url}/#person`,
    },
    inLanguage: "en-US",
  };
}

/**
 * Generate Schema.org WebPage structured data
 */
export function generateWebPageSchema({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url.replace(/\/$/, "")}/#webpage`,
    url: url,
    name: title,
    description: description,
    isPartOf: {
      "@id": `${SITE_CONFIG.url}/#website`,
    },
    about: {
      "@id": `${SITE_CONFIG.url}/#person`,
    },
    inLanguage: "en-US",
  };
}

/**
 * Scalable Schema.org TechArticle for future research studies
 */
export function generateTechArticleSchema({
  title,
  description,
  slug,
  basePath = "research",
  datePublished,
  dateModified,
  category,
}: {
  title: string;
  description: string;
  slug: string;
  basePath?: string;
  datePublished?: string;
  dateModified?: string;
  category?: string;
}) {
  const articleUrl = `${SITE_CONFIG.url}/${basePath}/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${articleUrl}/#article`,
    headline: title,
    description: description,
    url: articleUrl,
    author: {
      "@id": `${SITE_CONFIG.url}/#person`,
    },
    publisher: {
      "@id": `${SITE_CONFIG.url}/#person`,
    },
    inLanguage: "en-US",
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(category && { articleSection: category }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${articleUrl}/#webpage`,
    },
  };
}

/**
 * Generate Schema.org Article structured data for editorial dispatches and strategic analysis
 */
export function generateArticleSchema({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  category,
}: {
  title: string;
  description: string;
  slug: string;
  datePublished?: string;
  dateModified?: string;
  category?: string;
}) {
  const articleUrl = `${SITE_CONFIG.url}/articles/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${articleUrl}/#article`,
    headline: title,
    description: description,
    url: articleUrl,
    author: {
      "@id": `${SITE_CONFIG.url}/#person`,
    },
    publisher: {
      "@id": `${SITE_CONFIG.url}/#person`,
    },
    inLanguage: "en-US",
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(category && { articleSection: category }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${articleUrl}/#webpage`,
    },
  };
}

/**
 * Generate Schema.org TechArticle structured data for technical implementation guides
 */
export function generateGuideSchema({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  category,
}: {
  title: string;
  description: string;
  slug: string;
  datePublished?: string;
  dateModified?: string;
  category?: string;
}) {
  const guideUrl = `${SITE_CONFIG.url}/guides/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${guideUrl}/#article`,
    headline: title,
    description: description,
    url: guideUrl,
    author: {
      "@id": `${SITE_CONFIG.url}/#person`,
    },
    publisher: {
      "@id": `${SITE_CONFIG.url}/#person`,
    },
    inLanguage: "en-US",
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(category && { articleSection: category }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${guideUrl}/#webpage`,
    },
  };
}

/**
 * Scalable Schema.org BreadcrumbList for deeper hierarchical routes
 */
export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
