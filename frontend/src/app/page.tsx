import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  ArrowRight,
  Check,
  FileText,
  Brain,
  Layers,
  BarChart3,
} from "@/components/ui/Icons";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans">
      {/* Navigation Bar */}
      <header className="h-16 border-b border-[var(--border)] px-6 md:px-12 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-semibold text-base tracking-tight">
            LearnSphere <span className="text-neutral-400 font-normal">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-3 py-1.5 transition-colors">
            Sign in
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="h-8 px-3.5 text-xs font-medium">
              Open workspace
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-20 md:pt-28 md:pb-28 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Headline and Call-to-Action */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--surface-secondary)] text-xs font-mono text-neutral-600 dark:text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Grounded on course documents</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-medium tracking-tight text-neutral-950 dark:text-neutral-50 leading-[1.08]">
              Turn course readings into notes, quizzes, and recall cards
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
              Upload a textbook, paper, or syllabus. LearnSphere indexes page coordinates, answers questions with strict source citations, and builds practice sets that test what you remember.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="/dashboard">
                <Button size="lg" className="h-11 px-6 text-sm font-medium w-full sm:w-auto">
                  Open workspace <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-11 px-5 text-sm font-medium w-full sm:w-auto">
                  Try student demo
                </Button>
              </Link>
            </div>

            {/* Quiet feature claims */}
            <div className="pt-4 grid grid-cols-2 gap-4 text-xs text-neutral-500 border-t border-[var(--border)]">
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-200">Page citations</p>
                <p className="text-neutral-500">Every response references the source page number</p>
              </div>
              <div>
                <p className="font-medium text-neutral-900 dark:text-neutral-200">Server-scored</p>
                <p className="text-neutral-500">Quiz keys stay hidden until answers are submitted</p>
              </div>
            </div>
          </div>

          {/* Right Column: Real Product Moment (Annotated Document + Grounded Tutor Card) */}
          <div className="lg:col-span-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs space-y-4">
              {/* Document Window Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] text-xs text-neutral-500">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-neutral-400" />
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    Cell_Biology_Ch3.pdf
                  </span>
                </div>
                <span className="font-mono text-[11px] text-neutral-400">p. 14 of 38</span>
              </div>

              {/* Document Excerpt with Citation Highlight */}
              <div className="p-3.5 rounded-lg bg-[var(--surface-secondary)] text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 font-serif">
                <p className="text-neutral-500 text-[11px] font-mono mb-1.5">
                  Source text excerpt
                </p>
                <p>
                  &ldquo;...ATP synthase is embedded within the inner mitochondrial membrane, converting electrochemical proton potential into high-energy phosphate bonds through mechanical rotation.&rdquo;
                </p>
              </div>

              {/* Grounded Tutor Response Card */}
              <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                    AI Tutor Response
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-[var(--border)]">
                    p. 14 §2
                  </span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-normal">
                  ATP synthase harnesses the electrochemical proton gradient across the inner mitochondrial membrane to generate cellular ATP via rotational catalysis.
                </p>
              </div>

              {/* Interactive Recall Card Mini Preview */}
              <div className="p-3.5 rounded-lg border border-[var(--border)] bg-neutral-50 dark:bg-neutral-900/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-mono text-neutral-400 block">Flashcard practice</span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200">
                    Where does ATP synthase reside?
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] bg-white dark:bg-neutral-800 font-mono text-[10px] text-neutral-500">
                    Space
                  </kbd>
                  <span className="text-[11px] text-neutral-400">to flip</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4-Stage Cycle Section */}
      <section className="py-20 border-t border-[var(--border)] px-6 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-mono text-neutral-500">
              The learning cycle
            </p>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
              Structured for active recall, not passive scrolling
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Every document moves through a repeatable workflow from raw PDF to verified mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] space-y-3">
              <span className="font-mono text-xs text-neutral-400">01</span>
              <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-500" />
                Upload & Convert
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                PyMuPDF extracts text page by page, tracking coordinates and chunk boundaries so every assertion has a verifiable location.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] space-y-3">
              <span className="font-mono text-xs text-neutral-400">02</span>
              <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-neutral-500" />
                Understand
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Ask questions scoped to one document or several. Answers cite page numbers inline and open the matching excerpt.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] space-y-3">
              <span className="font-mono text-xs text-neutral-400">03</span>
              <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Brain className="w-4 h-4 text-neutral-500" />
                Practice
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Generate practice quizzes scored deterministically on the server, plus 3D flip recall flashcards with spaced repetition intervals.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--surface-secondary)] space-y-3">
              <span className="font-mono text-xs text-neutral-400">04</span>
              <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-neutral-500" />
                Improve
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Track completion streaks and topic mastery percentages aggregated from stored quiz attempts and task logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[var(--border)] py-8 px-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 LearnSphere AI. Grounded document intelligence.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-neutral-800 dark:hover:text-neutral-200">
              Sign in
            </Link>
            <Link href="/dashboard" className="hover:text-neutral-800 dark:hover:text-neutral-200">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
