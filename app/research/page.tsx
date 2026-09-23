import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/site-config";
import { getAllResearch } from "@/data/research";
import { generateBreadcrumbSchema } from "@/lib/schema";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  FlaskConical,
  Layers,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Research Archive",
  description:
    "Empirical research, conceptual frameworks, and systematic testing on information retrieval, RAG, knowledge graphs, and AI search discoverability.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/research`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_CONFIG.url}/research`,
    title: "Research Archive | DIXITH",
    description:
      "Empirical research, conceptual frameworks, and systematic testing on information retrieval, RAG, knowledge graphs, and AI search discoverability.",
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Research Archive | DIXITH",
    description:
      "Empirical research, conceptual frameworks, and systematic testing on information retrieval, RAG, knowledge graphs, and AI search discoverability.",
  },
};

export default function ResearchArchivePage() {
  const researchItems = getAllResearch();

  const breadcrumbs = [
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Research", url: `${SITE_CONFIG.url}/research` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const archiveWebPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_CONFIG.url}/research/#webpage`,
    url: `${SITE_CONFIG.url}/research`,
    name: "Research Archive | DIXITH",
    description:
      "Empirical research, conceptual frameworks, and systematic testing on information retrieval, RAG, knowledge graphs, and AI search discoverability.",
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
              Research
            </li>
          </ol>
        </nav>

        {/* Editorial Archive Header */}
        <header className="pb-[48px] border-b border-brand-border/60">
          <div className="inline-flex items-center gap-[8px] font-mono text-[11px] tracking-[0.2em] text-brand-accent uppercase font-medium mb-[16px]">
            <span className="w-[6px] h-[6px] rounded-full bg-brand-accent" />
            RESEARCH ARCHIVE · EMPIRICAL & SYSTEMIC
          </div>
          <h1 className="font-display text-[36px] sm:text-[48px] md:text-[56px] font-bold text-brand-text-primary tracking-tight leading-[1.08] mb-[20px]">
            INVESTIGATING SEARCH SYSTEMS &amp; RETRIEVAL DYNAMICS
          </h1>
          <p className="text-[17px] sm:text-[19px] text-brand-text-secondary leading-relaxed max-w-3xl font-sans">
            Independent research analyzing citation pathways, entity grounding, and
            discovery mechanisms across traditional search engines and AI generative models.
          </p>

          {/* Research Architecture Principles Bar */}
          <div className="mt-[32px] pt-[24px] border-t border-brand-border/40 grid grid-cols-1 sm:grid-cols-3 gap-[16px] font-mono text-[12px] text-brand-text-muted">
            <div className="flex items-center gap-[8px]">
              <Layers className="w-4 h-4 text-brand-accent" />
              <span>Multi-System Testing</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <FlaskConical className="w-4 h-4 text-brand-accent" />
              <span>Standardized Query Vectors</span>
            </div>
            <div className="flex items-center gap-[8px]">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              <span>Evidence Over Assumptions</span>
            </div>
          </div>
        </header>

        {/* Research Document Registry */}
        <div className="mt-[48px] space-y-[24px]">
          <div className="flex items-center justify-between text-[12px] font-mono text-brand-text-muted">
            <span>INDEXED PROTOCOLS ({researchItems.length})</span>
            <span>STATUS: ACTIVE RESEARCH PIPELINE</span>
          </div>

          <div className="divide-y divide-brand-border/60 border-y border-brand-border/60">
            {researchItems.map((item) => (
              <article
                key={item.id}
                className="py-[36px] group hover:bg-brand-surface/20 transition-colors px-[8px] sm:px-[16px] rounded-sm"
              >
                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-[12px] mb-[12px]">
                  <div className="flex flex-wrap items-center gap-[10px]">
                    <Badge variant="active" size="sm">
                      {item.id}
                    </Badge>
                    <span className="font-mono text-[11px] text-brand-accent tracking-wider uppercase">
                      {item.category}
                    </span>
                    <span className="text-brand-border">•</span>
                    <span className="font-mono text-[11px] text-brand-text-muted uppercase">
                      {item.researchArea}
                    </span>
                  </div>
                  <div className="flex items-center gap-[12px] font-mono text-[12px] text-brand-text-muted">
                    <span className="inline-flex items-center gap-[6px]">
                      <BookOpen className="w-3.5 h-3.5" />
                      {item.readingTime || item.readTime}
                    </span>
                    <span className="text-brand-border">•</span>
                    <Badge variant="outline" size="sm">
                      STATUS: {item.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <div className="mt-[12px]">
                  <h2 className="font-display text-[24px] sm:text-[28px] font-bold text-brand-text-primary tracking-tight leading-snug group-hover:text-brand-accent-hover transition-colors mb-[12px]">
                    <Link
                      href={`/research/${item.slug}`}
                      className="focus-visible:outline-brand-accent flex items-start justify-between gap-[16px]"
                    >
                      <span>{item.title}</span>
                      <ArrowRight className="w-5 h-5 text-brand-text-muted group-hover:text-brand-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </Link>
                  </h2>
                  <p className="text-[15px] sm:text-[16px] text-brand-text-secondary leading-relaxed font-sans max-w-4xl mb-[18px]">
                    {item.summary}
                  </p>
                </div>

                {/* Systems Tested & Topic Badges */}
                {item.systems && item.systems.length > 0 && (
                  <div className="flex flex-wrap items-center gap-[8px] pt-[8px]">
                    <span className="font-mono text-[11px] text-brand-text-muted uppercase tracking-wider mr-[4px]">
                      Target Systems:
                    </span>
                    {item.systems.map((system) => (
                      <span
                        key={system}
                        className="font-mono text-[11px] px-[8px] py-[2px] bg-brand-surface border border-brand-border-subtle rounded-sm text-brand-text-secondary"
                      >
                        {system}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Executive Archive Notice (Empty State / Protocol Notice) */}
        <section
          aria-label="Archive Protocol Notice"
          className="mt-[64px] p-[28px] sm:p-[36px] bg-brand-surface/40 border border-brand-border rounded-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px]">
            <div>
              <div className="font-mono text-[11px] text-brand-accent uppercase tracking-widest font-semibold mb-[6px]">
                EDITORIAL STANDARDS &amp; PUBLICATION PROTOCOL
              </div>
              <p className="text-[14px] text-brand-text-secondary leading-relaxed font-sans max-w-3xl">
                Research documents in the DIXITH archive progress through standardized query vector design,
                cross-engine execution, and peer verification. Empirical data and citation measurements
                are published strictly upon completion of the verification protocol without speculative claims.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/#search-lab"
                className="inline-flex items-center gap-[8px] font-mono text-[12px] text-brand-accent hover:text-brand-accent-hover tracking-wider uppercase font-semibold"
              >
                <span>Active Experiments in AI Search Lab</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </Container>
    </div>
  );
}
