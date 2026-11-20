"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Layers,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { DocumentItem, Flashcard, FlashcardSet } from "@/types";
import { formatDate } from "@/lib/utils";

type FlashcardMode = "setup" | "study" | "finished";

function FlashcardsContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get("doc");

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId || "");
  const [cardCount, setCardCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Flashcard Set & Player
  const [mode, setMode] = useState<FlashcardMode>("setup");
  const [activeSet, setActiveSet] = useState<FlashcardSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<
    { cardId: string; rating: string }[]
  >([]);

  // Decks list
  const [deckSets, setDeckSets] = useState<FlashcardSet[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoadingHistory(true);
        const [docsData, setsData] = await Promise.all([
          api.documents.list(1, 50),
          api.flashcards.listSets(),
        ]);
        setDocuments(docsData.items.filter((d: DocumentItem) => d.status === "ready") || []);
        setDeckSets(setsData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    load();
  }, []);

  // Keyboard shortcut listener for active study session
  useEffect(() => {
    if (mode !== "study") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "1") {
        handleRate("again");
      } else if (e.key === "2") {
        handleRate("hard");
      } else if (e.key === "3") {
        handleRate("good");
      } else if (e.key === "4") {
        handleRate("easy");
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, currentIndex, activeSet]);

  const handleGenerate = async () => {
    if (!selectedDocId) {
      setErrorMsg("Please select a document to generate flashcards from.");
      return;
    }
    try {
      setIsGenerating(true);
      setErrorMsg(null);
      const set = await api.flashcards.generate({
        document_id: selectedDocId,
        card_count: cardCount,
      });
      setActiveSet(set);
      setCurrentIndex(0);
      setIsFlipped(false);
      setReviewedCards([]);
      setMode("study");
      setDeckSets((prev) => [set, ...prev]);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate flashcard deck");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartExisting = async (setId: string) => {
    try {
      setIsGenerating(true);
      const set = await api.flashcards.getSet(setId);
      setActiveSet(set);
      setCurrentIndex(0);
      setIsFlipped(false);
      setReviewedCards([]);
      setMode("study");
    } catch {
      setErrorMsg("Failed to load flashcard deck");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRate = async (rating: "again" | "hard" | "good" | "easy") => {
    if (!activeSet || !activeSet.cards[currentIndex]) return;
    const currentCard = activeSet.cards[currentIndex];

    api.flashcards.reviewCard(currentCard.id, rating).catch(() => {});

    setReviewedCards((prev) => [...prev, { cardId: currentCard.id, rating }]);

    if (currentIndex < activeSet.cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setMode("finished");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (activeSet && currentIndex < activeSet.cards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const currentCard: Flashcard | undefined = activeSet?.cards?.[currentIndex];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[#e6dfd1] dark:border-[#2a2723] pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Spaced Retrieval Flashcards
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-serif italic">
          Active recall drills with keyboard-navigated physical card decks.
        </p>
      </div>

      {/* MODE 1: SETUP & DECKS */}
      {mode === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-6 space-y-6 shadow-xs">
              <div>
                <h2 className="font-serif text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Synthesize new study deck
                </h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Extract core principles, theoretical distinctions, and terminology into active recall pairs.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Document Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Source text
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-[#e6dfd1] dark:border-[#2e2a25] bg-white dark:bg-[#1f1d1a] p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-200"
                >
                  <option value="">Select an indexed reading...</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Card Count */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Deck volume
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { count: 5, label: "5 cards", desc: "Rapid review" },
                    { count: 10, label: "10 cards", desc: "Standard session" },
                    { count: 15, label: "15 cards", desc: "Deep consolidation" },
                  ].map((option) => (
                    <button
                      key={option.count}
                      type="button"
                      onClick={() => setCardCount(option.count)}
                      className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                        cardCount === option.count
                          ? "border-neutral-900 dark:border-neutral-100 bg-white dark:bg-[#23211d] shadow-xs"
                          : "border-[#e6dfd1] dark:border-[#2a2723] bg-neutral-50/50 dark:bg-[#1a1917] hover:border-neutral-400"
                      }`}
                    >
                      <div className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {option.label}
                      </div>
                      <div className="text-[11px] text-neutral-500 mt-0.5">
                        {option.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!selectedDocId || isGenerating}
                isLoading={isGenerating}
                className="w-full justify-center h-10 text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200"
              >
                <Layers className="w-3.5 h-3.5 mr-2" />
                {isGenerating ? "Synthesizing cards..." : "Generate study deck"}
              </Button>
            </div>
          </div>

          {/* Existing Decks Column */}
          <div>
            <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-5 space-y-4 shadow-xs">
              <h2 className="font-serif text-sm font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-[#e6dfd1] dark:border-[#2a2723]">
                Saved study decks
              </h2>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {isLoadingHistory ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                ) : deckSets.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-6 font-serif italic">
                    No flashcard sets generated yet. Select a reading to synthesize your first deck.
                  </p>
                ) : (
                  deckSets.map((ds) => (
                    <div
                      key={ds.id}
                      className="p-3 rounded-lg border border-[#e6dfd1] dark:border-[#2a2723] bg-white dark:bg-[#1f1d1a] flex items-center justify-between gap-3 hover:border-neutral-400 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {ds.title}
                        </p>
                        <p className="text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {ds.cards?.length || 0} cards • {formatDate(ds.created_at)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartExisting(ds.id)}
                        className="h-7 text-xs px-2.5 font-mono"
                      >
                        Study
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: 3D CARD FLIP STUDY PLAYER */}
      {mode === "study" && activeSet && currentCard && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header & Progress */}
          <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {activeSet.title}
                </h2>
                <p className="text-xs font-mono tabular-nums text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Card {String(currentIndex + 1).padStart(2, "0")} of {String(activeSet.cards.length).padStart(2, "0")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("setup")}
                className="text-xs h-7 border-[#e6dfd1] dark:border-[#2a2723]"
              >
                Exit session
              </Button>
            </div>
            <ProgressBar
              value={((currentIndex + 1) / activeSet.cards.length) * 100}
            />
          </div>

          {/* 3D Flip Card Container */}
          <div
            className="w-full h-80 [perspective:1200px] cursor-pointer select-none"
            onClick={() => setIsFlipped((prev) => !prev)}
          >
            <div
              className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] rounded-2xl border border-[#e6dfd1] dark:border-[#2a2723] shadow-md ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* FRONT: Front Prompt / Question */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-[#faf8f5] dark:bg-[#181715] rounded-2xl p-8 flex flex-col justify-between border border-[#e6dfd1] dark:border-[#2e2a25]">
                <div className="flex items-center justify-between border-b border-[#e6dfd1] dark:border-[#2a2723] pb-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                    Prompt
                  </span>
                  <span className="text-xs font-mono text-neutral-500 flex items-center gap-1.5">
                    <kbd className="px-2 py-0.5 rounded border border-[#d6cfc1] dark:border-[#38332c] bg-white dark:bg-[#23211d] text-[10px] font-semibold text-neutral-700 dark:text-neutral-300 shadow-2xs">
                      Space
                    </kbd>
                    <span>flip card</span>
                  </span>
                </div>

                <div className="text-center my-auto px-6 py-4">
                  <p className="font-serif text-xl md:text-2xl font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed">
                    {currentCard.front || currentCard.front_content}
                  </p>
                </div>

                <div className="text-center text-xs font-serif italic text-neutral-500 dark:text-neutral-400 pt-2 border-t border-[#e6dfd1] dark:border-[#2a2723]">
                  Recall the core definition or proposition, then tap or press space to verify.
                </div>
              </div>

              {/* BACK: Back Answer / Definition */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#171e28] text-neutral-100 rounded-2xl p-8 flex flex-col justify-between border border-[#2b3545] shadow-lg">
                <div className="flex items-center justify-between border-b border-[#2b3545] pb-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#9cb1cd]">
                    Verified synthesis
                  </span>
                  <span className="text-xs font-mono text-[#9cb1cd] flex items-center gap-1.5">
                    <kbd className="px-2 py-0.5 rounded border border-[#3b475c] bg-[#1e2634] text-[10px] font-semibold text-[#d0dbe9]">
                      Space
                    </kbd>
                    <span>flip card</span>
                  </span>
                </div>

                <div className="text-center my-auto px-6 py-4">
                  <p className="text-base md:text-lg leading-relaxed font-sans text-neutral-100">
                    {currentCard.back || currentCard.back_content}
                  </p>
                </div>

                <div className="text-center text-xs text-[#9cb1cd] pt-2 border-t border-[#2b3545]">
                  Select your retrieval tier below to register spaced repetition intervals.
                </div>
              </div>
            </div>
          </div>

          {/* Rating Buttons */}
          <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
              <span className="font-serif italic">
                {isFlipped ? "Score your retrieval accuracy:" : "Assess recall strength (advances to next card):"}
              </span>
              <span className="font-mono text-[11px] text-neutral-400">
                Keys 1 - 4
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { rating: "again", key: "1", label: "Again", desc: "Forgot", borderHover: "hover:border-red-400" },
                { rating: "hard", key: "2", label: "Hard", desc: "Struggled", borderHover: "hover:border-amber-400" },
                { rating: "good", key: "3", label: "Good", desc: "Recalled", borderHover: "hover:border-blue-400" },
                { rating: "easy", key: "4", label: "Easy", desc: "Mastered", borderHover: "hover:border-emerald-400" },
              ].map((tier) => (
                <button
                  key={tier.rating}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(tier.rating as any);
                  }}
                  className={`p-3 rounded-lg border border-[#e6dfd1] dark:border-[#2a2723] bg-white dark:bg-[#1f1d1a] ${tier.borderHover} transition-all flex flex-col items-center cursor-pointer shadow-2xs hover:shadow-xs`}
                >
                  <span className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                    [{tier.key}] {tier.label}
                  </span>
                  <span className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    {tier.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: SESSION COMPLETED */}
      {mode === "finished" && (
        <div className="max-w-md mx-auto text-center rounded-2xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-10 space-y-6 shadow-sm">
          <div className="w-12 h-12 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Drill Run Complete
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-serif italic">
              Successfully reviewed <strong className="font-mono tabular-nums not-italic">{reviewedCards.length}</strong> cards in this practice interval.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setReviewedCards([]);
                setMode("study");
              }}
              className="h-9 px-4 text-xs font-medium border-[#e6dfd1] dark:border-[#2a2723]"
            >
              <RotateCw className="w-3.5 h-3.5 mr-2" /> Repeat deck
            </Button>
            <Button
              size="sm"
              onClick={() => setMode("setup")}
              className="h-9 px-4 text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950"
            >
              Return to decks
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400 font-mono">Loading flashcard studio...</div>}>
      <FlashcardsContent />
    </Suspense>
  );
}