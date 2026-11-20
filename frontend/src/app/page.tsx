"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTab, TabsPanel } from "@ui-sdk/react/tabs";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  ArrowRight,
  Check,
  FileText,
  Brain,
  Layers,
  BarChart3,
  RotateCw,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  ChevronRight,
  ChevronDown,
  Target,
  Send,
  Calendar,
  User,
} from "@/components/ui/Icons";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string>("B");
  const [quizSubmitted, setQuizSubmitted] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>("good");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Keyboard shortcut: Space to flip card in flashcard tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && activeTab === "flashcard") {
        const target = e.target as HTMLElement;
        if (target && ["INPUT", "TEXTAREA", "BUTTON"].includes(target.tagName)) return;
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  const faqs = [
    {
      q: "How does LearnSphere prevent hallucinated citations?",
      a: "Every response is computed strictly against indexed vector chunks extracted from your uploaded PDFs with PyMuPDF. Claims reference exact page numbers and spatial bounding boxes, so you can verify each assertion directly in the primary literature.",
    },
    {
      q: "What document formats and file sizes are supported?",
      a: "LearnSphere natively parses PDFs, scanned documents with OCR, research papers, and syllabi up to 100MB per file. Multi-column academic layouts, mathematical notations, and tables are preserved during vectorization.",
    },
    {
      q: "How does the Socratic tutor differ from standard chatbots?",
      a: "Rather than providing passive summary snippets, the Socratic tutor guides you to deduce key principles through structured follow-up questions, testing your causal understanding and pointing out conceptual blind spots.",
    },
    {
      q: "How are flashcard intervals and quiz questions generated?",
      a: "Practice assessments and flashcards are synthesized deterministically from critical definitions and theoretical distinctions in the text. Retrieval ratings (Again, Hard, Good, Easy) feed into spaced-repetition schedules calibrated toward your target exam dates.",
    },
    {
      q: "Can I export my study summaries and notes to other tools?",
      a: "Yes. All structured summaries, flashcard decks, and quiz reviews can be exported in one click to Markdown, Notion, or Anki-compatible CSV formats with full citation attributions.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#080c14] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-100 dark:selection:bg-blue-900/50">
      {/* 1. Header Navigation */}
      <header className="h-18 px-6 md:px-12 flex items-center justify-between max-w-7xl mx-auto w-full sticky top-0 bg-white/80 dark:bg-[#080c14]/80 backdrop-blur-md z-40 border-b border-slate-100 dark:border-slate-800/80">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-blue-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-slate-900 dark:text-slate-100">
            LearnSphere <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">AI</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a href="#why" className="hover:text-slate-950 dark:hover:text-white transition-colors">
            Why LearnSphere
          </a>
          <a href="#how-it-works" className="hover:text-slate-950 dark:hover:text-white transition-colors">
            How it works
          </a>
          <a href="#studio" className="hover:text-slate-950 dark:hover:text-white transition-colors">
            Interactive studio
          </a>
          <a href="#pricing" className="hover:text-slate-950 dark:hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#faqs" className="hover:text-slate-950 dark:hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 transition-colors"
          >
            Sign in
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white border-transparent rounded-xl shadow-sm shadow-blue-500/25">
              Launch workspace
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. Hero Section with Floating Chips */}
      <section className="pt-20 pb-20 md:pt-28 md:pb-28 px-6 max-w-7xl mx-auto w-full relative overflow-hidden">
        {/* Decorative Floating Pill Badges */}
        <div className="hidden lg:block absolute left-8 top-28 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm shadow-slate-200/50 dark:shadow-none transition-transform hover:-translate-y-0.5 duration-300">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            PDF Layout Parser
          </span>
        </div>

        <div className="hidden lg:block absolute right-12 top-24 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm shadow-slate-200/50 dark:shadow-none">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            99.2% Citation Accuracy
          </span>
        </div>

        <div className="hidden lg:block absolute left-14 bottom-24 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm shadow-slate-200/50 dark:shadow-none">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Socratic AI Guidance
          </span>
        </div>

        <div className="hidden lg:block absolute right-16 bottom-20 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-full px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-sm shadow-slate-200/50 dark:shadow-none">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Spaced Retrieval Engine
          </span>
        </div>

        {/* Main Hero Header */}
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-950 dark:text-white leading-[1.12]">
            The fastest way to master complex course readings
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload dense textbooks, legal casebooks, and research papers. LearnSphere extracts exact page layout coordinates, grounds Socratic dialogues, and generates active recall practice.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="h-11 px-7 text-sm font-semibold w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white border-transparent rounded-xl shadow-md shadow-blue-500/25">
                Start for free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#studio" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-11 px-7 text-sm font-medium w-full sm:w-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl">
                Explore interactive console
              </Button>
            </a>
          </div>

          {/* Trust Banner / University Logos */}
          <div className="pt-16 space-y-4">
            <p className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
              Trusted by students and researchers at top institutions
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-sm font-semibold text-slate-400 dark:text-slate-500">
              <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">HARVARD</span>
              <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">STANFORD</span>
              <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">MIT</span>
              <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">OXFORD</span>
              <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">CAMBRIDGE</span>
              <span className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">BERKELEY</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bento Grid: "Why LearnSphere?" */}
      <section id="why" className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
              Why LearnSphere?
            </h2>
            <p className="text-sm text-slate-500 mt-2 max-w-lg">
              Designed from first principles to turn passive reading into active, verifiable academic mastery.
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Bento Card 1: Intelligent Writing Assistant / Socratic Tutor (Large Left) */}
          <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900/60 p-8 flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Socratic Query</span>
                  <span>Principles_of_Neural_Science.pdf</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  How does long-term potentiation differ from short-term synaptic facilitation?
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs text-slate-800 dark:text-slate-200 space-y-2">
                  <p>
                    LTP induces persistent postsynaptic changes via NMDA receptor activation and AMPA receptor insertion lasting hours or days.
                  </p>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[11px] font-semibold">
                    Page 214 §3 • Grounded Excerpt
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-bold text-slate-950 dark:text-white">
                Intelligent Socratic Assistant
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
                Ask deep conceptual questions. Every response verifies claims against primary text excerpts and challenges your understanding with deductive probes.
              </p>
            </div>
          </div>

          {/* Right Column Stack */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Bento Card 2: Multi-Format Synthesis */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900/60 p-8 space-y-5 shadow-xs flex-1">
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                  Multi-Format Synthesis
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generate citation-grounded notes tailored to your learning style.
                </p>
              </div>

              {/* Formats Grid Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <span className="p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Key Takeaways
                </span>
                <span className="p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Executive Digest
                </span>
                <span className="p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Study Guide
                </span>
                <span className="p-2.5 rounded-xl bg-white dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Concept Hierarchy
                </span>
              </div>
            </div>

            {/* Bento Card 3 & 4 (Split row) */}
            <div className="grid grid-cols-2 gap-6">
              {/* Stat card */}
              <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900/60 p-6 flex flex-col justify-between shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center font-bold">
                  <Target className="w-4 h-4" />
                </div>
                <div className="space-y-0.5 pt-4">
                  <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                    99.2%
                  </p>
                  <p className="text-xs text-slate-500">Citation match accuracy</p>
                </div>
              </div>

              {/* Community card (Vibrant Blue) */}
              <div className="rounded-3xl bg-blue-600 text-white p-6 flex flex-col justify-between shadow-md shadow-blue-500/20">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-blue-400 border-2 border-blue-600 flex items-center justify-center text-[10px] font-bold">JD</div>
                  <div className="w-7 h-7 rounded-full bg-blue-300 border-2 border-blue-600 flex items-center justify-center text-[10px] font-bold text-blue-900">AR</div>
                  <div className="w-7 h-7 rounded-full bg-blue-200 border-2 border-blue-600 flex items-center justify-center text-[10px] font-bold text-blue-900">EV</div>
                </div>
                <div className="space-y-0.5 pt-4">
                  <p className="text-2xl font-bold tracking-tight">50,000+</p>
                  <p className="text-xs text-blue-100">Scholars studying with LearnSphere</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "How It Works" Section */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-slate-100 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
            How it works
          </h2>
          <p className="text-sm text-slate-500">
            Three simple steps to transform complex textbooks into lifelong comprehension.
          </p>
        </div>

        <div className="space-y-8">
          {/* Step 1: Upload */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900/60 p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-xs">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Step 01</span>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                Upload your course literature
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Add dense PDFs, syllabi, or legal casebooks. PyMuPDF extracts text while preserving spatial layout, equations, and tables for high-precision vector indexing.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Supported Formats</span>
                <span className="text-emerald-600 font-semibold">100MB Max File</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200">
                  Textbooks (.pdf)
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200">
                  Research Papers
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200">
                  Legal Casebooks
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200">
                  Lecture Slides
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Socratic Inquire */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900/60 p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-xs">
            <div className="order-2 md:order-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <span>Verified Source Inspector</span>
                <span className="text-blue-600 font-semibold">Page 214 §3</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                &ldquo;High-frequency stimulation leads to calcium influx through the open pore of NMDA receptors, triggering insertion of AMPA receptors...&rdquo;
              </div>
              <div className="text-[11px] text-slate-400">
                Bounding Box coordinates: x: 72, y: 340, w: 468, h: 84
              </div>
            </div>

            <div className="order-1 md:order-2 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Step 02</span>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                Inquire with verifiable page citations
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Ask challenging questions. The tutor answers with exact citations and highlights the corresponding paragraph in your document viewer in real time.
              </p>
            </div>
          </div>

          {/* Step 3: Active Recall */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900/60 p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center shadow-xs">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Step 03</span>
              <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                Retain with active recall & diagnostic quizzes
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Lock in knowledge using 3D interactive flashcards with spacebar flip and server-evaluated multiple choice assessments with pedagogical explanations.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 p-6 space-y-4 shadow-xs">
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <span className="text-[10px] uppercase font-semibold text-blue-400">Active Recall Card</span>
                <p className="text-xs font-medium leading-relaxed">
                  What is the primary mechanism distinguishing electrical synapses from chemical synapses?
                </p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <span className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold">[1] Again</span>
                <span className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold">[2] Hard</span>
                <span className="p-2 rounded-lg border border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">[3] Good</span>
                <span className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold">[4] Easy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Studio: Elevated App Showcase */}
      <section id="studio" className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-slate-100 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
            Master complex curricula quickly and easily
          </h2>
          <p className="text-sm text-slate-500">
            Test the live studio console below: switch between Socratic inquiry, flashcards, diagnostic quiz, and summary.
          </p>
        </div>

        {/* Elevated Desktop Browser Frame */}
        <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          {/* macOS-style Window Chrome */}
          <div className="h-11 px-4 bg-slate-100/80 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
            </div>

            <div className="px-4 py-1 rounded-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-mono text-slate-500 truncate max-w-xs">
              learnsphere.ai/workspace/tutor
            </div>

            <div className="w-12" />
          </div>

          {/* Embedded Studio Workbench */}
          <Tabs value={activeTab} onValueChange={(val) => { if (val) setActiveTab(val); }}>
            {/* Console Toolbar */}
            <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Text:
                </span>
                <span className="text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Principles_of_Neural_Science_Ch12.pdf
                </span>
              </div>

              {/* @ui-sdk/react TabsList */}
              <TabsList className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 gap-1 w-full sm:w-auto">
                <TabsTab
                  value="chat"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-slate-600 dark:text-slate-400 data-selected:bg-white data-selected:text-blue-700 data-selected:shadow-xs dark:data-selected:bg-slate-900 dark:data-selected:text-blue-400"
                >
                  Socratic AI Tutor
                </TabsTab>
                <TabsTab
                  value="flashcard"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-slate-600 dark:text-slate-400 data-selected:bg-white data-selected:text-blue-700 data-selected:shadow-xs dark:data-selected:bg-slate-900 dark:data-selected:text-blue-400"
                >
                  Recall Flashcards
                </TabsTab>
                <TabsTab
                  value="quiz"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-slate-600 dark:text-slate-400 data-selected:bg-white data-selected:text-blue-700 data-selected:shadow-xs dark:data-selected:bg-slate-900 dark:data-selected:text-blue-400"
                >
                  Practice Quiz
                </TabsTab>
                <TabsTab
                  value="summary"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-slate-600 dark:text-slate-400 data-selected:bg-white data-selected:text-blue-700 data-selected:shadow-xs dark:data-selected:bg-slate-900 dark:data-selected:text-blue-400"
                >
                  Summary
                </TabsTab>
              </TabsList>
            </div>

            {/* TAB 1: Socratic AI Tutor */}
            <TabsPanel value="chat" className="focus:outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
                {/* Left 7 Cols: Chat Dialog */}
                <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 space-y-6">
                  <div className="space-y-4">
                    {/* User Query */}
                    <div className="flex gap-3 items-start justify-end">
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-xs p-3.5 max-w-md text-xs leading-relaxed shadow-sm shadow-blue-500/20">
                        How does long-term potentiation differ from short-term facilitation at hippocampal synapses?
                      </div>
                    </div>

                    {/* Socratic AI Response */}
                    <div className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0 text-xs font-bold">
                        AI
                      </div>
                      <div className="space-y-3 max-w-lg">
                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl rounded-tl-xs p-4 text-xs leading-relaxed border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 space-y-2.5">
                          <p>
                            Short-term facilitation depends on residual presynaptic calcium accumulation lasting hundreds of milliseconds.
                          </p>
                          <p>
                            In contrast, long-term potentiation (LTP) induces persistent postsynaptic changes via NMDA receptor activation and AMPA receptor recruitment, persisting for hours or days.
                          </p>

                          {/* Interactive Citation Coordinates */}
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2">
                            <span className="text-[11px] font-medium text-slate-500">
                              Verified Grounding:
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              Page 214 §3 • Paragraph 2
                            </span>
                          </div>
                        </div>

                        {/* Socratic Follow-Up Probe */}
                        <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <p className="leading-relaxed">
                            <strong>Socratic Check:</strong> What would happen to LTP induction if you introduced an intracellular calcium chelator into the postsynaptic CA1 neuron?
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Bar */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <input
                        type="text"
                        readOnly
                        value=" Chelating postsynaptic Ca²⁺ prevents calmodulin kinase activation..."
                        className="w-full bg-transparent text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-default font-sans"
                      />
                      <Button size="sm" className="h-8 px-4 text-xs bg-blue-600 hover:bg-blue-700 text-white shrink-0 rounded-lg">
                        Send
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right 5 Cols: Citation & Excerpt Inspector */}
                <div className="lg:col-span-5 p-6 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        Primary Source Inspector
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                        99.2% match confidence
                      </span>
                    </div>

                    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-5 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Principles of Neural Science</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">p. 214</span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                        &ldquo;High-frequency stimulation leads to substantial calcium influx through the open pore of NMDA receptors... This activates calcium/calmodulin-dependent protein kinase II (CaMKII), triggering the insertion of AMPA receptors into the postsynaptic membrane.&rdquo;
                      </div>

                      <div className="text-[11px] text-slate-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Bounding Box:</span>
                          <span className="text-slate-700 dark:text-slate-300">x: 72, y: 340, w: 468, h: 84</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Vector Storage:</span>
                          <span className="text-slate-700 dark:text-slate-300">pgvector (768-dim cosine)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>Full text chunk indexed</span>
                    <Link href="/tutor" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1">
                      Open full workspace <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </TabsPanel>

            {/* TAB 2: Active Recall Flashcards */}
            <TabsPanel value="flashcard" className="focus:outline-none p-6 md:p-8">
              <div className="max-w-xl mx-auto space-y-6">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      Neurotransmission Flashcard Set
                    </h3>
                    <p className="text-slate-500 text-[11px]">Card 03 of 10</p>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Press <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 font-semibold">Space</kbd> to flip
                  </span>
                </div>

                {/* 3D Flip Card */}
                <div
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="w-full h-72 [perspective:1000px] cursor-pointer select-none"
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm ${
                      isFlipped ? "[transform:rotateY(180deg)]" : ""
                    }`}
                  >
                    {/* FRONT */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white dark:bg-slate-850 rounded-2xl p-8 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold">Prompt</span>
                        <span>Click or Space to flip</span>
                      </div>
                      <div className="text-center my-auto px-4">
                        <p className="text-lg md:text-xl font-medium text-slate-900 dark:text-slate-100 leading-snug">
                          What is the fundamental mechanism distinguishing electrical synapses from chemical synapses?
                        </p>
                      </div>
                      <p className="text-center text-[11px] text-slate-400">
                        Recall your answer before verifying
                      </p>
                    </div>

                    {/* BACK */}
                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-slate-900 text-white rounded-2xl p-8 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-blue-400">Verified Answer</span>
                        <span>Page 178 §2</span>
                      </div>
                      <div className="text-center my-auto px-4">
                        <p className="text-sm md:text-base leading-relaxed text-slate-100 font-sans">
                          Electrical synapses conduct current instantaneously through gap-junction channels (connexons) with zero synaptic delay, whereas chemical synapses rely on vesicle exocytosis and neurotransmitter diffusion across a cleft.
                        </p>
                      </div>
                      <p className="text-center text-[11px] text-slate-400">
                        Rate your retrieval accuracy below
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating Buttons */}
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2.5">
                    {[
                      { key: "again", label: "Again", desc: "Forgot" },
                      { key: "hard", label: "Hard", desc: "Struggled" },
                      { key: "good", label: "Good", desc: "Recalled" },
                      { key: "easy", label: "Easy", desc: "Mastered" },
                    ].map((tier) => (
                      <button
                        key={tier.key}
                        onClick={() => setSelectedDifficulty(tier.key)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedDifficulty === tier.key
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold shadow-xs"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xs block font-semibold">{tier.label}</span>
                        <span className="text-[10px] text-slate-400">{tier.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </TabsPanel>

            {/* TAB 3: Practice Quiz */}
            <TabsPanel value="quiz" className="focus:outline-none p-6 md:p-8">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      Synaptic Plasticity Assessment
                    </h3>
                    <p className="text-[11px] text-slate-500">Question 02 of 05 • Medium Difficulty</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Server Evaluated
                  </span>
                </div>

                <div className="space-y-4">
                  <h4 className="text-base font-medium text-slate-900 dark:text-slate-100 leading-snug">
                    Which ionic mechanism is primarily responsible for the voltage-dependent magnesium unblock in NMDA receptors during LTP induction?
                  </h4>

                  <div className="space-y-2.5">
                    {[
                      { key: "A", text: "Hyperpolarization mediated by presynaptic GABA-B receptor activation." },
                      { key: "B", text: "Depolarization of the postsynaptic membrane mediated by AMPA receptor sodium influx." },
                      { key: "C", text: "Retrograde nitric oxide gas signaling stimulating guanylyl cyclase." },
                      { key: "D", text: "Direct calcium binding to the extracellular domain of GluN2B subunits." },
                    ].map((opt) => {
                      const isSelected = selectedQuizOption === opt.key;
                      const isCorrect = opt.key === "B";
                      return (
                        <button
                          key={opt.key}
                          onClick={() => {
                            setSelectedQuizOption(opt.key);
                            setQuizSubmitted(true);
                          }}
                          className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                            isSelected && isCorrect
                              ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30"
                              : isSelected && !isCorrect
                              ? "border-red-500 bg-red-50/60 dark:bg-red-950/30"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${
                              isSelected && isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                            {opt.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Correct • Option B
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                        At resting membrane potential, extracellular Mg²⁺ blocks the NMDA pore. Postsynaptic depolarization via AMPA receptors relieves this electrostatic block, allowing Ca²⁺ influx essential for LTP induction. (Grounded in Chapter 12, p. 215).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsPanel>

            {/* TAB 4: Summary */}
            <TabsPanel value="summary" className="focus:outline-none p-6 md:p-8">
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      Executive Summary & Key Takeaways
                    </h3>
                    <p className="text-[11px] text-slate-500">Principles_of_Neural_Science_Ch12.pdf</p>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Multi-Format Engine
                  </span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      1. Core Propositions
                    </h4>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Chemical synapses introduce an obligate 0.5–1.0 ms synaptic delay due to diffusion.</li>
                      <li>Electrical synapses enable bidirectional, instantaneous electrotonic transmission.</li>
                      <li>NMDA receptors operate as molecular coincidence detectors requiring both glutamate binding and membrane depolarization.</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 space-y-2">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                      2. Exam Revision Checklist
                    </h4>
                    <p>
                      Master the exact difference between early-LTP (protein-kinase phosphorylation of existing AMPA receptors) and late-LTP (CREB-dependent gene transcription and morphological spine enlargement).
                    </p>
                  </div>
                </div>
              </div>
            </TabsPanel>
          </Tabs>
        </div>
      </section>

      {/* 6. Pricing Section */}
      <section id="pricing" className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-slate-100 dark:border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
            Choose a pricing plan
          </h2>
          <p className="text-sm text-slate-500">
            Transparent plans for individual scholars, researchers, and university cohorts.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700 mt-4">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("annual")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                billingCycle === "annual"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Annual <span className="text-[10px] text-blue-600 font-bold ml-1">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Card 1: Starter / Free */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900/60 p-8 flex flex-col justify-between space-y-8 shadow-xs">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">Starter</h3>
                <p className="text-xs text-slate-500 mt-0.5">For undergraduates and introductory courses</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">$0</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pt-2">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Up to 5 indexed textbooks & PDFs</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Citation-grounded AI Tutor</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Spaced retrieval flashcards</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Standard community support</span>
                </li>
              </ul>
            </div>

            <Link href="/dashboard" className="block">
              <Button variant="outline" className="w-full text-xs h-10 font-semibold bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 rounded-xl">
                Start for free
              </Button>
            </Link>
          </div>

          {/* Card 2: Pro (Highlighted) */}
          <div className="rounded-3xl border-2 border-blue-600 bg-white dark:bg-slate-900 p-8 flex flex-col justify-between space-y-8 shadow-lg shadow-blue-500/10 relative">
            <div className="absolute -top-3.5 right-8 bg-blue-600 text-white text-[11px] font-semibold px-3 py-0.5 rounded-full shadow-xs">
              Most Popular
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">Researcher Pro</h3>
                <p className="text-xs text-slate-500 mt-0.5">For graduate researchers and bar/med candidates</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {billingCycle === "annual" ? "$12" : "$15"}
                </span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pt-2">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Unlimited indexed documents & books</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Priority Socratic inference (Gemini 2.5)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>All 6 synthesis and summary frameworks</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Exam syllabus milestone planner</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>One-click export to Markdown & Anki</span>
                </li>
              </ul>
            </div>

            <Link href="/register" className="block">
              <Button className="w-full text-xs h-10 font-semibold bg-blue-600 hover:bg-blue-700 text-white border-transparent rounded-xl shadow-md shadow-blue-500/25">
                Get started with Pro
              </Button>
            </Link>
          </div>

          {/* Card 3: Enterprise / Cohort */}
          <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900/60 p-8 flex flex-col justify-between space-y-8 shadow-xs">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">Campus Cohort</h3>
                <p className="text-xs text-slate-500 mt-0.5">For academic departments and study groups</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {billingCycle === "annual" ? "$48" : "$60"}
                </span>
                <span className="text-xs text-slate-500">/ term / seat</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400 pt-2">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Shared department corpus library</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Collaborative flashcard decks & quizzes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Cohort mastery progress dashboard</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Dedicated cloud storage SLA</span>
                </li>
              </ul>
            </div>

            <Link href="/register" className="block">
              <Button variant="outline" className="w-full text-xs h-10 font-semibold bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700 rounded-xl">
                Contact department sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Testimonial / "What people are saying" */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
              What scholars are saying
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Read how researchers and graduate students use LearnSphere to retain dense literature for high-stakes exams.
            </p>

            {/* Testimonial Photo Card */}
            <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900 p-6 flex items-center gap-4 shadow-xs mt-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm shadow-blue-500/20">
                EV
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">Dr. Eleanor Vance</p>
                <p className="text-xs text-slate-500">Doctoral Fellow in Cognitive Neuroscience</p>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-0.5">Columbia University</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900/60 p-8 md:p-12 space-y-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>

            <p className="text-lg md:text-xl font-medium leading-relaxed text-slate-800 dark:text-slate-200">
              &ldquo;Preparing for my qualifying exams required reviewing over 2,000 pages of neurobiology papers. LearnSphere completely eliminated the hallucination problem: I can immediately click any AI claim and inspect the exact bounding box citation in the original text.&rdquo;
            </p>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Verified Scholar Review • 5.0 Star Rating</span>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors">
                  ←
                </button>
                <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions (Accordion) */}
      <section id="faqs" className="py-20 px-6 max-w-4xl mx-auto w-full border-t border-slate-100 dark:border-slate-800">
        <div className="text-center space-y-3 mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
            Frequently asked questions
          </h2>
          <p className="text-sm text-slate-500">
            Everything you need to know about citation grounding, vector search, and spaced repetition.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900/60 overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center border border-slate-200 dark:border-slate-700 transition-transform ${
                      isOpen ? "rotate-180 bg-blue-600 text-white border-transparent" : "text-slate-400 bg-white dark:bg-slate-800"
                    }`}
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 font-sans">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Bottom CTA Banner */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full border-t border-slate-100 dark:border-slate-800">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-900/80 p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
              Brainstorm. Learn. Excel.
            </h2>
            <p className="text-sm text-slate-500 max-w-lg">
              Start transforming your dense course readings into verified, high-retention study assets in under 60 seconds.
            </p>
          </div>

          <Link href="/dashboard" className="shrink-0">
            <Button size="lg" className="h-12 px-8 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white border-transparent rounded-xl shadow-md shadow-blue-500/25">
              Launch free workspace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 10. Multi-Column Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-16 px-6 md:px-12 max-w-7xl mx-auto w-full text-xs text-slate-500">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-slate-100">
                LearnSphere <span className="text-blue-600 dark:text-blue-400 font-medium">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              The citation-grounded learning engine engineered for rigorous undergraduate and graduate curricula. Page-accurate vector extraction and active recall drills.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs">𝕏</span>
              <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs">in</span>
              <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold text-xs">GH</span>
            </div>
          </div>

          {/* Column 1 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2">
              <li><a href="#why" className="hover:text-slate-900 dark:hover:text-white transition-colors">Why LearnSphere</a></li>
              <li><a href="#studio" className="hover:text-slate-900 dark:hover:text-white transition-colors">Interactive Console</a></li>
              <li><a href="#how-it-works" className="hover:text-slate-900 dark:hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
              Studio
            </h4>
            <ul className="space-y-2">
              <li><Link href="/tutor" className="hover:text-slate-900 dark:hover:text-white transition-colors">Socratic AI Tutor</Link></li>
              <li><Link href="/studio/flashcards" className="hover:text-slate-900 dark:hover:text-white transition-colors">Active Recall Cards</Link></li>
              <li><Link href="/studio/quizzes" className="hover:text-slate-900 dark:hover:text-white transition-colors">Practice Quizzes</Link></li>
              <li><Link href="/studio/summaries" className="hover:text-slate-900 dark:hover:text-white transition-colors">Structured Summaries</Link></li>
            </ul>
          </div>

          {/* Column 3: Newsletter */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
              Stay Informed
            </h4>
            <p className="text-[11px] text-slate-500">
              Get cognitive science research and syllabus study templates.
            </p>
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="email"
                placeholder="scholar@university.edu"
                className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shrink-0"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © 2026 LearnSphere Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/security" className="hover:underline">Security Audit</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}