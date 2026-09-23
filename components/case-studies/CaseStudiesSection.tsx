import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { PROFESSIONAL_EXPERIENCES } from "@/data/professional-experience";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export function CaseStudiesSection() {
  return (
    <section id="experience" className="py-[96px] md:py-[128px]">
      <div id="case-studies" className="sr-only" aria-hidden="true" />
      <Container>
        <SectionHeader
          eyebrow="PROFESSIONAL BACKGROUND & TECHNICAL EXPERTISE"
          title="PROFESSIONAL EXPERIENCE"
          description="Experience across search strategy, technical SEO, enterprise discovery, healthcare search and e-commerce ecosystems."
        />

        {/* 3-Column Grid Desktop */}
        <div className="mt-[48px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[32px]">
          {PROFESSIONAL_EXPERIENCES.map((pe) => (
            <article
              key={pe.id}
              aria-labelledby={`experience-title-${pe.id}`}
              className="group bg-brand-surface/40 border border-brand-border hover:border-brand-accent/50 rounded-lg p-[32px] flex flex-col justify-between transition-all duration-300 hover:bg-brand-surface"
            >
              <div>
                <div className="flex items-center justify-between mb-[20px]">
                  <Badge variant="outline" size="sm">
                    {pe.domain}
                  </Badge>
                  <span className="font-mono text-[11px] text-brand-text-muted">
                    {pe.id}
                  </span>
                </div>

                <h3
                  id={`experience-title-${pe.id}`}
                  className="font-display text-[20px] md:text-[22px] font-bold text-brand-text-primary tracking-tight group-hover:text-brand-accent transition-colors mb-[20px]"
                >
                  <Link
                    href={`/professional-experience/${pe.slug}`}
                    className="focus-visible:outline-brand-accent"
                  >
                    {pe.title}
                  </Link>
                </h3>

                <p className="text-[14px] text-brand-text-secondary leading-relaxed mb-[24px]">
                  {pe.summary}
                </p>

                {/* Structured Responsibility & Technical Focus */}
                <div className="space-y-[16px] text-[13px] font-sans">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-brand-accent block mb-[6px]">
                      AREAS OF RESPONSIBILITY
                    </span>
                    <ul className="space-y-1.5 text-brand-text-secondary leading-relaxed">
                      {pe.responsibilities.slice(0, 2).map((resp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-accent mt-1.5 shrink-0" />
                          <span className="line-clamp-2">{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-brand-accent block mb-[6px]">
                      TECHNICAL FOCUS
                    </span>
                    <ul className="space-y-1.5 text-brand-text-secondary leading-relaxed">
                      {pe.technicalFocus.slice(0, 2).map((tech, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-border-highlight mt-1.5 shrink-0" />
                          <span className="line-clamp-2">{tech}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer Link */}
              <div className="mt-[32px] pt-[20px] border-t border-brand-border-subtle flex items-center justify-between font-mono text-[12px] text-brand-text-muted">
                <span>Technical Framework</span>
                <Link
                  href={`/professional-experience/${pe.slug}`}
                  aria-label={`Review technical architecture for ${pe.title}`}
                  className="inline-flex items-center gap-1 text-brand-accent hover:text-brand-accent-hover transition-colors focus-visible:outline-brand-accent"
                >
                  <span>Review</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Archive Exploration Link */}
        <div className="mt-[48px] text-center">
          <Link
            href="/professional-experience"
            className="inline-flex items-center gap-2 font-mono text-[13px] font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors px-6 py-3 rounded-lg border border-brand-accent/30 hover:border-brand-accent bg-brand-surface hover:bg-brand-surface-raised focus-visible:outline-brand-accent"
          >
            <span>Explore Professional Experience Archive</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
