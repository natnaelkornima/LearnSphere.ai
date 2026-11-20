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
  Target,
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 px-6 md:px-10 flex items-center justify-between max-w-7xl mx-auto w-full sticky top-0 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-semibold text-base tracking-tight text-slate-900 dark:text-slate-100">
            LearnSphere <span className="text-blue-600 dark:text-blue-400 font-medium">AI</span>
          </span>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600 dark:text-slate-400">
          <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Capabilities
          </a>
          <a href="#demo" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Interactive console
          </a>
          <a href="#workflow" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Workflow
          </a>
          <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Plans
          </a>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1.5 transition-colors"
          >
            Sign in
          </Link>
          <Link href="/dashboard">
            <Button size="sm" className="h-9 px-4 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white border-transparent">
              Open workspace
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-6 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Citation-grounded RAG with exact page coordinates</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white leading-[1.1]">
            The study workspace built for rigorous coursework
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload dense textbooks, legal casebooks, and scientific papers. LearnSphere parses layout structures, answers with verifiable page references, and generates server-scored recall practice.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="h-11 px-6 text-sm font-medium w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-xs">
                Launch student workspace
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a href="#demo" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="h-11 px-6 text-sm font-medium w-full sm:w-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                Explore interactive console
              </Button>
            </a>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Exact page coordinates
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Socratic reasoning
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> Zero citation drift
            </span>
          </div>
        </div>
      </section>

      {/* Centerpiece: Interactive Console powered by @ui-sdk/react/tabs */}
      <section id="demo" className="py-16 md:py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="space-y-4 mb-8 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Experience the grounded study loop
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Test the live studio primitives below: dialog with citations, active recall flashcards, practice quizzes, and structured summaries.
          </p>
        </div>

        {/* Tabbed Interactive Workbench */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
          <Tabs value={activeTab} onValueChange={(val) => { if (val) setActiveTab(val); }}>
            {/* Console Toolbar */}
            <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50/70 dark:bg-slate-900/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Current Document:
                </span>
                <span className="text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  Principles_of_Neural_Science_Ch12.pdf
                </span>
              </div>

              {/* @ui-sdk/react TabsList */}
              <TabsList className="flex items-center p-1 rounded-lg bg-slate-200/60 dark:bg-slate-800 gap-1 w-full sm:w-auto">
                <TabsTab
                  value="chat"
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer text-slate-600 dark:text-slate-400 data-selected:bg-white data-selected:text-blue-700 data-selected:shadow-xs dark:data-selected:bg-slate-900 dark:data-selected:text-blue-400"
                >
                  Socratic AI Tutor
                </TabsTab>
                <TabsTab
                  value="flashcard"
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer text-slate-600 dark:text-slate-400 data-selected:bg-white data-selected:text-blue-700 data-selected:shadow-xs dark:data-selected:bg-slate-900 dark:data-selected:text-blue-400"
                >
                  Recall Flashcards
                </TabsTab>
                <TabsTab
                  value="quiz"
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer text-slate-600 dark:text-slate-400 data-selected:bg-white data-selected:text-blue-700 data-selected:shadow-xs dark:data-selected:bg-slate-900 dark:data-selected:text-blue-400"
                >
                  Practice Quiz
                </TabsTab>
                <TabsTab
                  value="summary"
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer text-slate-600 dark:text-slate-400 data-selected:bg-white data-selected:text-blue-700 data-selected:shadow-xs dark:data-selected:bg-slate-900 dark:data-selected:text-blue-400"
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
                      <div className="bg-blue-600 text-white rounded-xl rounded-tr-xs p-3.5 max-w-md text-xs leading-relaxed shadow-xs">
                        How does long-term potentiation differ from short-term facilitation at hippocampal synapses?
                      </div>
                    </div>

                    {/* Socratic AI Response */}
                    <div className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shrink-0 text-xs font-bold">
                        AI
                      </div>
                      <div className="space-y-3 max-w-lg">
                        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl rounded-tl-xs p-4 text-xs leading-relaxed border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 space-y-2.5">
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
                            <button
                              onClick={() => setShowCitationDrawer((prev) => !prev)}
                              className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors cursor-pointer"
                            >
                              Page 214 §3 • Paragraph 2
                            </button>
                          </div>
                        </div>

                        {/* Socratic Follow-Up Probe */}
                        <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                          <Sparkles className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <p className="leading-relaxed">
                            <strong>Socratic Check:</strong> What would happen to LTP induction if you introduced an intracellular calcium chelator into the postsynaptic CA1 neuron?
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mock Input Bar */}
                  <div className="pt-2">
                    <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <input
                        type="text"
                        readOnly
                        value=" Chelating postsynaptic Ca²⁺ prevents calmodulin kinase activation..."
                        className="w-full bg-transparent text-xs text-slate-600 dark:text-slate-300 focus:outline-none cursor-default font-sans"
                      />
                      <Button size="sm" className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white shrink-0">
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
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                        99.2% match confidence
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-4 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Principles of Neural Science (5th Ed.)</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">p. 214</span>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
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

                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>Full text chunk indexed</span>
                    <Link href="/tutor" className="text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
                      Open in AI Tutor <ChevronRight className="w-3.5 h-3.5" />
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
                      { key: "again", label: "Again", desc: "Forgot", color: "hover:border-red-400" },
                      { key: "hard", label: "Hard", desc: "Struggled", color: "hover:border-amber-400" },
                      { key: "good", label: "Good", desc: "Recalled", color: "hover:border-blue-400" },
                      { key: "easy", label: "Easy", desc: "Mastered", color: "hover:border-emerald-400" },
                    ].map((tier) => (
                      <button
                        key={tier.key}
                        onClick={() => setSelectedDifficulty(tier.key)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedDifficulty === tier.key
                            ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold shadow-xs"
                            : `border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${tier.color}`
                        }`}
                      >
                        <span className="text-xs block font-medium">{tier.label}</span>
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
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
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
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
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

      {/* Core Capabilities Section */}
      <section id="features" className="py-16 md:py-24 px-6 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Architected for academic verification
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Four specialized subsystems ensure every AI response is traceable, reproducible, and pedagogical.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
              Page Coordinate RAG
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every factual assertion cites exact document bounding boxes and page numbers. Zero hallucinated attributions.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
              Socratic Dialogue
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Guides students to deduce answers through targeted questions instead of passive copy-pasting.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
              Active Recall Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generates physical 3D card decks with keyboard hotkeys and spaced repetition retention tracking.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
              6-Format Synthesis
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Export executive briefs, bullet points, exam study sheets, Q&A inquiry sets, or concept maps.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-16 md:py-24 px-6 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            From textbook chapter to exam mastery
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A cohesive study progression structured around cognitive science principles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              1
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
              Ingest & Index Reading
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload course PDFs. PyMuPDF extracts text preserving spatial bounding boxes, and pgvector indexes chunks into semantic embeddings.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              2
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
              Socratic Investigation
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ask deep conceptual questions. The tutor verifies claims against primary excerpts and tests your comprehension with deductive follow-ups.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
              Retention Practice
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Run active recall flashcard drills and diagnostic quizzes. Track your topic mastery scores to eliminate blind spots prior to exam day.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing / Access Plans */}
      <section id="pricing" className="py-16 md:py-24 px-6 max-w-7xl mx-auto w-full border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Predictable plans for individual scholars and cohorts
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Full vector vault access, unlimited flashcard sets, and deterministic citation verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Plan 1 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-6 shadow-2xs flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Student</h3>
                <p className="text-xs text-slate-500 mt-1">For undergraduate study and general course readings</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">$0</span>
                <span className="text-xs text-slate-500">/ free forever</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Up to 5 indexed textbooks</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Grounded Socratic AI Tutor</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Spaced repetition flashcards</li>
              </ul>
            </div>
            <Link href="/dashboard" className="block">
              <Button variant="outline" className="w-full text-xs h-9 font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                Start with free student tier
              </Button>
            </Link>
          </div>

          {/* Plan 2: Highlighted */}
          <div className="rounded-2xl border-2 border-blue-600 bg-white dark:bg-slate-900 p-8 space-y-6 shadow-md flex flex-col justify-between relative">
            <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              Most Popular
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Graduate Researcher</h3>
                <p className="text-xs text-slate-500 mt-1">For law, medical, and graduate doctoral researchers</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">$16</span>
                <span className="text-xs text-slate-500">/ month</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Unlimited indexed documents & PDFs</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Priority Gemini 2.5 Flash reasoning</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Multi-format Markdown summaries</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Exam milestone calendar planner</li>
              </ul>
            </div>
            <Link href="/register" className="block">
              <Button className="w-full text-xs h-9 font-medium bg-blue-600 hover:bg-blue-700 text-white border-transparent">
                Get started with Pro
              </Button>
            </Link>
          </div>

          {/* Plan 3 */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-6 shadow-2xs flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">Campus Cohort</h3>
                <p className="text-xs text-slate-500 mt-1">For university departments and study groups</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">$39</span>
                <span className="text-xs text-slate-500">/ member / term</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Shared corpus repository</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Collaborative flashcard decks</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-blue-600" /> Enterprise SLA & dedicated storage</li>
              </ul>
            </div>
            <Link href="/register" className="block">
              <Button variant="outline" className="w-full text-xs h-9 font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                Contact department sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 px-6 max-w-7xl mx-auto w-full text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            <BookOpen className="w-3 h-3" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">LearnSphere AI</span>
          <span>© 2026 LearnSphere Inc.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/security" className="hover:underline">Security</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
        </div>
      </footer>
    </div>
  );
}