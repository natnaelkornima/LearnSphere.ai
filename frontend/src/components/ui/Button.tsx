import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-neutral-400 disabled:opacity-50 disabled:pointer-events-none rounded-md cursor-pointer select-none";

    const variantStyles = {
      primary:
        "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 active:scale-[0.98] transition-[background-color,transform]",
      secondary:
        "bg-[var(--surface-secondary)] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 active:scale-[0.98]",
      outline:
        "border border-[var(--border)] bg-transparent text-neutral-800 dark:text-neutral-200 hover:bg-[var(--surface-secondary)] active:scale-[0.98]",
      ghost:
        "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-[var(--surface-secondary)] hover:text-neutral-900 dark:hover:text-neutral-100",
      danger:
        "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white",
      link: "text-neutral-900 dark:text-neutral-100 hover:underline bg-transparent p-0",
    };

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1 gap-1.5 h-8",
      md: "text-xs px-3.5 py-1.5 gap-2 h-9",
      lg: "text-sm px-5 py-2.5 gap-2.5 h-11",
      icon: "p-1.5 w-8 h-8 aspect-square",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
