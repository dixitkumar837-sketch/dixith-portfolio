import React from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Network } from "lucide-react";

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-[120px] md:pt-[160px] pb-[80px] md:pb-[128px] overflow-hidden">
      {/* Background ambient lighting subtle accent blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-accent/10 blur-[140px] pointer-events-none rounded-full" />

      <Container>
        {/* 5 / 7 Column Grid Relationship */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-[48px] lg:gap-[32px] items-center">
          
          {/* Left Column (5 Cols Desktop) - Content */}
          <div className="lg:col-span-5 space-y-[24px]">
            <Badge variant="active" size="md">
              RESEARCH · STRATEGY · EXPERIMENTATION
            </Badge>

            <div className="space-y-[12px]">
              <h1 className="font-display text-[48px] sm:text-[64px] lg:text-[72px] font-bold tracking-tight text-brand-text-primary leading-[1.05]">
                SEARCH <br />
                <span className="text-brand-accent">FORWARD</span>
              </h1>
              <p className="font-mono text-[14px] uppercase tracking-widest text-brand-text-muted">
                AI SEARCH STRATEGIST
              </p>
            </div>

            <p className="text-[18px] sm:text-[20px] text-brand-text-secondary leading-relaxed font-sans max-w-xl">
              &quot;I research how people, businesses and information are discovered across modern search.&quot;
            </p>

            <div className="pt-[12px] flex flex-wrap items-center gap-[16px]">
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
                icon={<Network className="w-4 h-4 text-brand-accent" />}
              >
                AI Search Lab
              </Button>
            </div>
          </div>

          {/* Right Column (7 Cols Desktop) - Visual Placeholder Architecture */}
          <div className="lg:col-span-7">
            <div className="relative w-full aspect-[4/3] bg-brand-surface/40 border border-brand-border/80 rounded-lg p-[24px] sm:p-[32px] flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-sm group hover:border-brand-accent/40 transition-colors">
              {/* Header Label */}
              <div className="flex items-center justify-between border-b border-brand-border-subtle pb-[16px]">
                <div className="flex items-center gap-[10px]">
                  <span className="w-[8px] h-[8px] rounded-full bg-brand-accent animate-pulse" />
                  <span className="font-mono text-[12px] uppercase tracking-widest text-brand-text-secondary">
                    AI Search Universe — Knowledge Graph Architecture
                  </span>
                </div>
                <Badge variant="outline" size="sm">Phase 1 Placeholder</Badge>
              </div>

              {/* Conceptual Node Grid Network Graphic Placeholder */}
              <div className="relative my-[24px] flex-1 flex flex-col justify-center items-center">
                {/* Node Graph Concept Mockup Nodes */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-[16px] sm:gap-[20px] w-full max-w-lg">
                  {[
                    "Users",
                    "User Intent",
                    "Google",
                    "ChatGPT",
                    "Gemini",
                    "Claude",
                    "Perplexity",
                    "Entities",
                    "Content",
                    "Authority",
                    "Citations",
                  ].map((node, i) => (
                    <div
                      key={node}
                      className="bg-brand-bg/80 border border-brand-border hover:border-brand-accent/60 p-[10px] rounded-md text-center transition-all duration-200"
                    >
                      <div className="font-mono text-[11px] text-brand-text-secondary font-medium">
                        {node}
                      </div>
                      <div className="text-[9px] font-mono text-brand-text-muted mt-[2px]">
                        [Node #{i + 1}]
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subtitle / Footer Note */}
              <div className="border-t border-brand-border-subtle pt-[12px] flex items-center justify-between text-[12px] font-mono text-brand-text-muted">
                <span>SYSTEM: Multi-Node Retrieval Graph</span>
                <span>STATUS: Interactive Engine Architecture Pending</span>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
};
