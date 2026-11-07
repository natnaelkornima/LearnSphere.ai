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
  Sparkles,
  RotateCw,
  AlertCircle,
  Trophy,
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

    // Persist review to backend
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
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Smart Flashcards & Active Recall
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Reinforce long-term semantic memory with 3D flip interactive study decks.
        </p>
      </div>

      {/* MODE 1: SETUP & DECKS */}
      {mode === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  Generate New Deck
                </CardTitle>
                <CardDescription>
                  Extract key terms, definitions, and concepts into flashcards.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {errorMsg && (
                  <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Document Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase">
                    Source Document
                  </label>
                  <select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">-- Select Ready Document --</option>
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Card Count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase">
                    Deck Size
                  </label>
                  <select
                    value={cardCount}
                    onChange={(e) => setCardCount(Number(e.target.value))}
                    className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={5}>5 Flashcards (Focused Review)</option>
                    <option value={10}>10 Flashcards (Standard Deck)</option>
                    <option value={15}>15 Flashcards (Deep Study)</option>
                  </select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!selectedDocId || isGenerating}
                  isLoading={isGenerating}
                  className="w-full justify-center mt-2"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  {isGenerating ? "Synthesizing Flashcards..." : "Generate Deck"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Existing Decks */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Saved Decks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                {isLoadingHistory ? (
                  <div className="space-y-2">
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
                      className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {ds.title}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {ds.cards?.length || 0} cards • {formatDate(ds.created_at)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartExisting(ds.id)}
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
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header & Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                  {activeSet.title}
                </h3>
                <p className="text-xs text-neutral-400">
                  Card {currentIndex + 1} of {activeSet.cards.length}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMode("setup")}
                className="text-xs"
              >
                Exit Session
              </Button>
            </div>
            <ProgressBar
              value={((currentIndex + 1) / activeSet.cards.length) * 100}
            />
          </div>

          {/* 3D Flip Card Container */}
          <div
            className="w-full h-80 [perspective:1000px] cursor-pointer"
            onClick={() => setIsFlipped((prev) => !prev)}
          >
            <div
              className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-800 ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* FRONT: Front Prompt / Question */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] bg-white dark:bg-neutral-900 rounded-2xl p-8 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <Badge variant="primary" className="text-[10px] uppercase">
                    Concept / Question
                  </Badge>
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" /> Click or Space to flip
                  </span>
                </div>

                <div className="text-center my-auto px-4">
                  <p className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-snug">
                    {currentCard.front || currentCard.front_content}
                  </p>
                </div>

                <p className="text-center text-xs text-neutral-400">
                  Think of the answer, then reveal back
                </p>
              </div>

              {/* BACK: Back Answer / Definition */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-tr from-primary-950 via-neutral-900 to-neutral-900 text-white rounded-2xl p-8 flex flex-col justify-between border border-primary-500/30">
                <div className="flex items-center justify-between">
                  <Badge variant="success" className="text-[10px] uppercase">
                    Answer / Definition
                  </Badge>
                  <span className="text-xs text-primary-200 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" /> Click or Space to flip back
                  </span>
                </div>

                <div className="text-center my-auto px-4 space-y-2">
                  <p className="text-lg md:text-xl font-medium text-neutral-100 leading-relaxed">
                    {currentCard.back || currentCard.back_content}
                  </p>
                </div>

                <p className="text-center text-xs text-neutral-400">
                  Rate how well you recalled this concept below
                </p>
              </div>
            </div>
          </div>

          {/* Rating Buttons (Spaced Repetition Feedback) */}
          <div className="space-y-2">
            <p className="text-center text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              {isFlipped ? "How well did you know this?" : "Rate recall (reveals next card)"}
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate("again");
                }}
                className="p-3 rounded-xl border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors flex flex-col items-center"
              >
                <span className="text-xs font-bold">Again (1)</span>
                <span className="text-[10px] text-red-500 mt-0.5">Forgot</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate("hard");
                }}
                className="p-3 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors flex flex-col items-center"
              >
                <span className="text-xs font-bold">Hard (2)</span>
                <span className="text-[10px] text-amber-500 mt-0.5">Struggled</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate("good");
                }}
                className="p-3 rounded-xl border border-blue-300 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex flex-col items-center"
              >
                <span className="text-xs font-bold">Good (3)</span>
                <span className="text-[10px] text-blue-500 mt-0.5">Recalled</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRate("easy");
                }}
                className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex flex-col items-center"
              >
                <span className="text-xs font-bold">Easy (4)</span>
                <span className="text-[10px] text-emerald-500 mt-0.5">Mastered</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: SESSION COMPLETED */}
      {mode === "finished" && (
        <Card className="max-w-lg mx-auto text-center p-8 space-y-6 shadow-md">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
            <Trophy className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Deck Completed!
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Great job reinforcing your memory with active recall.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-300">
            Reviewed {reviewedCards.length} cards in this study session.
          </div>

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentIndex(0);
                setIsFlipped(false);
                setReviewedCards([]);
                setMode("study");
              }}
            >
              <RotateCw className="w-4 h-4 mr-1.5" /> Restart Deck
            </Button>
            <Button size="sm" onClick={() => setMode("setup")}>
              Select Another Deck
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default function FlashcardsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400">Loading flashcards...</div>}>
      <FlashcardsContent />
    </Suspense>
  );
}
