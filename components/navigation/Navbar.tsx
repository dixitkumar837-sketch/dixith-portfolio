"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { KnowledgeNodeLogo } from "./KnowledgeNodeLogo";
import { NAV_ITEMS } from "@/data/navigation";
import { cn } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-brand-bg/80 backdrop-blur-md border-b border-brand-border/60 py-[14px]"
          : "bg-transparent py-[24px]"
      )}
    >
      <Container>
        <div className="flex items-center justify-between">
          {/* Brand Mark */}
          <Link
            href="/"
            aria-label="DIXITH — Home"
            className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded-sm"
          >
            <KnowledgeNodeLogo size={26} />
          </Link>

          {/* Editorial Desktop Navigation */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-[20px] lg:gap-[28px] xl:gap-[32px]"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[13px] font-sans font-medium text-brand-text-secondary hover:text-brand-text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded-sm py-1 relative group tracking-[0.01em]"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-[6px] text-[9px] font-mono font-medium px-[6px] py-[1.5px] bg-brand-accent/15 text-brand-accent-hover rounded-pill border border-brand-accent/25 tracking-widest uppercase align-middle">
                    {item.badge}
                  </span>
                )}
                <span className="absolute -bottom-1 left-0 right-0 h-[1px] bg-brand-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>
            ))}
          </nav>

          {/* Right Directional Action */}
          <div className="hidden md:flex items-center gap-[10px]">
            <Link
              href="/search"
              aria-label="Search DIXITH Knowledge Base"
              className="p-[7px] text-brand-text-secondary hover:text-brand-text-primary hover:border-brand-accent/50 rounded-interactive border border-brand-border/70 bg-brand-surface/40 hover:bg-brand-surface/80 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent"
            >
              <Search className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="#connect"
              className="group inline-flex items-center gap-[6px] text-[13px] font-mono font-medium text-brand-text-primary hover:text-brand-accent transition-colors py-[6px] px-[12px] rounded-interactive border border-brand-border/70 hover:border-brand-accent/50 bg-brand-surface/40 hover:bg-brand-surface/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent"
            >
              <span>Connect</span>
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>

          {/* Mobile Menu & Search Button */}
          <div className="flex md:hidden items-center gap-[8px]">
            <Link
              href="/search"
              aria-label="Search DIXITH Knowledge Base"
              className="p-[9px] min-h-[40px] min-w-[40px] flex items-center justify-center text-brand-text-secondary hover:text-brand-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded-interactive border border-brand-border/60 bg-brand-surface/60 transition-colors"
            >
              <Search className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-[9px] min-h-[40px] min-w-[40px] flex items-center justify-center text-brand-text-secondary hover:text-brand-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded-interactive border border-brand-border/60 bg-brand-surface/60 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-bg-secondary/95 backdrop-blur-xl border-b border-brand-border px-[20px] py-[20px] space-y-[16px] animate-in fade-in slide-in-from-top-2 duration-200">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-[4px]">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-[15px] font-sans font-medium text-brand-text-primary py-[10px] px-[12px] hover:bg-brand-surface/80 rounded-md transition-colors"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-mono px-[7px] py-[2px] bg-brand-accent/15 text-brand-accent-hover rounded-pill border border-brand-accent/25">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="pt-[14px] border-t border-brand-border/60 space-y-2">
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between w-full text-[14px] font-mono font-medium text-brand-text-primary bg-brand-surface border border-brand-border/80 px-[16px] py-[10px] rounded-interactive hover:border-brand-accent/50"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-brand-accent" />
                <span>Search Knowledge Base</span>
              </div>
              <span className="font-mono text-[11px] text-brand-text-muted">/search</span>
            </Link>
            <Link
              href="#connect"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between w-full text-[14px] font-mono font-medium text-brand-text-primary bg-brand-surface border border-brand-border/80 px-[16px] py-[10px] rounded-interactive hover:border-brand-accent/50"
            >
              <span>Connect</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
