import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { FEATURED_RESEARCH } from "@/data/research";
import { ArrowUpRight, BookOpen } from "lucide-react";

export const FeaturedResearchSection: React.FC = () => {
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
            <div
              key={item.id}
              className="group bg-brand-surface/50 border border-brand-border hover:border-brand-accent/50 rounded-lg p-[28px] flex flex-col justify-between transition-all duration-300 hover:bg-brand-surface"
            >
              <div>
                {/* Header Metadata */}
                <div className="flex items-center justify-between mb-[20px]">
                  <Badge variant="active" size="sm">
                    {item.id}
                  </Badge>
                  <span className="font-mono text-[11px] text-brand-text-muted tracking-wider">
                    {item.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-display text-[22px] font-bold text-brand-text-primary tracking-tight leading-snug group-hover:text-brand-accent-hover transition-colors mb-[12px]">
                  {item.title}
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
                <ArrowUpRight className="w-4 h-4 text-brand-text-muted group-hover:text-brand-text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
