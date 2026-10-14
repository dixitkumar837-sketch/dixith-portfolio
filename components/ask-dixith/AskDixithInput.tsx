"use client";

import React, { useState } from "react";
import { Search, CornerDownLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AskDixithInputProps {
  onSubmit: (query: string) => void;
  isSubmitting: boolean;
  initialQuery?: string;
}

const SAMPLE_QUERIES = [
  "Healthcare search architecture",
  "Enterprise e-commerce discovery",
  "International search architectures",
];

export const AskDixithInput: React.FC<AskDixithInputProps> = ({
  onSubmit,
  isSubmitting,
  initialQuery = "",
}) => {
  const [value, setValue] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitized = value.trim();
    if (!sanitized || isSubmitting) return;
    onSubmit(sanitized);
  };

  const handleChipClick = (query: string) => {
    if (isSubmitting) return;
    setValue(query);
    onSubmit(query);
  };

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="relative w-full">
        <label htmlFor="ask-dixith-query" className="sr-only">
          Ask DIXITH a research question
        </label>
        <div className="relative flex items-center w-full">
          <div className="absolute left-4 text-brand-text-muted pointer-events-none">
            <Search className="w-4 h-4 text-brand-accent" />
          </div>
          <input
            id="ask-dixith-query"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isSubmitting}
            maxLength={500}
            placeholder="Ask a question about search, AI search, SEO, or DIXITH research..."
            className={cn(
              "w-full pl-11 pr-24 py-3.5 bg-brand-surface/60 border border-brand-border/80 rounded-interactive",
              "text-[15px] font-sans text-brand-text-primary placeholder:text-brand-text-muted",
              "focus:outline-none focus:ring-1 focus:ring-brand-accent focus:border-brand-accent",
              "disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            )}
          />
          <div className="absolute right-2.5 flex items-center gap-1.5">
            <button
              type="submit"
              disabled={isSubmitting || !value.trim()}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[13px] font-mono font-medium",
                "bg-brand-accent text-brand-text-primary hover:bg-brand-accent-hover transition-colors",
                "disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent"
              )}
            >
              <span>Ask</span>
              <CornerDownLeft className="w-3 h-3" />
            </button>
          </div>
        </div>
      </form>

      {/* Suggested Query Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-[11px] font-mono uppercase tracking-wider text-brand-text-muted mr-1">
          Published topics:
        </span>
        {SAMPLE_QUERIES.map((query) => (
          <button
            key={query}
            type="button"
            onClick={() => handleChipClick(query)}
            disabled={isSubmitting}
            className="text-[12px] font-sans px-2.5 py-1 rounded-sm bg-brand-surface/40 hover:bg-brand-surface/90 border border-brand-border/60 hover:border-brand-accent/40 text-brand-text-secondary hover:text-brand-text-primary transition-colors disabled:opacity-40"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
};
