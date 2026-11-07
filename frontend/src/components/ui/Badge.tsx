import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "outline";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default:
      "bg-[var(--surface-secondary)] text-neutral-700 dark:text-neutral-300 border-[var(--border)]",
    primary:
      "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700",
    secondary:
      "bg-[var(--surface-secondary)] text-neutral-600 dark:text-neutral-400 border-[var(--border)]",
    success:
      "bg-emerald-50/70 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900",
    warning:
      "bg-amber-50/70 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/80 dark:border-amber-900",
    danger:
      "bg-red-50/70 text-red-800 dark:bg-red-950/30 dark:text-red-400 border-red-200/80 dark:border-red-900",
    outline:
      "bg-transparent text-neutral-700 dark:text-neutral-300 border-[var(--border)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
