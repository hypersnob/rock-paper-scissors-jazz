import type * as React from "react";
import { cn } from "@/lib/utils";

type TabItemProps = {
  isActive: boolean;
  onClick: () => void;
  count?: number;
  className?: string;
} & Omit<React.ComponentProps<"button">, "onClick">;

export function TabItem({
  isActive,
  onClick,
  children,
  count,
  className,
  ...props
}: TabItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "p-4 font-medium text-sm transition-colors rounded-full",
        isActive
          ? "text-primary-foreground bg-primary hover:bg-primary/80"
          : "text-secondary-foreground bg-secondary hover:bg-secondary/80",
        className,
      )}
      {...props}
    >
      {children}
      {count !== undefined && ` (${count})`}
    </button>
  );
}
