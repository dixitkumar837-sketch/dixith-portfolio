import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/site-config";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/lib/schema";
import { AskDixithShell } from "@/components/ask-dixith/AskDixithShell";
import { ChevronRight, Sparkles, BookOpen } from "lucide-react";

interface AskDixithPageProps {
  searchParams?: {
    q?: string;
  };
}

export const metadata: Metadata = {
  title: "Ask DIXITH — Search the DIXITH Knowledge Base",
  description:
    "A research-grounded interface for exploring published DIXITH knowledge, professional experience, and empirical research.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/ask-dixith`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    url: `${SITE_CONFIG.url}/ask-dixith`,
    title: "Ask DIXITH — Search the DIXITH Knowledge Base | DIXITH",
    description:
      "A research-grounded interface for exploring published DIXITH knowledge, professional experience, and empirical research.",
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ask DIXITH — Search the DIXITH Knowledge Base | DIXITH",
    description:
      "A research-grounded interface for exploring published DIXITH knowledge, professional experience, and empirical research.",
  },
};

export default function AskDixithPage({ searchParams }: AskDixithPageProps) {
  const initialQuery = searchParams?.q || "";

  const breadcrumbs = [
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Ask DIXITH", url: `${SITE_CONFIG.url}/ask-dixith` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const webPageSchema = generateWebPageSchema({
    title: "Ask DIXITH — Search the DIXITH Knowledge Base | DIXITH",
    description:
      "A research-grounded interface for exploring published DIXITH knowledge, professional experience, and empirical research.",
    url: `${SITE_CONFIG.url}/ask-dixith`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <div className="pt-28 md:pt-36 pb-20 md:pb-28">
        <Container>
          {/* Breadcrumb Navigation */}
          <nav
            aria-label="Breadcrumbs"
            className="flex items-center gap-2 text-[12px] font-mono text-brand-text-muted mb-8"
          >
            <Link
              href="/"
              className="hover:text-brand-text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded-sm"
            >
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
            <span className="text-brand-text-secondary" aria-current="page">
              Ask DIXITH
            </span>
          </nav>

          {/* Research Header */}
          <header className="max-w-[960px] mx-auto text-center space-y-4 mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-surface/60 border border-brand-border text-brand-accent-text text-[11px] font-mono tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Knowledge Engine</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-brand-text-primary">
              ASK DIXITH
            </h1>

            <p className="text-lg md:text-xl font-sans text-brand-text-secondary max-w-xl mx-auto">
              Search the DIXITH knowledge base.
            </p>

            <p className="text-sm font-sans text-brand-text-muted max-w-md mx-auto">
              Research-grounded answers synthesized from published DIXITH knowledge,
              methodology specifications, and clinical information architectures.
            </p>
          </header>

          {/* Interactive Client Shell */}
          <section aria-label="Ask DIXITH Interactive Console">
            <AskDixithShell initialQuery={initialQuery} />
          </section>
        </Container>
      </div>
    </>
  );
}
