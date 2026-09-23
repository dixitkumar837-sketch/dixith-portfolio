import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/site-config";
import { getAllArticles, getArticleBySlug } from "@/data/articles";
import { getResearchById } from "@/data/research";
import { getSourceById } from "@/data/sources";
import { getTopicById } from "@/data/topics";
import { isIndexable } from "@/data/types";
import {
  generateBreadcrumbSchema,
  generateArticleSchema,
  generateWebPageSchema,
} from "@/lib/schema";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  ShieldCheck,
  User,
} from "lucide-react";

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  const allArticles = getAllArticles();
  return allArticles.map((article) => ({
    slug: article.slug,
  }));
}

export function generateMetadata({ params }: ArticlePageProps): Metadata {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    return {
      title: "Article Not Found | DIXITH",
    };
  }

  const canonicalUrl = `${SITE_CONFIG.url}/articles/${article.slug}`;
  const isPublished = isIndexable(article.status);

  return {
    title: `${article.title} — Analysis & Perspectives`,
    description: article.summary,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: isPublished,
      follow: true,
      googleBot: {
        index: isPublished,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: `${article.title} | DIXITH Articles`,
      description: article.summary,
      siteName: SITE_CONFIG.name,
      authors: [SITE_CONFIG.author.name],
      ...(article.publishedAt && { publishedTime: article.publishedAt }),
      ...(article.updatedAt && { modifiedTime: article.updatedAt }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} | DIXITH Articles`,
      description: article.summary,
    },
  };
}

export default function ArticleDetailPage({ params }: ArticlePageProps) {
  const article = getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const canonicalUrl = `${SITE_CONFIG.url}/articles/${article.slug}`;
  const isPublished = isIndexable(article.status);

  const breadcrumbs = [
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Articles", url: `${SITE_CONFIG.url}/articles` },
    { name: article.title, url: canonicalUrl },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const webPageSchema = generateWebPageSchema({
    title: `${article.title} | DIXITH Articles`,
    description: article.summary,
    url: canonicalUrl,
  });

  const articleSchema = isPublished
    ? generateArticleSchema({
        title: article.title,
        description: article.summary,
        slug: article.slug,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        category: article.category,
      })
    : null;

  // Resolve related research via explicit research references (avoiding prefix heuristics)
  const relatedResearch = (article.relatedResearchIds || [])
    .map((id) => getResearchById(id))
    .filter(Boolean);

  // Resolve sources if present
  const sources = (article.sourceIds || [])
    .map((srcId) => getSourceById(srcId))
    .filter(Boolean);

  return (
    <article className="py-[96px] md:py-[128px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      {articleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}

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
            <li>
              <Link
                href="/articles"
                className="hover:text-brand-text-primary transition-colors focus-visible:outline-brand-accent"
              >
                Articles
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
            </li>
            <li
              aria-current="page"
              className="text-brand-accent font-semibold truncate max-w-[240px] sm:max-w-none"
            >
              {article.title}
            </li>
          </ol>
        </nav>

        {/* Back Link */}
        <div className="mb-[40px]">
          <Link
            href="/articles"
            className="inline-flex items-center space-x-2 font-mono text-[12px] text-brand-text-muted hover:text-brand-accent transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Articles</span>
          </Link>
        </div>

        {/* Header */}
        <header className="max-w-[840px] mb-[48px]">
          <div className="flex flex-wrap items-center gap-3 mb-[20px]">
            <Badge variant="outline" size="sm">
              {article.category}
            </Badge>

            {!isPublished && (
              <span className="font-mono text-[10px] tracking-wider text-brand-text-muted border border-brand-border/80 bg-brand-surface/80 px-[8px] py-[2px] rounded uppercase">
                {article.status.replace("_", " ")}
              </span>
            )}

            <span className="flex items-center space-x-1.5 font-mono text-[12px] text-brand-text-muted">
              <Clock className="w-3.5 h-3.5 text-brand-border" />
              <span>{article.readTime}</span>
            </span>
          </div>

          <h1 className="font-display text-[32px] sm:text-[44px] md:text-[50px] font-bold text-brand-text-primary tracking-tight leading-[1.15] mb-[24px]">
            {article.title}
          </h1>

          <p className="text-[17px] sm:text-[19px] text-brand-text-secondary leading-relaxed font-sans font-light">
            {article.summary}
          </p>

          {/* Author Metadata Bar */}
          <div className="mt-[32px] pt-[24px] border-t border-brand-border-subtle flex flex-wrap items-center justify-between gap-4 text-brand-text-muted font-mono text-[12px]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center font-display font-bold text-[12px] text-brand-accent">
                DK
              </div>
              <div>
                <div className="text-brand-text-primary font-medium">
                  {SITE_CONFIG.author.name}
                </div>
                <div className="text-[11px] text-brand-text-muted">
                  {SITE_CONFIG.author.jobTitle}
                </div>
              </div>
            </div>

            <div>
              {article.publishedAt ? (
                <span>Published: {article.publishedAt}</span>
              ) : (
                <span className="text-brand-text-muted">
                  Status: Non-Indexed Draft
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-[840px]">
          {/* Topics Tagging */}
          {article.topics && article.topics.length > 0 && (
            <section aria-label="Article Topics" className="mb-[40px]">
              <div className="flex flex-wrap gap-2">
                {article.topics.map((topicToken) => {
                  const topic = getTopicById(topicToken);
                  return (
                    <span
                      key={topicToken}
                      className="px-[10px] py-[4px] rounded bg-brand-surface border border-brand-border text-[12px] font-mono text-brand-text-secondary"
                    >
                      {topic ? topic.name : topicToken}
                    </span>
                  );
                })}
              </div>
            </section>
          )}

          {/* Article Body or Abstract Overview */}
          <section className="mb-[64px] border border-brand-border rounded-lg bg-brand-surface/30 p-[32px] sm:p-[40px]">
            <div className="flex items-center space-x-2.5 mb-[20px]">
              <FileText className="w-4 h-4 text-brand-accent" />
              <h2 className="font-mono text-[13px] tracking-wider text-brand-accent uppercase font-medium">
                EDITORIAL THESIS & ABSTRACT
              </h2>
            </div>

            <p className="text-[16px] text-brand-text-primary leading-relaxed mb-[24px]">
              {article.summary}
            </p>

            {article.body ? (
              <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-brand-text-secondary whitespace-pre-line">
                {article.body}
              </div>
            ) : (
              <div className="rounded border border-brand-border/60 bg-brand-surface/60 p-[20px] font-mono text-[12px] text-brand-text-muted leading-relaxed">
                <div className="flex items-center space-x-2 text-brand-accent mb-[8px]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-semibold uppercase tracking-wider">
                    Editorial Notice
                  </span>
                </div>
                This article is a structured editorial record in development. Full prose sections, empirical code demonstrations, and comparative analysis are undergoing replication review before public release.
              </div>
            )}
          </section>

          {/* Related Empirical Research Section */}
          {relatedResearch.length > 0 && (
            <section aria-labelledby="related-research-heading" className="mb-[64px]">
              <div className="flex items-center space-x-2.5 mb-[24px]">
                <BookOpen className="w-4 h-4 text-brand-accent" />
                <h2
                  id="related-research-heading"
                  className="font-mono text-[13px] tracking-wider text-brand-accent uppercase font-medium"
                >
                  FOUNDATIONAL EMPIRICAL RESEARCH
                </h2>
              </div>

              <div className="space-y-[16px]">
                {relatedResearch.map((res) => {
                  if (!res) return null;
                  return (
                    <Link
                      key={res.id}
                      href={`/research/${res.slug}`}
                      className="block p-[24px] rounded-lg border border-brand-border bg-brand-surface/40 hover:border-brand-accent/50 hover:bg-brand-surface transition-all group"
                    >
                      <div className="flex items-center justify-between mb-[10px]">
                        <span className="font-mono text-[11px] text-brand-accent font-medium">
                          {res.id} · {res.category}
                        </span>
                        <span className="font-mono text-[10px] text-brand-text-muted border border-brand-border px-[6px] py-[1.5px] rounded uppercase">
                          {res.status.replace("_", " ")}
                        </span>
                      </div>

                      <h3 className="font-display text-[18px] font-bold text-brand-text-primary group-hover:text-brand-accent-hover transition-colors mb-[8px]">
                        {res.title}
                      </h3>

                      {res.question && (
                        <p className="text-[13px] text-brand-text-secondary leading-relaxed font-sans mb-[16px]">
                          <span className="text-brand-text-muted font-mono text-[11px] block mb-1">
                            RESEARCH QUESTION:
                          </span>
                          {res.question}
                        </p>
                      )}

                      <div className="flex items-center space-x-1.5 font-mono text-[12px] text-brand-accent group-hover:translate-x-0.5 transition-transform">
                        <span>Inspect Research Protocol</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Sources Section */}
          {sources.length > 0 && (
            <section aria-labelledby="sources-heading" className="mb-[64px]">
              <div className="flex items-center space-x-2.5 mb-[20px]">
                <ExternalLink className="w-4 h-4 text-brand-accent" />
                <h2
                  id="sources-heading"
                  className="font-mono text-[13px] tracking-wider text-brand-accent uppercase font-medium"
                >
                  VERIFIED CITATION SOURCES
                </h2>
              </div>

              <ul className="space-y-[12px]">
                {sources.map((src) => {
                  if (!src) return null;
                  return (
                    <li
                      key={src.id}
                      className="p-[16px] rounded border border-brand-border/60 bg-brand-surface/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                    >
                      <div>
                        <div className="font-display text-[14px] font-bold text-brand-text-primary">
                          {src.title}
                        </div>
                        <div className="font-mono text-[11px] text-brand-text-muted">
                          {src.publisher}
                          {src.sourceType && ` · ${src.sourceType.replace("_", " ")}`}
                        </div>
                      </div>
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 font-mono text-[11px] text-brand-accent hover:underline self-start sm:self-auto"
                      >
                        <span>View Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Footer Independence Notice */}
          <footer className="pt-[32px] border-t border-brand-border-subtle text-brand-text-muted font-mono text-[12px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span>DIXITH Editorial Architecture · Independent Analysis</span>
            </div>
            <div>
              <Link
                href="/articles"
                className="text-brand-accent hover:text-brand-accent-hover transition-colors"
              >
                ← Back to All Articles
              </Link>
            </div>
          </footer>
        </main>
      </Container>
    </article>
  );
}
