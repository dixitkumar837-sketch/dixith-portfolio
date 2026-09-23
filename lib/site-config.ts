/**
 * Centralized Site Configuration & Entity Registry for DIXITH
 * Single source of truth for canonical URLs, metadata, and entity schemas.
 */

export const SITE_CONFIG = {
  name: "DIXITH",
  tagline: "Search Forward",
  positioning: "AI Search Strategist",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://dixith.ai",
  defaultTitle: "Dixith Kumar — AI Search Strategist | Search Forward",
  description:
    "Researching how people, businesses, and information are discovered across modern search.",
  philosophy: "Research first. Build second. Measure always.",
  locale: "en_US",
  themeColor: "#050816",

  author: {
    name: "Dixith Kumar",
    alternateName: "DIXITH",
    jobTitle: "AI Search Strategist",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://dixith.ai",
    description:
      "Researching how people, businesses, and information are discovered across modern search.",
    sameAs: [
      "https://github.com/dixitkumar837-sketch",
      "https://www.linkedin.com/in/dixithkumar-ai-search-strategist/",
    ],
    knowsAbout: [
      "AI Search",
      "Search Engine Optimization (SEO)",
      "Answer Engine Optimization (AEO)",
      "Generative Engine Optimization (GEO)",
      "Technical SEO",
      "Enterprise Search Systems",
      "Information Retrieval",
      "Retrieval Augmented Generation (RAG)",
      "Knowledge Graphs",
    ],
  },

  principles: [
    "Evidence over opinions",
    "Research over assumptions",
    "Results over noise",
    "Long-term visibility over short-term ranking tactics",
    "Clear thinking over marketing hype",
    "Human expertise combined with emerging search technology",
  ],

  socials: {
    github: "https://github.com/dixitkumar837-sketch",
    linkedin: "https://www.linkedin.com/in/dixithkumar-ai-search-strategist/",
    whatsapp: "https://wa.me/917981234450",
  },
};
