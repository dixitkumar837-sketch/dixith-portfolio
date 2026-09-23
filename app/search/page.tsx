import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SITE_CONFIG } from "@/lib/site-config";
import {
  searchWithMode,
  parseSearchMode,
  SearchMode,
  UnifiedSearchResult,
} from "@/lib/search/mode";
import { SearchableEntityType } from "@/lib/search";
import {
  generateBreadcrumbSchema,
  generateWebPageSchema,
} from "@/lib/schema";
import { cn } from "@/lib/utils";
import {
  Search,
  ArrowRight,
  ChevronRight,
  BookOpen,
  FlaskConical,
  FileText,
  Compass,
  Briefcase,
  HelpCircle,
  Tag,
  Sparkles,
} from "lucide-react";

interface SearchPageProps {
  searchParams?: {
    q?: string;
    type?: string;
    mode?: string;
  };
}

export const metadata: Metadata = {
  title: "Search | DIXITH",
  description:
    "Deterministic enhanced keyword search and experimental hybrid retrieval across DIXITH research protocols, experiments, articles, implementation guides, and professional experience.",
  alternates: {
    canonical: `${SITE_CONFIG.url}/search`,
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const VALID_TYPES: SearchableEntityType[] = [
  "research",
  "experiment",
  "article",
  "guide",
  "professional-experience",
];

const FILTER_OPTIONS: { label: string; value: "all" | SearchableEntityType }[] = [
  { label: "All Content", value: "all" },
  { label: "Professional Experience", value: "professional-experience" },
  { label: "Research", value: "research" },
  { label: "AI Search Lab", value: "experiment" },
  { label: "Articles", value: "article" },
  { label: "Guides", value: "guide" },
];

function getEntityBadgeVariant(type: SearchableEntityType): {
  label: string;
  icon: React.ReactNode;
} {
  switch (type) {
    case "research":
      return {
        label: "RESEARCH",
        icon: <BookOpen className="w-3 h-3 text-brand-accent" />,
      };
    case "experiment":
      return {
        label: "AI SEARCH LAB",
        icon: <FlaskConical className="w-3 h-3 text-brand-accent" />,
      };
    case "article":
      return {
        label: "ARTICLE",
        icon: <FileText className="w-3 h-3 text-brand-accent" />,
      };
    case "guide":
      return {
        label: "GUIDE",
        icon: <Compass className="w-3 h-3 text-brand-accent" />,
      };
    case "professional-experience":
      return {
        label: "PROFESSIONAL EXPERIENCE",
        icon: <Briefcase className="w-3 h-3 text-brand-accent" />,
      };
    default:
      return {
        label: "DOCUMENT",
        icon: <BookOpen className="w-3 h-3 text-brand-accent" />,
      };
  }
}

function buildSearchUrl(q: string, mode: SearchMode, type?: string): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (mode === "hybrid") params.set("mode", "hybrid");
  if (type && type !== "all") params.set("type", type);
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const rawQuery = searchParams?.q || "";
  const query = rawQuery.trim();

  const selectedMode = parseSearchMode(searchParams?.mode);
  const isHybridMode = selectedMode === "hybrid";

  const rawType = searchParams?.type;
  const selectedType: "all" | SearchableEntityType =
    rawType && VALID_TYPES.includes(rawType as SearchableEntityType)
      ? (rawType as SearchableEntityType)
      : "all";

  const searchResponse = await searchWithMode(query, {
    mode: selectedMode,
    typeFilter: selectedType,
  });

  const results: UnifiedSearchResult[] = searchResponse.results;
  const fallbackToKeyword = searchResponse.fallbackToKeyword;

  const canonicalUrl = `${SITE_CONFIG.url}/search`;

  const breadcrumbs = [
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Search", url: canonicalUrl },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);
  const webPageSchema = generateWebPageSchema({
    title: "Search | DIXITH",
    description: "Search DIXITH knowledge base.",
    url: canonicalUrl,
  });

  return (
    <main className="py-[96px] md:py-[128px]">
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
        <nav aria-label="Breadcrumb" className="mb-[32px]">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-[12px] text-brand-text-muted">
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
              Search
            </li>
          </ol>
        </nav>

        {/* Search Header */}
        <header className="pb-[40px] border-b border-brand-border/60 max-w-3xl">
          <div className="flex items-center gap-[10px] mb-[16px]">
            <Badge variant="outline" size="sm">
              UTILITY LAYER
            </Badge>
            <span className="font-mono text-[12px] text-brand-text-muted">
              {isHybridMode ? "HYBRID RETRIEVAL (OPT-IN)" : "DETERMINISTIC RETRIEVAL"}
            </span>
          </div>

          <h1 className="font-display text-[32px] sm:text-[44px] md:text-[52px] font-bold text-brand-text-primary tracking-tight leading-[1.12] mb-[16px]">
            Search DIXITH
          </h1>

          <p className="text-[16px] sm:text-[18px] text-brand-text-secondary leading-relaxed font-sans">
            Explore research protocols, lab experiments, analytical articles,
            implementation guides, and professional experience.
          </p>

          {/* Search Form (Accessible Server Form) */}
          <form
            method="GET"
            action="/search"
            role="search"
            className="mt-[32px]"
          >
            {selectedType !== "all" && (
              <input type="hidden" name="type" value={selectedType} />
            )}
            {selectedMode === "hybrid" && (
              <input type="hidden" name="mode" value="hybrid" />
            )}
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-grow">
                <Search className="w-4 h-4 text-brand-text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <label htmlFor="search-input" className="sr-only">
                  Search DIXITH Knowledge Base
                </label>
                <input
                  id="search-input"
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search architecture, schema, healthcare, topics..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-brand-surface/70 border border-brand-border rounded-lg pl-11 pr-4 py-3.5 text-[15px] text-brand-text-primary placeholder:text-brand-text-muted/60 focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 bg-brand-accent hover:bg-brand-accent-hover text-white text-[14px] font-mono font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg flex items-center justify-center gap-2"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Search Mode Selector (Accessible Server Navigation) */}
            <div
              className="flex items-center gap-2 mt-4"
              role="radiogroup"
              aria-label="Search Mode"
            >
              <span className="font-mono text-[11px] text-brand-text-muted uppercase tracking-wider">
                Mode:
              </span>
              <Link
                href={buildSearchUrl(query, "keyword", selectedType)}
                role="radio"
                aria-checked={selectedMode === "keyword"}
                className={cn(
                  "px-3 py-1 rounded text-[11px] font-mono transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent",
                  selectedMode === "keyword"
                    ? "bg-brand-surface border border-brand-accent/60 text-brand-accent font-semibold shadow-xs"
                    : "bg-brand-surface/40 border border-brand-border text-brand-text-muted hover:text-brand-text-secondary hover:border-brand-border/80"
                )}
              >
                Keyword
              </Link>
              <Link
                href={buildSearchUrl(query, "hybrid", selectedType)}
                role="radio"
                aria-checked={selectedMode === "hybrid"}
                className={cn(
                  "px-3 py-1 rounded text-[11px] font-mono transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent inline-flex items-center gap-1.5",
                  selectedMode === "hybrid"
                    ? "bg-brand-surface border border-brand-accent/60 text-brand-accent font-semibold shadow-xs"
                    : "bg-brand-surface/40 border border-brand-border text-brand-text-muted hover:text-brand-text-secondary hover:border-brand-border/80"
                )}
              >
                <Sparkles className="w-3 h-3 text-brand-accent" />
                <span>Hybrid</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-brand-accent/15 text-brand-accent font-mono uppercase tracking-wider font-semibold">
                  EXP
                </span>
              </Link>
            </div>
          </form>
        </header>

        {/* Content Area */}
        <section className="mt-[48px] max-w-4xl" aria-label="Search Content">
          {/* Fallback Notice when Hybrid Mode defaults back to Keyword */}
          {fallbackToKeyword && (
            <div className="p-3.5 rounded-lg border border-brand-border bg-brand-surface/50 font-mono text-[12px] text-brand-text-muted mb-6">
              Notice: Semantic retrieval was temporarily unavailable; gracefully defaulted to deterministic keyword results.
            </div>
          )}

          {/* STATE 1: Empty Query State */}
          {!query && (
            <div className="space-y-[36px]">
              <div>
                <h2 className="font-mono text-[13px] tracking-wider text-brand-accent uppercase font-medium mb-[16px]">
                  SUGGESTED DISCOVERY QUERIES
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    "Healthcare Search Architecture",
                    "International Search",
                    "E-Commerce",
                    "Schema.org",
                    "Technical SEO",
                    "Entities",
                    "AEO",
                    "GEO",
                    "RAG",
                  ].map((term) => (
                    <Link
                      key={term}
                      href={buildSearchUrl(term, selectedMode, selectedType)}
                      className="px-3.5 py-1.5 rounded-md bg-brand-surface border border-brand-border hover:border-brand-accent/50 text-[13px] font-mono text-brand-text-secondary hover:text-brand-text-primary transition-colors"
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Technical Transparency Note */}
              <div className="p-[20px] rounded-lg border border-brand-border/60 bg-brand-surface/30">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-4 h-4 text-brand-accent mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <div className="font-mono text-[12px] font-semibold text-brand-text-primary">
                      RETRIEVAL ARCHITECTURE NOTE
                    </div>
                    <p className="text-[13px] text-brand-text-muted leading-relaxed font-sans">
                      Default search utilizes deterministic keyword retrieval with weighted
                      field relevance and controlled taxonomy expansion. An experimental
                      Hybrid mode is available above, combining lexical precision, lexical
                      quality gating, and dense vector semantic retrieval via Reciprocal Rank Fusion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: Query With Results */}
          {query && results.length > 0 && (
            <div className="space-y-[28px]">
              {/* Type Filter Tabs */}
              <nav
                aria-label="Filter results by content type"
                className="flex flex-wrap items-center gap-2 pb-[16px] border-b border-brand-border/60"
              >
                {FILTER_OPTIONS.map((opt) => {
                  const isActive = selectedType === opt.value;
                  const href = buildSearchUrl(query, selectedMode, opt.value);

                  return (
                    <Link
                      key={opt.value}
                      href={href}
                      className={cn(
                        "px-3 py-1.5 rounded-interactive text-[12px] font-mono transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent",
                        isActive
                          ? "bg-brand-accent text-white font-semibold shadow-sm"
                          : "bg-brand-surface border border-brand-border text-brand-text-secondary hover:text-brand-text-primary hover:border-brand-accent/50"
                      )}
                    >
                      {opt.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="flex items-center justify-between">
                <p className="font-mono text-[13px] text-brand-text-muted">
                  Found{" "}
                  <strong className="text-brand-text-primary">
                    {results.length}
                  </strong>{" "}
                  {results.length === 1 ? "result" : "results"} for{" "}
                  <span className="text-brand-accent">"{query}"</span>
                  {selectedType !== "all" && (
                    <span className="text-brand-text-muted">
                      {" "}
                      in <span className="uppercase">{selectedType}</span>
                    </span>
                  )}
                  {isHybridMode && (
                    <span className="text-brand-accent font-mono text-[11px] ml-2 font-semibold">
                      [HYBRID RETRIEVAL]
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-[20px]">
                {results.map((result) => {
                  const badge = getEntityBadgeVariant(result.entityType);
                  const isPhraseMatch =
                    result.matchedFields?.includes("title-phrase") ||
                    result.matchedFields?.includes("summary-phrase");
                  const isTaxonomyMatch = result.matchedFields?.includes(
                    "taxonomy-alias"
                  );

                  return (
                    <article
                      key={result.id}
                      className="p-[24px] sm:p-[28px] rounded-lg border border-brand-border bg-brand-surface/40 hover:bg-brand-surface/80 hover:border-brand-accent/50 transition-all group"
                    >
                      <div className="flex flex-wrap items-center gap-[10px] mb-[12px]">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-surface border border-brand-border font-mono text-[11px] text-brand-text-primary font-medium tracking-wider">
                          {badge.icon}
                          <span>{badge.label}</span>
                        </div>
                        {result.category && (
                          <span className="font-mono text-[11px] text-brand-accent font-semibold tracking-wider uppercase">
                            {result.category}
                          </span>
                        )}
                        <span className="font-mono text-[11px] text-brand-text-muted">
                          {result.id}
                        </span>

                        {/* Hybrid Signal Badge */}
                        {isHybridMode && result.retrievalSignals && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-medium tracking-wider uppercase",
                              result.retrievalSignals === "both"
                                ? "bg-brand-accent/10 border border-brand-accent/30 text-brand-accent"
                                : result.retrievalSignals === "semantic"
                                ? "bg-brand-surface border border-brand-border text-brand-text-secondary"
                                : "bg-brand-surface border border-brand-border text-brand-text-muted"
                            )}
                          >
                            {result.retrievalSignals === "both"
                              ? "Lexical + Semantic"
                              : result.retrievalSignals === "semantic"
                              ? "Semantic Match"
                              : "Lexical Match"}
                          </span>
                        )}

                        {isPhraseMatch && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-accent/10 border border-brand-accent/30 font-mono text-[10px] text-brand-accent font-medium tracking-wider uppercase">
                            Phrase Match
                          </span>
                        )}

                        {isTaxonomyMatch && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-brand-bg-secondary border border-brand-border font-mono text-[10px] text-brand-text-secondary tracking-wider uppercase">
                            <Tag className="w-2.5 h-2.5 text-brand-accent" />
                            Taxonomy Aligned
                          </span>
                        )}
                      </div>

                      <h2 className="font-display text-[20px] sm:text-[22px] font-bold text-brand-text-primary mb-[10px] group-hover:text-brand-accent transition-colors">
                        <Link
                          href={result.href}
                          className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent rounded"
                        >
                          {result.title}
                        </Link>
                      </h2>

                      {result.summary && (
                        <p className="text-[14px] sm:text-[15px] text-brand-text-secondary leading-relaxed font-sans mb-[16px]">
                          {result.summary}
                        </p>
                      )}

                      {/* Concise Matched Canonical Excerpt (Hybrid Mode Only) */}
                      {isHybridMode && result.matchedChunkExcerpt && (
                        <div className="mb-[16px] p-[12px] rounded bg-brand-bg/60 border border-brand-border/40 font-mono text-[12px] text-brand-text-secondary leading-relaxed">
                          <span className="text-brand-accent text-[10px] uppercase tracking-wider font-semibold block mb-1">
                            Matched Context Excerpt:
                          </span>
                          <p className="italic font-sans text-[13px] text-brand-text-muted">
                            "{result.matchedChunkExcerpt}"
                          </p>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-[12px] border-t border-brand-border/40">
                        {result.topics && result.topics.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {result.topics.slice(0, 3).map((topic: string) => (
                              <span
                                key={topic}
                                className="px-2 py-0.5 rounded bg-brand-bg/60 border border-brand-border/60 font-mono text-[11px] text-brand-text-muted"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div />
                        )}

                        <Link
                          href={result.href}
                          className="inline-flex items-center gap-1.5 font-mono text-[12px] text-brand-accent group-hover:text-brand-accent-hover tracking-wider font-semibold focus-visible:outline-brand-accent"
                        >
                          <span>View Document</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* STATE 3: Query With No Results */}
          {query && results.length === 0 && (
            <div className="p-[32px] sm:p-[40px] rounded-lg border border-brand-border bg-brand-surface/30 space-y-[24px]">
              <div>
                <h2 className="font-display text-[22px] font-bold text-brand-text-primary mb-[8px]">
                  No results found for "{query}"
                </h2>
                <p className="text-[14px] text-brand-text-secondary font-sans leading-relaxed">
                  No published knowledge assets matched your query in the current
                  index.
                </p>
              </div>

              <div className="space-y-[12px] pt-[16px] border-t border-brand-border/60">
                <div className="font-mono text-[12px] text-brand-accent uppercase tracking-wider font-semibold">
                  RECOMMENDATIONS
                </div>
                <ul className="space-y-2 text-[14px] text-brand-text-secondary font-sans">
                  <li className="flex items-start gap-2">
                    <span className="text-brand-accent font-mono">•</span>
                    <span>Verify spelling or try using fewer, broader keywords.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-accent font-mono">•</span>
                    <span>
                      Try broader concepts such as{" "}
                      <Link
                        href={buildSearchUrl("Healthcare", selectedMode, selectedType)}
                        className="text-brand-accent underline hover:text-brand-accent-hover"
                      >
                        Healthcare
                      </Link>
                      ,{" "}
                      <Link
                        href={buildSearchUrl("International", selectedMode, selectedType)}
                        className="text-brand-accent underline hover:text-brand-accent-hover"
                      >
                        International
                      </Link>
                      ,{" "}
                      <Link
                        href={buildSearchUrl("Architecture", selectedMode, selectedType)}
                        className="text-brand-accent underline hover:text-brand-accent-hover"
                      >
                        Architecture
                      </Link>
                      , or{" "}
                      <Link
                        href={buildSearchUrl("Schema", selectedMode, selectedType)}
                        className="text-brand-accent underline hover:text-brand-accent-hover"
                      >
                        Schema
                      </Link>
                      .
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-brand-accent font-mono">•</span>
                    <span>
                      Only content with published indexable status is included.
                      Draft or under-review protocols remain private until released.
                    </span>
                  </li>
                  {isHybridMode && (
                    <li className="flex items-start gap-2">
                      <span className="text-brand-accent font-mono">•</span>
                      <span>
                        Hybrid mode combines exact terms and conceptual meaning; if your query is
                        outside information retrieval and technical architecture, it will be rejected.
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Footer Navigation */}
        <footer className="mt-[64px] pt-[32px] border-t border-brand-border/60 flex items-center justify-between font-mono text-[12px] text-brand-text-muted">
          <Link
            href="/"
            className="hover:text-brand-accent transition-colors focus-visible:outline-brand-accent"
          >
            ← Back to Overview
          </Link>
          <span>DIXITH · SEARCH FORWARD</span>
        </footer>
      </Container>
    </main>
  );
}
