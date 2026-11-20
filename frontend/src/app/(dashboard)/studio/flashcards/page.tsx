"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Layers,
  RotateCw,
  AlertCircle,
  CheckCircle2,
  BookOpen,
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
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Spaced Retrieval Flashcards
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Active recall drills with keyboard-navigated interactive card decks.
        </p>
      </div>

      {/* MODE 1: SETUP & DECKS */}
      {mode === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6 shadow-2xs">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Synthesize new study deck
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Extract core principles, definitions, and conceptual questions into active recall cards.
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
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Source reading
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Deck volume
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { count: 5, label: "5 cards", desc: "Rapid review" },
                    { count: 10, label: "10 cards", desc: "Standard session" },
                    { count: 15, label: "15 cards", desc: "Deep recall" },
                  ].map((option) => (
                    <button
                      key={option.count}
                      type="button"
                      onClick={() => setCardCount(option.count)}
                      className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                        cardCount === option.count
                          ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-semibold">{option.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!selectedDocId || isGenerating}
                isLoading={isGenerating}
                className="w-full justify-center h-10 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white border-transparent"
              >
                <Layers className="w-3.5 h-3.5 mr-2" />
                {isGenerating ? "Synthesizing cards..." : "Generate study deck"}
              </Button>
            </div>
          </div>

          {/* Existing Decks Column */}
          <div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
                Saved study decks
              </h2>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {isLoadingHistory ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                ) : deckSets.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No flashcard sets generated yet. Select a reading to synthesize your first deck.
                  </p>
                ) : (
                  deckSets.map((ds) => (
                    <div
                      key={ds.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                          {ds.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {ds.cards?.length || 0} cards • {formatDate(ds.created_at)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartExisting(ds.id)}
                        className="h-7 text-xs px-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
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
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {activeSet.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Card {currentIndex + 1} of {activeSet.cards.length}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode("setup")}
                className="text-xs h-7 border-slate-200 dark:border-slate-700"
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
              className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* FRONT: Front Prompt */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white dark:bg-slate-900 rounded-2xl p-8 flex flex-col justify-between border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-xs font-medium text-slate-400">
                    Prompt
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <kbd className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      Space
                    </kbd>
                    <span>flip card</span>
                  </span>
                </div>

                <div className="text-center my-auto px-6 py-4">
                  <p className="text-xl md:text-2xl font-medium text-slate-900 dark:text-slate-100 leading-snug">
                    {currentCard.front || currentCard.front_content}
                  </p>
                </div>

                <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                  Recall the core definition, then click or press Space to verify.
                </div>
              </div>

              {/* BACK: Back Answer */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-slate-900 text-white rounded-2xl p-8 flex flex-col justify-between border border-slate-800 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-medium text-blue-400">
                    Verified Answer
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <kbd className="px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-[10px] font-semibold text-slate-300">
                      Space
                    </kbd>
                    <span>flip card</span>
                  </span>
                </div>

                <div className="text-center my-auto px-6 py-4">
                  <p className="text-base md:text-lg leading-relaxed text-slate-100 font-sans">
                    {currentCard.back || currentCard.back_content}
                  </p>
                </div>

                <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                  Select your retrieval tier below to register spaced repetition intervals.
                </div>
              </div>
            </div>
          </div>

          {/* Rating Buttons */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>
                {isFlipped ? "Score your recall accuracy:" : "Assess recall strength (advances to next card):"}
              </span>
              <span className="text-[11px] text-slate-400">
                Keys 1 - 4
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[
                { rating: "again", key: "1", label: "Again", desc: "Forgot", hover: "hover:border-red-400" },
                { rating: "hard", key: "2", label: "Hard", desc: "Struggled", hover: "hover:border-amber-400" },
                { rating: "good", key: "3", label: "Good", desc: "Recalled", hover: "hover:border-blue-400" },
                { rating: "easy", key: "4", label: "Easy", desc: "Mastered", hover: "hover:border-emerald-400" },
              ].map((tier) => (
                <button
                  key={tier.rating}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(tier.rating as any);
                  }}
                  className={`p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 ${tier.hover} transition-all flex flex-col items-center cursor-pointer shadow-2xs`}
                >
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    [{tier.key}] {tier.label}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
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
        <div className="max-w-md mx-auto text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 space-y-6 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Drill Run Complete
            </h2>
            <p className="text-xs text-slate-500">
              Successfully reviewed <strong className="text-slate-900 dark:text-slate-100">{reviewedCards.length}</strong> cards in this practice run.
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
              className="h-9 px-4 text-xs font-medium border-slate-200 dark:border-slate-700"
            >
              <RotateCw className="w-3.5 h-3.5 mr-2" /> Repeat deck
            </Button>
            <Button
              size="sm"
              onClick={() => setMode("setup")}
              className="h-9 px-4 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white border-transparent"
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
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading flashcards...</div>}>
      <FlashcardsContent />
    </Suspense>
  );
}