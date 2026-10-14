import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Info,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { AskDixithUIState } from "./AskDixithState";
import { AskDixithSources } from "./AskDixithSources";
import { AskDixithRelated } from "./AskDixithRelated";

interface AskDixithAnswerPanelProps {
  state: AskDixithUIState;
  onRetry: () => void;
}

export const AskDixithAnswerPanel: React.FC<AskDixithAnswerPanelProps> = ({
  state,
  onRetry,
}) => {
  const { status, answer, error, query } = state;

  // ── IDLE STATE ─────────────────────────────────────────────────────────────
  if (status === "IDLE") {
    return (
      <div className="py-12 px-6 rounded-interactive border border-brand-border/60 bg-brand-surface/20 text-center space-y-3">
        <div className="inline-flex p-3 rounded-full bg-brand-surface/80 border border-brand-border/80 text-brand-accent">
          <Layers className="w-5 h-5" />
        </div>
        <h3 className="font-sans font-medium text-[16px] text-brand-text-primary">
          Ask DIXITH Knowledge Engine
        </h3>
        <p className="font-sans text-[14px] text-brand-text-muted max-w-md mx-auto leading-relaxed">
          Submit an inquiry to perform deterministic hybrid retrieval across verified
          published content in the DIXITH knowledge base.
        </p>
      </div>
    );
  }

  // ── SUBMITTING / LOADING STATE ─────────────────────────────────────────────
  if (status === "SUBMITTING") {
    return (
      <div
        aria-live="polite"
        className="py-10 px-6 rounded-interactive border border-brand-border/60 bg-brand-surface/30 space-y-6 animate-pulse"
      >
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-2 border-brand-accent border-t-transparent animate-spin" />
          <span className="font-mono text-[13px] text-brand-text-secondary">
            Searching published DIXITH knowledge...
          </span>
        </div>

        {/* Skeleton Source Cards */}
        <div className="space-y-3 pt-2">
          <div className="h-4 w-40 bg-brand-surface/80 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="h-28 bg-brand-surface/60 border border-brand-border/40 rounded-interactive" />
            <div className="h-28 bg-brand-surface/60 border border-brand-border/40 rounded-interactive" />
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR STATE ────────────────────────────────────────────────────────────
  if (status === "ERROR") {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="p-6 rounded-interactive border border-red-500/30 bg-red-500/5 space-y-4"
      >
        <div className="flex items-center gap-2.5 text-red-400 font-mono text-[13px]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Retrieval Operation Error</span>
        </div>
        <p className="font-sans text-[14px] text-brand-text-secondary leading-relaxed">
          {error || "Something went wrong while retrieving DIXITH knowledge."}
        </p>
        <div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm text-[12px] font-mono font-medium bg-brand-surface hover:bg-brand-surface-hover border border-brand-border text-brand-text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try again</span>
          </button>
        </div>
      </div>
    );
  }

  // ── NO RELEVANT CONTENT STATE ──────────────────────────────────────────────
  if (status === "NO_RELEVANT_CONTENT") {
    return (
      <div
        aria-live="polite"
        className="p-6 md:p-8 rounded-interactive border border-brand-border/80 bg-brand-surface/30 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <Badge variant="outline" size="sm" className="gap-1.5 text-brand-text-muted">
            <HelpCircle className="w-3 h-3" />
            <span>NO RELEVANT CONTENT</span>
          </Badge>
          <span className="font-mono text-[11px] text-brand-text-muted">
            Published Corpus Boundary
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="font-sans font-medium text-[16px] text-brand-text-primary">
            No Published Content Matches This Query
          </h3>
          <p className="font-sans text-[14px] text-brand-text-secondary leading-relaxed max-w-2xl">
            I couldn&apos;t find relevant published material in the DIXITH knowledge base for
            &ldquo;{query}&rdquo;.
          </p>
        </div>

        {/* Suggested Next Actions */}
        <div className="pt-2 border-t border-brand-border/40 space-y-3">
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-brand-text-muted">
            Suggested Next Explorations:
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <li>
              <Link
                href="/#experience"
                className="flex items-center justify-between p-3 rounded-sm bg-brand-surface/50 hover:bg-brand-surface border border-brand-border/60 hover:border-brand-accent/50 text-[13px] text-brand-text-secondary hover:text-brand-text-primary transition-all group"
              >
                <span>Explore Professional Experience</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-text-muted group-hover:text-brand-accent transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
            <li>
              <Link
                href="/#research"
                className="flex items-center justify-between p-3 rounded-sm bg-brand-surface/50 hover:bg-brand-surface border border-brand-border/60 hover:border-brand-accent/50 text-[13px] text-brand-text-secondary hover:text-brand-text-primary transition-all group"
              >
                <span>Explore Research Protocols</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-text-muted group-hover:text-brand-accent transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
            <li>
              <Link
                href="/#search-lab"
                className="flex items-center justify-between p-3 rounded-sm bg-brand-surface/50 hover:bg-brand-surface border border-brand-border/60 hover:border-brand-accent/50 text-[13px] text-brand-text-secondary hover:text-brand-text-primary transition-all group"
              >
                <span>Explore AI Search Lab</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-text-muted group-hover:text-brand-accent transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
            <li>
              <Link
                href="/guides"
                className="flex items-center justify-between p-3 rounded-sm bg-brand-surface/50 hover:bg-brand-surface border border-brand-border/60 hover:border-brand-accent/50 text-[13px] text-brand-text-secondary hover:text-brand-text-primary transition-all group"
              >
                <span>Explore Technical Guides</span>
                <ArrowRight className="w-3.5 h-3.5 text-brand-text-muted group-hover:text-brand-accent transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // ── INSUFFICIENT EVIDENCE STATE ────────────────────────────────────────────
  if (status === "INSUFFICIENT_EVIDENCE") {
    return (
      <div
        aria-live="polite"
        className="p-6 md:p-8 rounded-interactive border border-brand-border/80 bg-brand-surface/30 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
          <Badge variant="outline" size="sm" className="gap-1.5 text-amber-400 border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>INSUFFICIENT EVIDENCE</span>
          </Badge>
          <span className="font-mono text-[11px] text-brand-text-muted">
            Fail-Closed Scientific Policy
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="font-sans font-medium text-[16px] text-brand-text-primary">
            Insufficient Published Evidence
          </h3>
          <p className="font-sans text-[14px] text-brand-text-secondary leading-relaxed">
            {answer?.answer ||
              "I don't have enough published evidence in the DIXITH knowledge base to answer that confidently."}
          </p>
        </div>

        {/* Evidence Limitations */}
        {answer?.limitations && answer.limitations.length > 0 && (
          <div className="p-3.5 rounded-sm bg-brand-surface/50 border border-brand-border/60 space-y-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-brand-text-muted flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Observed Boundaries & Limitations</span>
            </span>
            <ul className="list-disc list-inside space-y-1 text-[12px] font-sans text-brand-text-muted">
              {answer.limitations.map((limit, idx) => (
                <li key={idx}>{limit}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Render Partial Sources if any exist */}
        {answer?.sources && answer.sources.length > 0 && (
          <AskDixithSources sources={answer.sources} />
        )}
      </div>
    );
  }

  // ── ANSWERED / PARTIALLY_SUPPORTED STATE ────────────────────────────────────
  const isPartiallySupported = status === "PARTIALLY_SUPPORTED";

  return (
    <div
      aria-live="polite"
      className="p-6 md:p-8 rounded-interactive border border-brand-border/80 bg-brand-surface/30 space-y-7"
    >
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Badge
            variant={isPartiallySupported ? "outline" : "active"}
            size="sm"
            className="gap-1.5"
          >
            {isPartiallySupported ? (
              <AlertTriangle className="w-3 h-3 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-3 h-3 text-brand-accent-hover" />
            )}
            <span>{status}</span>
          </Badge>

          {answer?.intent && (
            <Badge variant="default" size="sm" className="font-mono text-[10px]">
              {answer.intent}
            </Badge>
          )}

          {answer?.retrievalMode && (
            <Badge variant="outline" size="sm" className="font-mono text-[10px]">
              MODE: {answer.retrievalMode}
            </Badge>
          )}
        </div>

        <span className="font-mono text-[11px] text-brand-text-muted">
          Published DIXITH Knowledge
        </span>
      </div>

      {/* Answer Body */}
      <div className="space-y-3">
        <h3 className="font-mono text-[12px] uppercase tracking-wider text-brand-text-muted">
          Answer Summary
        </h3>
        <p className="font-sans text-[15px] text-brand-text-primary leading-relaxed font-normal">
          {answer?.answer}
        </p>
      </div>

      {/* Evidence & Limitations Box */}
      {answer?.limitations && answer.limitations.length > 0 && (
        <div className="p-3.5 rounded-sm bg-brand-surface/50 border border-brand-border/60 space-y-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-brand-text-muted flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-brand-accent" />
            <span>Epistemological Limitations</span>
          </span>
          <ul className="list-disc list-inside space-y-1 text-[12px] font-sans text-brand-text-muted">
            {answer.limitations.map((limit, idx) => (
              <li key={idx}>{limit}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources Component */}
      {answer?.sources && <AskDixithSources sources={answer.sources} />}

      {/* Related Content Component */}
      {answer?.relatedContent && <AskDixithRelated related={answer.relatedContent} />}
    </div>
  );
};
