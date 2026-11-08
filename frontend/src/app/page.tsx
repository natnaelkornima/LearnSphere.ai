"use client";

import React, { useState } from "react";
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
  RotateCw,
  CheckCircle2,
  Clock,
  Sparkles,
} from "@/components/ui/Icons";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"ingest" | "chat" | "flashcard" | "quiz">("chat");
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>("B");
  const [quizSubmitted, setQuizSubmitted] = useState(true);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="h-16 border-b border-[var(--border)] px-6 md:px-10 flex items-center justify-between max-w-7xl mx-auto w-full sticky top-0 bg-[var(--background)]/90 backdrop-blur-md z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
              LearnSphere <span className="text-neutral-400 font-normal">AI</span>
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
              v2.4
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
          <a href="#cycle" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Cognitive loop
          </a>
          <a href="#demo" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Interactive preview
          </a>
          <a href="#matrix" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Why LearnSphere
          </a>
          <a href="#disciplines" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
            Disciplines
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-2.5 py-1.5 transition-colors"
          >
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
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Headline and Call-to-Action */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--surface-secondary)] text-xs font-mono text-neutral-600 dark:text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Grounded on course documents</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-medium tracking-tight text-neutral-950 dark:text-neutral-50 leading-[1.08]">
              Turn course readings into verified notes, quizzes, and recall sets
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
              Upload a textbook, paper, or syllabus. LearnSphere extracts exact page coordinates, answers questions with verified paragraph citations, and creates server-evaluated retrieval practice.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
              <Link href="/dashboard">
                <Button size="lg" className="h-11 px-6 text-xs sm:text-sm font-medium w-full sm:w-auto">
                  Open workspace <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-11 px-5 text-xs sm:text-sm font-medium w-full sm:w-auto">
                  Try student demo
                </Button>
              </Link>
            </div>

            {/* Architecture Claims */}
            <div className="pt-4 grid grid-cols-3 gap-3 text-xs text-neutral-500 border-t border-[var(--border)]">
              <div>
                <p className="font-mono text-[11px] text-neutral-900 dark:text-neutral-200">768-dim RAG</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Vector chunk embeddings</p>
              </div>
              <div>
                <p className="font-mono text-[11px] text-neutral-900 dark:text-neutral-200">PyMuPDF OCR</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Exact page coordinates</p>
              </div>
              <div>
                <p className="font-mono text-[11px] text-neutral-900 dark:text-neutral-200">Hidden Keys</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Server evaluated grading</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Product Preview */}
          <div className="lg:col-span-6" id="demo">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs overflow-hidden">
              {/* Window Tab Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-neutral-50/70 dark:bg-neutral-850">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-600 inline-block" />
                </div>

                {/* Workspace Mode Tabs */}
                <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 p-0.5 rounded-md border border-[var(--border)]">
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                      activeTab === "chat"
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                    }`}
                  >
                    Grounded chat
                  </button>
                  <button
                    onClick={() => setActiveTab("flashcard")}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                      activeTab === "flashcard"
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                    }`}
                  >
                    Recall deck
                  </button>
                  <button
                    onClick={() => setActiveTab("quiz")}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                      activeTab === "quiz"
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                    }`}
                  >
                    Practice quiz
                  </button>
                  <button
                    onClick={() => setActiveTab("ingest")}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                      activeTab === "ingest"
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
                    }`}
                  >
                    Source PDF
                  </button>
                </div>
              </div>

              {/* Tab 1: Grounded Socratic Chat */}
              {activeTab === "chat" && (
                <div className="p-5 space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-[var(--border)]">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      Socratic Session · Cell Biology
                    </span>
                    <span className="font-mono text-[11px] text-neutral-400">Scoped: Lehninger_Ch19.pdf</span>
                  </div>

                  {/* Student Question */}
                  <div className="flex gap-2.5 max-w-md ml-auto flex-row-reverse text-right">
                    <div className="w-5 h-5 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[10px] font-mono flex items-center justify-center shrink-0">
                      YOU
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-900 text-neutral-100 dark:bg-neutral-800 text-xs text-left leading-relaxed">
                      How does the chemiosmotic coupling mechanism drive ATP synthesis across the inner mitochondrial membrane?
                    </div>
                  </div>

                  {/* Verified Tutor Response */}
                  <div className="flex gap-2.5 max-w-lg mr-auto">
                    <div className="w-5 h-5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 text-[10px] font-mono flex items-center justify-center shrink-0">
                      AI
                    </div>
                    <div className="p-3.5 rounded-lg border border-[var(--border)] bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100 space-y-2.5 leading-relaxed">
                      <p>
                        Peter Mitchell&apos;s chemiosmotic hypothesis states that the electrochemical proton gradient (ΔμH⁺) created by the electron transport chain stores potential energy. This proton-motive force drives protons through the F₀ subunit of ATP synthase, inducing conformational rotation in the F₁ catalytic domain that phosphorylates ADP into ATP.
                      </p>
                      <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                        <span className="text-[11px] text-neutral-500">Verified source citation:</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border border-primary-200 dark:border-primary-900 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300">
                          p. 732 §3
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Interactive 3D Flashcard */}
              {activeTab === "flashcard" && (
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-[var(--border)]">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      Recall Card 04 of 12
                    </span>
                    <span className="font-mono text-[11px] text-neutral-400">Click card or Space to flip</span>
                  </div>

                  <div
                    className="w-full h-48 [perspective:1000px] cursor-pointer"
                    onClick={() => setIsFlipped((prev) => !prev)}
                  >
                    <div
                      className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] rounded-lg border border-[var(--border)] ${
                        isFlipped ? "[transform:rotateY(180deg)]" : ""
                      }`}
                    >
                      {/* Front */}
                      <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-[#faf9f6] dark:bg-[#151412] p-5 flex flex-col justify-between rounded-lg">
                        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                          <span>PROMPT</span>
                          <span>[ CLICK TO REVEAL ]</span>
                        </div>
                        <p className="text-sm font-medium text-center text-neutral-900 dark:text-neutral-100">
                          What is the stoichiometry of protons pumped per NADH oxidized in mammalian Complex I, III, and IV?
                        </p>
                        <p className="text-center text-[11px] text-neutral-400 font-mono">
                          Space to flip
                        </p>
                      </div>

                      {/* Back */}
                      <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#1c1a17] text-white p-5 flex flex-col justify-between rounded-lg border border-neutral-700">
                        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                          <span>VERIFIED ANSWER</span>
                          <span>p. 735 §2</span>
                        </div>
                        <p className="text-xs text-center text-neutral-100 leading-relaxed font-sans">
                          A total of <strong>10 H⁺</strong> are translocated across the inner membrane: 4 H⁺ by Complex I, 4 H⁺ by Complex III, and 2 H⁺ by Complex IV per pair of electrons.
                        </p>
                        <div className="flex justify-center gap-1.5 pt-1">
                          <span className="px-2 py-0.5 rounded border border-neutral-700 text-[10px] font-mono">1 Again</span>
                          <span className="px-2 py-0.5 rounded border border-neutral-700 text-[10px] font-mono">2 Hard</span>
                          <span className="px-2 py-0.5 rounded border border-neutral-700 text-[10px] font-mono text-emerald-400">3 Good</span>
                          <span className="px-2 py-0.5 rounded border border-neutral-700 text-[10px] font-mono">4 Easy</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Practice Assessment */}
              {activeTab === "quiz" && (
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-[var(--border)]">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      Practice Assessment · Server Evaluated
                    </span>
                    <span className="font-mono text-[11px] text-neutral-400">Question 2 of 5</span>
                  </div>

                  <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                    Which inhibitor specifically targets Complex IV by binding to the heme a₃-Cu_B binuclear center?
                  </p>

                  <div className="space-y-1.5">
                    {[
                      { key: "A", label: "Rotenone" },
                      { key: "B", label: "Cyanide (CN⁻) and Carbon Monoxide" },
                      { key: "C", label: "Antimycin A" },
                      { key: "D", label: "Oligomycin" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => setSelectedQuizOption(opt.key)}
                        className={`w-full p-2.5 rounded-md border text-left text-xs flex items-center justify-between transition-colors ${
                          selectedQuizOption === opt.key
                            ? "border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800 font-medium"
                            : "border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] text-neutral-500">{opt.key}.</span>
                          <span>{opt.label}</span>
                        </div>
                        {selectedQuizOption === opt.key && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100" />
                        )}
                      </button>
                    ))}
                  </div>

                  {quizSubmitted && (
                    <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-800 dark:text-emerald-300">
                      <strong>Correct (Answer B):</strong> Cyanide blocks the transfer of electrons from cytochrome oxidase to oxygen. Grounded in <em>Lehninger_Ch19.pdf, p. 738</em>.
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Raw PDF Excerpt */}
              {activeTab === "ingest" && (
                <div className="p-5 space-y-3 font-serif">
                  <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-[var(--border)] font-sans">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      PyMuPDF Document Chunk Inspector
                    </span>
                    <span className="font-mono text-[11px] text-neutral-400">p. 732 · Bounding Box [45, 120, 520, 680]</span>
                  </div>

                  <div className="p-4 rounded-md bg-[#faf8f2] dark:bg-[#181714] border border-[#e6dfd1] dark:border-[#2e2a22] text-xs leading-relaxed text-neutral-800 dark:text-neutral-200">
                    &ldquo;...ATP synthase is embedded within the inner mitochondrial membrane, converting electrochemical proton potential into high-energy phosphate bonds through mechanical rotation. The enzyme comprises two functional units: F₀, an integral membrane oligomer acting as the proton pore, and F₁, a peripheral complex bearing three catalytic nucleotide-binding sites.&rdquo;
                  </div>

                  <div className="text-[11px] font-mono text-neutral-400 font-sans flex items-center justify-between">
                    <span>Chunk ID: chk_098a12</span>
                    <span>768-dim vector embedding generated</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Academic Institution Validation Bar */}
      <section className="py-8 border-y border-[var(--border)] bg-[var(--surface)] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-neutral-500 font-medium">
            Designed for rigorous university curricula and graduate examinations:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-xs font-mono font-semibold tracking-wider text-neutral-400 dark:text-neutral-500">
            <span>OXFORD</span>
            <span>HARVARD</span>
            <span>STANFORD</span>
            <span>JOHNS HOPKINS</span>
            <span>CAMBRIDGE</span>
            <span>MIT</span>
          </div>
        </div>
      </section>

      {/* The 4-Stage Cognitive Loop Section */}
      <section id="cycle" className="py-20 md:py-24 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="space-y-2 max-w-xl">
          <p className="text-xs font-mono text-neutral-500">
            The cognitive cycle
          </p>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
            Engineered for retrieval strength, not passive re-reading
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Every lecture reading or textbook moves through four strictly verifiable stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <span className="font-mono text-xs text-neutral-400">01</span>
            <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-neutral-500" />
              Ingest & Index
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              PyMuPDF preserves layout coordinates and page boundaries. Text chunks are embedded into 768-dimensional vector space for deterministic cosine retrieval.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <span className="font-mono text-xs text-neutral-400">02</span>
            <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-neutral-500" />
              Understand & Cite
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Ask targeted questions scoped to one chapter or an entire syllabus. Every factual assertion carries an inline page pill linking directly to the source excerpt.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <span className="font-mono text-xs text-neutral-400">03</span>
            <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Brain className="w-4 h-4 text-neutral-500" />
              Active Retrieval
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Practice with 3D flip flashcards and server-evaluated multiple-choice tests. Spaced repetition intervals adjust according to your recorded recall strength.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <span className="font-mono text-xs text-neutral-400">04</span>
            <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-neutral-500" />
              Measure & Master
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Aggregated analytics spotlight retention decay and flag weak sub-topics before examination day, keeping study streaks grounded in real performance.
            </p>
          </div>
        </div>
      </section>

      {/* Startup Contrast Matrix: Why LearnSphere Beats Generic LLMs & Static Flashcards */}
      <section id="matrix" className="py-20 border-t border-[var(--border)] bg-[var(--surface)] px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-mono text-neutral-500">The architectural difference</p>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
              Why generic chatbots fail for academic study
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Generic language models hallucinate page numbers and offer passive reading. LearnSphere anchors every interaction to your verified syllabus.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="border border-[var(--border)] rounded-lg overflow-x-auto bg-[var(--background)]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-neutral-100/60 dark:bg-neutral-850">
                  <th className="p-4 font-medium text-neutral-500">Capability</th>
                  <th className="p-4 font-medium text-neutral-500">Generic Chatbots (ChatGPT / Claude)</th>
                  <th className="p-4 font-medium text-neutral-500">Manual Flashcards (Anki / Quizlet)</th>
                  <th className="p-4 font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-200/50 dark:bg-neutral-800">
                    LearnSphere AI Grounded Loop
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                <tr>
                  <td className="p-4 font-medium text-neutral-900 dark:text-neutral-100">Source Fidelity</td>
                  <td className="p-4 text-neutral-500">Hallucinates citations and invented theorems</td>
                  <td className="p-4 text-neutral-500">Manual copy-pasting required</td>
                  <td className="p-4 font-medium text-neutral-900 dark:text-neutral-100 bg-neutral-200/20 dark:bg-neutral-800/40">
                    Strict pgvector RAG with exact page coordinates
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-neutral-900 dark:text-neutral-100">Page Reference</td>
                  <td className="p-4 text-neutral-500">None or fabricated page numbers</td>
                  <td className="p-4 text-neutral-500">Static notes disconnected from the book</td>
                  <td className="p-4 font-medium text-neutral-900 dark:text-neutral-100 bg-neutral-200/20 dark:bg-neutral-800/40">
                    Inline interactive citation pills (e.g. [p. 14 §2])
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-neutral-900 dark:text-neutral-100">Practice Assessments</td>
                  <td className="p-4 text-neutral-500">Answers reveal keys immediately without recording</td>
                  <td className="p-4 text-neutral-500">Flashcards only, no multi-choice diagnostics</td>
                  <td className="p-4 font-medium text-neutral-900 dark:text-neutral-100 bg-neutral-200/20 dark:bg-neutral-800/40">
                    Server-scored quizzes with hidden keys & explanations
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-neutral-900 dark:text-neutral-100">Preparation Time</td>
                  <td className="p-4 text-neutral-500">Requires endless prompt engineering</td>
                  <td className="p-4 text-neutral-500">Hours spent making flashcard decks</td>
                  <td className="p-4 font-medium text-neutral-900 dark:text-neutral-100 bg-neutral-200/20 dark:bg-neutral-800/40">
                    1-click synthesis of decks, quizzes & outlines
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Academic Disciplines in Action */}
      <section id="disciplines" className="py-20 md:py-24 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="space-y-2 max-w-xl">
          <p className="text-xs font-mono text-neutral-500">Discipline benchmarks</p>
          <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
            Validated across demanding curricula
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            From medical board preparations to statutory law and algorithmic derivations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <span className="font-mono text-xs text-neutral-400">Medicine & Pre-Med</span>
            <h3 className="font-medium text-base text-neutral-900 dark:text-neutral-100">
              USMLE & Pharmacology
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Ingest multi-thousand page texts like First Aid and Robbins Pathology. Extract biochemical pathway steps, drug side effects, and exact diagnostic criteria with zero citation drift.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <span className="font-mono text-xs text-neutral-400">Law & Jurisprudence</span>
            <h3 className="font-medium text-base text-neutral-900 dark:text-neutral-100">
              Casebooks & Statutes
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Upload appellate opinions and civil procedure codes. LearnSphere preserves exact slip opinion paragraph coordinates to cite holdings and dissents with clinical precision.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <span className="font-mono text-xs text-neutral-400">Engineering & STEM</span>
            <h3 className="font-medium text-base text-neutral-900 dark:text-neutral-100">
              Proofs & Mechanics
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              From advanced linear algebra to circuit theory. Synthesizes proof steps into incremental flashcards and multi-variable diagnostic questions verified against lecture notes.
            </p>
          </div>
        </div>
      </section>

      {/* Scholar & Student Testimonials */}
      <section className="py-20 border-t border-[var(--border)] bg-[var(--surface)] px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="space-y-2 max-w-xl">
            <p className="text-xs font-mono text-neutral-500">Student reflections</p>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
              What researchers and students say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--background)] space-y-3 flex flex-col justify-between">
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                &ldquo;Cut my biochemistry review time in half. Being able to click a citation pill and see the exact textbook paragraph prevents any AI hallucination anxiety.&rdquo;
              </p>
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Elena V.</p>
                <p className="text-[11px] font-mono text-neutral-400">MD-PhD Candidate, Johns Hopkins</p>
              </div>
            </div>

            <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--background)] space-y-3 flex flex-col justify-between">
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                &ldquo;For legal case briefs, traditional AI makes up holdings. LearnSphere references the exact slip opinion paragraph. It is indispensable for 1L exams.&rdquo;
              </p>
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Marcus T.</p>
                <p className="text-[11px] font-mono text-neutral-400">J.D. Candidate, Harvard Law</p>
              </div>
            </div>

            <div className="p-5 rounded-lg border border-[var(--border)] bg-[var(--background)] space-y-3 flex flex-col justify-between">
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                &ldquo;The server-scored quizzes feel like an actual professor wrote them directly from my course syllabus. It has completely replaced my manual Anki workflow.&rdquo;
              </p>
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">Priya K.</p>
                <p className="text-[11px] font-mono text-neutral-400">Computer Science M.S., Stanford</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action Callout */}
      <section className="py-20 md:py-24 px-6 border-t border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
            Begin with your next lecture reading
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Upload any course PDF syllabus or textbook chapter and have verified notes, flashcards, and practice quizzes ready in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/dashboard">
              <Button size="lg" className="h-11 px-7 text-xs sm:text-sm font-medium w-full sm:w-auto">
                Open workspace <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="h-11 px-6 text-xs sm:text-sm font-medium w-full sm:w-auto">
                Sign in with demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-12 px-6 text-xs text-neutral-500 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-[var(--border)]">
          <div className="space-y-2">
            <p className="font-medium text-neutral-900 dark:text-neutral-100">Product</p>
            <ul className="space-y-1.5 text-neutral-500">
              <li><Link href="/dashboard" className="hover:text-neutral-900 dark:hover:text-white">Workspace</Link></li>
              <li><Link href="/tutor" className="hover:text-neutral-900 dark:hover:text-white">Socratic Tutor</Link></li>
              <li><Link href="/studio/flashcards" className="hover:text-neutral-900 dark:hover:text-white">Recall Decks</Link></li>
              <li><Link href="/studio/quizzes" className="hover:text-neutral-900 dark:hover:text-white">Practice Tests</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-neutral-900 dark:text-neutral-100">Architecture</p>
            <ul className="space-y-1.5 text-neutral-500">
              <li><span>PyMuPDF Layout OCR</span></li>
              <li><span>PostgreSQL pgvector</span></li>
              <li><span>Google Gemini 2.5 Flash</span></li>
              <li><span>FastAPI Backend</span></li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-neutral-900 dark:text-neutral-100">Methodology</p>
            <ul className="space-y-1.5 text-neutral-500">
              <li><span>Active Retrieval Practice</span></li>
              <li><span>Spaced Repetition (FSRS)</span></li>
              <li><span>Grounded Verification</span></li>
              <li><span>Empirical Mastery Decay</span></li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-medium text-neutral-900 dark:text-neutral-100">Account</p>
            <ul className="space-y-1.5 text-neutral-500">
              <li><Link href="/login" className="hover:text-neutral-900 dark:hover:text-white">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-neutral-900 dark:hover:text-white">Create Account</Link></li>
              <li><Link href="/settings" className="hover:text-neutral-900 dark:hover:text-white">Preferences</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 LearnSphere AI. Grounded educational intelligence.</p>
          <p className="font-mono text-[11px] text-neutral-400">Strict page citation integrity</p>
        </div>
      </footer>
    </div>
  );
}
