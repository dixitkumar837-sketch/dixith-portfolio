"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { KnowledgeNodeLogo } from "./KnowledgeNodeLogo";
import { NAV_ITEMS } from "@/data/navigation";
import { cn } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-brand-bg/85 backdrop-blur-md border-b border-brand-border/80 py-[12px] shadow-lg shadow-black/20"
          : "bg-transparent py-[20px]"
      )}
    >
      <Container>
        <div className="flex items-center justify-between">
          {/* Left: Brand Identity */}
          <Link
            href="/"
            aria-label="DIXITH — Home"
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-sm"
          >
            <KnowledgeNodeLogo />
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-[32px]"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-[14px] font-medium text-brand-text-secondary hover:text-brand-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-sm py-1 px-2 relative group"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-[6px] text-[10px] font-mono font-semibold px-[6px] py-[1px] bg-brand-accent/20 text-brand-accent-hover rounded-pill border border-brand-accent/30">
                    {item.badge}
                  </span>
                )}
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-brand-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </Link>
            ))}
          </nav>

          {/* Right: Connect Action */}
          <div className="hidden md:flex items-center gap-[16px]">
            <Button
              href="#connect"
              variant="secondary"
              size="sm"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Connect
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-[12px]">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-[8px] text-brand-text-secondary hover:text-brand-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-interactive border border-brand-border/60 bg-brand-surface/80"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close main menu" : "Open main menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-bg-secondary/95 backdrop-blur-xl border-b border-brand-border px-[20px] py-[24px] space-y-[16px] animate-in fade-in slide-in-from-top-4 duration-200">
          <nav aria-label="Mobile Navigation" className="flex flex-col gap-[12px]">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-[16px] font-medium text-brand-text-primary py-[10px] px-[12px] hover:bg-brand-surface rounded-md transition-colors"
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[11px] font-mono px-[8px] py-[2px] bg-brand-accent/20 text-brand-accent-hover rounded-pill border border-brand-accent/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="pt-[16px] border-t border-brand-border/60">
            <Button
              href="#connect"
              variant="primary"
              size="md"
              className="w-full justify-between"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setMobileMenuOpen(false)}
            >
              Connect
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
