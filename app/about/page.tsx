import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/site-config";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
} from "@/lib/schema";
import {
  ArrowRight,
  ChevronRight,
  User,
  FlaskConical,
  BookOpen,
  Briefcase,
  Layers,
  Cpu,
  Globe2,
  Search,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Code2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Dixith Kumar — AI Search Strategist | Search Forward",
  description:
    "Dixith Kumar is an AI Search Strategist researching how people, businesses, and information are discovered across modern search, RAG pipelines, and AI answer engines.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/about`,
  },
  openGraph: {
    type: "website",
    url: `${SITE_CONFIG.url}/about`,
    title: "About Dixith Kumar — AI Search Strategist | DIXITH",
    description:
      "Researching how people, businesses, and information are discovered across modern search.",
    siteName: SITE_CONFIG.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "About Dixith Kumar — AI Search Strategist | DIXITH",
    description:
      "Researching how people, businesses, and information are discovered across modern search.",
  },
};

export default function AboutPage() {
  const breadcrumbs = [
    { name: "Home", url: SITE_CONFIG.url },
    { name: "About", url: `${SITE_CONFIG.url}/about` },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const webPageSchema = generateWebPageSchema({
    title: "About Dixith Kumar — AI Search Strategist | DIXITH",
    description:
      "Researching how people, businesses, and information are discovered across modern search.",
    url: `${SITE_CONFIG.url}/about`,
  });

  const benchmarkSystems = [
    "Google AI Overview",
    "ChatGPT",
    "Perplexity",
    "Claude",
    "Gemini",
    "Microsoft Copilot",
  ];

  const practiceAreas = [
    {
      num: "01",
      title: "AI Search Strategy",
      description:
        "Building visibility models for generative answer engines, AI overviews, and LLM search discovery.",
    },
    {
      num: "02",
      title: "Enterprise SEO",
      description:
        "Architecting complex, large-scale technical search systems and multi-domain web footprints.",
    },
    {
      num: "03",
      title: "Technical SEO",
      description:
        "Optimizing crawling budgets, site architecture, rendering pipelines, and structured data schemas.",
    },
    {
      num: "04",
      title: "AEO + GEO",
      description:
        "Answer Engine Optimization & Generative Engine Optimization targeting LLM citations and RAG retrieval.",
    },
    {
      num: "05",
      title: "International SEO",
      description:
        "Managing multi-regional hreflang structures, global entity mapping, and localized search discovery.",
    },
    {
      num: "06",
      title: "Search Experience",
      description:
        "Aligning user search intent, performance metrics, and seamless discovery interface design.",
    },
  ];

  const independentBuilds = [
    {
      title: "AI Search Lab Testing Framework",
      type: "Research System",
      description:
        "Multi-engine retrieval scoring matrices and query vector suites evaluating factual accuracy, citation anchor density, and entity grounding across 6 major AI engines.",
      link: "/ai-search-lab",
    },
    {
      title: "Information Discovery Architectures",
      type: "Technical Framework",
      description:
        "Hierarchical Schema.org taxonomy models and localized entity relationship graphs designed to establish unambiguous machine readability.",
      link: "/research",
    },
    {
      title: "Interactive AI Search Universe",
      type: "Visualization Prototype",
      description:
        "Interactive architectural map depicting the five stages of modern information retrieval from web crawling to direct generative synthesis.",
      link: "/#search-universe",
    },
    {
      title: "Machine-Readable Discovery Endpoints",
      type: "LLM Infrastructure",
      description:
        "Standardized llms.txt protocol implementation enabling autonomous AI research agents to parse structured entity definitions efficiently.",
      link: "/llms.txt",
    },
  ];

  return (
    <div className="pt-[88px] pb-[64px] sm:pt-[96px] sm:pb-[80px] md:pt-[112px] md:pb-[96px] lg:pt-[128px] lg:pb-[128px]">
      {/* Structured Data: Breadcrumbs + WebPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <Container>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-[24px] sm:mb-[32px]">
          <ol className="flex items-center space-x-2 font-mono text-[12px] text-brand-text-muted">
            <li>
              <Link
                href="/"
                className="hover:text-brand-text-primary transition-colors focus-visible:outline-brand-accent"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
            </li>
            <li aria-current="page" className="text-brand-accent font-semibold">
              About
            </li>
          </ol>
        </nav>

        {/* 01 — INTRODUCTION */}
        <header className="mb-[48px] sm:mb-[64px] md:mb-[80px] border-b border-brand-border pb-[40px] sm:pb-[56px]">
          <div className="flex items-center gap-2 mb-[14px] sm:mb-[16px]">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse shrink-0" />
            <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider text-brand-accent uppercase">
              AI SEARCH STRATEGIST · SEARCH FORWARD
            </span>
          </div>

          <h1 className="font-display text-[36px] sm:text-[48px] md:text-[64px] font-bold text-brand-text-primary tracking-tight leading-[1.15] mb-[20px] sm:mb-[24px]">
            Dixith Kumar
          </h1>

          <p className="text-[17px] sm:text-[20px] md:text-[24px] text-brand-text-secondary leading-relaxed max-w-3xl mb-[28px] sm:mb-[32px]">
            Researching how people, businesses, and information are discovered
            across modern search.
          </p>

          {/* Core Entity Positioning (AEO Direct Answers) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 pt-[20px] sm:pt-[24px] border-t border-brand-border-subtle">
            <div className="space-y-1 sm:space-y-1.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-brand-accent block font-semibold">
                WHO IS DIXITH KUMAR?
              </span>
              <p className="text-[14px] text-brand-text-secondary leading-relaxed">
                An AI Search Strategist focused on technical SEO, search
                systems architecture, and emerging AI discovery experiences.
              </p>
            </div>
            <div className="space-y-1 sm:space-y-1.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-brand-accent block font-semibold">
                WHAT DOES HE DO?
              </span>
              <p className="text-[14px] text-brand-text-secondary leading-relaxed">
                Investigates how search systems retrieve, cite, and synthesize
                information across traditional search and generative engines.
              </p>
            </div>
            <div className="space-y-1 sm:space-y-1.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-brand-accent block font-semibold">
                WHAT IS DIXITH?
              </span>
              <p className="text-[14px] text-brand-text-secondary leading-relaxed">
                The independent personal research and strategic identity
                dedicated to modern search architecture and entity trust.
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Main Editorial Narrative (8 cols) */}
          <div className="lg:col-span-8 space-y-[56px] sm:space-y-[64px] lg:space-y-[80px]">
            {/* 02 — HOW I THINK */}
            <section
              id="philosophy"
              aria-labelledby="heading-how-i-think"
              className="scroll-mt-[80px] md:scroll-mt-[100px] space-y-[20px] sm:space-y-[24px]"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] text-brand-accent font-semibold">02.</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-brand-text-muted">
                  FOUNDATIONAL FRAMEWORK
                </span>
              </div>

              <h2
                id="heading-how-i-think"
                className="font-display text-[24px] sm:text-[30px] md:text-[36px] font-bold text-brand-text-primary tracking-tight leading-tight break-words"
              >
                Search Forward Philosophy
              </h2>

              {/* Operating Philosophy Quote */}
              <div className="bg-brand-surface/60 border border-brand-border p-[20px] sm:p-[24px] rounded-lg">
                <div className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-brand-accent mb-[6px] font-semibold">
                  OPERATING PRINCIPLE
                </div>
                <p className="font-display text-[19px] sm:text-[22px] md:text-[24px] font-bold text-brand-text-primary leading-snug">
                  &quot;{SITE_CONFIG.philosophy}&quot;
                </p>
              </div>

              {/* Paradigm Shift Flow */}
              <div className="bg-brand-surface/30 border border-brand-border rounded-xl p-[20px] sm:p-[24px] space-y-[20px]">
                <div className="font-mono text-[11px] uppercase tracking-wider text-brand-text-muted font-semibold">
                  THE DISCOVERY PARADIGM SHIFT:
                </div>

                {/* Mobile Paradigm Flow (sm:hidden) */}
                <div className="grid grid-cols-1 gap-1.5 font-mono text-[12px] text-brand-text-primary sm:hidden">
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded bg-brand-surface border border-brand-border">
                    <span className="text-brand-text-muted text-[10px]">STAGE 01</span>
                    <span className="font-medium tracking-wider">SEARCH</span>
                  </div>
                  <div className="flex justify-center text-brand-accent text-[12px] py-0.5">↓</div>
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded bg-brand-surface border border-brand-border">
                    <span className="text-brand-text-muted text-[10px]">STAGE 02</span>
                    <span className="font-medium tracking-wider">DISCOVERY</span>
                  </div>
                  <div className="flex justify-center text-brand-accent text-[12px] py-0.5">↓</div>
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded bg-brand-surface border border-brand-border">
                    <span className="text-brand-text-muted text-[10px]">STAGE 03</span>
                    <span className="font-medium tracking-wider">KNOWLEDGE</span>
                  </div>
                  <div className="flex justify-center text-brand-accent text-[12px] py-0.5">↓</div>
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded bg-brand-accent/15 border border-brand-accent/40 text-brand-accent">
                    <span className="text-brand-accent/70 text-[10px]">STAGE 04</span>
                    <span className="font-semibold tracking-wider">ANSWERS</span>
                  </div>
                </div>

                {/* Desktop Paradigm Flow (hidden sm:flex) */}
                <div className="hidden sm:flex flex-wrap items-center gap-3 font-mono text-[12px] text-brand-text-primary">
                  <span className="px-3 py-1.5 rounded bg-brand-surface border border-brand-border">
                    SEARCH
                  </span>
                  <span className="text-brand-accent">→</span>
                  <span className="px-3 py-1.5 rounded bg-brand-surface border border-brand-border">
                    DISCOVERY
                  </span>
                  <span className="text-brand-accent">→</span>
                  <span className="px-3 py-1.5 rounded bg-brand-surface border border-brand-border">
                    KNOWLEDGE
                  </span>
                  <span className="text-brand-accent">→</span>
                  <span className="px-3 py-1.5 rounded bg-brand-accent/20 border border-brand-accent/40 text-brand-accent font-semibold">
                    ANSWERS
                  </span>
                </div>

                <p className="text-[14px] sm:text-[15px] text-brand-text-secondary leading-relaxed">
                  Traditional search has historically focused heavily on ranking
                  web pages for specific keyword queries. Modern discovery
                  increasingly involves interconnected search systems, entity
                  relationships, vector retrieval, direct citations, automated
                  recommendations, and AI-generated answers.
                </p>
                <p className="text-[14px] sm:text-[15px] text-brand-text-secondary leading-relaxed">
                  Search Forward represents a strategic commitment to studying
                  how these retrieval layers operate, ensuring information
                  architecture remains robust, authoritative, and discoverable
                  whether queried by human users or synthesized by machine
                  models.
                </p>
              </div>
            </section>

            {/* 03 — AREAS OF PRACTICE */}
            <section
              id="practices"
              aria-labelledby="heading-practices"
              className="scroll-mt-[80px] md:scroll-mt-[100px] space-y-[20px] sm:space-y-[24px]"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] text-brand-accent font-semibold">03.</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-brand-text-muted">
                  CAPABILITIES &amp; SPECIALIZATIONS
                </span>
              </div>

              <h2
                id="heading-practices"
                className="font-display text-[24px] sm:text-[30px] md:text-[36px] font-bold text-brand-text-primary tracking-tight leading-tight break-words"
              >
                Areas of Practice
              </h2>

              <p className="text-[14px] sm:text-[15px] text-brand-text-secondary leading-relaxed">
                Core domain focus bridging traditional search infrastructure
                and generative AI retrieval systems:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {practiceAreas.map((item) => (
                  <div
                    key={item.num}
                    className="bg-brand-surface/40 border border-brand-border rounded-lg p-[18px] sm:p-[20px] space-y-2 hover:border-brand-accent/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-brand-accent font-semibold">
                        {item.num}
                      </span>
                      <Badge variant="outline" size="sm">
                        Practice
                      </Badge>
                    </div>
                    <h3 className="font-display text-[16px] font-bold text-brand-text-primary">
                      {item.title}
                    </h3>
                    <p className="text-[13px] text-brand-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 04 — WHAT I RESEARCH */}
            <section
              id="research"
              aria-labelledby="heading-research"
              className="scroll-mt-[80px] md:scroll-mt-[100px] space-y-[20px] sm:space-y-[24px]"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] text-brand-accent font-semibold">04.</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-brand-text-muted">
                  INDEPENDENT INQUIRY
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
                <div>
                  <h2
                    id="heading-research"
                    className="font-display text-[24px] sm:text-[30px] md:text-[36px] font-bold text-brand-text-primary tracking-tight leading-tight break-words"
                  >
                    What I Research
                  </h2>
                  <p className="text-[14px] sm:text-[15px] text-brand-text-secondary mt-1 max-w-xl">
                    Empirical inquiry into information retrieval mechanisms,
                    knowledge graphs, and AI citation grounding.
                  </p>
                </div>

                <Link
                  href="/research"
                  className="inline-flex items-center gap-2 font-mono text-[12px] text-brand-accent hover:text-brand-accent-hover transition-colors focus-visible:outline-brand-accent shrink-0 pt-1 md:pt-0"
                >
                  <span>Explore Research Archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-brand-surface/30 border border-brand-border rounded-xl p-[20px] sm:p-[24px] space-y-4 text-[14px] text-brand-text-secondary leading-relaxed">
                <p>
                  Research initiatives explore the transition from traditional
                  document ranking to entity-driven answers:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-[12px]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    <span>AI Search &amp; Generative Retrieval</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    <span>Technical &amp; Enterprise SEO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    <span>Answer Engine Optimization (AEO)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    <span>Generative Engine Optimization (GEO)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    <span>Search Systems Architecture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    <span>Entity Search &amp; Knowledge Graphs</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 05 — WHAT I TEST */}
            <section
              id="testing"
              aria-labelledby="heading-testing"
              className="scroll-mt-[80px] md:scroll-mt-[100px] space-y-[20px] sm:space-y-[24px]"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] text-brand-accent font-semibold">05.</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-brand-text-muted">
                  EMPIRICAL BENCHMARKING
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
                <div>
                  <h2
                    id="heading-testing"
                    className="font-display text-[24px] sm:text-[30px] md:text-[36px] font-bold text-brand-text-primary tracking-tight leading-tight break-words"
                  >
                    What I Test — AI Search Lab
                  </h2>
                  <p className="text-[14px] sm:text-[15px] text-brand-text-secondary mt-1 max-w-xl">
                    Controlled multi-engine testing across 6 commercial AI
                    answer systems.
                  </p>
                </div>

                <Link
                  href="/ai-search-lab"
                  className="inline-flex items-center gap-2 font-mono text-[12px] text-brand-accent hover:text-brand-accent-hover transition-colors focus-visible:outline-brand-accent shrink-0 pt-1 md:pt-0"
                >
                  <span>Enter AI Search Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-brand-surface/30 border border-brand-border rounded-xl p-[20px] sm:p-[24px] space-y-4">
                <p className="text-[14px] sm:text-[15px] text-brand-text-secondary leading-relaxed">
                  The AI Search Lab evaluates output divergence, citation
                  sourcing, and entity confidence using standardized query
                  vectors across 6 benchmark systems:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {benchmarkSystems.map((sys) => (
                    <span
                      key={sys}
                      className="font-mono text-[11px] px-2.5 py-1 bg-brand-surface border border-brand-border rounded-sm text-brand-text-primary"
                    >
                      {sys}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* 06 — PROFESSIONAL EXPERIENCE */}
            <section
              id="experience"
              aria-labelledby="heading-experience"
              className="scroll-mt-[80px] md:scroll-mt-[100px] space-y-[20px] sm:space-y-[24px]"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] text-brand-accent font-semibold">06.</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-brand-text-muted">
                  FIELD BACKGROUND
                </span>
              </div>

              <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-4">
                <div>
                  <h2
                    id="heading-experience"
                    className="font-display text-[24px] sm:text-[30px] md:text-[36px] font-bold text-brand-text-primary tracking-tight leading-tight break-words"
                  >
                    Professional Experience
                  </h2>
                  <p className="text-[14px] sm:text-[15px] text-brand-text-secondary mt-1 max-w-xl">
                    Technical responsibilities and architectures developed
                    through professional employment.
                  </p>
                </div>

                <Link
                  href="/professional-experience"
                  className="inline-flex items-center gap-2 font-mono text-[12px] text-brand-accent hover:text-brand-accent-hover transition-colors focus-visible:outline-brand-accent shrink-0 pt-1 md:pt-0"
                >
                  <span>Review Professional Experience</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="bg-brand-surface/30 border border-brand-border rounded-xl p-[20px] sm:p-[24px] space-y-4 text-[14px] text-brand-text-secondary leading-relaxed">
                <p>
                  Professional experience developed through employment covers
                  search strategy, technical SEO, enterprise discovery,
                  healthcare search, and e-commerce ecosystems.
                </p>
                <div className="flex items-start gap-2.5 pt-2 text-[13px] text-brand-text-muted border-t border-brand-border-subtle">
                  <ShieldCheck className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
                  <span>
                    Professional engagements reflect skills and responsibilities
                    developed through employment, distinct from independent
                    DIXITH research. Specific client and commercial details are
                    intentionally omitted.
                  </span>
                </div>
              </div>
            </section>

            {/* 07 — WHAT I BUILD */}
            <section
              id="builds"
              aria-labelledby="heading-builds"
              className="scroll-mt-[80px] md:scroll-mt-[100px] space-y-[20px] sm:space-y-[24px]"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] text-brand-accent font-semibold">07.</span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-brand-text-muted">
                  TECHNICAL SYSTEMS &amp; PROTOTYPES
                </span>
              </div>

              <h2
                id="heading-builds"
                className="font-display text-[24px] sm:text-[30px] md:text-[36px] font-bold text-brand-text-primary tracking-tight leading-tight break-words"
              >
                What I Build
              </h2>

              <p className="text-[14px] sm:text-[15px] text-brand-text-secondary leading-relaxed">
                Independent technical artifacts, testing frameworks, and
                machine-readable prototypes built for search research:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {independentBuilds.map((build) => (
                  <div
                    key={build.title}
                    className="bg-brand-surface/40 border border-brand-border rounded-lg p-[18px] sm:p-[20px] space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[11px] text-brand-accent font-semibold">
                          {build.type}
                        </span>
                      </div>
                      <h3 className="font-display text-[16px] font-bold text-brand-text-primary mb-2">
                        {build.title}
                      </h3>
                      <p className="text-[13px] text-brand-text-secondary leading-relaxed">
                        {build.description}
                      </p>
                    </div>

                    <div className="pt-3">
                      <Link
                        href={build.link}
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-brand-accent hover:text-brand-accent-hover transition-colors"
                      >
                        <span>View Resource</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar / Portrait & Connect (4 cols) */}
          <aside className="lg:col-span-4 space-y-[24px] sm:space-y-[32px]">
            {/* 08 — PERSONAL PORTRAIT CONTAINER */}
            <section
              id="portrait"
              aria-labelledby="heading-portrait"
              className="scroll-mt-[80px] md:scroll-mt-[100px]"
            >
              <div className="bg-brand-surface border border-brand-border rounded-xl p-[20px] sm:p-[24px] flex flex-col justify-between overflow-hidden shadow-xl space-y-[16px] sm:space-y-[20px]">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" size="sm">
                    Executive Portrait Slot
                  </Badge>
                  <User className="w-4 h-4 text-brand-text-muted" />
                </div>

                {/* Portrait Placeholder Frame */}
                <div className="py-[28px] sm:py-[36px] px-[16px] sm:px-[20px] bg-brand-surface-raised/40 border border-dashed border-brand-border rounded-lg flex flex-col items-center justify-center text-center">
                  <div className="w-[84px] h-[84px] sm:w-[100px] sm:h-[100px] rounded-full bg-brand-bg border border-brand-border flex items-center justify-center mb-[14px] sm:mb-[16px] text-brand-accent font-display text-[22px] sm:text-[26px] font-bold shadow-inner">
                    DK
                  </div>
                  <h3
                    id="heading-portrait"
                    className="font-display text-[17px] sm:text-[18px] font-bold text-brand-text-primary"
                  >
                    Dixith Kumar
                  </h3>
                  <p className="font-mono text-[12px] text-brand-accent mt-[3px] sm:mt-[4px]">
                    AI Search Strategist
                  </p>
                  <span className="font-mono text-[11px] text-brand-text-muted mt-[2px]">
                    Search Forward
                  </span>
                </div>

                <div className="pt-[12px] sm:pt-[14px] border-t border-brand-border-subtle font-mono text-[10px] text-brand-text-muted text-center leading-normal">
                  IMAGE CONTAINER: Reserved for professional portrait asset
                </div>
              </div>
            </section>

            {/* Quick Operating Principles */}
            <div className="bg-brand-surface border border-brand-border rounded-xl p-[20px] sm:p-[24px] space-y-[16px]">
              <h3 className="font-mono text-[11px] font-semibold tracking-wider text-brand-accent uppercase pb-3 border-b border-brand-border-subtle">
                CORE PRINCIPLES
              </h3>
              <ul className="space-y-2.5 text-[13px] text-brand-text-secondary leading-relaxed font-sans">
                {SITE_CONFIG.principles.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-accent mt-1 shrink-0" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 09 — CONNECT */}
            <section
              id="connect"
              aria-labelledby="heading-connect"
              className="scroll-mt-[80px] md:scroll-mt-[100px] bg-brand-surface border border-brand-border rounded-xl p-[20px] sm:p-[24px] space-y-[18px] sm:space-y-[20px]"
            >
              <h3
                id="heading-connect"
                className="font-mono text-[11px] font-semibold tracking-wider text-brand-accent uppercase pb-3 border-b border-brand-border-subtle"
              >
                DIRECT CHANNELS &amp; INQUIRIES
              </h3>

              <p className="text-[13px] text-brand-text-secondary leading-relaxed">
                Open to discussions regarding technical search architecture, AI
                retrieval research, and strategic collaboration.
              </p>

              <div className="space-y-2.5">
                <a
                  href={SITE_CONFIG.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-between font-mono text-[12px] text-brand-text-primary hover:text-brand-accent min-h-[44px] py-2.5 px-3.5 rounded border border-brand-border hover:border-brand-accent/50 bg-brand-surface-raised transition-colors focus-visible:outline-brand-accent"
                >
                  <span className="flex items-center gap-2">
                    <span>LinkedIn (Primary)</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-brand-text-muted" />
                </a>

                <a
                  href={SITE_CONFIG.socials.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-between font-mono text-[12px] text-brand-text-primary hover:text-brand-accent min-h-[44px] py-2.5 px-3.5 rounded border border-brand-border hover:border-brand-accent/50 bg-brand-surface-raised transition-colors focus-visible:outline-brand-accent"
                >
                  <span className="flex items-center gap-2">
                    <span>WhatsApp Direct</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-brand-text-muted" />
                </a>

                <a
                  href={SITE_CONFIG.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-between font-mono text-[12px] text-brand-text-muted hover:text-brand-text-primary min-h-[44px] py-2.5 px-3.5 rounded border border-transparent hover:border-brand-border-subtle transition-colors focus-visible:outline-brand-accent"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-brand-text-muted" />
                </a>
              </div>
            </section>
          </aside>
        </div>
      </Container>
    </div>
  );
}
