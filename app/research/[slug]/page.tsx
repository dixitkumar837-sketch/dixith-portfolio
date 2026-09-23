import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/site-config";
import { getAllResearch, getResearchBySlug } from "@/data/research";
import { getExperimentById } from "@/data/experiments";
import { getSourceById } from "@/data/sources";
import {
  getGuidesForResearch,
  getArticlesForResearch,
} from "@/lib/content-utils";
import {
  generateBreadcrumbSchema,
  generateTechArticleSchema,
  generateWebPageSchema,
} from "@/lib/schema";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  Cpu,
  ExternalLink,
  FileText,
  FlaskConical,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";

interface ResearchPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  const allResearch = getAllResearch();
  return allResearch.map((item) => ({
    slug: item.slug,
  }));
}

export function generateMetadata({ params }: ResearchPageProps): Metadata {
  const item = getResearchBySlug(params.slug);

  if (!item) {
    return {
      title: "Research Not Found | DIXITH",
    };
  }

  const canonicalUrl = `${SITE_CONFIG.url}/research/${item.slug}`;

  // Draft / In-Review research is explicitly set to noindex to protect search indexes
  const isPublished = item.status === "PUBLISHED";

  return {
    title: `${item.title} — Research Protocol`,
    description: item.summary,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: isPublished,
      follow: true,
      googleBot: {
        index: isPublished,
        follow: true,
      },
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: `${item.title} | DIXITH Research`,
      description: item.summary,
      siteName: SITE_CONFIG.name,
      authors: [item.author],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.title} | DIXITH Research`,
      description: item.summary,
    },
  };
}

export default function ResearchDetailPage({ params }: ResearchPageProps) {
  const item = getResearchBySlug(params.slug);

  if (!item) {
    notFound();
  }

  const canonicalUrl = `${SITE_CONFIG.url}/research/${item.slug}`;

  const breadcrumbs = [
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Research", url: `${SITE_CONFIG.url}/research` },
    { name: item.title, url: canonicalUrl },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const webPageSchema = generateWebPageSchema({
    title: `${item.title} — Research Protocol | DIXITH`,
    description: item.summary || "",
    url: canonicalUrl,
  });

  const articleSchema = generateTechArticleSchema({
    title: item.title,
    description: item.summary || "",
    slug: item.slug,
    category: item.category,
    datePublished: item.publishedAt,
    dateModified: item.updatedAt,
  });

  // Resolve related cross-entity graph nodes
  const sources = (item.sourceIds || [])
    .map((srcId) => getSourceById(srcId))
    .filter(Boolean);

  const applyingGuides = getGuidesForResearch(item.id);
  const explainingArticles = getArticlesForResearch(item.id);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-[32px]">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-[12px] text-brand-text-muted">
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
                href="/research"
                className="hover:text-brand-text-primary transition-colors focus-visible:outline-brand-accent"
              >
                Research
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
            </li>
            <li
              aria-current="page"
              className="text-brand-accent font-semibold truncate max-w-[280px] sm:max-w-md"
            >
              {item.title}
            </li>
          </ol>
        </nav>

        {/* Document Header */}
        <header className="pb-[40px] border-b border-brand-border/60">
          <div className="flex flex-wrap items-center gap-[12px] mb-[20px]">
            <Badge variant="active" size="md">
              {item.id}
            </Badge>
            <span className="font-mono text-[12px] text-brand-accent font-semibold tracking-wider uppercase">
              {item.category}
            </span>
            <span className="text-brand-border">•</span>
            <span className="font-mono text-[12px] text-brand-text-muted uppercase">
              {item.researchArea}
            </span>
            <span className="text-brand-border">•</span>
            <Badge variant="outline" size="sm">
              STATUS: {item.status.replace("_", " ")}
            </Badge>
          </div>

          <h1 className="font-display text-[32px] sm:text-[44px] md:text-[52px] font-bold text-brand-text-primary tracking-tight leading-[1.12] mb-[24px]">
            {item.title}
          </h1>

          {/* Abstract / Executive Summary */}
          {item.summary && (
            <div className="p-[24px] sm:p-[28px] bg-brand-surface border border-brand-border rounded-lg mb-[28px]">
              <div className="font-mono text-[11px] text-brand-accent uppercase tracking-widest font-semibold mb-[8px]">
                ABSTRACT / EXECUTIVE SUMMARY
              </div>
              <p className="text-[16px] sm:text-[18px] text-brand-text-secondary leading-relaxed font-sans">
                {item.summary}
              </p>
            </div>
          )}

          {/* Author & Reading Time Bar */}
          <div className="flex flex-wrap items-center justify-between gap-[16px] font-mono text-[12px] text-brand-text-muted pt-[12px]">
            <div className="flex items-center gap-[12px]">
              <span>
                Investigator:{" "}
                <strong className="text-brand-text-primary font-medium">
                  {item.author}
                </strong>
              </span>
              <span className="text-brand-border">•</span>
              <span className="text-brand-accent">AI Search Strategist</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <BookOpen className="w-4 h-4" />
              <span>Protocol Duration / Read: {item.readingTime || item.readTime}</span>
            </div>
          </div>
        </header>

        {/* Document Body Sections (AEO & Semantic Hierarchy) */}
        <div className="mt-[48px] max-w-4xl space-y-[48px]">
          {/* 1. Research Question */}
          {item.question && (
            <section aria-labelledby="heading-question">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <HelpCircle className="w-5 h-5 text-brand-accent" />
                <h2
                  id="heading-question"
                  className="font-display text-[22px] sm:text-[26px] font-bold text-brand-text-primary tracking-tight"
                >
                  What is being investigated?
                </h2>
              </div>
              <div className="p-[20px] bg-brand-bg-secondary/40 border border-brand-border/60 rounded-md">
                <p className="text-[16px] text-brand-text-primary leading-relaxed font-sans">
                  {item.question}
                </p>
              </div>
            </section>
          )}

          {/* 2. Evaluated Search Systems */}
          {item.systems && item.systems.length > 0 && (
            <section aria-labelledby="heading-systems">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <Cpu className="w-5 h-5 text-brand-accent" />
                <h2
                  id="heading-systems"
                  className="font-display text-[22px] sm:text-[26px] font-bold text-brand-text-primary tracking-tight"
                >
                  What systems are evaluated?
                </h2>
              </div>
              <p className="text-[15px] text-brand-text-secondary leading-relaxed font-sans mb-[16px]">
                Standardized queries are executed simultaneously across six major generative
                retrieval and LLM discovery engines:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-[12px]">
                {item.systems.map((system) => (
                  <div
                    key={system}
                    className="p-[14px] bg-brand-surface border border-brand-border rounded-md flex items-center justify-between"
                  >
                    <span className="font-mono text-[13px] text-brand-text-primary font-medium">
                      {system}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-brand-success flex-shrink-0" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 3. Methodology */}
          {item.methodology && (
            <section aria-labelledby="heading-methodology">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <FlaskConical className="w-5 h-5 text-brand-accent" />
                <h2
                  id="heading-methodology"
                  className="font-display text-[22px] sm:text-[26px] font-bold text-brand-text-primary tracking-tight"
                >
                  How is it being studied?
                </h2>
              </div>
              <div className="p-[20px] bg-brand-surface/60 border border-brand-border rounded-md">
                <p className="text-[15px] text-brand-text-secondary leading-relaxed font-sans">
                  {item.methodology}
                </p>
              </div>
            </section>
          )}

          {/* 4. Observations / Current Status */}
          <section aria-labelledby="heading-status">
            <h2
              id="heading-status"
              className="font-display text-[22px] sm:text-[26px] font-bold text-brand-text-primary tracking-tight mb-[12px]"
            >
              What is observed?
            </h2>
            <div className="p-[20px] border border-brand-accent/30 bg-brand-accent/5 rounded-md font-sans">
              <div className="font-mono text-[12px] font-semibold text-brand-accent tracking-wider uppercase mb-[6px]">
                STATUS: {item.status.replace("_", " ")}
              </div>
              <p className="text-[15px] text-brand-text-secondary leading-relaxed">
                Empirical measurements and query vectors are actively being executed across
                standardized testing intervals. Verified datasets, citation distribution models,
                and comparative analyses are documented sequentially following replication testing.
                No unverified or simulated statistics are published.
              </p>
            </div>
          </section>

          {/* 5. Limitations */}
          {item.limitations && item.limitations.length > 0 && (
            <section aria-labelledby="heading-limitations">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <ShieldAlert className="w-5 h-5 text-brand-accent" />
                <h2
                  id="heading-limitations"
                  className="font-display text-[22px] sm:text-[26px] font-bold text-brand-text-primary tracking-tight"
                >
                  What are the limitations?
                </h2>
              </div>
              <ul className="space-y-[10px] pl-[6px]">
                {item.limitations.map((limitation, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-[10px] text-[14px] text-brand-text-secondary leading-relaxed font-sans"
                  >
                    <span className="font-mono text-brand-accent text-[12px] mt-[2px]">
                      0{idx + 1}.
                    </span>
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 6. Related AI Search Lab Experiments */}
          {item.relatedExperiments && item.relatedExperiments.length > 0 && (
            <section aria-labelledby="heading-experiments" className="pt-[24px] border-t border-brand-border/60">
              <h2
                id="heading-experiments"
                className="font-display text-[20px] font-bold text-brand-text-primary tracking-tight mb-[16px]"
              >
                Related AI Search Lab Experiments
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                {item.relatedExperiments.map((expId) => {
                  const exp = getExperimentById(expId);
                  const href = exp ? `/ai-search-lab/${exp.slug}` : "/ai-search-lab";
                  const title = exp ? exp.title : `Experiment ${expId}`;
                  return (
                    <Link
                      key={expId}
                      href={href}
                      className="group p-[18px] bg-brand-surface border border-brand-border hover:border-brand-accent/50 rounded-lg transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono text-[11px] text-brand-accent tracking-wider font-semibold mb-[2px]">
                          EXPERIMENT: {expId}
                        </div>
                        <div className="text-[14px] text-brand-text-primary font-medium group-hover:text-brand-accent transition-colors">
                          {title}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-brand-text-muted group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 7. Supporting Implementation Guides */}
          {applyingGuides.length > 0 && (
            <section aria-labelledby="heading-guides" className="pt-[24px] border-t border-brand-border/60">
              <div className="flex items-center gap-[8px] mb-[16px]">
                <Compass className="w-5 h-5 text-brand-accent" />
                <h2
                  id="heading-guides"
                  className="font-display text-[20px] font-bold text-brand-text-primary tracking-tight"
                >
                  Supporting Implementation Guides
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                {applyingGuides.map((guide) => (
                  <Link
                    key={guide.id}
                    href={`/guides/${guide.slug}`}
                    className="group p-[18px] bg-brand-surface border border-brand-border hover:border-brand-accent/50 rounded-lg transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono text-[11px] text-brand-accent tracking-wider font-semibold mb-[2px]">
                        GUIDE: {guide.id} · {guide.category}
                      </div>
                      <div className="text-[14px] text-brand-text-primary font-medium group-hover:text-brand-accent transition-colors">
                        {guide.title}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-brand-text-muted group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 8. Analytical Articles & Dispatches */}
          {explainingArticles.length > 0 && (
            <section aria-labelledby="heading-articles" className="pt-[24px] border-t border-brand-border/60">
              <div className="flex items-center gap-[8px] mb-[16px]">
                <FileText className="w-5 h-5 text-brand-accent" />
                <h2
                  id="heading-articles"
                  className="font-display text-[20px] font-bold text-brand-text-primary tracking-tight"
                >
                  Analytical Articles &amp; Dispatches
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
                {explainingArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/articles/${article.slug}`}
                    className="group p-[18px] bg-brand-surface border border-brand-border hover:border-brand-accent/50 rounded-lg transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono text-[11px] text-brand-accent tracking-wider font-semibold mb-[2px]">
                        ARTICLE: {article.id} · {article.category}
                      </div>
                      <div className="text-[14px] text-brand-text-primary font-medium group-hover:text-brand-accent transition-colors">
                        {article.title}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-brand-text-muted group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* 9. Verified Citation Sources */}
          {sources.length > 0 && (
            <section aria-labelledby="heading-sources" className="pt-[24px] border-t border-brand-border/60">
              <div className="flex items-center gap-[8px] mb-[16px]">
                <ExternalLink className="w-4 h-4 text-brand-accent" />
                <h2
                  id="heading-sources"
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
        </div>

        {/* Footer Navigation Back to Archive */}
        <footer className="mt-[64px] pt-[32px] border-t border-brand-border/60 flex items-center justify-between">
          <Link
            href="/research"
            className="inline-flex items-center gap-[8px] font-mono text-[13px] text-brand-accent hover:text-brand-accent-hover tracking-wider uppercase font-semibold focus-visible:outline-brand-accent"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Research Archive</span>
          </Link>
          <span className="font-mono text-[12px] text-brand-text-muted">
            DIXITH · AI SEARCH STRATEGIST
          </span>
        </footer>
      </Container>
    </article>
  );
}
