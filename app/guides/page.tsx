import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/site-config";
import { getPublishedGuides } from "@/data/guides";
import { generateBreadcrumbSchema } from "@/lib/schema";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Compass,
  FileText,
  FlaskConical,
  Layers,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Implementation Guides & Frameworks",
  description:
    "Evergreen technical guides, architectural blueprints, and practical implementation frameworks for modern search discoverability, structured data, and AI retrieval.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/guides`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_CONFIG.url}/guides`,
    title: "Implementation Guides & Frameworks | DIXITH",
    description:
      "Evergreen technical guides, architectural blueprints, and practical implementation frameworks for modern search discoverability, structured data, and AI retrieval.",
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Implementation Guides & Frameworks | DIXITH",
    description:
      "Evergreen technical guides, architectural blueprints, and practical implementation frameworks for modern search discoverability, structured data, and AI retrieval.",
  },
};

export default function GuidesArchivePage() {
  const publishedGuides = getPublishedGuides();

  const breadcrumbs = [
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Guides", url: `${SITE_CONFIG.url}/guides` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const archiveWebPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_CONFIG.url}/guides/#webpage`,
    url: `${SITE_CONFIG.url}/guides`,
    name: "Implementation Guides & Frameworks | DIXITH",
    description:
      "Evergreen technical guides, architectural blueprints, and practical implementation frameworks for modern search discoverability, structured data, and AI retrieval.",
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
              Guides
            </li>
          </ol>
        </nav>

        {/* Evergreen Guides Archive Header */}
        <header className="max-w-[800px] mb-[64px]">
          <div className="flex items-center space-x-2.5 mb-[16px]">
            <span className="w-2 h-2 rounded-full bg-brand-accent" />
            <span className="font-mono text-[12px] tracking-[0.18em] text-brand-accent uppercase font-medium">
              EVERGREEN IMPLEMENTATION FRAMEWORKS
            </span>
          </div>

          <h1 className="font-display text-[36px] sm:text-[48px] md:text-[54px] font-bold text-brand-text-primary tracking-tight leading-[1.1] mb-[24px]">
            Guides
          </h1>

          <p className="text-[17px] sm:text-[19px] text-brand-text-secondary leading-relaxed font-sans font-light">
            Comprehensive technical resources, architectural checklists, and procedural frameworks designed to implement durable discoverability, structured data layers, and clean retrieval pipelines.
          </p>
        </header>

        {/* Published Guides List or Graceful In-Development Notice */}
        {publishedGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {publishedGuides.map((guide) => (
              <article
                key={guide.id}
                aria-labelledby={`guide-title-${guide.id}`}
                className="group bg-brand-surface/40 border border-brand-border hover:border-brand-accent/50 rounded-lg p-[32px] flex flex-col justify-between transition-all duration-300 hover:bg-brand-surface"
              >
                <div>
                  <div className="flex items-center justify-between mb-[20px]">
                    <Badge variant="outline" size="sm">
                      {guide.category}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {guide.difficultyLevel && (
                        <span className="font-mono text-[10px] text-brand-text-muted border border-brand-border/60 px-[6px] py-[1.5px] rounded uppercase">
                          {guide.difficultyLevel}
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-brand-text-muted">
                        {guide.readTime || guide.readingTime}
                      </span>
                    </div>
                  </div>

                  <h2
                    id={`guide-title-${guide.id}`}
                    className="font-display text-[22px] font-bold text-brand-text-primary tracking-tight leading-snug group-hover:text-brand-accent-hover transition-colors mb-[14px]"
                  >
                    <Link
                      href={`/guides/${guide.slug}`}
                      className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded-sm"
                    >
                      {guide.title}
                    </Link>
                  </h2>

                  <p className="text-[14px] text-brand-text-secondary leading-relaxed font-sans mb-[24px]">
                    {guide.summary}
                  </p>
                </div>

                <div className="pt-[20px] border-t border-brand-border-subtle flex items-center justify-between font-mono text-[12px] text-brand-text-muted">
                  <span className="text-brand-text-muted">
                    {guide.publishedAt || "Verified Guide"}
                  </span>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="flex items-center space-x-1.5 text-brand-accent group-hover:text-brand-accent-hover font-medium transition-colors"
                  >
                    <span>View Guide</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-brand-border rounded-lg bg-brand-surface/20 p-[40px] md:p-[56px] text-center max-w-[860px] mx-auto">
            <div className="w-12 h-12 rounded-full bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center mx-auto mb-[20px]">
              <Compass className="w-5 h-5 text-brand-accent" />
            </div>

            <div className="inline-flex items-center gap-2 px-[10px] py-[3px] rounded-full bg-brand-surface border border-brand-border font-mono text-[11px] text-brand-text-muted mb-[16px] uppercase tracking-wider">
              <span>Knowledge Frameworks</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
              <span>In Development</span>
            </div>

            <h2 className="font-display text-[24px] md:text-[28px] font-bold text-brand-text-primary mb-[14px]">
              Evergreen Guides in Preparation
            </h2>

            <p className="text-[15px] text-brand-text-secondary leading-relaxed max-w-[620px] mx-auto mb-[32px] font-sans">
              Technical implementation guides detailing Schema.org entity graph modeling, AI crawler access rules, and generative retrieval hygiene are currently undergoing architectural validation.
            </p>

            <div className="pt-[24px] border-t border-brand-border-subtle grid grid-cols-1 sm:grid-cols-4 gap-[16px] text-left">
              <Link
                href="/research"
                className="p-[16px] rounded border border-brand-border/60 hover:border-brand-accent/40 bg-brand-surface/30 transition-all group"
              >
                <div className="flex items-center justify-between text-brand-accent mb-[8px]">
                  <BookOpen className="w-4 h-4" />
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-display text-[14px] font-bold text-brand-text-primary mb-[2px]">
                  Research
                </div>
                <div className="text-[11px] text-brand-text-muted">
                  Empirical protocols
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
                <div className="font-display text-[14px] font-bold text-brand-text-primary mb-[2px]">
                  AI Search Lab
                </div>
                <div className="text-[11px] text-brand-text-muted">
                  Benchmark tests
                </div>
              </Link>

              <Link
                href="/articles"
                className="p-[16px] rounded border border-brand-border/60 hover:border-brand-accent/40 bg-brand-surface/30 transition-all group"
              >
                <div className="flex items-center justify-between text-brand-accent mb-[8px]">
                  <FileText className="w-4 h-4" />
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="font-display text-[14px] font-bold text-brand-text-primary mb-[2px]">
                  Articles
                </div>
                <div className="text-[11px] text-brand-text-muted">
                  Strategic analysis
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
                <div className="font-display text-[14px] font-bold text-brand-text-primary mb-[2px]">
                  Experience
                </div>
                <div className="text-[11px] text-brand-text-muted">
                  Technical systems
                </div>
              </Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
