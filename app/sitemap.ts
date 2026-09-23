import { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/site-config";
import { getPublishedResearch } from "@/data/research";
import { getPublishedExperiments } from "@/data/experiments";
import { getPublishedProfessionalExperiences } from "@/data/professional-experience";
import { getPublishedArticles } from "@/data/articles";
import { getPublishedGuides } from "@/data/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const publishedResearch = getPublishedResearch();
  const publishedExperiments = getPublishedExperiments();
  const publishedExperiences = getPublishedProfessionalExperiences();
  const publishedArticles = getPublishedArticles();
  const publishedGuides = getPublishedGuides();

  const routes: MetadataRoute.Sitemap = [
    {
      url: SITE_CONFIG.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_CONFIG.url}/research`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_CONFIG.url}/ai-search-lab`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_CONFIG.url}/articles`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_CONFIG.url}/guides`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_CONFIG.url}/professional-experience`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_CONFIG.url}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Include only verified PUBLISHED research entries (prevents indexing draft/in-review work)
  publishedResearch.forEach((item) => {
    routes.push({
      url: `${SITE_CONFIG.url}/research/${item.slug}`,
      lastModified: item.updatedAt ? new Date(item.updatedAt) : lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  // Include only verified PUBLISHED lab experiments (prevents indexing active/draft experiments)
  publishedExperiments.forEach((exp) => {
    routes.push({
      url: `${SITE_CONFIG.url}/ai-search-lab/${exp.slug}`,
      lastModified: exp.completedAt ? new Date(exp.completedAt) : lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  // Include verified PUBLISHED articles (prevents indexing draft/in-review articles)
  publishedArticles.forEach((article) => {
    routes.push({
      url: `${SITE_CONFIG.url}/articles/${article.slug}`,
      lastModified: article.updatedAt ? new Date(article.updatedAt) : lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  // Include verified PUBLISHED guides (prevents indexing draft/in-review guides)
  publishedGuides.forEach((guide) => {
    routes.push({
      url: `${SITE_CONFIG.url}/guides/${guide.slug}`,
      lastModified: guide.updatedAt ? new Date(guide.updatedAt) : lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  // Include verified PUBLISHED professional experience entries
  publishedExperiences.forEach((pe) => {
    routes.push({
      url: `${SITE_CONFIG.url}/professional-experience/${pe.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  return routes;
}
