import React from "react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  align?: "left" | "center";
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  className,
  align = "left",
}) => {
  return (
    <div
      className={cn(
        "mb-[40px] md:mb-[56px]",
        align === "center" && "text-center mx-auto max-w-2xl",
        className
      )}
    >
      {eyebrow && (
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand-accent mb-[10px] font-medium">
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-[32px] sm:text-[40px] md:text-[44px] font-bold text-brand-text-primary tracking-[-0.02em] leading-[1.12]">
        {title}
      </h2>
      {description && (
        <p className="mt-[14px] text-[16px] sm:text-[18px] text-brand-text-secondary leading-relaxed font-sans max-w-2xl font-normal">
          {description}
        </p>
      )}
    </div>
  );
};
