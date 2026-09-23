import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/site-config";
import { getAllGuides, getGuideBySlug } from "@/data/guides";
import { getResearchById } from "@/data/research";
import { getArticleById } from "@/data/articles";
import { getSourceById } from "@/data/sources";
import { getTopicById } from "@/data/topics";
import { isIndexable } from "@/data/types";
import {
  generateBreadcrumbSchema,
  generateGuideSchema,
  generateWebPageSchema,
} from "@/lib/schema";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  ExternalLink,
  FileText,
  ListOrdered,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

interface GuidePageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  const allGuides = getAllGuides();
  return allGuides.map((guide) => ({
    slug: guide.slug,
  }));
}

export function generateMetadata({ params }: GuidePageProps): Metadata {
  const guide = getGuideBySlug(params.slug);

  if (!guide) {
    return {
      title: "Guide Not Found | DIXITH",
    };
  }

  const canonicalUrl = `${SITE_CONFIG.url}/guides/${guide.slug}`;
  const isPublished = isIndexable(guide.status);

  return {
    title: `${guide.title} — Implementation Guide`,
    description: guide.summary,
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
      title: `${guide.title} | DIXITH Guides`,
      description: guide.summary,
      siteName: SITE_CONFIG.name,
      authors: [SITE_CONFIG.author.name],
      ...(guide.publishedAt && { publishedTime: guide.publishedAt }),
      ...(guide.updatedAt && { modifiedTime: guide.updatedAt }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.title} | DIXITH Guides`,
      description: guide.summary,
    },
  };
}

export default function GuideDetailPage({ params }: GuidePageProps) {
  const guide = getGuideBySlug(params.slug);

  if (!guide) {
    notFound();
  }

  const canonicalUrl = `${SITE_CONFIG.url}/guides/${guide.slug}`;
  const isPublished = isIndexable(guide.status);

  const breadcrumbs = [
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Guides", url: `${SITE_CONFIG.url}/guides` },
    { name: guide.title, url: canonicalUrl },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const webPageSchema = generateWebPageSchema({
    title: `${guide.title} | DIXITH Guides`,
    description: guide.summary || guide.title,
    url: canonicalUrl,
  });

  const guideSchema = isPublished
    ? generateGuideSchema({
        title: guide.title,
        description: guide.summary || guide.title,
        slug: guide.slug,
        datePublished: guide.publishedAt,
        dateModified: guide.updatedAt,
        category: guide.category,
      })
    : null;

  // Resolve related research via explicit research references
  const relatedResearch = (guide.relatedResearchIds || [])
    .map((id) => getResearchById(id))
    .filter(Boolean);

  // Resolve related articles if present
  const relatedArticles = (guide.relatedArticleIds || [])
    .map((id) => getArticleById(id))
    .filter(Boolean);

  // Resolve sources if present
  const sources = (guide.sourceIds || [])
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
      {guideSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(guideSchema) }}
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
                href="/guides"
                className="hover:text-brand-text-primary transition-colors focus-visible:outline-brand-accent"
              >
                Guides
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
            </li>
            <li
              aria-current="page"
              className="text-brand-accent font-semibold truncate max-w-[240px] sm:max-w-none"
            >
              {guide.title}
            </li>
          </ol>
        </nav>

        {/* Back Link */}
        <div className="mb-[40px]">
          <Link
            href="/guides"
            className="inline-flex items-center space-x-2 font-mono text-[12px] text-brand-text-muted hover:text-brand-accent transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Guides</span>
          </Link>
        </div>

        {/* Header */}
        <header className="max-w-[840px] mb-[48px]">
          <div className="flex flex-wrap items-center gap-3 mb-[20px]">
            <Badge variant="outline" size="sm">
              {guide.category}
            </Badge>

            {guide.difficultyLevel && (
              <span className="font-mono text-[10px] tracking-wider text-brand-accent border border-brand-accent/30 bg-brand-accent/10 px-[8px] py-[2px] rounded uppercase font-medium">
                {guide.difficultyLevel}
              </span>
            )}

            {!isPublished && (
              <span className="font-mono text-[10px] tracking-wider text-brand-text-muted border border-brand-border/80 bg-brand-surface/80 px-[8px] py-[2px] rounded uppercase">
                {guide.status.replace("_", " ")}
              </span>
            )}

            <span className="flex items-center space-x-1.5 font-mono text-[12px] text-brand-text-muted">
              <Clock className="w-3.5 h-3.5 text-brand-border" />
              <span>{guide.readTime || guide.readingTime}</span>
            </span>
          </div>

          <h1 className="font-display text-[32px] sm:text-[44px] md:text-[50px] font-bold text-brand-text-primary tracking-tight leading-[1.15] mb-[24px]">
            {guide.title}
          </h1>

          <p className="text-[17px] sm:text-[19px] text-brand-text-secondary leading-relaxed font-sans font-light">
            {guide.summary}
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
              {guide.publishedAt ? (
                <span>Published: {guide.publishedAt}</span>
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
          {guide.topics && guide.topics.length > 0 && (
            <section aria-label="Guide Topics" className="mb-[40px]">
              <div className="flex flex-wrap gap-2">
                {guide.topics.map((topicToken) => {
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

          {/* Target Systems Grid */}
          {guide.targetSystems && guide.targetSystems.length > 0 && (
            <section aria-label="Target Systems" className="mb-[48px]">
              <div className="p-[24px] rounded-lg border border-brand-border bg-brand-surface/30">
                <div className="flex items-center space-x-2 text-brand-accent mb-[14px]">
                  <Cpu className="w-4 h-4" />
                  <span className="font-mono text-[12px] uppercase tracking-wider font-medium">
                    Evaluated AI Search Systems
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {guide.targetSystems.map((system) => (
                    <div
                      key={system}
                      className="font-mono text-[12px] text-brand-text-secondary bg-brand-surface/60 border border-brand-border/60 rounded px-3 py-2"
                    >
                      {system}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Prerequisites */}
          {guide.prerequisites && guide.prerequisites.length > 0 && (
            <section aria-label="Prerequisites" className="mb-[48px]">
              <div className="p-[24px] rounded-lg border border-brand-border bg-brand-surface/20">
                <div className="flex items-center space-x-2 text-brand-accent mb-[14px]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-mono text-[12px] uppercase tracking-wider font-medium">
                    Technical Prerequisites
                  </span>
                </div>
                <ul className="space-y-2">
                  {guide.prerequisites.map((prereq, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-2 text-[14px] text-brand-text-secondary font-sans"
                    >
                      <span className="text-brand-accent font-mono text-[12px] mt-0.5">•</span>
                      <span>{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Implementation Steps */}
          {guide.steps && guide.steps.length > 0 && (
            <section aria-labelledby="steps-heading" className="mb-[64px]">
              <div className="flex items-center space-x-2.5 mb-[24px]">
                <ListOrdered className="w-4 h-4 text-brand-accent" />
                <h2
                  id="steps-heading"
                  className="font-mono text-[13px] tracking-wider text-brand-accent uppercase font-medium"
                >
                  IMPLEMENTATION FRAMEWORK
                </h2>
              </div>

              <div className="space-y-[20px]">
                {guide.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-[28px] rounded-lg border border-brand-border bg-brand-surface/30"
                  >
                    <div className="flex items-center space-x-3 mb-[12px]">
                      <span className="w-7 h-7 rounded-full bg-brand-accent/15 border border-brand-accent/30 font-mono text-[12px] font-bold text-brand-accent flex items-center justify-center">
                        {step.stepNumber}
                      </span>
                      <h3 className="font-display text-[18px] font-bold text-brand-text-primary">
                        {step.title}
                      </h3>
                    </div>

                    <p className="text-[14px] text-brand-text-secondary leading-relaxed font-sans pl-[40px]">
                      {step.description}
                    </p>

                    {step.codeSnippet && (
                      <div className="mt-[16px] ml-[40px] rounded bg-brand-bg border border-brand-border p-4 font-mono text-[12px] text-brand-text-secondary overflow-x-auto">
                        <pre>
                          <code>{step.codeSnippet.code}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Guide Body or Editorial Status Notice */}
          <section className="mb-[64px] border border-brand-border rounded-lg bg-brand-surface/30 p-[32px] sm:p-[40px]">
            <div className="flex items-center space-x-2.5 mb-[20px]">
              <Compass className="w-4 h-4 text-brand-accent" />
              <h2 className="font-mono text-[13px] tracking-wider text-brand-accent uppercase font-medium">
                ARCHITECTURE & OPERATIONAL NOTES
              </h2>
            </div>

            <p className="text-[16px] text-brand-text-primary leading-relaxed mb-[24px]">
              {guide.summary}
            </p>

            {guide.body ? (
              <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-brand-text-secondary whitespace-pre-line">
                {guide.body}
              </div>
            ) : (
              <div className="rounded border border-brand-border/60 bg-brand-surface/60 p-[20px] font-mono text-[12px] text-brand-text-muted leading-relaxed">
                <div className="flex items-center space-x-2 text-brand-accent mb-[8px]">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-semibold uppercase tracking-wider">
                    Evergreen Resource Notice
                  </span>
                </div>
                This technical guide represents an evergreen implementation specification in active testing. Architectural code patterns, step verification matrices, and live test cases are undergoing replication before public indexing.
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

          {/* Related Articles Section */}
          {relatedArticles.length > 0 && (
            <section aria-labelledby="related-articles-heading" className="mb-[64px]">
              <div className="flex items-center space-x-2.5 mb-[24px]">
                <FileText className="w-4 h-4 text-brand-accent" />
                <h2
                  id="related-articles-heading"
                  className="font-mono text-[13px] tracking-wider text-brand-accent uppercase font-medium"
                >
                  SUPPORTING STRATEGIC ARTICLES
                </h2>
              </div>

              <div className="space-y-[16px]">
                {relatedArticles.map((art) => {
                  if (!art) return null;
                  return (
                    <Link
                      key={art.id}
                      href={`/articles/${art.slug}`}
                      className="block p-[24px] rounded-lg border border-brand-border bg-brand-surface/40 hover:border-brand-accent/50 hover:bg-brand-surface transition-all group"
                    >
                      <div className="flex items-center justify-between mb-[10px]">
                        <span className="font-mono text-[11px] text-brand-accent font-medium">
                          {art.id} · {art.category}
                        </span>
                        <span className="font-mono text-[10px] text-brand-text-muted border border-brand-border px-[6px] py-[1.5px] rounded uppercase">
                          {art.status.replace("_", " ")}
                        </span>
                      </div>

                      <h3 className="font-display text-[18px] font-bold text-brand-text-primary group-hover:text-brand-accent-hover transition-colors mb-[8px]">
                        {art.title}
                      </h3>

                      <p className="text-[13px] text-brand-text-secondary leading-relaxed font-sans mb-[16px]">
                        {art.summary}
                      </p>

                      <div className="flex items-center space-x-1.5 font-mono text-[12px] text-brand-accent group-hover:translate-x-0.5 transition-transform">
                        <span>Read Strategic Article</span>
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
              <span>DIXITH Implementation Architecture · Evergreen Resources</span>
            </div>
            <div>
              <Link
                href="/guides"
                className="text-brand-accent hover:text-brand-accent-hover transition-colors"
              >
                ← Back to All Guides
              </Link>
            </div>
          </footer>
        </main>
      </Container>
    </article>
  );
}
