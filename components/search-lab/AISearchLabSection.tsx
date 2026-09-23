import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LAB_EXPERIMENTS } from "@/data/experiments";
import { FlaskConical, ArrowRight, CheckCircle2 } from "lucide-react";

export const AISearchLabSection: React.FC = () => {
  return (
    <section id="search-lab" className="py-[96px] md:py-[128px] bg-brand-bg-secondary/70 border-y border-brand-border">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-[48px] gap-[16px]">
          <div>
            <div className="flex items-center gap-[10px] mb-[12px]">
              <FlaskConical className="w-5 h-5 text-brand-accent" />
              <span className="font-mono text-[12px] uppercase tracking-widest text-brand-accent">
                LIVE EXPERIMENTATION PLATFORM
              </span>
            </div>
            <h2 className="font-display text-[32px] sm:text-[40px] md:text-[44px] font-bold text-brand-text-primary tracking-tight">
              AI SEARCH LAB
            </h2>
          </div>
          <div className="flex items-center gap-[8px]">
            <span className="w-[10px] h-[10px] rounded-full bg-brand-success animate-ping" />
            <span className="font-mono text-[12px] uppercase tracking-widest text-brand-success font-semibold">
              ACTIVE EXPERIMENTS
            </span>
          </div>
        </div>

        {/* Visual Distinction Banner: RESEARCH vs LAB */}
        <div className="bg-brand-surface/40 border border-brand-border-subtle p-[16px] sm:p-[20px] rounded-md mb-[32px] flex flex-col sm:flex-row sm:items-center justify-between gap-[12px] text-[13px] font-mono text-brand-text-muted">
          <div>
            <span className="text-brand-accent font-semibold">DISTINCTION: </span>
            <span>RESEARCH = What was learned · </span>
            <span className="text-brand-text-primary font-semibold">AI SEARCH LAB = What is currently being tested</span>
          </div>
          <Badge variant="outline" size="sm">Standardized Query Protocol</Badge>
        </div>

        {/* Active Experiment Card */}
        {LAB_EXPERIMENTS.map((exp) => (
          <div
            key={exp.id}
            className="bg-brand-surface border border-brand-border hover:border-brand-accent/60 rounded-lg p-[32px] md:p-[40px] transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px] pb-[24px] border-b border-brand-border-subtle">
              <div className="flex items-center gap-[12px]">
                <Badge variant="active" size="md">
                  {exp.id}
                </Badge>
                <span className="font-mono text-[12px] text-brand-success font-semibold tracking-wider flex items-center gap-[6px]">
                  <CheckCircle2 className="w-4 h-4" />
                  STATUS: {exp.status}
                </span>
              </div>
              <span className="font-mono text-[12px] text-brand-text-muted">
                ACTIVE TEST MATRIX
              </span>
            </div>

            <div className="my-[28px]">
              <h3 className="font-display text-[26px] md:text-[32px] font-bold text-brand-text-primary tracking-tight">
                {exp.title}
              </h3>
              <p className="mt-[12px] text-[16px] text-brand-text-secondary leading-relaxed font-sans max-w-3xl">
                {exp.purpose}
              </p>
            </div>

            {/* Target Systems Tested Grid */}
            <div className="pt-[20px] border-t border-brand-border-subtle">
              <div className="font-mono text-[12px] uppercase tracking-widest text-brand-text-muted mb-[16px]">
                Active Benchmark Systems:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-[12px]">
                {exp.systemsTested.map((sys) => (
                  <div
                    key={sys}
                    className="bg-brand-bg border border-brand-border px-[14px] py-[10px] rounded-md font-mono text-[12px] text-brand-text-primary text-center"
                  >
                    {sys}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-[32px] flex justify-end">
              <Button
                href={`/ai-search-lab/${exp.slug}`}
                variant="secondary"
                size="md"
                icon={<ArrowRight className="w-4 h-4" />}
                aria-label={`View protocol for experiment ${exp.id}`}
              >
                View {exp.id} Protocol &amp; Benchmark
              </Button>
            </div>
          </div>
        ))}

        <div className="mt-[40px] text-center">
          <Link
            href="/ai-search-lab"
            className="inline-flex items-center gap-[8px] font-mono text-[12px] uppercase tracking-widest text-brand-accent hover:text-brand-accent-hover font-semibold transition-colors focus-visible:outline-brand-accent"
          >
            <span>Explore AI Search Lab Environment &amp; Protocols</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
};
