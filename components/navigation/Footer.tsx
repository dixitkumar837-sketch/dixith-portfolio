import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { KnowledgeNodeLogo } from "./KnowledgeNodeLogo";
import { BRAND_CONFIG, FOOTER_LINKS } from "@/data/navigation";
import { Linkedin, Github, MessageSquare } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-bg-secondary border-t border-brand-border/80 text-brand-text-secondary py-[64px] md:py-[96px]">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-[48px] md:gap-[32px]">
          {/* Brand Column (5 cols) */}
          <div className="md:col-span-5 space-y-[24px]">
            <KnowledgeNodeLogo size={36} />
            <p className="text-[14px] text-brand-text-muted leading-relaxed max-w-sm font-sans">
              AI Search Strategist researching information discovery, search systems, and generative engine optimization.
            </p>
            <div className="font-mono text-[12px] text-brand-text-muted tracking-wider">
              {BRAND_CONFIG.philosophy}
            </div>
          </div>

          {/* Quick Links (4 cols) */}
          <div className="md:col-span-4 space-y-[16px]">
            <h3 className="font-mono text-[12px] uppercase tracking-widest text-brand-text-primary">
              Navigation
            </h3>
            <ul className="space-y-[12px]">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-brand-text-secondary hover:text-brand-text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social & Contact (3 cols) */}
          <div className="md:col-span-3 space-y-[16px]">
            <h3 className="font-mono text-[12px] uppercase tracking-widest text-brand-text-primary">
              Authority Channels
            </h3>
            <ul className="space-y-[12px]">
              <li>
                <a
                  href={BRAND_CONFIG.socials.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-[10px] text-[14px] text-brand-text-secondary hover:text-brand-text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded-sm"
                >
                  <Linkedin className="w-4 h-4 text-brand-accent" />
                  <span>LinkedIn</span>
                </a>
              </li>
              <li>
                <a
                  href={BRAND_CONFIG.socials.whatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-[10px] text-[14px] text-brand-text-secondary hover:text-brand-text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded-sm"
                >
                  <MessageSquare className="w-4 h-4 text-brand-success" />
                  <span>WhatsApp</span>
                </a>
              </li>
              <li>
                <a
                  href={BRAND_CONFIG.socials.gitHub}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-[10px] text-[14px] text-brand-text-secondary hover:text-brand-text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded-sm"
                >
                  <Github className="w-4 h-4 text-brand-text-muted" />
                  <span>GitHub</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Sub-footer Divider & Copyright */}
        <div className="mt-[64px] pt-[32px] border-t border-brand-border-subtle flex flex-col sm:flex-row items-center justify-between gap-[16px] text-[13px] text-brand-text-muted font-mono">
          <div>
            © {new Date().getFullYear()} DIXITH. {BRAND_CONFIG.tagline}. All rights reserved.
          </div>
          <div className="flex items-center gap-[24px]">
            <span>WCAG 2.2 AA Accessible</span>
            <span>Zero Tracking</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};
