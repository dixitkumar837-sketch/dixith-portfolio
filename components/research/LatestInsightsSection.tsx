import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { LATEST_INSIGHTS } from "@/data/articles";

export const LatestInsightsSection: React.FC = () => {
  return (
    <section id="insights" className="py-[96px] md:py-[128px] bg-brand-bg-secondary/40 border-y border-brand-border">
      <Container>
        <SectionHeader
          eyebrow="PERSPECTIVES & DISPATCHES"
          title="LATEST INSIGHTS"
          description="Analysis of emerging search system algorithms, technical architecture updates, and generative retrieval models."
        />

        <div className="mt-[48px] grid grid-cols-1 md:grid-cols-3 gap-[24px]">
          {LATEST_INSIGHTS.map((article) => (
            <article
              key={article.id}
              aria-labelledby={`insight-title-${article.id}`}
              className="group bg-brand-surface/30 border border-brand-border hover:border-brand-accent/50 rounded-lg p-[28px] flex flex-col justify-between transition-all duration-300 hover:bg-brand-surface"
            >
              <div>
                <div className="flex items-center justify-between mb-[16px]">
                  <Badge variant="outline" size="sm">
                    {article.category}
                  </Badge>
                  <span className="font-mono text-[11px] text-brand-text-muted">
                    {article.readTime}
                  </span>
                </div>

                <h3
                  id={`insight-title-${article.id}`}
                  className="font-display text-[20px] font-bold text-brand-text-primary tracking-tight leading-snug group-hover:text-brand-accent-hover transition-colors mb-[12px]"
                >
                  {article.title}
                </h3>

                <p className="text-[14px] text-brand-text-secondary leading-relaxed font-sans mb-[24px]">
                  {article.summary}
                </p>
              </div>

              <div className="pt-[16px] border-t border-brand-border-subtle flex items-center justify-between font-mono text-[12px] text-brand-text-muted">
                <span>Editorial Dispatch</span>
                <span className="font-mono text-[10px] tracking-wider text-brand-text-muted border border-brand-border/60 px-[7px] py-[2px] rounded-sm uppercase">
                  Planned
                </span>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
};
