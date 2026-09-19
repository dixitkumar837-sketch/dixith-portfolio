import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { CASE_STUDIES } from "@/data/case-studies";
import { ArrowUpRight } from "lucide-react";

export const CaseStudiesSection: React.FC = () => {
  return (
    <section id="case-studies" className="py-[96px] md:py-[128px]">
      <Container>
        <SectionHeader
          eyebrow="STRUCTURED FIELD ANALYSIS"
          title="SELECTED CASE STUDIES"
          description="Detailed methodological documentation covering search architecture challenges, strategic intervention, and empirical evaluation."
        />

        {/* 2-Column Grid (6 / 6 Desktop) */}
        <div className="mt-[48px] grid grid-cols-1 md:grid-cols-2 gap-[32px]">
          {CASE_STUDIES.map((cs) => (
            <div
              key={cs.id}
              className="group bg-brand-surface/40 border border-brand-border hover:border-brand-accent/50 rounded-lg p-[32px] flex flex-col justify-between transition-all duration-300 hover:bg-brand-surface"
            >
              <div>
                <div className="flex items-center justify-between mb-[20px]">
                  <Badge variant="outline" size="sm">
                    {cs.category}
                  </Badge>
                  <span className="font-mono text-[11px] text-brand-text-muted">
                    {cs.id}
                  </span>
                </div>

                <h3 className="font-display text-[22px] md:text-[24px] font-bold text-brand-text-primary tracking-tight group-hover:text-brand-accent-hover transition-colors mb-[24px]">
                  {cs.title}
                </h3>

                {/* Structured Problem-Strategy-Implementation Framework */}
                <div className="space-y-[16px] text-[14px] font-sans">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-brand-accent block mb-[2px]">
                      PROBLEM STATEMENT
                    </span>
                    <p className="text-brand-text-secondary leading-relaxed">
                      {cs.problemPlaceholder}
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-brand-accent block mb-[2px]">
                      STRATEGIC APPROACH
                    </span>
                    <p className="text-brand-text-secondary leading-relaxed">
                      {cs.strategyPlaceholder}
                    </p>
                  </div>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-brand-accent block mb-[2px]">
                      IMPLEMENTATION PIPELINE
                    </span>
                    <p className="text-brand-text-secondary leading-relaxed">
                      {cs.implementationPlaceholder}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-[32px] pt-[20px] border-t border-brand-border-subtle flex items-center justify-between font-mono text-[12px] text-brand-text-muted">
                <span>VERIFICATION: Structural Data Model</span>
                <ArrowUpRight className="w-4 h-4 text-brand-text-muted group-hover:text-brand-text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
