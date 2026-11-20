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
} from "@/components/ui/Icons";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string>("B");
  const [quizSubmitted, setQuizSubmitted] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>("good");
  const [showCitationDrawer, setShowCitationDrawer] = useState(false);

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

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans selection:bg-[#e5ddca] dark:selection:bg-[#3b362c]">
      {/* Top Academic Header */}
      <header className="h-16 border-b border-[var(--border)] px-6 md:px-10 flex items-center justify-between max-w-7xl mx-auto w-full sticky top-0 bg-[var(--background)]/90 backdrop-blur-md z-40">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded border border-neutral-800 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm shadow-xs transition-transform group-hover:scale-[1.02]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-sm tracking-tight text-neutral-950 dark:text-neutral-50 font-serif">
              LearnSphere <span className="text-neutral-500 font-sans font-normal text-xs">AI</span>
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono border border-[var(--border)] bg-[var(--surface-secondary)] text-neutral-600 dark:text-neutral-400">
              edtech workspace · v2.4
            </span>
          </div>
        </Link>

        {/* Center Editorial Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
          <a href="#cycle" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
            Cognitive loop
          </a>
          <a href="#demo" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
            Interactive console
          </a>
          <a href="#matrix" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
            Architecture matrix
          </a>
          <a href="#disciplines" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
            Curricula
          </a>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-2 py-1.5 transition-colors font-medium"
          >
            Sign in
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="h-8 px-3.5 text-xs font-medium">
              Open workspace
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section: Asymmetric Scholarly Spread */}
      <section className="pt-14 pb-20 md:pt-20 md:pb-28 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          {/* Left Column: Thesis and Grounding Authority */}
          <div className="lg:col-span-6 space-y-6 text-left lg:pt-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-[var(--border)] bg-[var(--surface-secondary)] text-xs font-mono text-neutral-700 dark:text-neutral-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 inline-block" />
              <span>Strict page coordinate retrieval · zero citation drift</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[50px] font-serif font-normal tracking-tight text-neutral-950 dark:text-neutral-50 leading-[1.12]">
              Turn course readings into verified notes, quizzes, and recall sets
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl leading-relaxed">
              Upload dense textbooks, legal casebooks, or lecture syllabi. LearnSphere extracts exact page layout coordinates, grounds Socratic inquiries in primary sources, and generates server-authoritative retrieval practice.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link href="/dashboard">
                <Button size="lg" className="h-11 px-6 text-xs sm:text-sm font-medium w-full sm:w-auto">
                  Open workspace
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-11 px-5 text-xs sm:text-sm font-medium w-full sm:w-auto">
                  Try student demo
                </Button>
              </Link>
            </div>

            {/* Architectural Rigor Ledger */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[var(--border)]">
              <div>
                <p className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                  768-dim RAG
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                  pgvector cosine chunk indexing
                </p>
              </div>
              <div>
                <p className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                  PyMuPDF OCR
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                  Sub-pixel layout bounding boxes
                </p>
              </div>
              <div>
                <p className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                  Server Evaluated
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                  Withheld answer key diagnostics
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Inspection Console (ui-sdk/react/tabs) */}
          <div className="lg:col-span-6" id="demo">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
              <Tabs
                defaultValue="chat"
                value={activeTab}
                onValueChange={(val) => {
                  if (val) setActiveTab(val);
                }}
                className="w-full flex flex-col"
              >
                {/* Academic Window Topbar with ui-sdk Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[#faf8f4] dark:bg-[#1a1815] gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d6cfc2] dark:bg-[#423e36] inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d6cfc2] dark:bg-[#423e36] inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-[#d6cfc2] dark:bg-[#423e36] inline-block" />
                    </div>
                    <span className="text-[11px] font-mono text-neutral-500 ml-1">console.study.session</span>
                  </div>

                  {/* Accessible ui-sdk TabsList */}
                  <TabsList
                    aria-label="Interactive Showcase Modes"
                    className="inline-flex items-center gap-1 bg-white dark:bg-neutral-900 p-0.5 rounded-md border border-[var(--border)] self-start sm:self-auto"
                  >
                    <TabsTab
                      value="chat"
                      className="px-2.5 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer data-selected:bg-neutral-900 data-selected:text-white dark:data-selected:bg-neutral-100 dark:data-selected:text-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100"
                    >
                      Socratic Dialogue
                    </TabsTab>
                    <TabsTab
                      value="flashcard"
                      className="px-2.5 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer data-selected:bg-neutral-900 data-selected:text-white dark:data-selected:bg-neutral-100 dark:data-selected:text-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100"
                    >
                      Recall Deck
                    </TabsTab>
                    <TabsTab
                      value="quiz"
                      className="px-2.5 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer data-selected:bg-neutral-900 data-selected:text-white dark:data-selected:bg-neutral-100 dark:data-selected:text-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100"
                    >
                      Diagnostic
                    </TabsTab>
                    <TabsTab
                      value="ingest"
                      className="px-2.5 py-1 text-[11px] font-medium rounded transition-colors cursor-pointer data-selected:bg-neutral-900 data-selected:text-white dark:data-selected:bg-neutral-100 dark:data-selected:text-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-100"
                    >
                      Coordinates
                    </TabsTab>
                  </TabsList>
                </div>

                {/* Panel 1: Grounded Socratic Dialogue */}
                <TabsPanel value="chat" className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-[var(--border)]">
                    <span className="font-serif font-medium text-neutral-800 dark:text-neutral-200">
                      Cellular Respiration & Chemiosmosis
                    </span>
                    <span className="font-mono text-[11px] text-neutral-500">
                      Primary Source: <span className="underline decoration-dotted">Lehninger_Ch19.pdf</span>
                    </span>
                  </div>

                  {/* Student Question */}
                  <div className="flex gap-2.5 max-w-md ml-auto flex-row-reverse text-right">
                    <div className="w-5 h-5 rounded bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-[10px] font-mono flex items-center justify-center shrink-0">
                      Q
                    </div>
                    <div className="p-3 rounded-lg bg-neutral-900 text-neutral-100 dark:bg-neutral-800 text-xs text-left leading-relaxed">
                      How does the proton electrochemical gradient physically drive ATP synthesis through the F₀ and F₁ subunits?
                    </div>
                  </div>

                  {/* Verified Socratic Response */}
                  <div className="flex gap-2.5 max-w-lg mr-auto">
                    <div className="w-5 h-5 rounded border border-[var(--border)] bg-[#faf8f4] dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 text-[10px] font-mono flex items-center justify-center shrink-0">
                      R
                    </div>
                    <div className="p-3.5 rounded-lg border border-[var(--border)] bg-white dark:bg-neutral-900 text-xs text-neutral-900 dark:text-neutral-100 space-y-3 leading-relaxed">
                      <p>
                        Peter Mitchell&apos;s chemiosmotic model demonstrates that protons translocated into the intermembrane space generate an electrochemical proton-motive force (ΔμH⁺). Protons flow back through the F₀ pore across the c-ring, exerting mechanical torque on the central γ-subunit shaft. This rotation sequentially deforms the three catalytic β-subunits of the F₁ domain through open, loose, and tight conformations, synthesizing ATP from ADP + Pᵢ.
                      </p>

                      <div className="pt-2.5 border-t border-[var(--border)] flex items-center justify-between">
                        <span className="text-[11px] text-neutral-500">Grounded evidence coordinate:</span>
                        <button
                          type="button"
                          onClick={() => setShowCitationDrawer((prev) => !prev)}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border border-[#c4533a]/40 bg-[#fbf2ee] dark:bg-[#2d1b16] text-[#9e3722] dark:text-[#ea7258] hover:bg-[#f6e5dd] transition-colors cursor-pointer"
                        >
                          <span>p. 732 §3</span>
                          <span className="text-[10px] opacity-70">
                            {showCitationDrawer ? "▾ close" : "▸ inspect"}
                          </span>
                        </button>
                      </div>

                      {showCitationDrawer && (
                        <div className="mt-2 p-3 rounded border border-[#e4d7c2] dark:border-[#3d3326] bg-[#faf8f2] dark:bg-[#1a1713] text-[11px] leading-relaxed text-neutral-800 dark:text-neutral-200 font-serif animate-in fade-in duration-150">
                          <p className="italic text-neutral-600 dark:text-neutral-400 mb-1 font-sans text-[10px] uppercase tracking-wider">
                            Verified Excerpt · Lehninger Biochemistry 8th Ed., Page 732, Paragraph 3:
                          </p>
                          &ldquo;The γ-subunit rotates within the cylinder formed by the α₃β₃ complex. With each 120° rotation of γ, a different β-subunit transitions into the tight conformation, stabilizing ATP synthesis until release.&rdquo;
                        </div>
                      )}
                    </div>
                  </div>
                </TabsPanel>

                {/* Panel 2: Interactive 3D Flashcard */}
                <TabsPanel value="flashcard" className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-[var(--border)]">
                    <span className="font-serif font-medium text-neutral-800 dark:text-neutral-200">
                      Stoichiometry of Oxidative Phosphorylation
                    </span>
                    <span className="font-mono text-[11px] text-neutral-400">Card 04 of 12 · Space to flip</span>
                  </div>

                  <div
                    tabIndex={0}
                    role="button"
                    aria-label="Interactive 3D Flashcard. Click or press Enter to flip."
                    className="w-full h-48 [perspective:1000px] cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-500 rounded-lg"
                    onClick={() => setIsFlipped((prev) => !prev)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setIsFlipped((prev) => !prev);
                      }
                    }}
                  >
                    <div
                      className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] rounded-lg border border-[var(--border)] shadow-xs ${
                        isFlipped ? "[transform:rotateY(180deg)]" : ""
                      }`}
                    >
                      {/* Card Front: Prompt */}
                      <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-[#faf8f4] dark:bg-[#171512] p-5 flex flex-col justify-between rounded-lg">
                        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500">
                          <span>ACTIVE RECALL PROMPT</span>
                          <span className="underline decoration-dotted">[ CLICK OR SPACE TO FLIP ]</span>
                        </div>
                        <p className="text-sm sm:text-base font-serif font-medium text-center text-neutral-900 dark:text-neutral-100 px-4">
                          What is the exact stoichiometry of protons pumped across the inner mitochondrial membrane per NADH molecule oxidized?
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                          <span>FSRS Interval: 3 days</span>
                          <span>Lehninger §19.2</span>
                        </div>
                      </div>

                      {/* Card Back: Verified Answer */}
                      <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#1c1a17] text-white p-5 flex flex-col justify-between rounded-lg border border-neutral-700">
                        <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
                          <span>VERIFIED ANSWER</span>
                          <span className="text-emerald-400 font-semibold">10 H⁺ Translocated</span>
                        </div>
                        <p className="text-xs text-center text-neutral-200 leading-relaxed font-sans px-2">
                          A total of <strong className="text-white">10 H⁺</strong> are pumped per electron pair: <strong>4 H⁺</strong> by Complex I, <strong>4 H⁺</strong> by Complex III, and <strong>2 H⁺</strong> by Complex IV.
                        </p>
                        <div className="flex justify-center items-center gap-1.5 pt-1">
                          {[
                            { id: "again", label: "1 Again", delay: "10m" },
                            { id: "hard", label: "2 Hard", delay: "1d" },
                            { id: "good", label: "3 Good", delay: "4d" },
                            { id: "easy", label: "4 Easy", delay: "8d" },
                          ].map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDifficulty(item.id);
                              }}
                              className={`px-2 py-0.5 rounded border text-[10px] font-mono transition-colors ${
                                selectedDifficulty === item.id
                                  ? "border-emerald-400 bg-emerald-950/60 text-emerald-300 font-bold"
                                  : "border-neutral-700 bg-neutral-900/60 text-neutral-400 hover:text-white"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsPanel>

                {/* Panel 3: Server-Scored Diagnostic */}
                <TabsPanel value="quiz" className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-[var(--border)]">
                    <span className="font-serif font-medium text-neutral-800 dark:text-neutral-200">
                      Biochemistry Diagnostic Assessment
                    </span>
                    <span className="font-mono text-[11px] text-neutral-500">Question 02 of 05 · Server Scored</span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    Which pharmacological agent specifically halts electron transfer at Complex IV by coordinating to the heme a₃-Cu_B binuclear center?
                  </p>

                  <div className="space-y-1.5">
                    {[
                      { key: "A", label: "Rotenone (NADH dehydrogenase inhibitor)" },
                      { key: "B", label: "Cyanide (CN⁻) and Carbon Monoxide" },
                      { key: "C", label: "Antimycin A (Q-cycle inhibitor)" },
                      { key: "D", label: "Oligomycin (ATP synthase F₀ pore blocker)" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setSelectedQuizOption(opt.key)}
                        className={`w-full p-2.5 rounded-md border text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          selectedQuizOption === opt.key
                            ? "border-neutral-950 dark:border-neutral-100 bg-[#f4f0e6] dark:bg-neutral-800 font-medium text-neutral-950 dark:text-neutral-100"
                            : "border-[var(--border)] bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-[#faf8f4] dark:hover:bg-neutral-850"
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
                    <div className="p-3 rounded border border-emerald-300 dark:border-emerald-900/60 bg-emerald-50/80 dark:bg-emerald-950/30 text-[11px] leading-relaxed text-emerald-900 dark:text-emerald-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold font-mono text-[11px]">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Verified Result: Option B Correct</span>
                      </div>
                      <p>
                        Cyanide binds tightly to the oxidized Fe³⁺ in heme a₃ of cytochrome c oxidase, precluding O₂ binding and stalling oxidative phosphorylation. Grounded in <em>Lehninger Principles of Biochemistry, p. 738 §2</em>.
                      </p>
                    </div>
                  )}
                </TabsPanel>

                {/* Panel 4: Coordinate Inspector */}
                <TabsPanel value="ingest" className="p-5 space-y-3 font-serif">
                  <div className="flex items-center justify-between text-xs text-neutral-500 pb-2 border-b border-[var(--border)] font-sans">
                    <span className="font-medium text-neutral-800 dark:text-neutral-200">
                      PyMuPDF Document Chunk Parser
                    </span>
                    <span className="font-mono text-[11px] text-neutral-500">
                      Page 732 · Bounding Box [45.2, 120.0, 520.8, 680.4]
                    </span>
                  </div>

                  <div className="p-4 rounded border border-[#e4dbca] dark:border-[#38332a] bg-[#faf8f2] dark:bg-[#181613] text-xs leading-relaxed text-neutral-800 dark:text-neutral-200">
                    &ldquo;...ATP synthase is embedded within the inner mitochondrial membrane, converting electrochemical proton potential into high-energy phosphate bonds through mechanical rotation. The enzyme comprises two functional units: F₀, an integral membrane oligomer acting as the proton pore, and F₁, a peripheral complex bearing three catalytic nucleotide-binding sites.&rdquo;
                  </div>

                  <div className="text-[11px] font-mono text-neutral-500 font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-1">
                    <span>Token Chunk: chk_lehninger_19_0732</span>
                    <span>Tensor: [0.0124, -0.0481, 0.1192 ... 768 dims]</span>
                  </div>
                </TabsPanel>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Academic Rigor Institutional Validation Ribbon */}
      <section className="py-7 border-y border-[var(--border)] bg-[#faf8f5] dark:bg-[#181613] px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-serif italic text-center md:text-left">
            Engineered to synthesize syllabi and primary literature from demanding university curricula:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-7 md:gap-10 text-xs font-mono font-semibold tracking-wider text-neutral-500 dark:text-neutral-400">
            <span>OXFORD</span>
            <span>HARVARD</span>
            <span>STANFORD</span>
            <span>JOHNS HOPKINS</span>
            <span>CAMBRIDGE</span>
            <span>MIT</span>
          </div>
        </div>
      </section>

      {/* The 4-Stage Cognitive Loop Codex */}
      <section id="cycle" className="py-20 md:py-26 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-normal tracking-tight text-neutral-950 dark:text-neutral-50">
            Engineered for retrieval strength, not passive re-reading
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Passive highlighting and rereading produce the illusion of competence. LearnSphere translates dense reading assignments into a four-stage verified feedback loop.
          </p>
        </div>

        {/* Scholarly Sequential Codex Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Stage 1 */}
          <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3.5 relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-neutral-400 dark:text-neutral-600">STAGE I</span>
                <FileText className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              </div>
              <h3 className="font-serif font-medium text-base text-neutral-950 dark:text-neutral-50">
                Coordinate Ingest
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                PyMuPDF extracts layout blocks while recording physical page coordinates and bounding boxes. Passages are segmented into semantic vectors for deterministic cosine retrieval.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border)] text-[11px] font-mono text-neutral-500">
              Output: 768-dim pgvector index
            </div>
          </div>

          {/* Stage 2 */}
          <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3.5 relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-neutral-400 dark:text-neutral-600">STAGE II</span>
                <BookOpen className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              </div>
              <h3 className="font-serif font-medium text-base text-neutral-950 dark:text-neutral-50">
                Contextual Socratic Tutor
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Inquire into dense mechanisms scoped strictly to selected readings. Every answer anchors each factual assertion to an inline citation pill linking directly to source text.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border)] text-[11px] font-mono text-neutral-500">
              Output: Zero citation drift
            </div>
          </div>

          {/* Stage 3 */}
          <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3.5 relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-neutral-400 dark:text-neutral-600">STAGE III</span>
                <Brain className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              </div>
              <h3 className="font-serif font-medium text-base text-neutral-950 dark:text-neutral-50">
                Active Retrieval Practice
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Generate 3D interactive flashcard decks with spaced-repetition ratings and server-authoritative multiple-choice quizzes where answer keys remain withheld until submission.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border)] text-[11px] font-mono text-neutral-500">
              Output: FSRS recall schedules
            </div>
          </div>

          {/* Stage 4 */}
          <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3.5 relative flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-neutral-400 dark:text-neutral-600">STAGE IV</span>
                <BarChart3 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              </div>
              <h3 className="font-serif font-medium text-base text-neutral-950 dark:text-neutral-50">
                Retention & Mastery
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Track retention decay across sub-topics, syllabus milestones, and streak records. Aggregated SQL analytics flag deteriorating recall before exam week.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border)] text-[11px] font-mono text-neutral-500">
              Output: Empirical mastery matrix
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Contrast Matrix */}
      <section id="matrix" className="py-20 border-t border-[var(--border)] bg-[var(--surface)] px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-neutral-950 dark:text-neutral-50">
              Why generic LLMs and static flashcards fail university curricula
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              General chat interfaces hallucinate page numbers and explain concepts passively. Manual flashcard creation wastes hundreds of hours of reading time.
            </p>
          </div>

          {/* Academic Comparison Ledger */}
          <div className="border border-[var(--border)] rounded-lg overflow-x-auto bg-[var(--background)]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[#faf8f4] dark:bg-[#1a1815]">
                  <th className="p-4 font-serif font-semibold text-neutral-700 dark:text-neutral-300 w-1/4">
                    Pedagogical Dimension
                  </th>
                  <th className="p-4 font-medium text-neutral-500 w-1/4">
                    Generic Chatbots (ChatGPT / Claude)
                  </th>
                  <th className="p-4 font-medium text-neutral-500 w-1/4">
                    Manual Decks (Anki / Quizlet)
                  </th>
                  <th className="p-4 font-serif font-semibold text-neutral-950 dark:text-neutral-50 bg-[#f4f0e6]/60 dark:bg-[#25221b] w-1/4">
                    LearnSphere AI Grounded Loop
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                <tr>
                  <td className="p-4 font-medium text-neutral-950 dark:text-neutral-100 font-serif">Source Fidelity</td>
                  <td className="p-4 text-neutral-500 leading-relaxed">Hallucinates citations, invented theorems, and non-existent papers</td>
                  <td className="p-4 text-neutral-500 leading-relaxed">Laborious copy-pasting of static snippets</td>
                  <td className="p-4 font-medium text-neutral-950 dark:text-neutral-50 bg-[#f4f0e6]/30 dark:bg-[#25221b]/40 leading-relaxed">
                    Strict pgvector RAG with exact page coordinates & bounding box tracking
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-neutral-950 dark:text-neutral-100 font-serif">Citation Auditing</td>
                  <td className="p-4 text-neutral-500 leading-relaxed">None; user must manually cross-reference entire 800-page book</td>
                  <td className="p-4 text-neutral-500 leading-relaxed">Static notes severed from document context</td>
                  <td className="p-4 font-medium text-neutral-950 dark:text-neutral-50 bg-[#f4f0e6]/30 dark:bg-[#25221b]/40 leading-relaxed">
                    Inline interactive citation pills (e.g. [p. 732 §3]) opening source drawer
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-neutral-950 dark:text-neutral-100 font-serif">Diagnostic Testing</td>
                  <td className="p-4 text-neutral-500 leading-relaxed">Immediate answer reveal; no persistent scoring or streak record</td>
                  <td className="p-4 text-neutral-500 leading-relaxed">Binary flashcard flip only, no multiple-choice diagnostics</td>
                  <td className="p-4 font-medium text-neutral-950 dark:text-neutral-50 bg-[#f4f0e6]/30 dark:bg-[#25221b]/40 leading-relaxed">
                    Server-authoritative scoring with withheld keys and post-eval explanations
                  </td>
                </tr>
                <tr>
                  <td className="p-4 font-medium text-neutral-950 dark:text-neutral-100 font-serif">Setup Velocity</td>
                  <td className="p-4 text-neutral-500 leading-relaxed">Requires delicate, repetitive prompt engineering every session</td>
                  <td className="p-4 text-neutral-500 leading-relaxed">6–8 hours manually formatting flashcards per chapter</td>
                  <td className="p-4 font-medium text-neutral-950 dark:text-neutral-50 bg-[#f4f0e6]/30 dark:bg-[#25221b]/40 leading-relaxed">
                    One-click generation of summaries, recall decks, and milestone study plans
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Curriculum Provenance in Demanding Disciplines */}
      <section id="disciplines" className="py-20 md:py-26 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-neutral-950 dark:text-neutral-50">
            Field-tested across demanding academic curricula
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Tested on multi-thousand page medical texts, statutory legal casebooks, and formal mathematical proofs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <span className="font-mono text-[11px] text-[#9e3722] dark:text-[#ea7258] uppercase tracking-wider font-semibold">
                Medicine & Pharmacology
              </span>
              <h3 className="font-serif font-medium text-base text-neutral-950 dark:text-neutral-50">
                USMLE Step 1 & Pathology
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Ingest dense tomes such as Robbins & Cotran Pathologic Basis of Disease. Extract biochemical pathway steps, drug mechanisms, and diagnostic criteria with zero citation drift.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border)] text-[11px] font-mono text-neutral-500">
              Benchmark: 99.4% citation exactness
            </div>
          </div>

          <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <span className="font-mono text-[11px] text-[#9e3722] dark:text-[#ea7258] uppercase tracking-wider font-semibold">
                Law & Jurisprudence
              </span>
              <h3 className="font-serif font-medium text-base text-neutral-950 dark:text-neutral-50">
                Casebooks & Slip Opinions
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Upload appellate decisions and federal codes. LearnSphere preserves exact slip opinion paragraph markers to cite majority holdings, concurrences, and dissents with clinical precision.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border)] text-[11px] font-mono text-neutral-500">
              Benchmark: Sub-paragraph paragraph mapping
            </div>
          </div>

          <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <span className="font-mono text-[11px] text-[#9e3722] dark:text-[#ea7258] uppercase tracking-wider font-semibold">
                Computer Science & STEM
              </span>
              <h3 className="font-serif font-medium text-base text-neutral-950 dark:text-neutral-50">
                Algorithmic Derivations & Proofs
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Synthesize CLRS algorithms and discrete mathematics syllabi into incremental flashcard proof steps and multi-variable diagnostic questions verified against lecture slides.
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--border)] text-[11px] font-mono text-neutral-500">
              Benchmark: Theorem step decomposition
            </div>
          </div>
        </div>
      </section>

      {/* Scholar & Student Testimonials */}
      <section className="py-20 border-t border-[var(--border)] bg-[var(--surface)] px-6">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-serif font-normal tracking-tight text-neutral-950 dark:text-neutral-50">
              Observations from university researchers and students
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--background)] space-y-4 flex flex-col justify-between">
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-serif italic">
                &ldquo;Cut my cellular biology review time in half. Clicking a citation pill and viewing the exact textbook paragraph prevents any AI hallucination anxiety before high-stakes exams.&rdquo;
              </p>
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="text-xs font-semibold text-neutral-950 dark:text-neutral-50">Elena V.</p>
                <p className="text-[11px] font-mono text-neutral-500">MD-PhD Candidate, Johns Hopkins</p>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--background)] space-y-4 flex flex-col justify-between">
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-serif italic">
                &ldquo;For civil procedure case briefs, general AI invents doctrine. LearnSphere references the exact slip opinion paragraph. It is indispensable for 1L exams.&rdquo;
              </p>
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="text-xs font-semibold text-neutral-950 dark:text-neutral-50">Marcus T.</p>
                <p className="text-[11px] font-mono text-neutral-500">J.D. Candidate, Harvard Law</p>
              </div>
            </div>

            <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--background)] space-y-4 flex flex-col justify-between">
              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-serif italic">
                &ldquo;The server-scored quizzes feel like an actual professor drafted them from our weekly course syllabus. It has completely replaced my manual Anki workflow.&rdquo;
              </p>
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="text-xs font-semibold text-neutral-950 dark:text-neutral-50">Priya K.</p>
                <p className="text-[11px] font-mono text-neutral-500">Computer Science M.S., Stanford</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Action Callout: Scholarly Invitation */}
      <section className="py-20 md:py-26 px-6 border-t border-[var(--border)] bg-[var(--background)]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-neutral-950 dark:text-neutral-50">
            Begin with your next syllabus or reading
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
            Upload any course PDF, textbook chapter, or research paper. Generate citation-grounded notes, spaced recall decks, and practice tests in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/dashboard">
              <Button size="lg" className="h-11 px-7 text-xs sm:text-sm font-medium w-full sm:w-auto">
                Open workspace
                <ArrowRight className="w-4 h-4 ml-1.5" />
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

      {/* Academic Colophon Footer */}
      <footer className="border-t border-[var(--border)] py-12 px-6 text-xs text-neutral-500 bg-[var(--surface)]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-[var(--border)]">
          <div className="space-y-2.5">
            <p className="font-serif font-semibold text-neutral-950 dark:text-neutral-100">Study Workspace</p>
            <ul className="space-y-1.5 text-neutral-500">
              <li><Link href="/dashboard" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Workspace Overview</Link></li>
              <li><Link href="/tutor" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Socratic Tutor</Link></li>
              <li><Link href="/studio/flashcards" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Recall Decks</Link></li>
              <li><Link href="/studio/quizzes" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Diagnostic Quizzes</Link></li>
            </ul>
          </div>
          <div className="space-y-2.5">
            <p className="font-serif font-semibold text-neutral-950 dark:text-neutral-100">Architecture</p>
            <ul className="space-y-1.5 text-neutral-500">
              <li><span>PyMuPDF Layout OCR</span></li>
              <li><span>PostgreSQL & pgvector</span></li>
              <li><span>Google Gemini API</span></li>
              <li><span>FastAPI Async Engine</span></li>
            </ul>
          </div>
          <div className="space-y-2.5">
            <p className="font-serif font-semibold text-neutral-950 dark:text-neutral-100">Pedagogy</p>
            <ul className="space-y-1.5 text-neutral-500">
              <li><span>Active Retrieval Practice</span></li>
              <li><span>Spaced Repetition (FSRS)</span></li>
              <li><span>Grounded Verification</span></li>
              <li><span>Retention Decay Tracking</span></li>
            </ul>
          </div>
          <div className="space-y-2.5">
            <p className="font-serif font-semibold text-neutral-950 dark:text-neutral-100">Session</p>
            <ul className="space-y-1.5 text-neutral-500">
              <li><Link href="/login" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/settings" className="hover:text-neutral-950 dark:hover:text-white transition-colors">Preferences</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 LearnSphere AI. Grounded educational intelligence.</p>
          <p className="font-mono text-[11px] text-neutral-400">Strict citation integrity · @ui-sdk/react</p>
        </div>
      </footer>
    </div>
  );
}
