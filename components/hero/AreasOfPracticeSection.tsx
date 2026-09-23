import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowUpRight } from "lucide-react";

export const AreasOfPracticeSection: React.FC = () => {
  const practices = [
    {
      num: "01",
      title: "AI Search Strategy",
      description:
        "Building visibility models for generative answer engines, AI overviews, and LLM search discovery.",
    },
    {
      num: "02",
      title: "Enterprise SEO",
      description:
        "Architecting complex, large-scale technical search systems and multi-domain web footprints.",
    },
    {
      num: "03",
      title: "Technical SEO",
      description:
        "Optimizing crawling budgets, site architecture, rendering pipelines, and structured data schemas.",
    },
    {
      num: "04",
      title: "AEO + GEO",
      description:
        "Answer Engine Optimization & Generative Engine Optimization targeting LLM citations and RAG retrieval.",
    },
    {
      num: "05",
      title: "International SEO",
      description:
        "Managing multi-regional hreflang structures, global entity mapping, and localized search discovery.",
    },
    {
      num: "06",
      title: "Search Experience",
      description:
        "Aligning user search intent, performance metrics, and seamless discovery interface design.",
    },
  ];

  return (
    <section className="py-[96px] md:py-[128px]">
      <Container>
        <SectionHeader
          eyebrow="DOMAINS & CAPABILITIES"
          title="AREAS OF PRACTICE"
          description="Editorial focus across traditional search infrastructure and generative AI discovery ecosystems."
        />

        {/* Editorial List with Thin Dividers and Restrained Interaction */}
        <div className="mt-[48px] border-t border-brand-border">
          {practices.map((item) => (
            <div
              key={item.num}
              className="group border-b border-brand-border py-[28px] md:py-[36px] transition-colors hover:bg-brand-surface/30 px-[16px] sm:px-[24px] rounded-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-[16px] md:gap-[32px] items-start">
                {/* Number */}
                <div className="md:col-span-1 font-mono text-[14px] text-brand-accent font-medium">
                  {item.num}
                </div>

                {/* Title */}
                <div className="md:col-span-4 flex items-center justify-between">
                  <h3 className="font-display text-[20px] md:text-[24px] font-bold text-brand-text-primary tracking-tight group-hover:text-brand-accent-hover transition-colors">
                    {item.title}
                  </h3>
                </div>

                {/* Description */}
                <div className="md:col-span-6 text-[15px] md:text-[16px] text-brand-text-secondary leading-relaxed font-sans">
                  {item.description}
                </div>

                {/* Arrow Icon */}
                <div className="md:col-span-1 flex justify-end">
                  <ArrowUpRight className="w-5 h-5 text-brand-text-muted group-hover:text-brand-text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};
