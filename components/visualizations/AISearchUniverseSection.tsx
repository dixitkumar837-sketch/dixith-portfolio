import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Cpu } from "lucide-react";

export const AISearchUniverseSection: React.FC = () => {
  const searchSystems = [
    "Google AI Overview",
    "ChatGPT",
    "Perplexity",
    "Claude",
    "Gemini",
    "Microsoft Copilot",
  ];

  const flowNodes = [
    { num: "01", label: "USER", sub: "Origin Trigger" },
    { num: "02", label: "INTENT", sub: "Semantic Vector" },
    { num: "03", label: "KNOWLEDGE GRAPH", sub: "Entity Authority" },
    { num: "04", label: "6 AI ENGINES", sub: "RAG Retrieval" },
    { num: "05", label: "SYNTHESIS", sub: "Answers & Citations" },
  ];

  return (
    <section id="search-universe" className="py-[96px] md:py-[128px] border-b border-brand-border/60">
      <Container>
        <SectionHeader
          eyebrow="SYSTEM TOPOLOGY"
          title="SEARCH IS BECOMING AN ECOSYSTEM."
          description="Modern search operates as a dynamic knowledge network where authority, entity validation, and user intent flow through multimodal generative answer engines."
        />

        {/* Precision Architecture Blueprint Container */}
        <div className="mt-[48px] border border-brand-border/70 bg-brand-bg-secondary/30 rounded-lg p-[24px] sm:p-[36px]">
          {/* Top Metadata Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-[20px] border-b border-brand-border/60 gap-[12px]">
            <div className="flex items-center gap-[10px]">
              <Cpu className="w-4 h-4 text-brand-accent" />
              <span className="font-mono text-[12px] font-medium text-brand-text-primary uppercase tracking-widest">
                END-TO-END RETRIEVAL TOPOLOGY
              </span>
            </div>
            <div className="font-mono text-[11px] text-brand-text-muted">
              METHODOLOGY: 6-SYSTEM ACTIVE EVALUATION
            </div>
          </div>

          {/* 5 Stage Flow Pipeline */}
          <div className="py-[32px] sm:py-[40px]">
            <div className="grid grid-cols-1 md:grid-cols-5 border-y md:border-y-0 md:border-x border-brand-border/60 divide-y md:divide-y-0 md:divide-x divide-brand-border/60">
              {flowNodes.map((node) => (
                <div
                  key={node.num}
                  className="p-[20px] sm:p-[24px] hover:bg-brand-surface/30 transition-colors group"
                >
                  <span className="font-mono text-[10px] text-brand-accent font-semibold tracking-wider block mb-[8px]">
                    STAGE {node.num}
                  </span>
                  <h3 className="font-display text-[16px] sm:text-[18px] font-bold text-brand-text-primary tracking-tight group-hover:text-brand-accent-hover transition-colors">
                    {node.label}
                  </h3>
                  <p className="font-mono text-[11px] text-brand-text-muted mt-[4px]">
                    {node.sub}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Six Validated Systems Sub-Tier */}
          <div className="pt-[24px] border-t border-brand-border/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-[16px]">
              <div className="font-mono text-[11px] uppercase tracking-widest text-brand-text-muted">
                Standardized Evaluation Targets:
              </div>
              <div className="flex flex-wrap items-center gap-[8px]">
                {searchSystems.map((sys) => (
                  <span
                    key={sys}
                    className="font-mono text-[11px] px-[10px] py-[4px] bg-brand-surface/60 border border-brand-border/80 rounded-sm text-brand-text-secondary hover:border-brand-accent/40 hover:text-brand-text-primary transition-colors"
                  >
                    {sys}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
