import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { BRAND_CONFIG } from "@/data/navigation";
import { CheckCircle, ArrowRight } from "lucide-react";

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-[96px] md:py-[128px]">
      <Container>
        <SectionHeader
          eyebrow="BACKGROUND & PHILOSOPHY"
          title="ABOUT DIXITH"
          description="AI Search Strategist focused on SEO, search systems and emerging AI discovery experiences."
        />

        <div className="mt-[48px] grid grid-cols-1 lg:grid-cols-12 gap-[48px] lg:gap-[32px] items-center">
          {/* Left: Reusable Portrait Placeholder Container (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] bg-brand-surface border border-brand-border rounded-lg p-[24px] flex flex-col justify-between overflow-hidden shadow-xl group">
              <div className="flex items-center justify-between">
                <Badge variant="outline" size="sm">Executive Portrait Slot</Badge>
                <span className="font-mono text-[11px] text-brand-text-muted tracking-widest">DK</span>
              </div>

              {/* Portrait Silhouette Graphic / Placeholder */}
              <div className="flex-1 flex flex-col items-center justify-center text-center p-[20px]">
                <div className="w-[100px] h-[100px] rounded-full bg-brand-bg-secondary border border-brand-border flex items-center justify-center mb-[16px] text-brand-accent font-display text-[26px] font-bold shadow-inner">
                  DK
                </div>
                <p className="font-display text-[18px] font-bold text-brand-text-primary">
                  Dixith Kumar
                </p>
                <p className="font-mono text-[12px] text-brand-accent mt-[4px]">
                  AI Search Strategist
                </p>
                <span className="font-mono text-[11px] text-brand-text-muted mt-[2px]">
                  Search Forward
                </span>
              </div>

              <div className="pt-[16px] border-t border-brand-border-subtle font-mono text-[11px] text-brand-text-muted text-center">
                IMAGE CONTAINER: Reserved for professional portrait
              </div>
            </div>
          </div>

          {/* Right: Core Positioning & Philosophy Principles (7 cols) */}
          <div className="lg:col-span-7 space-y-[32px]">
            <div className="space-y-[16px]">
              <h3 className="font-display text-[28px] font-bold text-brand-text-primary leading-tight">
                Engineering Visibility Across Information Networks
              </h3>
              <p className="text-[16px] md:text-[18px] text-brand-text-secondary leading-relaxed font-sans">
                As search shifts from traditional link indexing to LLM synthesis and RAG retrieval, establishing persistent entity trust is paramount. I work with organizations to research, test, and build search architectures that remain discoverable across both traditional search engines and AI answer systems.
              </p>
            </div>

            {/* Philosophy Block */}
            <div className="bg-brand-surface/60 border border-brand-border p-[24px] rounded-lg">
              <div className="font-mono text-[11px] uppercase tracking-widest text-brand-accent mb-[8px]">
                OPERATING PHILOSOPHY
              </div>
              <p className="font-display text-[22px] font-bold text-brand-text-primary">
                &quot;{BRAND_CONFIG.philosophy}&quot;
              </p>
            </div>

            {/* Principles List */}
            <div className="space-y-[16px]">
              <div className="font-mono text-[12px] uppercase tracking-widest text-brand-text-muted">
                Core Principles:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                {BRAND_CONFIG.principles.map((principle) => (
                  <div key={principle} className="flex items-start gap-[10px]">
                    <CheckCircle className="w-4 h-4 text-brand-accent shrink-0 mt-[3px]" />
                    <span className="text-[14px] text-brand-text-secondary font-sans">
                      {principle}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Link to Full About Page */}
            <div className="pt-[8px]">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 font-mono text-[13px] font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors px-5 py-2.5 rounded-lg border border-brand-accent/30 hover:border-brand-accent bg-brand-surface hover:bg-brand-surface-raised focus-visible:outline-brand-accent"
              >
                <span>Read Full Strategic Profile &amp; Philosophy</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
