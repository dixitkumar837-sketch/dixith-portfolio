import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { FEATURED_RESEARCH } from "@/data/research";
import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";

export function FeaturedResearchSection() {
  return (
    <section id="research" className="py-[96px] md:py-[128px]">
      <Container>
        <SectionHeader
          eyebrow="EDITORIAL ARCHIVE"
          title="FEATURED RESEARCH"
          description="Empirical studies on AI search mechanics, entity recognition, generative engine optimization, and citation behavior."
        />

        {/* 3-Column Desktop Grid (4 / 4 / 4) */}
        <div className="mt-[48px] grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          {FEATURED_RESEARCH.map((item) => (
            <article
              key={item.id}
              aria-labelledby={`research-title-${item.id}`}
              className="group bg-brand-surface/50 border border-brand-border hover:border-brand-accent/50 rounded-lg p-[28px] flex flex-col justify-between transition-all duration-300 hover:bg-brand-surface"
            >
              <div>
                {/* Header Metadata */}
                <div className="flex items-center justify-between mb-[20px]">
                  <Badge variant="active" size="sm">
                    {item.id}
                  </Badge>
                  <div className="flex items-center gap-[8px]">
                    {item.status === "IN_REVIEW" && (
                      <span className="font-mono text-[10px] tracking-wider text-brand-text-muted border border-brand-border/70 px-[7px] py-[2px] rounded-sm uppercase">
                        In Review
                      </span>
                    )}
                    <span className="font-mono text-[11px] text-brand-text-muted tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3
                  id={`research-title-${item.id}`}
                  className="font-display text-[22px] font-bold text-brand-text-primary tracking-tight leading-snug group-hover:text-brand-accent-hover transition-colors mb-[12px]"
                >
                  <Link
                    href={`/research/${item.slug}`}
                    className="focus-visible:outline-brand-accent hover:underline decoration-brand-accent/40"
                  >
                    {item.title}
                  </Link>
                </h3>

                {/* Summary */}
                <p className="text-[14px] text-brand-text-secondary leading-relaxed font-sans mb-[24px]">
                  {item.summary}
                </p>
              </div>

              {/* Footer Metadata */}
              <div className="pt-[16px] border-t border-brand-border-subtle flex items-center justify-between font-mono text-[12px] text-brand-text-muted">
                <span className="flex items-center gap-[6px]">
                  <BookOpen className="w-3.5 h-3.5" />
                  {item.type} · {item.readTime}
                </span>
                <Link
                  href={`/research/${item.slug}`}
                  aria-label={`Read ${item.title}`}
                  className="focus-visible:outline-brand-accent text-brand-text-muted hover:text-brand-accent"
                >
                  <ArrowUpRight className="w-4 h-4 text-brand-text-muted group-hover:text-brand-text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Link to Full Research Archive */}
        <div className="mt-[40px] text-center">
          <Link
            href="/research"
            className="inline-flex items-center gap-[8px] font-mono text-[12px] uppercase tracking-widest text-brand-accent hover:text-brand-accent-hover font-semibold transition-colors focus-visible:outline-brand-accent"
          >
            <span>Explore Full Research Archive &amp; Protocols</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
