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
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Active recall flashcards
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Spaced retrieval practice with keyboard-driven physical card decks.
        </p>
      </div>

      {/* MODE 1: SETUP & DECKS */}
      {mode === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Generate new deck</CardTitle>
                <CardDescription>
                  Extract key terms, definitions, and conceptual questions into study cards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {errorMsg && (
                  <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Document Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Source reading
                  </label>
                  <select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    className="w-full text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 p-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary-600"
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
                <div className="space-y-1">
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    Deck size
                  </label>
                  <select
                    value={cardCount}
                    onChange={(e) => setCardCount(Number(e.target.value))}
                    className="w-full text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 p-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary-600"
                  >
                    <option value={5}>5 cards (focused review)</option>
                    <option value={10}>10 cards (standard deck)</option>
                    <option value={15}>15 cards (deep retention)</option>
                  </select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!selectedDocId || isGenerating}
                  isLoading={isGenerating}
                  className="w-full justify-center h-8 text-xs mt-1"
                >
                  <Layers className="w-3.5 h-3.5 mr-1.5" />
                  {isGenerating ? "Synthesizing cards..." : "Generate deck"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Existing Decks */}
          <div>
            <Card>
              <CardHeader className="pb-2.5">
                <CardTitle className="text-xs font-medium text-neutral-500">Saved decks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                {isLoadingHistory ? (
                  <div className="space-y-1.5">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : deckSets.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-4">
                    No flashcard sets generated yet.
                  </p>
                ) : (
                  deckSets.map((ds) => (
                    <div
                      key={ds.id}
                      className="p-2.5 rounded-md border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {ds.title}
                        </p>
                        <p className="text-[11px] font-mono tabular-nums text-neutral-400">
                          {ds.cards?.length || 0} cards • {formatDate(ds.created_at)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartExisting(ds.id)}
                        className="h-6 text-[11px] px-2"
                      >
                        Study
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* MODE 2: 3D CARD FLIP STUDY PLAYER */}
      {mode === "study" && activeSet && currentCard && (
        <div className="max-w-xl mx-auto space-y-5">
          {/* Header & Progress */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                  {activeSet.title}
                </h3>
                <p className="text-[11px] font-mono tabular-nums text-neutral-400">
                  Card {currentIndex + 1} of {activeSet.cards.length}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("setup")}
                className="text-xs h-7"
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
            className="w-full h-72 [perspective:1000px] cursor-pointer"
            onClick={() => setIsFlipped((prev) => !prev)}
          >
            <div
              className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] rounded-lg border border-neutral-200/90 dark:border-neutral-800 shadow-xs ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* FRONT: Front Prompt / Question */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-[#faf9f6] dark:bg-[#151412] rounded-lg p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-neutral-400">
                    Prompt
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[10px]">
                      Space
                    </kbd>
                    <span>flip</span>
                  </span>
                </div>

                <div className="text-center my-auto px-4">
                  <p className="text-lg md:text-xl font-medium text-neutral-900 dark:text-neutral-100 leading-snug">
                    {currentCard.front || currentCard.front_content}
                  </p>
                </div>

                <p className="text-center text-[11px] text-neutral-400">
                  Recall the explanation, then flip to verify
                </p>
              </div>

              {/* BACK: Back Answer / Definition */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-[#1c1a17] text-white rounded-lg p-6 flex flex-col justify-between border border-neutral-700">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-neutral-400">
                    Answer / Definition
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded border border-neutral-700 bg-neutral-800 text-neutral-300 text-[10px]">
                      Space
                    </kbd>
                    <span>flip</span>
                  </span>
                </div>

                <div className="text-center my-auto px-4 space-y-2">
                  <p className="text-sm md:text-base text-neutral-100 leading-relaxed font-sans">
                    {currentCard.back || currentCard.back_content}
                  </p>
                </div>

                <p className="text-center text-[11px] text-neutral-400">
                  Rate your recall accuracy below
                </p>
              </div>
            </div>
          </div>

          {/* Rating Buttons */}
          <div className="space-y-2">
            <p className="text-center text-[11px] font-medium text-neutral-500">
              {isFlipped ? "Rate your retrieval strength" : "Rate recall (reveals next card)"}
            </p>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate("again");
                }}
                className="p-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-red-400 dark:hover:border-red-800 transition-colors flex flex-col items-center"
              >
                <span className="text-xs font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  [1] Again
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5">Forgot</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate("hard");
                }}
                className="p-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-amber-400 dark:hover:border-amber-800 transition-colors flex flex-col items-center"
              >
                <span className="text-xs font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  [2] Hard
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5">Struggled</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate("good");
                }}
                className="p-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-blue-400 dark:hover:border-blue-800 transition-colors flex flex-col items-center"
              >
                <span className="text-xs font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  [3] Good
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5">Recalled</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate("easy");
                }}
                className="p-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-emerald-400 dark:hover:border-emerald-800 transition-colors flex flex-col items-center"
              >
                <span className="text-xs font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  [4] Easy
                </span>
                <span className="text-[10px] text-neutral-400 mt-0.5">Mastered</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: SESSION COMPLETED */}
      {mode === "finished" && (
        <Card className="max-w-md mx-auto text-center p-8 space-y-5">
          <div className="w-10 h-10 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Session completed
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Reviewed <strong className="font-mono tabular-nums">{reviewedCards.length}</strong> cards in this study run.
            </p>
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setReviewedCards([]);
                setMode("study");
              }}
              className="h-7 text-xs"
            >
              <RotateCw className="w-3 h-3 mr-1.5" /> Restart deck
            </Button>
            <Button size="sm" onClick={() => setMode("setup")} className="h-7 text-xs">
              Select another deck
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400 font-mono">Loading flashcards...</div>}>
      <FlashcardsContent />
    </Suspense>
  );
}
