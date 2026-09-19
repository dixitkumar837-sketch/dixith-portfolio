import React from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BRAND_CONFIG } from "@/data/navigation";
import { Linkedin, MessageSquare, ArrowRight } from "lucide-react";

export const ConnectSection: React.FC = () => {
  return (
    <section id="connect" className="py-[96px] md:py-[128px] bg-brand-bg-secondary border-t border-brand-border">
      <Container>
        <div className="bg-gradient-to-b from-brand-surface to-brand-bg-secondary border border-brand-border rounded-lg p-[36px] sm:p-[64px] text-center max-w-4xl mx-auto space-y-[32px] shadow-2xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-brand-accent/15 blur-[90px] pointer-events-none rounded-full" />

          <div className="font-mono text-[12px] uppercase tracking-widest text-brand-accent">
            EXECUTIVE & STRATEGIC INQUIRIES
          </div>

          <h2 className="font-display text-[32px] sm:text-[44px] md:text-[52px] font-bold text-brand-text-primary tracking-tight leading-[1.1]">
            HAVE A SEARCH PROBLEM <br className="hidden sm:inline" />
            WORTH EXPLORING?
          </h2>

          <p className="text-[16px] sm:text-[18px] text-brand-text-secondary leading-relaxed font-sans max-w-2xl mx-auto">
            Direct collaboration on AI search strategy, technical SEO architecture, answer engine optimization, and generative discovery frameworks.
          </p>

          <div className="pt-[16px] flex flex-wrap items-center justify-center gap-[16px]">
            <Button
              href={BRAND_CONFIG.socials.linkedIn}
              variant="primary"
              size="lg"
              icon={<Linkedin className="w-5 h-5" />}
              iconPosition="left"
              target="_blank"
              rel="noopener noreferrer"
            >
              Connect on LinkedIn
            </Button>
            <Button
              href={BRAND_CONFIG.socials.whatsApp}
              variant="secondary"
              size="lg"
              icon={<MessageSquare className="w-5 h-5 text-brand-success" />}
              iconPosition="left"
              target="_blank"
              rel="noopener noreferrer"
            >
              Direct Message via WhatsApp
            </Button>
          </div>

          <div className="pt-[16px] font-mono text-[12px] text-brand-text-muted">
            PREFERRED CHANNELS: LINKEDIN · WHATSAPP
          </div>
        </div>
      </Container>
    </section>
  );
};
