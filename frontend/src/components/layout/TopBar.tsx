"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { UploadCloud, Search } from "@/components/ui/Icons";

export function TopBar({
  onOpenUpload,
  onToggleMobileMenu,
}: {
  onOpenUpload?: () => void;
  onToggleMobileMenu?: () => void;
}) {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard")) return "Overview";
    if (path.startsWith("/library")) return "Document Library";
    if (path.startsWith("/tutor")) return "Grounded AI Tutor";
    if (path.startsWith("/studio/summaries")) return "Structured Summaries";
    if (path.startsWith("/studio/quizzes")) return "Practice Quizzes";
    if (path.startsWith("/studio/flashcards")) return "Recall Flashcards";
    if (path.startsWith("/planner")) return "Study Planner";
    if (path.startsWith("/analytics")) return "Retention Analytics";
    if (path.startsWith("/settings")) return "Preferences";
    return "Workspace";
  };

  return (
    <header className="h-14 px-6 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 text-neutral-500 hover:bg-[var(--surface-secondary)] rounded cursor-pointer"
          aria-label="Open navigation menu"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <h1 className="text-sm font-serif font-medium text-neutral-950 dark:text-neutral-50 tracking-tight">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {onOpenUpload && (
          <Button
            size="sm"
            onClick={onOpenUpload}
            className="h-8 px-3 text-xs font-medium"
          >
            <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
            <span>Upload PDF</span>
          </Button>
        )}
      </div>
    </header>
  );
}
