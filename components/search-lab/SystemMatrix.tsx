import React from "react";
import { CheckCircle2, Cpu } from "lucide-react";

interface SystemMatrixProps {
  systems: string[];
  title?: string;
  description?: string;
}

const SYSTEM_METADATA: Record<
  string,
  { archetype: string; provider: string }
> = {
  "Google AI Overview": {
    archetype: "Search Index + Generative SGE Synthesis",
    provider: "Google",
  },
  ChatGPT: {
    archetype: "Conversational Reasoning + Web Browsing",
    provider: "OpenAI",
  },
  Perplexity: {
    archetype: "Real-time Citation Index + Pro RAG",
    provider: "Perplexity AI",
  },
  Claude: {
    archetype: "Long-Context Synthesis + Web Grounding",
    provider: "Anthropic",
  },
  Gemini: {
    archetype: "Multimodal Knowledge Graph + Live Search",
    provider: "Google",
  },
  "Microsoft Copilot": {
    archetype: "Bing Search Index + GPT Retrieval",
    provider: "Microsoft",
  },
};

export const SystemMatrix: React.FC<SystemMatrixProps> = ({
  systems,
  title = "SYSTEMS TESTED",
  description = "Standardized test queries are executed simultaneously across all six benchmark platforms under identical non-personalized conditions.",
}) => {
  return (
    <div className="p-[24px] sm:p-[32px] bg-brand-surface border border-brand-border rounded-lg">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-[12px] pb-[20px] border-b border-brand-border-subtle mb-[24px]">
        <div>
          <div className="flex items-center gap-[8px] mb-[6px]">
            <Cpu className="w-4 h-4 text-brand-accent" />
            <span className="font-mono text-[12px] uppercase tracking-widest text-brand-accent font-semibold">
              {title}
            </span>
          </div>
          <p className="text-[14px] text-brand-text-secondary leading-relaxed font-sans max-w-2xl">
            {description}
          </p>
        </div>
        <span className="font-mono text-[11px] text-brand-text-muted whitespace-nowrap">
          6 BENCHMARK ENGINES
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
        {systems.map((system) => {
          const meta = SYSTEM_METADATA[system] || {
            archetype: "Generative Answer Retrieval",
            provider: "Independent",
          };

          return (
            <div
              key={system}
              className="p-[16px] bg-brand-bg border border-brand-border/80 rounded-md flex flex-col justify-between transition-colors hover:border-brand-accent/40"
            >
              <div className="flex items-start justify-between gap-[8px] mb-[8px]">
                <div>
                  <div className="font-display text-[15px] font-bold text-brand-text-primary">
                    {system}
                  </div>
                  <div className="font-mono text-[11px] text-brand-text-muted">
                    {meta.provider}
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-brand-success flex-shrink-0 mt-0.5" />
              </div>

              <div className="pt-[10px] border-t border-brand-border-subtle flex items-center justify-between font-mono text-[11px]">
                <span className="text-brand-text-secondary truncate max-w-[180px]">
                  {meta.archetype}
                </span>
                <span className="text-brand-accent font-medium uppercase">
                  ACTIVE
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
