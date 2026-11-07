import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  Sparkles,
  BookOpen,
  MessageSquare,
  Brain,
  Layers,
  ArrowRight,
  CheckCircle2,
  Trophy,
  UploadCloud,
  FileText,
} from "@/components/ui/Icons";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      {/* Navigation Bar */}
      <header className="h-20 border-b border-neutral-100 dark:border-neutral-800 px-6 md:px-12 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-neutral-900 dark:text-white">
            LearnSphere <span className="text-primary-600 font-black">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="shadow-sm shadow-primary-500/20">
              Open App <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 px-6 max-w-7xl mx-auto w-full text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-primary-500" />
          <span>The Next-Generation Active Learning Workspace</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Turn Your Documents Into{" "}
          <span className="bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 bg-clip-text text-transparent">
            Active Knowledge
          </span>
        </h1>

        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Stop passively reading hundreds of PDF pages. LearnSphere AI extracts, indexes, and transforms textbooks into grounded AI tutoring, deterministic practice quizzes, and 3D flashcards.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-lg shadow-primary-500/25">
              Launch Learning Workspace <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
              Sign In / Student Portal
            </Button>
          </Link>
        </div>

        {/* Floating Feature Badges */}
        <div className="pt-10 flex flex-wrap justify-center items-center gap-6 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Zero Hallucination Citations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Server-Authoritative Quiz Scoring</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>3D Flip Active Recall</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>pgvector Semantic Search</span>
          </div>
        </div>

        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-500/10 dark:bg-primary-500/15 blur-3xl rounded-full pointer-events-none -z-10" />
      </section>

      {/* The 4-Stage Cycle Section */}
      <section className="py-20 bg-neutral-50 dark:bg-neutral-900/50 border-y border-neutral-200 dark:border-neutral-800 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold tracking-wider uppercase text-primary-600">
              The Pedagogical Engine
            </h2>
            <h3 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
              The 4-Stage Active Learning Cycle
            </h3>
            <p className="text-sm text-neutral-500 max-w-xl mx-auto">
              Engineered based on cognitive science: retrieval practice, spaced repetition, and dual-coding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Stage 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                Upload & Convert
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Ingest PDF textbooks, syllabi, or lecture slides. PyMuPDF extracts text by page, preserving coordinates and chunk boundaries.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                Understand
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Converse with your AI Tutor with strict inline page citations. Synthesize into 6 distinct summary styles.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                Practice
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Test knowledge with server-authoritative multiple choice quizzes and interactive 3D flip card recall decks.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center font-bold">
                4
              </div>
              <h4 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                Improve
              </h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Track persisted performance metrics, identify weak topics with real SQL aggregations, and follow adaptive recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 py-8 px-6 text-center text-xs text-neutral-500">
        <p>© 2026 LearnSphere AI. Developed for active, measurable education.</p>
      </footer>
    </div>
  );
}
