import React from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  as: Component = "div",
  ...props
}) => {
  return (
    <Component
      className={cn(
        "w-full max-w-[1280px] mx-auto px-[20px] md:px-[32px]",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};
