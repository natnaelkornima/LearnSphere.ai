import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValue?: boolean;
  variant?: "primary" | "secondary" | "success" | "warning";
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  variant = "primary",
  className,
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const variantBarStyles = {
    primary: "bg-primary-600",
    secondary: "bg-secondary-600",
    success: "bg-emerald-600",
    warning: "bg-amber-500",
  };

  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {(label || showValue) && (
        <div className="flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-400 font-medium">
          {label && <span>{label}</span>}
          {showValue && <span>{percentage}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
        <div
          className={cn(
            "h-full transition-all duration-300 ease-out rounded-full",
            variantBarStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

