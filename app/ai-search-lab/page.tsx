import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/site-config";
import { getAllExperiments } from "@/data/experiments";
import { generateBreadcrumbSchema } from "@/lib/schema";
import {
  ArrowRight,
  ChevronRight,
  Cpu,
  FlaskConical,
  Layers,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "AI Search Lab",
  description:
    "An experimentation environment for studying how modern search and AI answer systems retrieve, interpret, cite and recommend information.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/ai-search-lab`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_CONFIG.url}/ai-search-lab`,
    title: "AI Search Lab | DIXITH",
    description:
      "An experimentation environment for studying how modern search and AI answer systems retrieve, interpret, cite and recommend information.",
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Search Lab | DIXITH",
    description:
      "An experimentation environment for studying how modern search and AI answer systems retrieve, interpret, cite and recommend information.",
  },
};

export default function AISearchLabPage() {
  const experiments = getAllExperiments();

  const breadcrumbs = [
    { name: "Home", url: SITE_CONFIG.url },
    { name: "AI Search Lab", url: `${SITE_CONFIG.url}/ai-search-lab` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const labWebPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_CONFIG.url}/ai-search-lab/#webpage`,
    url: `${SITE_CONFIG.url}/ai-search-lab`,
    name: "AI Search Lab | DIXITH",
    description:
      "An experimentation environment for studying how modern search and AI answer systems retrieve, interpret, cite and recommend information.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(labWebPageSchema) }}
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
              AI Search Lab
            </li>
          </ol>
        </nav>

        {/* Console Header */}
        <header className="pb-[48px] border-b border-brand-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px] mb-[20px]">
            <div className="inline-flex items-center gap-[8px] font-mono text-[11px] tracking-[0.2em] text-brand-accent uppercase font-medium">
              <FlaskConical className="w-4 h-4 text-brand-accent" />
              LIVE EXPERIMENTATION ENVIRONMENT
            </div>
            <div className="inline-flex items-center gap-[8px]">
              <span className="w-[8px] h-[8px] rounded-full bg-brand-success animate-ping" />
              <span className="font-mono text-[12px] text-brand-success font-semibold uppercase tracking-wider">
                ● ACTIVE BENCHMARKS
              </span>
            </div>
          </div>

          <h1 className="font-display text-[38px] sm:text-[50px] md:text-[60px] font-bold text-brand-text-primary tracking-tight leading-[1.08] mb-[20px]">
            AI SEARCH LAB
          </h1>

          <p className="text-[17px] sm:text-[19px] text-brand-text-secondary leading-relaxed max-w-3xl font-sans mb-[28px]">
            An experimentation environment for studying how modern search and AI
            answer systems retrieve, interpret, cite and recommend information.
          </p>

          {/* Operational Scope & Architecture Distinction */}
          <div className="p-[20px] bg-brand-surface/50 border border-brand-border rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-[12px] font-mono text-[12px] text-brand-text-muted">
            <div>
              <span className="text-brand-accent font-semibold">DISTINCTION: </span>
              <span>RESEARCH = Documented findings · </span>
              <strong className="text-brand-text-primary font-medium">
                AI SEARCH LAB = Live test matrices &amp; query protocols
              </strong>
            </div>
            <span className="text-brand-text-secondary whitespace-nowrap">
              6 BENCHMARK ENGINES
            </span>
          </div>
        </header>

        {/* Experiment Archive Section */}
        <div className="mt-[48px] space-y-[32px]">
          <div className="flex items-center justify-between text-[12px] font-mono text-brand-text-muted">
            <span>ACTIVE PROTOCOLS ({experiments.length})</span>
            <span>STANDARDIZED QUERY VECTORS</span>
          </div>

          <div className="space-y-[24px]">
            {experiments.map((exp) => (
              <article
                key={exp.id}
                className="p-[32px] sm:p-[40px] bg-brand-surface border border-brand-border hover:border-brand-accent/60 rounded-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] pb-[20px] border-b border-brand-border-subtle">
                  <div className="flex flex-wrap items-center gap-[12px]">
                    <Badge variant="active" size="md">
                      {exp.id}
                    </Badge>
                    {exp.category && (
                      <span className="font-mono text-[11px] text-brand-accent tracking-wider uppercase">
                        {exp.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <span className="w-[8px] h-[8px] rounded-full bg-brand-success" />
                    <span className="font-mono text-[12px] text-brand-success font-semibold tracking-wider uppercase">
                      STATUS: {exp.status}
                    </span>
                  </div>
                </div>

                <div className="my-[24px]">
                  <h2 className="font-display text-[26px] sm:text-[32px] font-bold text-brand-text-primary tracking-tight mb-[12px]">
                    <Link
                      href={`/ai-search-lab/${exp.slug}`}
                      className="hover:text-brand-accent-hover transition-colors focus-visible:outline-brand-accent flex items-start justify-between gap-[16px]"
                    >
                      <span>{exp.title}</span>
                      <ArrowRight className="w-5 h-5 text-brand-text-muted group-hover:text-brand-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </Link>
                  </h2>
                  <p className="text-[15px] sm:text-[16px] text-brand-text-secondary leading-relaxed font-sans max-w-4xl">
                    {exp.summary || exp.purpose}
                  </p>
                </div>

                {/* Benchmark Systems Tested */}
                <div className="pt-[20px] border-t border-brand-border-subtle">
                  <div className="font-mono text-[11px] uppercase tracking-widest text-brand-text-muted mb-[12px]">
                    Evaluated AI Engines:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-[10px]">
                    {exp.systemsTested.map((sys) => (
                      <div
                        key={sys}
                        className="bg-brand-bg border border-brand-border/70 px-[12px] py-[8px] rounded-sm font-mono text-[11px] text-brand-text-primary text-center"
                      >
                        {sys}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-[28px] pt-[20px] border-t border-brand-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-[16px]">
                  <span className="font-mono text-[12px] text-brand-text-muted">
                    Investigator: Dixith Kumar · AI Search Strategist
                  </span>
                  <Link
                    href={`/ai-search-lab/${exp.slug}`}
                    className="inline-flex items-center gap-[8px] font-mono text-[12px] text-brand-accent hover:text-brand-accent-hover font-semibold uppercase tracking-wider focus-visible:outline-brand-accent"
                  >
                    <span>View {exp.id} Protocol &amp; Benchmark Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Future State / Controlled Archive Notice */}
        <section
          aria-label="Future Experiments Protocol"
          className="mt-[64px] p-[28px] sm:p-[36px] bg-brand-surface/40 border border-brand-border rounded-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[20px]">
            <div>
              <div className="font-mono text-[11px] text-brand-accent uppercase tracking-widest font-semibold mb-[6px]">
                EXPERIMENTATION PIPELINE
              </div>
              <p className="text-[14px] text-brand-text-secondary leading-relaxed font-sans max-w-3xl">
                Additional experiments are being documented as the research program develops.
                Testing protocols follow rigorous query vector design, parameter isolation,
                and cross-engine replication before public archival.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/research"
                className="inline-flex items-center gap-[8px] font-mono text-[12px] text-brand-accent hover:text-brand-accent-hover tracking-wider uppercase font-semibold"
              >
                <span>View Research Archive</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
