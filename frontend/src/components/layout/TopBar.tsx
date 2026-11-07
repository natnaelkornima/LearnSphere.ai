"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { UploadCloud, Sparkles } from "@/components/ui/Icons";

export function TopBar({
  onOpenUpload,
  onToggleMobileMenu,
}: {
  onOpenUpload?: () => void;
  onToggleMobileMenu?: () => void;
}) {
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    if (path.startsWith("/dashboard")) return "Dashboard Overview";
    if (path.startsWith("/library")) return "Document Library";
    if (path.startsWith("/tutor")) return "AI Tutor Workspace";
    if (path.startsWith("/studio/summaries")) return "AI Summaries";
    if (path.startsWith("/studio/quizzes")) return "Practice Quizzes";
    if (path.startsWith("/studio/flashcards")) return "Smart Flashcards";
    if (path.startsWith("/planner")) return "Study Planner";
    if (path.startsWith("/analytics")) return "Learning Analytics";
    if (path.startsWith("/settings")) return "Settings & Preferences";
    return "LearnSphere AI";
  };

  return (
    <header className="h-16 px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg"
          aria-label="Open Navigation"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h1 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            {getPageTitle(pathname)}
          </h1>
          <p className="hidden sm:block text-xs text-neutral-400">
            Turn your study material into knowledge
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Upload action */}
        {onOpenUpload && (
          <Button
            size="sm"
            onClick={onOpenUpload}
            className="shadow-sm shadow-primary-500/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Document</span>
          </Button>
        )}

        {/* AI Learning Mode Pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-50 dark:bg-secondary-950/50 border border-secondary-200 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-secondary-500" />
          <span>Active Learning Mode</span>
        </div>
      </div>
    </header>
  );
}

