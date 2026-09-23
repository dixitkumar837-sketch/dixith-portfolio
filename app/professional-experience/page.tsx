import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/site-config";
import { getAllProfessionalExperiences } from "@/data/professional-experience";
import { generateBreadcrumbSchema } from "@/lib/schema";
import {
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Professional Experience",
  description:
    "Technical responsibilities, search architecture frameworks, and methodologies developed across professional employment in healthcare, enterprise, and e-commerce environments by Dixith Kumar.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/professional-experience`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_CONFIG.url}/professional-experience`,
    title: "Professional Experience | DIXITH",
    description:
      "Technical responsibilities, search architecture frameworks, and methodologies developed across professional employment in healthcare, enterprise, and e-commerce environments by Dixith Kumar.",
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Professional Experience | DIXITH",
    description:
      "Technical responsibilities, search architecture frameworks, and methodologies developed across professional employment in healthcare, enterprise, and e-commerce environments by Dixith Kumar.",
  },
};

export default function ProfessionalExperienceArchivePage() {
  const experiences = getAllProfessionalExperiences();

  const breadcrumbs = [
    { name: "Home", url: SITE_CONFIG.url },
    {
      name: "Professional Experience",
      url: `${SITE_CONFIG.url}/professional-experience`,
    },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const archiveWebPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_CONFIG.url}/professional-experience/#webpage`,
    url: `${SITE_CONFIG.url}/professional-experience`,
    name: "Professional Experience | DIXITH",
    description:
      "Technical responsibilities, search architecture frameworks, and methodologies developed across professional employment in healthcare, enterprise, and e-commerce environments by Dixith Kumar.",
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(archiveWebPageSchema),
        }}
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
              Professional Experience
            </li>
          </ol>
        </nav>

        {/* Editorial Archive Header */}
        <header className="mb-[64px] border-b border-brand-border pb-[48px]">
          <div className="flex items-center gap-2 mb-[16px]">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
            <span className="font-mono text-[11px] font-semibold tracking-wider text-brand-accent uppercase">
              PROFESSIONAL BACKGROUND &amp; FIELD EXPERTISE
            </span>
          </div>

          <h1 className="font-display text-[40px] md:text-[56px] font-bold text-brand-text-primary tracking-tight mb-[24px]">
            Professional Experience
          </h1>

          <p className="text-[18px] md:text-[20px] text-brand-text-secondary leading-relaxed max-w-3xl mb-[32px]">
            Technical responsibilities, architectural frameworks, and search
            methodologies developed through professional employment across
            enterprise, healthcare, and e-commerce digital ecosystems.
          </p>

          {/* Professional Scope & Disclosure Note */}
          <div className="bg-brand-surface border border-brand-border-subtle rounded-lg p-[20px] max-w-3xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
            <div className="text-[13px] text-brand-text-secondary leading-relaxed">
              <span className="text-brand-text-primary font-medium block mb-1">
                Professional Scope &amp; Disclosure Standard
              </span>
              The technical frameworks, architecture strategies, and
              methodologies documented here reflect skills, technical
              responsibilities, and domain experience developed through
              professional employment. In accordance with professional standards
              and confidentiality, specific client names, proprietary commercial
              metrics, and private analytics are intentionally omitted.
            </div>
          </div>
        </header>

        {/* Experience Entries List */}
        <div className="space-y-[32px]">
          {experiences.map((pe) => (
            <article
              key={pe.id}
              aria-labelledby={`experience-${pe.id}-title`}
              className="bg-brand-surface/40 border border-brand-border hover:border-brand-accent/50 rounded-xl p-[32px] transition-all duration-300 hover:bg-brand-surface"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-[24px]">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-[12px]">
                    <span className="font-mono text-[11px] font-semibold text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded border border-brand-accent/20">
                      {pe.id}
                    </span>
                    <Badge variant="outline" size="sm">
                      {pe.domain}
                    </Badge>
                    {pe.roleContext && (
                      <span className="font-mono text-[11px] text-brand-text-muted">
                        {pe.roleContext}
                      </span>
                    )}
                  </div>

                  <h2
                    id={`experience-${pe.id}-title`}
                    className="font-display text-[24px] md:text-[28px] font-bold text-brand-text-primary tracking-tight"
                  >
                    <Link
                      href={`/professional-experience/${pe.slug}`}
                      className="hover:text-brand-accent transition-colors focus-visible:outline-brand-accent"
                    >
                      {pe.title}
                    </Link>
                  </h2>
                </div>

                <Link
                  href={`/professional-experience/${pe.slug}`}
                  className="inline-flex items-center gap-2 self-start font-mono text-[12px] font-medium text-brand-accent hover:text-brand-accent-hover transition-colors px-4 py-2 rounded border border-brand-accent/30 hover:border-brand-accent shrink-0 focus-visible:outline-brand-accent"
                  aria-label={`Review technical architecture for ${pe.title}`}
                >
                  <span>Review Architecture</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <p className="text-[15px] text-brand-text-secondary leading-relaxed mb-[28px] max-w-4xl">
                {pe.summary}
              </p>

              {/* Two Column Focus Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-[20px] border-t border-brand-border-subtle mb-[24px]">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-brand-accent block mb-[10px]">
                    AREAS OF RESPONSIBILITY
                  </span>
                  <ul className="space-y-2 text-[13px] text-brand-text-secondary leading-relaxed">
                    {pe.responsibilities.slice(0, 3).map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2 shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-brand-accent block mb-[10px]">
                    TECHNICAL ARCHITECTURE FOCUS
                  </span>
                  <ul className="space-y-2 text-[13px] text-brand-text-secondary leading-relaxed">
                    {pe.technicalFocus.slice(0, 3).map((tech, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-border-highlight mt-2 shrink-0" />
                        <span>{tech}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Technologies & Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-[16px] border-t border-brand-border-subtle/50 text-[12px] font-mono text-brand-text-muted">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-brand-text-muted">Technologies:</span>
                  {pe.technologies.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="bg-brand-surface-raised px-2 py-0.5 rounded border border-brand-border-subtle text-brand-text-secondary text-[11px]"
                    >
                      {tech}
                    </span>
                  ))}
                  {pe.technologies.length > 4 && (
                    <span className="text-[11px] text-brand-text-muted">
                      +{pe.technologies.length - 4} more
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-brand-text-muted italic">
                  <span>{pe.disclosure}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </div>
  );
}
