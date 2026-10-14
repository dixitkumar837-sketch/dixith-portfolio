import React from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Briefcase, FileText, Compass, Layers } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AskDixithSource } from "@/data/ask-dixith-types";

interface AskDixithSourcesProps {
  sources: AskDixithSource[];
}

function getSourceIcon(type: string) {
  switch (type) {
    case "professional-experience":
      return <Briefcase className="w-3.5 h-3.5 text-brand-accent" />;
    case "guide":
      return <Compass className="w-3.5 h-3.5 text-brand-accent" />;
    case "article":
      return <FileText className="w-3.5 h-3.5 text-brand-accent" />;
    case "research":
    case "experiment":
    default:
      return <BookOpen className="w-3.5 h-3.5 text-brand-accent" />;
  }
}

function formatEntityType(type: string): string {
  switch (type) {
    case "professional-experience":
      return "Professional Experience";
    case "guide":
      return "Guide";
    case "article":
      return "Article";
    case "research":
      return "Research Study";
    case "experiment":
      return "AI Search Lab";
    default:
      return type;
  }
}

export const AskDixithSources: React.FC<AskDixithSourcesProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <section className="space-y-4 pt-2">
      <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
        <h3 className="font-mono text-[12px] uppercase tracking-wider text-brand-text-primary flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-brand-accent" />
          <span>DIXITH Sources ({sources.length})</span>
        </h3>
        <span className="font-mono text-[11px] text-brand-text-muted">
          Published Knowledge Grounding
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {sources.map((source) => (
          <article
            key={source.entityId}
            className="flex flex-col justify-between p-4 bg-brand-surface/40 hover:bg-brand-surface/70 border border-brand-border/70 hover:border-brand-accent/40 rounded-interactive transition-all group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="default" size="sm" className="gap-1.5 text-[10px]">
                  {getSourceIcon(source.entityType)}
                  <span>{formatEntityType(source.entityType)}</span>
                </Badge>
                <span className="font-mono text-[10px] text-brand-text-muted">
                  {source.entityId}
                </span>
              </div>

              <h4 className="font-sans font-medium text-[15px] text-brand-text-primary group-hover:text-brand-accent-hover transition-colors">
                {source.title}
              </h4>

              {source.excerpt && (
                <p className="font-sans text-[13px] text-brand-text-secondary leading-relaxed line-clamp-3">
                  &ldquo;{source.excerpt}&rdquo;
                </p>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-brand-border/40 flex items-center justify-between">
              {source.relevance && (
                <span className="font-mono text-[11px] text-brand-text-muted">
                  {source.relevance}
                </span>
              )}
              <Link
                href={source.href}
                className="inline-flex items-center gap-1 font-mono text-[12px] text-brand-accent-text hover:text-brand-accent-light transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent"
              >
                <span>Open source</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
