"use client";

import React from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@ui-sdk/react/dialog";
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
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogBackdrop className="fixed inset-0 z-50 bg-neutral-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <DialogContent
          className={cn(
            "relative z-50 w-full max-w-lg rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] p-6 shadow-xl animate-in zoom-in-95 duration-150",
            className
          )}
        >
          <div className="flex items-start justify-between pb-4 border-b border-[var(--border)]">
            <div className="space-y-0.5">
              {title && (
                <DialogTitle className="text-sm font-serif font-semibold text-neutral-950 dark:text-neutral-50">
                  {title}
                </DialogTitle>
              )}
              {description && (
                <DialogDescription className="text-xs text-neutral-500">
                  {description}
                </DialogDescription>
              )}
            </div>
            <DialogClose
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </DialogClose>
          </div>
          <div className="mt-4">{children}</div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
