import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Cpu, ArrowRight } from "lucide-react";

export const AISearchUniverseSection: React.FC = () => {
  const searchSystems = ["Google", "ChatGPT", "Gemini", "Claude", "Perplexity"];
  const flowNodes = [
    { label: "USER", sub: "Query Trigger" },
    { label: "USER INTENT", sub: "Semantic Vector" },
    { label: "CONTENT / ENTITIES / AUTHORITY", sub: "Knowledge Graph" },
    { label: "SEARCH SYSTEMS", sub: "RAG & LLM Engine" },
    { label: "ANSWERS", sub: "Generative Output" },
  ];

  return (
    <section id="search-universe" className="py-[96px] md:py-[128px] bg-brand-bg-secondary/60 border-y border-brand-border">
      <Container>
        <SectionHeader
          eyebrow="SYSTEM ARCHITECTURE"
          title="SEARCH IS BECOMING AN ECOSYSTEM."
          description="Modern search is a interconnected knowledge graph where content, authority, and user intent flow dynamically through generative AI answer systems."
        />

        {/* Visual Ecosystem Architecture Container */}
        <div className="mt-[48px] bg-brand-surface border border-brand-border rounded-lg p-[24px] sm:p-[40px]">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-[24px] border-b border-brand-border-subtle gap-[12px]">
            <div className="flex items-center gap-[12px]">
              <Cpu className="w-5 h-5 text-brand-accent" />
              <span className="font-mono text-[14px] font-medium text-brand-text-primary uppercase tracking-wider">
                Ecosystem Retrieval Pipeline
              </span>
            </div>
            <div className="flex items-center gap-[8px]">
              <Badge variant="active">Phase 1 Foundation</Badge>
              <Badge variant="outline">Responsive Graph</Badge>
            </div>
          </div>

          {/* Conceptual Flow Nodes (Desktop & Mobile Responsive Grid) */}
          <div className="py-[40px]">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-[16px] relative">
              {flowNodes.map((node, index) => (
                <div key={node.label} className="flex flex-col items-center text-center group">
                  <div className="w-full bg-brand-bg/90 border border-brand-border group-hover:border-brand-accent p-[20px] rounded-md transition-all duration-300 relative">
                    <span className="font-mono text-[10px] text-brand-accent font-semibold block mb-[4px]">
                      STAGE 0{index + 1}
                    </span>
                    <h4 className="font-display text-[15px] font-bold text-brand-text-primary leading-tight">
                      {node.label}
                    </h4>
                    <p className="font-mono text-[11px] text-brand-text-muted mt-[4px]">
                      {node.sub}
                    </p>
                  </div>

                  {/* Flow Arrow (Mobile: Down, Desktop: Right) */}
                  {index < flowNodes.length - 1 && (
                    <div className="my-[12px] md:my-0 md:absolute md:top-1/2 md:-right-[12px] md:-translate-y-1/2 z-10">
                      <ArrowRight className="w-4 h-4 text-brand-accent rotate-90 md:rotate-0" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Integrated AI Search Systems Bar */}
          <div className="border-t border-brand-border-subtle pt-[24px]">
            <div className="font-mono text-[12px] uppercase tracking-widest text-brand-text-muted mb-[16px]">
              Connected AI Search Engines Tracked:
            </div>
            <div className="flex flex-wrap items-center gap-[12px]">
              {searchSystems.map((sys) => (
                <div
                  key={sys}
                  className="bg-brand-bg-secondary border border-brand-border/80 px-[16px] py-[8px] rounded-interactive font-mono text-[13px] text-brand-text-secondary flex items-center gap-[8px]"
                >
                  <span className="w-[6px] h-[6px] rounded-full bg-brand-accent" />
                  <span>{sys}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
