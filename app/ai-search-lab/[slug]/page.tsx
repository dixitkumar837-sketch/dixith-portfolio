import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/site-config";
import { getAllExperiments, getExperimentBySlug } from "@/data/experiments";
import { getResearchBySlug } from "@/data/research";
import { getSourceById } from "@/data/sources";
import { SystemMatrix } from "@/components/search-lab/SystemMatrix";
import {
  generateBreadcrumbSchema,
  generateTechArticleSchema,
  generateWebPageSchema,
} from "@/lib/schema";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Database,
  ExternalLink,
  FileCode,
  FlaskConical,
  HelpCircle,
  Layers,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface ExperimentPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  const experiments = getAllExperiments();
  return experiments.map((exp) => ({
    slug: exp.slug,
  }));
}

export function generateMetadata({ params }: ExperimentPageProps): Metadata {
  const exp = getExperimentBySlug(params.slug);

  if (!exp) {
    return {
      title: "Experiment Not Found",
    };
  }

  const canonicalUrl = `${SITE_CONFIG.url}/ai-search-lab/${exp.slug}`;
  const isPublished = exp.status === "PUBLISHED";

  return {
    title: `${exp.title} — AI Search Lab Protocol`,
    description: exp.summary || exp.purpose,
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
      title: `${exp.title} — AI Search Lab Protocol`,
      description: exp.summary || exp.purpose,
      siteName: SITE_CONFIG.name,
      authors: [exp.author || SITE_CONFIG.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: `${exp.title} — AI Search Lab Protocol`,
      description: exp.summary || exp.purpose,
    },
  };
}

export default function ExperimentDetailPage({ params }: ExperimentPageProps) {
  const exp = getExperimentBySlug(params.slug);

  if (!exp) {
    notFound();
  }

  const canonicalUrl = `${SITE_CONFIG.url}/ai-search-lab/${exp.slug}`;

  const breadcrumbs = [
    { name: "Home", url: SITE_CONFIG.url },
    { name: "AI Search Lab", url: `${SITE_CONFIG.url}/ai-search-lab` },
    { name: exp.title, url: canonicalUrl },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const webPageSchema = generateWebPageSchema({
    title: `${exp.id}: ${exp.title} — AI Search Lab Protocol | DIXITH`,
    description: exp.summary || exp.purpose,
    url: canonicalUrl,
  });

  const experimentSchema = generateTechArticleSchema({
    title: `${exp.id}: ${exp.title}`,
    description: exp.summary || exp.purpose,
    slug: exp.slug,
    basePath: "ai-search-lab",
    category: exp.category || "AI Search Lab Experiment",
  });

  // Resolve verified citation sources
  const sources = (exp.sourceIds || [])
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(experimentSchema) }}
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
                href="/ai-search-lab"
                className="hover:text-brand-text-primary transition-colors focus-visible:outline-brand-accent"
              >
                AI Search Lab
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
            </li>
            <li
              aria-current="page"
              className="text-brand-accent font-semibold truncate max-w-[280px] sm:max-w-md"
            >
              {exp.title}
            </li>
          </ol>
        </nav>

        {/* Experiment Protocol Header */}
        <header className="pb-[40px] border-b border-brand-border/60">
          <div className="flex flex-wrap items-center gap-[12px] mb-[20px]">
            <Badge variant="active" size="md">
              {exp.id}
            </Badge>
            {exp.category && (
              <span className="font-mono text-[12px] text-brand-accent font-semibold tracking-wider uppercase">
                {exp.category}
              </span>
            )}
            <span className="text-brand-border">•</span>
            <div className="inline-flex items-center gap-[6px]">
              <span className="w-[8px] h-[8px] rounded-full bg-brand-success" />
              <span className="font-mono text-[12px] text-brand-success font-semibold tracking-wider uppercase">
                STATUS: {exp.status}
              </span>
            </div>
          </div>

          <h1 className="font-display text-[32px] sm:text-[44px] md:text-[54px] font-bold text-brand-text-primary tracking-tight leading-[1.12] mb-[24px]">
            {exp.title}
          </h1>

          {/* Abstract / Scope Summary */}
          <div className="p-[24px] sm:p-[28px] bg-brand-surface border border-brand-border rounded-lg mb-[28px]">
            <div className="font-mono text-[11px] text-brand-accent uppercase tracking-widest font-semibold mb-[8px]">
              EXPERIMENT SCOPE &amp; OBJECTIVE
            </div>
            <p className="text-[16px] sm:text-[18px] text-brand-text-secondary leading-relaxed font-sans">
              {exp.summary || exp.purpose}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center justify-between gap-[16px] font-mono text-[12px] text-brand-text-muted pt-[8px]">
            <div className="flex items-center gap-[12px]">
              <span>
                Investigator:{" "}
                <strong className="text-brand-text-primary font-medium">
                  {exp.author || SITE_CONFIG.author.name}
                </strong>
              </span>
              <span className="text-brand-border">•</span>
              <span className="text-brand-accent">AI Search Strategist</span>
            </div>
            <div className="flex items-center gap-[6px]">
              <FlaskConical className="w-4 h-4 text-brand-accent" />
              <span>Multi-Engine Protocol Matrix</span>
            </div>
          </div>
        </header>

        {/* Experiment Content Body (Semantic AEO Layout) */}
        <div className="mt-[48px] max-w-4xl space-y-[48px]">
          {/* 1. What is this experiment testing? */}
          {exp.objective && (
            <section aria-labelledby="heading-objective">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <Sparkles className="w-5 h-5 text-brand-accent" />
                <h2
                  id="heading-objective"
                  className="font-display text-[22px] sm:text-[26px] font-bold text-brand-text-primary tracking-tight"
                >
                  What is this experiment testing?
                </h2>
              </div>
              <div className="p-[20px] bg-brand-bg-secondary/40 border border-brand-border/60 rounded-md">
                <p className="text-[16px] text-brand-text-primary leading-relaxed font-sans">
                  {exp.objective}
                </p>
              </div>
            </section>
          )}

          {/* 2. What question is being asked? */}
          {exp.researchQuestion && (
            <section aria-labelledby="heading-question">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <HelpCircle className="w-5 h-5 text-brand-accent" />
                <h2
                  id="heading-question"
                  className="font-display text-[22px] sm:text-[26px] font-bold text-brand-text-primary tracking-tight"
                >
                  What question is being asked?
                </h2>
              </div>
              <div className="p-[20px] bg-brand-surface/60 border border-brand-border rounded-md font-sans">
                <p className="text-[16px] text-brand-text-secondary leading-relaxed">
                  {exp.researchQuestion}
                </p>
              </div>
            </section>
          )}

          {/* 3. Which systems are being evaluated? (System Matrix Component) */}
          <section aria-labelledby="heading-systems">
            <h2
              id="heading-systems"
              className="font-display text-[22px] sm:text-[26px] font-bold text-brand-text-primary tracking-tight mb-[16px]"
            >
              Which systems are being evaluated?
            </h2>
            <SystemMatrix
              systems={exp.systems || exp.systemsTested}
              title="BENCHMARK PLATFORMS"
              description="Standardized query vectors are executed in parallel across all six major generative answer engines under isolated, non-personalized session conditions."
            />
          </section>

          {/* 4. What query vectors are used? */}
          {exp.query && (
            <section aria-labelledby="heading-query">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <Search className="w-5 h-5 text-brand-accent" />
                <h2
                  id="heading-query"
                  className="font-display text-[22px] sm:text-[26px] font-bold text-brand-text-primary tracking-tight"
                >
                  What query vectors are evaluated?
                </h2>
              </div>
              <div className="p-[20px] bg-brand-surface/60 border border-brand-border rounded-md font-sans">
                <p className="text-[15px] text-brand-text-secondary leading-relaxed mb-[16px]">
                  {exp.query}
                </p>
                {exp.variables && exp.variables.length > 0 && (
                  <div className="pt-[16px] border-t border-brand-border-subtle">
                    <div className="font-mono text-[11px] text-brand-text-muted uppercase tracking-wider mb-[8px]">
                      Controlled Vector Parameters:
                    </div>
                    <ul className="space-y-[6px]">
                      {exp.variables.map((variable, idx) => (
                        <li
                          key={idx}
                          className="font-mono text-[12px] text-brand-text-secondary flex items-center gap-[8px]"
                        >
                          <span className="w-[4px] h-[4px] rounded-full bg-brand-accent" />
                          <span>{variable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 5. How is the experiment conducted? */}
          {exp.methodology && (
            <section aria-labelledby="heading-methodology">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <Layers className="w-5 h-5 text-brand-accent" />
                <h2
                  id="heading-methodology"
                  className="font-display text-[22px] sm:text-[26px] font-bold text-brand-text-primary tracking-tight"
                >
                  How is the experiment conducted?
                </h2>
              </div>
              <div className="p-[20px] bg-brand-surface/60 border border-brand-border rounded-md font-sans">
                <p className="text-[15px] text-brand-text-secondary leading-relaxed">
                  {exp.methodology}
                </p>
              </div>
            </section>
          )}

          {/* 6. What evidence is being collected? */}
          {exp.evidence && exp.evidence.length > 0 && (
            <section aria-labelledby="heading-evidence">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <Database className="w-5 h-5 text-brand-accent" />
                <h2
                  id="heading-evidence"
                  className="font-display text-[22px] sm:text-[26px] font-bold text-brand-text-primary tracking-tight"
                >
                  What evidence is being collected?
                </h2>
              </div>
              <ul className="space-y-[10px] pl-[6px]">
                {exp.evidence.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-[10px] text-[15px] text-brand-text-secondary leading-relaxed font-sans"
                  >
                    <span className="font-mono text-brand-accent text-[12px] mt-[2px]">
                      0{idx + 1}.
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 7. What has been observed? */}
          {exp.observations && exp.observations.length > 0 && (
            <section aria-labelledby="heading-observations">
              <div className="flex items-center gap-[8px] mb-[12px]">
                <FileCode className="w-5 h-5 text-brand-accent" />
                <h2
                  id="heading-observations"
                  className="font-display text-[22px] sm:text-[26px] font-bold text-brand-text-primary tracking-tight"
                >
                  What has been observed?
                </h2>
              </div>
              <div className="p-[20px] bg-brand-surface/60 border border-brand-border rounded-md space-y-[12px]">
                {exp.observations.map((obs, idx) => (
                  <div key={idx} className="flex items-start gap-[10px]">
                    <span className="font-mono text-brand-success text-[12px] mt-[2px]">
                      ●
                    </span>
                    <p className="text-[15px] text-brand-text-secondary leading-relaxed font-sans">
                      {obs}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 8. What are the limitations? */}
          {exp.limitations && exp.limitations.length > 0 && (
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
                {exp.limitations.map((limitation, idx) => (
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

          {/* 9. Related Research Links */}
          {exp.relatedResearch && exp.relatedResearch.length > 0 && (
            <section aria-labelledby="heading-related-research" className="pt-[24px] border-t border-brand-border/60">
              <h2
                id="heading-related-research"
                className="font-display text-[20px] font-bold text-brand-text-primary tracking-tight mb-[16px]"
              >
                Related Research Documents
              </h2>
              <div className="space-y-[12px]">
                {exp.relatedResearch.map((slug) => {
                  const research = getResearchBySlug(slug);
                  if (!research) return null;

                  return (
                    <Link
                      key={slug}
                      href={`/research/${research.slug}`}
                      className="group p-[18px] bg-brand-surface border border-brand-border hover:border-brand-accent/50 rounded-lg transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono text-[11px] text-brand-accent tracking-wider font-semibold mb-[2px]">
                          RESEARCH ARCHIVE · {research.id}
                        </div>
                        <div className="text-[15px] text-brand-text-primary font-medium group-hover:text-brand-accent transition-colors">
                          {research.title}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-brand-text-muted group-hover:text-brand-accent group-hover:translate-x-1 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 10. Verified Citation Sources */}
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

        {/* Footer Navigation Back to Lab */}
        <footer className="mt-[64px] pt-[32px] border-t border-brand-border/60 flex items-center justify-between">
          <Link
            href="/ai-search-lab"
            className="inline-flex items-center gap-[8px] font-mono text-[13px] text-brand-accent hover:text-brand-accent-hover tracking-wider uppercase font-semibold focus-visible:outline-brand-accent"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to AI Search Lab</span>
          </Link>
          <span className="font-mono text-[12px] text-brand-text-muted">
            DIXITH · AI SEARCH LAB
          </span>
        </footer>
      </Container>
    </article>
  );
}
