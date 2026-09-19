import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowRight } from "lucide-react";

export const PhilosophySection: React.FC = () => {
  const steps = [
    { label: "SEARCH", desc: "Indexation & Keywords" },
    { label: "DISCOVERY", desc: "Entity Extraction & RAG" },
    { label: "KNOWLEDGE", desc: "Graph Nodes & Citation" },
    { label: "ANSWERS", desc: "Generative Recommendation" },
  ];

  return (
    <section className="py-[96px] md:py-[128px] bg-brand-bg-secondary/40 border-y border-brand-border/60">
      <Container>
        <SectionHeader
          eyebrow="SEARCH FORWARD PHILOSOPHY"
          title="SEARCH IS CHANGING."
          description="Search is no longer just about ranking pages. It's increasingly about being discovered, understood, referenced and recommended."
        />

        {/* Refined Visual Progression: SEARCH → DISCOVERY → KNOWLEDGE → ANSWERS */}
        <div className="mt-[48px] md:mt-[64px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            {steps.map((step, idx) => (
              <div key={step.label} className="relative group">
                <div className="bg-brand-surface/60 border border-brand-border p-[24px] rounded-lg transition-all duration-300 group-hover:border-brand-accent/50 group-hover:bg-brand-surface">
                  <div className="flex items-center justify-between mb-[16px]">
                    <span className="font-mono text-[12px] text-brand-accent font-semibold tracking-wider">
                      0{idx + 1}
                    </span>
                    {idx < steps.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-brand-text-muted hidden lg:block group-hover:translate-x-1 transition-transform" />
                    )}
                  </div>
                  <h3 className="font-display text-[20px] font-bold text-brand-text-primary tracking-tight">
                    {step.label}
                  </h3>
                  <p className="mt-[8px] text-[14px] text-brand-text-muted font-sans">
                    {step.desc}
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
