import React from "react";
import { cn } from "@/lib/utils";

interface KnowledgeNodeLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

export const KnowledgeNodeLogo: React.FC<KnowledgeNodeLogoProps> = ({
  className,
  size = 28,
  showWordmark = true,
}) => {
  return (
    <div className={cn("inline-flex items-center gap-[12px] group select-none", className)}>
      {/* Precision Knowledge Node Mark forming geometric 'D' */}
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-colors duration-200"
          aria-hidden="true"
        >
          {/* Subtle connecting trajectory lines */}
          {/* Vertical Anchor Stem */}
          <line
            x1="8"
            y1="6"
            x2="8"
            y2="26"
            stroke="#1E293B"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Forward Arc paths */}
          <path
            d="M8 6 L20 6 C24.5 6 26 10 26 16 C26 22 24.5 26 20 26 L8 26"
            stroke="#2563EB"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="group-hover:stroke-brand-accent-hover transition-colors"
          />
          {/* Forward search vector chord */}
          <line
            x1="8"
            y1="16"
            x2="26"
            y2="16"
            stroke="#3B82F6"
            strokeWidth="1"
            strokeDasharray="2 2"
            strokeOpacity="0.7"
          />
          <path
            d="M8 6 L26 16 L8 26"
            stroke="#1E293B"
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* Graph Nodes */}
          {/* Top Anchor */}
          <circle cx="8" cy="6" r="2" fill="#F8FAFC" />
          {/* Bottom Anchor */}
          <circle cx="8" cy="26" r="2" fill="#F8FAFC" />
          {/* Center Origin Node */}
          <circle cx="8" cy="16" r="1.75" fill="#3B82F6" />
          {/* Forward Node (The 'Search Forward' apex) */}
          <circle
            cx="26"
            cy="16"
            r="2.5"
            fill="#2563EB"
            stroke="#F8FAFC"
            strokeWidth="1.25"
            className="group-hover:fill-brand-accent-hover transition-colors"
          />
          {/* Top curve node */}
          <circle cx="20" cy="6" r="1.5" fill="#94A3B8" />
          {/* Bottom curve node */}
          <circle cx="20" cy="26" r="1.5" fill="#94A3B8" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <span className="font-display text-[17px] font-bold tracking-[0.06em] text-brand-text-primary leading-none group-hover:text-white transition-colors">
            DIXITH
          </span>
          <span className="font-mono text-[9px] tracking-[0.18em] text-brand-text-muted uppercase mt-[3px]">
            AI SEARCH STRATEGIST
          </span>
        </div>
      )}
    </div>
  );
};
