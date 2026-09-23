import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/site-config";
import {
  getAllProfessionalExperiences,
  getProfessionalExperienceBySlug,
} from "@/data/professional-experience";
import { getResearchBySlug } from "@/data/research";
import { generateBreadcrumbSchema } from "@/lib/schema";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  Target,
} from "lucide-react";

interface ExperiencePageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  const experiences = getAllProfessionalExperiences();
  return experiences.map((pe) => ({
    slug: pe.slug,
  }));
}

export function generateMetadata({ params }: ExperiencePageProps): Metadata {
  const pe = getProfessionalExperienceBySlug(params.slug);

  if (!pe) {
    return {
      title: "Experience Not Found",
    };
  }

  const canonicalUrl = `${SITE_CONFIG.url}/professional-experience/${pe.slug}`;
  const isPublished = pe.status === "PUBLISHED";

  return {
    title: `${pe.title} — Professional Experience | DIXITH`,
    description: pe.summary,
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
      type: "website",
      url: canonicalUrl,
      title: `${pe.title} — Professional Experience | DIXITH`,
      description: pe.summary,
      siteName: SITE_CONFIG.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${pe.title} — Professional Experience | DIXITH`,
      description: pe.summary,
    },
  };
}

export default function ProfessionalExperienceDetailPage({
  params,
}: ExperiencePageProps) {
  const pe = getProfessionalExperienceBySlug(params.slug);

  if (!pe) {
    notFound();
  }

  const canonicalUrl = `${SITE_CONFIG.url}/professional-experience/${pe.slug}`;

  const breadcrumbs = [
    { name: "Home", url: SITE_CONFIG.url },
    {
      name: "Professional Experience",
      url: `${SITE_CONFIG.url}/professional-experience`,
    },
    { name: pe.title, url: canonicalUrl },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}/#webpage`,
    url: canonicalUrl,
    name: `${pe.title} — Professional Experience | DIXITH`,
    description: pe.summary,
    isPartOf: {
      "@id": `${SITE_CONFIG.url}/#website`,
    },
    about: {
      "@id": `${SITE_CONFIG.url}/#person`,
    },
    mainEntity: {
      "@type": "Thing",
      name: pe.title,
      description: pe.summary,
    },
    inLanguage: "en-US",
  };

  return (
    <div className="py-[96px] md:py-[128px]">
      {/* Structured Data: Breadcrumbs + WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <Container>
        {/* Navigation Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-[32px]">
          <ol className="flex items-center flex-wrap gap-2 font-mono text-[12px] text-brand-text-muted">
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
                href="/professional-experience"
                className="hover:text-brand-text-primary transition-colors focus-visible:outline-brand-accent"
              >
                Professional Experience
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
            </li>
            <li
              aria-current="page"
              className="text-brand-accent font-semibold truncate max-w-[200px] md:max-w-none"
            >
              {pe.id}
            </li>
          </ol>
        </nav>

        {/* Back Link */}
        <div className="mb-[32px]">
          <Link
            href="/professional-experience"
            className="inline-flex items-center gap-2 font-mono text-[12px] text-brand-text-muted hover:text-brand-accent transition-colors focus-visible:outline-brand-accent"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Professional Experience Archive</span>
          </Link>
        </div>

        {/* Header */}
        <header className="mb-[48px] border-b border-brand-border pb-[40px]">
          <div className="flex flex-wrap items-center gap-3 mb-[20px]">
            <span className="font-mono text-[12px] font-bold text-brand-accent bg-brand-accent/10 px-2.5 py-1 rounded border border-brand-accent/20">
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

          <h1 className="font-display text-[32px] md:text-[44px] lg:text-[48px] font-bold text-brand-text-primary tracking-tight mb-[24px] leading-tight">
            {pe.title}
          </h1>

          <p className="text-[17px] md:text-[19px] text-brand-text-secondary leading-relaxed max-w-4xl mb-[32px]">
            {pe.summary}
          </p>

          {/* Professional Scope & Disclosure Callout */}
          <div className="bg-brand-surface border border-brand-border-subtle rounded-lg p-[20px] max-w-4xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-accent shrink-0 mt-0.5" />
            <div className="text-[13px] text-brand-text-secondary leading-relaxed">
              <strong className="text-brand-text-primary block mb-0.5">
                Professional Scope &amp; Disclosure Standard
              </strong>
              This documentation outlines technical architecture concepts,
              responsibilities, and methodologies developed through full-time
              professional employment. In accordance with professional standards
              and confidentiality, specific client and commercial details are
              intentionally omitted.
            </div>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Editorial Content (8 cols) */}
          <article className="lg:col-span-8 space-y-[48px]">
            {/* Section 1: Overview */}
            <section aria-labelledby="heading-overview">
              <h2
                id="heading-overview"
                className="font-display text-[22px] md:text-[26px] font-bold text-brand-text-primary tracking-tight mb-[16px] flex items-center gap-3"
              >
                <span className="font-mono text-[14px] text-brand-accent">
                  01.
                </span>
                Domain Overview
              </h2>
              <div className="bg-brand-surface/30 border border-brand-border rounded-xl p-[24px] text-[15px] text-brand-text-secondary leading-relaxed">
                <p>{pe.overview}</p>
              </div>
            </section>

            {/* Section 2: Areas of Responsibility */}
            <section aria-labelledby="heading-responsibilities">
              <h2
                id="heading-responsibilities"
                className="font-display text-[22px] md:text-[26px] font-bold text-brand-text-primary tracking-tight mb-[16px] flex items-center gap-3"
              >
                <span className="font-mono text-[14px] text-brand-accent">
                  02.
                </span>
                Key Areas of Responsibility
              </h2>
              <div className="bg-brand-surface/30 border border-brand-border rounded-xl p-[24px]">
                <ul className="space-y-3 font-sans text-[14px] text-brand-text-secondary leading-relaxed">
                  {pe.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-accent mt-1 shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 3: Technical Architecture Focus */}
            <section aria-labelledby="heading-technical">
              <h2
                id="heading-technical"
                className="font-display text-[22px] md:text-[26px] font-bold text-brand-text-primary tracking-tight mb-[16px] flex items-center gap-3"
              >
                <span className="font-mono text-[14px] text-brand-accent">
                  03.
                </span>
                Technical Architecture &amp; Methodological Focus
              </h2>
              <div className="bg-brand-surface/30 border border-brand-border rounded-xl p-[24px]">
                <ul className="space-y-3 font-sans text-[14px] text-brand-text-secondary leading-relaxed">
                  {pe.technicalFocus.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 4: Search Focus */}
            <section aria-labelledby="heading-search">
              <h2
                id="heading-search"
                className="font-display text-[22px] md:text-[26px] font-bold text-brand-text-primary tracking-tight mb-[16px] flex items-center gap-3"
              >
                <span className="font-mono text-[14px] text-brand-accent">
                  04.
                </span>
                Search &amp; Information Retrieval Focus
              </h2>
              <div className="bg-brand-surface/30 border border-brand-border rounded-xl p-[24px]">
                <ul className="space-y-3 font-sans text-[14px] text-brand-text-secondary leading-relaxed">
                  {pe.searchFocus.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-border-highlight mt-2 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Section 5: Professional Context */}
            <section aria-labelledby="heading-context">
              <h2
                id="heading-context"
                className="font-display text-[22px] md:text-[26px] font-bold text-brand-text-primary tracking-tight mb-[16px] flex items-center gap-3"
              >
                <span className="font-mono text-[14px] text-brand-accent">
                  05.
                </span>
                Professional Context &amp; Disclosure
              </h2>
              <div className="bg-brand-surface/30 border border-brand-border rounded-xl p-[24px] text-[15px] text-brand-text-secondary leading-relaxed space-y-3">
                <p>{pe.professionalContext}</p>
                <p className="text-[13px] text-brand-text-muted italic">
                  {pe.disclosure}
                </p>
              </div>
            </section>

            {/* Section 6: Related Research (Natural cross-linking) */}
            {pe.relatedResearch && pe.relatedResearch.length > 0 && (
              <section aria-labelledby="heading-related-research">
                <h2
                  id="heading-related-research"
                  className="font-display text-[22px] md:text-[26px] font-bold text-brand-text-primary tracking-tight mb-[16px] flex items-center gap-3"
                >
                  <span className="font-mono text-[14px] text-brand-accent">
                    06.
                  </span>
                  Related Foundational Research
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pe.relatedResearch.map((resSlug) => {
                    const rItem = getResearchBySlug(resSlug);
                    return (
                      <Link
                        key={resSlug}
                        href={`/research/${resSlug}`}
                        className="group bg-brand-surface border border-brand-border hover:border-brand-accent/50 rounded-lg p-[20px] transition-all"
                      >
                        <span className="font-mono text-[11px] text-brand-accent uppercase block mb-1">
                          {rItem?.id || "RESEARCH"}
                        </span>
                        <h3 className="font-display text-[15px] font-bold text-brand-text-primary group-hover:text-brand-accent transition-colors mb-2">
                          {rItem?.title || resSlug.replace(/-/g, " ")}
                        </h3>
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] text-brand-text-muted group-hover:text-brand-text-primary transition-colors">
                          <span>Read Study</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar / Specifications (4 cols) */}
          <aside className="lg:col-span-4 space-y-[24px]">
            {/* Quick Specifications Card */}
            <div className="bg-brand-surface border border-brand-border rounded-xl p-[24px] space-y-[20px]">
              <h3 className="font-mono text-[11px] font-semibold tracking-wider text-brand-accent uppercase pb-3 border-b border-brand-border-subtle">
                TECHNICAL SPECIFICATIONS
              </h3>

              <div>
                <span className="text-[12px] font-mono text-brand-text-muted block mb-1">
                  IDENTIFIER
                </span>
                <span className="text-[14px] font-mono text-brand-text-primary font-semibold">
                  {pe.id}
                </span>
              </div>

              <div>
                <span className="text-[12px] font-mono text-brand-text-muted block mb-1">
                  DOMAIN / SECTOR
                </span>
                <span className="text-[14px] font-sans text-brand-text-primary">
                  {pe.domain}
                </span>
              </div>

              <div>
                <span className="text-[12px] font-mono text-brand-text-muted block mb-1">
                  ROLE FOCUS
                </span>
                <span className="text-[14px] font-sans text-brand-text-primary">
                  {pe.roleContext || "Technical Search Architecture"}
                </span>
              </div>

              <div>
                <span className="text-[12px] font-mono text-brand-text-muted block mb-1">
                  PROFESSIONAL NATURE
                </span>
                <span className="text-[13px] font-sans text-brand-text-secondary">
                  Employment Experience
                </span>
              </div>

              <div>
                <span className="text-[12px] font-mono text-brand-text-muted block mb-1">
                  DISCLOSURE STATUS
                </span>
                <span className="text-[12px] font-mono text-brand-text-secondary">
                  Non-Proprietary / Client Omitted
                </span>
              </div>
            </div>

            {/* Technologies Card */}
            {pe.technologies && pe.technologies.length > 0 && (
              <div className="bg-brand-surface border border-brand-border rounded-xl p-[24px]">
                <h3 className="font-mono text-[11px] font-semibold tracking-wider text-brand-accent uppercase pb-3 border-b border-brand-border-subtle mb-4">
                  TOOLS &amp; TECHNOLOGIES
                </h3>
                <div className="flex flex-wrap gap-2">
                  {pe.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="bg-brand-surface-raised px-2.5 py-1 rounded border border-brand-border-subtle text-brand-text-secondary text-[12px] font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}
