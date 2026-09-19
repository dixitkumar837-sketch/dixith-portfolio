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
        "mb-[48px] md:mb-[64px]",
        align === "center" && "text-center mx-auto max-w-2xl",
        className
      )}
    >
      {eyebrow && (
        <div className="font-mono text-[12px] uppercase tracking-widest text-brand-accent mb-[12px]">
          {eyebrow}
        </div>
      )}
      <h2 className="font-display text-[32px] sm:text-[40px] md:text-[44px] font-bold text-brand-text-primary tracking-tight leading-[1.15]">
        {title}
      </h2>
      {description && (
        <p className="mt-[16px] text-[16px] sm:text-[18px] md:text-[20px] text-brand-text-secondary leading-relaxed font-sans max-w-3xl">
          {description}
        </p>
      )}
    </div>
  );
};
