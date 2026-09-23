import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "sm" | "md" | "lg";
  href?: string;
  target?: string;
  rel?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      href,
      target,
      rel,
      icon,
      iconPosition = "right",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-sans font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-accent focus-visible:ring-offset-2 focus-visible:ring-offset-brand-bg disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] select-none";

    const variants = {
      primary:
        "bg-brand-accent hover:bg-brand-accent-hover active:bg-brand-accent-active text-brand-text-primary rounded-interactive border border-brand-accent/40 shadow-sm",
      secondary:
        "bg-brand-surface/70 hover:bg-brand-surface text-brand-text-primary border border-brand-border/80 hover:border-brand-accent/40 rounded-interactive transition-colors",
      tertiary:
        "bg-transparent hover:bg-brand-surface/40 text-brand-text-secondary hover:text-brand-text-primary rounded-interactive border border-transparent",
    };

    const sizes = {
      sm: "text-[13px] px-[16px] py-[8px] gap-[6px]",
      md: "text-[13px] sm:text-[14px] px-[22px] py-[11px] gap-[8px]",
      lg: "text-[14px] sm:text-[15px] px-[28px] py-[14px] gap-[10px]",
    };

    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    const content = (
      <>
        {icon && iconPosition === "left" && (
          <span className="inline-flex shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5">
            {icon}
          </span>
        )}
        <span>{children}</span>
        {icon && iconPosition === "right" && (
          <span className="inline-flex shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
            {icon}
          </span>
        )}
      </>
    );

    if (href) {
      return (
        <Link
          href={href}
          target={target}
          rel={rel}
          className={cn(classes, "group")}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        className={cn(classes, "group")}
        disabled={disabled}
        ref={ref as React.Ref<HTMLButtonElement>}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
