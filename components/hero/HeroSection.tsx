import React from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { AISearchUniverseGraph } from "./AISearchUniverseGraph";
import { ArrowRight, Compass } from "lucide-react";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-[130px] md:pt-[170px] pb-[80px] md:pb-[130px] overflow-hidden">
      {/* Subtle deep ambient glow — restrained, non-glowing */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-accent/5 blur-[160px] pointer-events-none rounded-full" />

      <Container>
        {/* 5 / 7 Column Relationship with Strong Whitespace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[48px] lg:gap-[40px] items-center">
          
          {/* Left Column (5 Cols Desktop) — Editorial Content */}
          <div className="lg:col-span-5 space-y-[28px]">
            {/* Technical Metadata Tag */}
            <div className="inline-flex items-center gap-[8px] font-mono text-[11px] tracking-[0.22em] text-brand-accent uppercase font-medium">
              <span className="w-[5px] h-[5px] rounded-full bg-brand-accent" />
              RESEARCH · STRATEGY · EXPERIMENTATION
            </div>

            {/* Signature Headline */}
            <div className="space-y-[14px]">
              <h1 className="font-display text-[38px] sm:text-[54px] lg:text-[76px] font-bold tracking-[-0.03em] text-brand-text-primary leading-[0.98]">
                SEARCH <br />
                <span className="text-brand-accent">FORWARD</span>
              </h1>
              <div className="font-mono text-[13px] tracking-[0.2em] text-brand-text-muted uppercase">
                AI SEARCH STRATEGIST
              </div>
            </div>

            {/* Supporting Positioning Statement */}
            <p className="text-[18px] sm:text-[20px] text-brand-text-secondary leading-[1.6] font-sans max-w-xl font-normal">
              I research how people, businesses and information are discovered across modern search.
            </p>

            {/* Editorial CTAs */}
            <div className="pt-[8px] flex flex-wrap items-center gap-[16px]">
              <Button
                href="#research"
                variant="primary"
                size="lg"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Explore Research
              </Button>
              <Button
                href="#search-lab"
                variant="secondary"
                size="lg"
                icon={<Compass className="w-4 h-4 text-brand-accent" />}
              >
                AI Search Lab
              </Button>
            </div>
          </div>

          {/* Right Column (7 Cols Desktop) — Living Knowledge Graph */}
          <div className="lg:col-span-7">
            <AISearchUniverseGraph />
          </div>

        </div>
      </Container>
    </section>
  );
};
