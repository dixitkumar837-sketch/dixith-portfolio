import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/site-config";
import { getPublishedArticles } from "@/data/articles";
import { generateBreadcrumbSchema } from "@/lib/schema";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  FlaskConical,
  Layers,
  Sparkles,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Articles & Analysis",
  description:
    "Expert analysis, technical explanations, and strategic perspectives on modern AI search engines, retrieval architectures, and entity discovery.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/articles`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_CONFIG.url}/articles`,
    title: "Articles & Analysis | DIXITH",
    description:
      "Expert analysis, technical explanations, and strategic perspectives on modern AI search engines, retrieval architectures, and entity discovery.",
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Articles & Analysis | DIXITH",
    description:
      "Expert analysis, technical explanations, and strategic perspectives on modern AI search engines, retrieval architectures, and entity discovery.",
  },
};

export default function ArticlesArchivePage() {
  const publishedArticles = getPublishedArticles();

  const breadcrumbs = [
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Articles", url: `${SITE_CONFIG.url}/articles` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const archiveWebPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_CONFIG.url}/articles/#webpage`,
    url: `${SITE_CONFIG.url}/articles`,
    name: "Articles & Analysis | DIXITH",
    description:
      "Expert analysis, technical explanations, and strategic perspectives on modern AI search engines, retrieval architectures, and entity discovery.",
    isPartOf: {
      "@id": `${SITE_CONFIG.url}/#website`,
    },
    about: {
      "@id": `${SITE_CONFIG.url}/#person`,
    },
    inLanguage: "en-US",
  };

  return (
    <div className="py-[96px] md:py-[128px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(archiveWebPageSchema) }}
      />

      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-[32px]">
          <ol className="flex items-center space-x-2 font-mono text-[12px] text-brand-text-muted">
            <li>
              <Link
                href="/"
                className="hover:text-brand-text-primary transition-colors focus-visible:outline-brand-accent"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
            </li>
            <li aria-current="page" className="text-brand-accent font-semibold">
              Articles
            </li>
          </ol>
        </nav>

        {/* Editorial Archive Header */}
        <header className="max-w-[800px] mb-[64px]">
          <div className="flex items-center space-x-2.5 mb-[16px]">
            <span className="w-2 h-2 rounded-full bg-brand-accent" />
            <span className="font-mono text-[12px] tracking-[0.18em] text-brand-accent uppercase font-medium">
              EDITORIAL PERSPECTIVES & ANALYSES
            </span>
          </div>

          <h1 className="font-display text-[36px] sm:text-[48px] md:text-[54px] font-bold text-brand-text-primary tracking-tight leading-[1.1] mb-[24px]">
            Articles
          </h1>

          <p className="text-[17px] sm:text-[19px] text-brand-text-secondary leading-relaxed font-sans font-light">
            In-depth analysis, architectural explanations, and strategic interpretations examining how retrieval models, entity graphs, and generative AI search systems reshape discoverability.
          </p>
        </header>

        {/* Published Articles List or In-Review Graceful Notice */}
        {publishedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {publishedArticles.map((article) => (
              <article
                key={article.id}
                aria-labelledby={`article-title-${article.id}`}
                className="group bg-brand-surface/40 border border-brand-border hover:border-brand-accent/50 rounded-lg p-[32px] flex flex-col justify-between transition-all duration-300 hover:bg-brand-surface"
              >
                <div>
                  <div className="flex items-center justify-between mb-[20px]">
                    <Badge variant="outline" size="sm">
                      {article.category}
                    </Badge>
                    <span className="font-mono text-[11px] text-brand-text-muted">
                      {article.readTime}
                    </span>
                  </div>

                  <h2
                    id={`article-title-${article.id}`}
                    className="font-display text-[22px] font-bold text-brand-text-primary tracking-tight leading-snug group-hover:text-brand-accent-hover transition-colors mb-[14px]"
                  >
                    <Link
                      href={`/articles/${article.slug}`}
                      className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded-sm"
                    >
                      {article.title}
                    </Link>
                  </h2>

                  <p className="text-[14px] text-brand-text-secondary leading-relaxed font-sans mb-[24px]">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-[20px] border-t border-brand-border-subtle flex items-center justify-between font-mono text-[12px] text-brand-text-muted">
                  <span className="text-brand-text-muted">
                    {article.publishedAt || "Verified Editorial"}
                  </span>
                  <Link
                    href={`/articles/${article.slug}`}
                    className="flex items-center space-x-1.5 text-brand-accent group-hover:text-brand-accent-hover font-medium transition-colors"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-brand-border rounded-lg bg-brand-surface/20 p-[40px] md:p-[56px] text-center max-w-[860px] mx-auto">
            <div className="w-12 h-12 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mx-auto mb-[20px]">
              <FileText className="w-5 h-5 text-brand-accent" />
            </div>

            <div className="inline-flex items-center gap-2 px-[10px] py-[3px] rounded-full bg-brand-surface border border-brand-border font-mono text-[11px] text-brand-text-muted mb-[16px] uppercase tracking-wider">
              <span>Editorial Pipeline</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
              <span>In Review</span>
            </div>

            <h2 className="font-display text-[24px] md:text-[28px] font-bold text-brand-text-primary mb-[14px]">
              Editorial Dispatches in Development
            </h2>

            <p className="text-[15px] text-brand-text-secondary leading-relaxed max-w-[620px] mx-auto mb-[32px] font-sans">
              Comprehensive analytical articles examining RAG pipelines, entity validation, and search crawler architectures are currently in active drafting and editorial review.
            </p>

            <div className="pt-[24px] border-t border-brand-border-subtle grid grid-cols-1 sm:grid-cols-3 gap-[16px] text-left">
              <Link
                href="/research"
                className="p-[16px] rounded border border-brand-border/60 hover:border-brand-accent/40 bg-brand-surface/30 transition-all group"
              >
                <div className="flex items-center justify-between text-brand-accent mb-[8px]">
                  <BookOpen className="w-4 h-4" />
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-display text-[15px] font-bold text-brand-text-primary mb-[4px]">
                  Research
                </div>
                <div className="text-[12px] text-brand-text-muted">
                  Empirical studies & protocols
                </div>
              </Link>

              <Link
                href="/ai-search-lab"
                className="p-[16px] rounded border border-brand-border/60 hover:border-brand-accent/40 bg-brand-surface/30 transition-all group"
              >
                <div className="flex items-center justify-between text-brand-accent mb-[8px]">
                  <FlaskConical className="w-4 h-4" />
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-display text-[15px] font-bold text-brand-text-primary mb-[4px]">
                  AI Search Lab
                </div>
                <div className="text-[12px] text-brand-text-muted">
                  6-engine benchmark tests
                </div>
              </Link>

              <Link
                href="/professional-experience"
                className="p-[16px] rounded border border-brand-border/60 hover:border-brand-accent/40 bg-brand-surface/30 transition-all group"
              >
                <div className="flex items-center justify-between text-brand-accent mb-[8px]">
                  <Layers className="w-4 h-4" />
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-display text-[15px] font-bold text-brand-text-primary mb-[4px]">
                  Experience
                </div>
                <div className="text-[12px] text-brand-text-muted">
                  Employment-developed systems
                </div>
              </Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
