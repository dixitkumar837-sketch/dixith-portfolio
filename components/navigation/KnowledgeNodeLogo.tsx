import React from "react";
import { cn } from "@/lib/utils";

interface KnowledgeNodeLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

export const KnowledgeNodeLogo: React.FC<KnowledgeNodeLogoProps> = ({
  className,
  size = 32,
  showWordmark = true,
}) => {
  return (
    <div className={cn("inline-flex items-center gap-[12px] group select-none", className)}>
      {/* Knowledge Node Graph forming geometric 'D' */}
      <div
        className="relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-brand-accent transition-colors duration-300"
          aria-hidden="true"
        >
          {/* Subtle Outer Orbital / Graph Mesh */}
          <circle cx="20" cy="20" r="18" stroke="#1E293B" strokeWidth="1" strokeDasharray="2 2" />

          {/* Connected Network Paths forming 'D' Stem & Curve */}
          {/* Vertical Stem Edge */}
          <line x1="12" y1="10" x2="12" y2="30" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" />
          {/* Top Arch Edge */}
          <path d="M12 10 Q28 10 28 20" stroke="#2563EB" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Bottom Arch Edge */}
          <path d="M28 20 Q28 30 12 30" stroke="#2563EB" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Internal Knowledge Synapse Line */}
          <line x1="12" y1="20" x2="28" y2="20" stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="3 3" />

          {/* Network Graph Nodes */}
          {/* Stem Top Node */}
          <circle cx="12" cy="10" r="2.5" fill="#F8FAFC" stroke="#2563EB" strokeWidth="1.5" />
          {/* Stem Bottom Node */}
          <circle cx="12" cy="30" r="2.5" fill="#F8FAFC" stroke="#2563EB" strokeWidth="1.5" />
          {/* Stem Center Node */}
          <circle cx="12" cy="20" r="2" fill="#3B82F6" />
          {/* Right Apex Node (Curve peak) */}
          <circle cx="28" cy="20" r="3" fill="#2563EB" stroke="#F8FAFC" strokeWidth="1.5" />
          {/* Orbit Peripheral Entity Nodes */}
          <circle cx="22" cy="11" r="1.5" fill="#CBD5E1" />
          <circle cx="22" cy="29" r="1.5" fill="#CBD5E1" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col">
          <span className="font-display text-[18px] font-bold tracking-tight text-brand-text-primary leading-none">
            DIXITH
          </span>
          <span className="font-mono text-[10px] tracking-widest text-brand-text-muted uppercase mt-[3px]">
            AI SEARCH STRATEGIST
          </span>
        </div>
      )}
    </div>
  );
};
