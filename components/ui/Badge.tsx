import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "active" | "outline" | "success";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = "default",
  size = "sm",
  ...props
}) => {
  const base =
    "inline-flex items-center font-mono font-medium tracking-wider uppercase rounded-sm transition-colors";

  const variants = {
    default:
      "bg-brand-surface-hover text-brand-text-secondary border border-brand-border-subtle",
    active:
      "bg-brand-accent/15 text-brand-accent-hover border border-brand-accent/30",
    outline:
      "bg-transparent text-brand-text-muted border border-brand-border",
    success:
      "bg-brand-success/15 text-brand-success border border-brand-success/30",
  };

  const sizes = {
    sm: "text-[11px] px-[8px] py-[3px] gap-[6px]",
    md: "text-[12px] px-[10px] py-[4px] gap-[8px]",
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};
