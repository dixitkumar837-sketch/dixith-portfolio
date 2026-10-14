import React from "react";
import Link from "next/link";
import { ArrowRight, GitFork } from "lucide-react";
import { AskDixithSource } from "@/data/ask-dixith-types";

interface AskDixithRelatedProps {
  related: AskDixithSource[];
}

export const AskDixithRelated: React.FC<AskDixithRelatedProps> = ({ related }) => {
  // If there are no related items, do not show an empty decorative section (Section 12 rule)
  if (!related || related.length === 0) return null;

  return (
    <section className="space-y-3 pt-2">
      <div className="flex items-center justify-between border-b border-brand-border/60 pb-2">
        <h3 className="font-mono text-[12px] uppercase tracking-wider text-brand-text-primary flex items-center gap-2">
          <GitFork className="w-3.5 h-3.5 text-brand-accent" />
          <span>Related Knowledge Graph Nodes</span>
        </h3>
        <span className="font-mono text-[11px] text-brand-text-muted">
          Public Knowledge Graph Traversal
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {related.map((item) => (
          <Link
            key={item.entityId}
            href={item.href}
            className="flex items-center justify-between p-3.5 bg-brand-surface/30 hover:bg-brand-surface/70 border border-brand-border/60 hover:border-brand-accent/40 rounded-interactive transition-all group"
          >
            <div className="space-y-1 pr-3">
              <span className="font-mono text-[10px] text-brand-text-muted uppercase">
                {item.entityId}
              </span>
              <p className="font-sans text-[13px] font-medium text-brand-text-secondary group-hover:text-brand-text-primary transition-colors">
                {item.title}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-brand-text-muted group-hover:text-brand-accent group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </div>
    </section>
  );
};
