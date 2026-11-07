"use client";

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "./Icons";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div
        className={cn(
          "relative z-50 w-full max-w-lg rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 shadow-lg animate-in zoom-in-95 duration-150",
          className
        )}
      >
        <div className="flex items-start justify-between pb-3.5 border-b border-neutral-100 dark:border-neutral-800/80">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-3.5">{children}</div>
      </div>
    </div>
  );
}
