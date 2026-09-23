import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const PhilosophySection: React.FC = () => {
  const progression = [
    {
      num: "01",
      label: "SEARCH",
      desc: "Indexation & Keywords",
      note: "Traditional Retrieval",
    },
    {
      num: "02",
      label: "DISCOVERY",
      desc: "Entity Extraction & RAG",
      note: "Contextual Routing",
    },
    {
      num: "03",
      label: "KNOWLEDGE",
      desc: "Graph Nodes & Authority",
      note: "Entity Alignment",
    },
    {
      num: "04",
      label: "ANSWERS",
      desc: "Generative Recommendation",
      note: "Synthesis & Citation",
    },
  ];

  return (
    <section className="py-[80px] md:py-[112px] border-y border-brand-border/60 bg-brand-bg-secondary/25">
      <Container>
        <SectionHeader
          eyebrow="PARADIGM SHIFT"
          title="SEARCH IS CHANGING."
          description="Search is no longer just about ranking pages. It's increasingly about being discovered, understood, referenced and recommended."
        />

        {/* Editorial Progression: Pure Typography, Fine Hairlines & Whitespace */}
        <div className="mt-[48px] border-t border-brand-border/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {progression.map((item, idx) => (
              <div
                key={item.label}
                className="py-[32px] sm:py-[40px] px-[16px] sm:px-[24px] border-b border-brand-border/60 sm:odd:border-r lg:border-b-0 lg:border-r lg:last:border-r-0 group hover:bg-brand-surface/20 transition-colors"
              >
                {/* Stage Indicator & Directional Symbol */}
                <div className="flex items-center justify-between mb-[20px]">
                  <span className="font-mono text-[11px] font-semibold text-brand-accent tracking-widest">
                    {item.num}
                  </span>
                  {idx < progression.length - 1 && (
                    <span className="font-mono text-[14px] text-brand-text-muted/60 group-hover:text-brand-accent transition-colors hidden lg:inline">
                      →
                    </span>
                  )}
                </div>

                {/* Stage Heading */}
                <h3 className="font-display text-[26px] sm:text-[30px] font-bold text-brand-text-primary tracking-tight leading-none group-hover:text-brand-accent-hover transition-colors">
                  {item.label}
                </h3>

                {/* Editorial Subtext */}
                <div className="mt-[12px] space-y-[4px]">
                  <p className="text-[14px] text-brand-text-secondary font-sans font-medium">
                    {item.desc}
                  </p>
                  <p className="font-mono text-[11px] text-brand-text-muted uppercase tracking-wider">
                    {item.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
};
