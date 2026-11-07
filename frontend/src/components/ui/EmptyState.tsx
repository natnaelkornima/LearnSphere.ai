import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40",
        className
      )}
    >
      {icon && (
        <div className="w-8 h-8 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h3>
      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-xs leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
