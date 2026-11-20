"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Brain,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Check,
} from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { DocumentItem, Quiz, QuizAttempt, QuizQuestion } from "@/types";

type QuizMode = "setup" | "playing" | "results";

function QuizzesContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get("doc");

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId || "");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active quiz state
  const [mode, setMode] = useState<QuizMode>("setup");
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);

  // History
  const [previousQuizzes, setPreviousQuizzes] = useState<Quiz[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoadingHistory(true);
        const [docsData, quizzesData] = await Promise.all([
          api.documents.list(1, 50),
          api.quizzes.list(),
        ]);
        setDocuments(docsData.items.filter((d: DocumentItem) => d.status === "ready") || []);
        setPreviousQuizzes(quizzesData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    load();
  }, []);

  const handleGenerate = async () => {
    if (!selectedDocId) {
      setErrorMsg("Please select an indexed document to generate assessment from.");
      return;
    }
    try {
      setIsGenerating(true);
      setErrorMsg(null);
      const quiz = await api.quizzes.generate({
        document_id: selectedDocId,
        question_count: questionCount,
        difficulty: difficulty,
      });
      setActiveQuiz(quiz);
      setUserAnswers({});
      setCurrentQIndex(0);
      setMode("playing");
      setPreviousQuizzes((prev) => [quiz, ...prev]);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate assessment");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartExisting = async (quizId: string) => {
    try {
      setIsGenerating(true);
      const quiz = await api.quizzes.get(quizId);
      setActiveQuiz(quiz);
      setUserAnswers({});
      setCurrentQIndex(0);
      setMode("playing");
    } catch {
      setErrorMsg("Could not load selected assessment");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectOption = (questionId: string, optionKey: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      setIsSubmitting(true);
      const answersPayload = activeQuiz.questions.map((q) => ({
        question_id: q.id,
        selected_option: userAnswers[q.id] || "",
      }));

      const attempt = await api.quizzes.submit(activeQuiz.id, answersPayload);
      setQuizResult(attempt);
      setMode("results");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion: QuizQuestion | undefined =
    activeQuiz?.questions?.[currentQIndex];

  const getRenderOptions = (q: QuizQuestion): [string, string][] => {
    if (Array.isArray(q.options)) {
      return q.options.map((opt) => [opt.id, opt.text]);
    }
    return Object.entries(q.options || {});
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[#e6dfd1] dark:border-[#2a2723] pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Evaluative Assessments
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-serif italic">
          Diagnostic multiple-choice tests synthesized and evaluated against your primary source literature.
        </p>
      </div>

      {/* MODE 1: SETUP & GENERATION */}
      {mode === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-6 space-y-6 shadow-xs">
              <div>
                <h2 className="font-serif text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Configure assessment parameters
                </h2>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                  Questions are generated deterministically from semantic text chunks with exact citations.
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Question Count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Question count
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-[#e6dfd1] dark:border-[#2e2a25] bg-white dark:bg-[#1f1d1a] p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-200"
                  >
                    <option value={3}>3 questions (focused check)</option>
                    <option value={5}>5 questions (standard battery)</option>
                    <option value={10}>10 questions (comprehensive exam)</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Cognitive rigor
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full text-xs rounded-lg border border-[#e6dfd1] dark:border-[#2e2a25] bg-white dark:bg-[#1f1d1a] p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-200"
                  >
                    <option value="easy">Foundational (retrieval & terminology)</option>
                    <option value="medium">Standard (application & analytical comparison)</option>
                    <option value="hard">Advanced (synthetic deduction & critical case)</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!selectedDocId || isGenerating}
                isLoading={isGenerating}
                className="w-full justify-center h-10 text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200"
              >
                <Brain className="w-3.5 h-3.5 mr-2" />
                {isGenerating ? "Synthesizing exam..." : "Create practice assessment"}
              </Button>
            </div>
          </div>

          {/* Previous Quizzes Column */}
          <div>
            <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-5 space-y-4 shadow-xs">
              <h2 className="font-serif text-sm font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-[#e6dfd1] dark:border-[#2a2723]">
                Available tests
              </h2>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {isLoadingHistory ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                ) : previousQuizzes.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-6 font-serif italic">
                    No assessments generated yet.
                  </p>
                ) : (
                  previousQuizzes.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-lg border border-[#e6dfd1] dark:border-[#2a2723] bg-white dark:bg-[#1f1d1a] flex items-center justify-between gap-3 hover:border-neutral-400 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {q.title}
                        </p>
                        <p className="text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {q.questions?.length || 0} items • {q.difficulty}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartExisting(q.id)}
                        className="h-7 text-xs px-2.5 font-mono"
                      >
                        Start
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: ACTIVE QUIZ PLAYER */}
      {mode === "playing" && activeQuiz && currentQuestion && (
        <div className="max-w-3xl mx-auto rounded-2xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] overflow-hidden shadow-xs">
          {/* Header Bar */}
          <div className="p-6 border-b border-[#e6dfd1] dark:border-[#2a2723] space-y-3 bg-white/70 dark:bg-[#1c1b18]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {activeQuiz.title}
                </h2>
                <p className="text-xs font-mono tabular-nums text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Question {String(currentQIndex + 1).padStart(2, "0")} of {String(activeQuiz.questions.length).padStart(2, "0")}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded border border-[#e6dfd1] dark:border-[#2e2a25] font-mono text-[10px] uppercase text-neutral-600 dark:text-neutral-400">
                {activeQuiz.difficulty}
              </span>
            </div>

            <ProgressBar
              value={((currentQIndex + 1) / activeQuiz.questions.length) * 100}
            />
          </div>

          {/* Question Body */}
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono tabular-nums uppercase tracking-wider text-neutral-500">
                Item {String(currentQIndex + 1).padStart(2, "0")}
              </span>
              <h3 className="font-serif text-lg md:text-xl font-medium text-neutral-900 dark:text-neutral-100 leading-snug">
                {currentQuestion.prompt || currentQuestion.question_text}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 pt-2">
              {getRenderOptions(currentQuestion).map(([key, label]) => {
                const isSelected = userAnswers[currentQuestion.id] === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectOption(currentQuestion.id, key)}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-neutral-900 dark:border-neutral-100 bg-white dark:bg-[#23211d] shadow-xs"
                        : "border-[#e6dfd1] dark:border-[#2a2723] hover:border-neutral-400 bg-white/80 dark:bg-[#1a1917]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-semibold uppercase border transition-colors ${
                          isSelected
                            ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-transparent"
                            : "bg-neutral-100 dark:bg-[#23211d] border-[#e6dfd1] dark:border-[#2e2a25] text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {key}
                      </span>
                      <span className="text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed font-sans">
                        {label}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-neutral-900 dark:text-neutral-100 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Footer & Quick-Jump */}
          <div className="px-8 py-4 bg-white/80 dark:bg-[#191816] border-t border-[#e6dfd1] dark:border-[#2a2723] flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex((prev) => prev - 1)}
              className="h-8 text-xs border-[#e6dfd1] dark:border-[#2a2723]"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Previous
            </Button>

            {/* Quick-Jump numbered buttons */}
            <div className="hidden sm:flex items-center gap-1.5">
              {activeQuiz.questions.map((q, idx) => {
                const answered = !!userAnswers[q.id];
                const isCurrent = idx === currentQIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`w-7 h-7 rounded-lg text-xs font-mono tabular-nums font-medium transition-colors cursor-pointer ${
                      isCurrent
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                        : answered
                        ? "border border-neutral-300 dark:border-neutral-700 bg-neutral-200 dark:bg-[#2e2a25] text-neutral-900 dark:text-neutral-100"
                        : "border border-transparent text-neutral-400 hover:border-[#e6dfd1]"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {currentQIndex < activeQuiz.questions.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentQIndex((prev) => prev + 1)}
                className="h-8 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950"
              >
                Next item <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubmitQuiz}
                isLoading={isSubmitting}
                className="h-8 text-xs font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950"
              >
                Submit assessment
              </Button>
            )}
          </div>
        </div>
      )}

      {/* MODE 3: RESULTS SCREEN */}
      {mode === "results" && quizResult && activeQuiz && (
        <div className="space-y-8 max-w-3xl mx-auto">
          {/* Score Header Card */}
          <div className="rounded-2xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-8 text-center space-y-6 shadow-xs">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                Evaluation Summary
              </span>
              <h2 className="font-serif text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mt-1">
                {activeQuiz.title}
              </h2>
            </div>

            <div className="inline-grid grid-cols-2 gap-8 px-8 py-5 rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-white dark:bg-[#1f1d1a]">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">Score percentage</p>
                <p className="text-3xl font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                  {quizResult.score_percentage ?? quizResult.percentage ?? 0}%
                </p>
              </div>
              <div className="border-l border-[#e6dfd1] dark:border-[#2a2723] pl-8">
                <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">Correct answers</p>
                <p className="text-3xl font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                  {quizResult.correct_answers_count ?? quizResult.correct_count} / {quizResult.total_questions_count ?? activeQuiz.questions.length}
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUserAnswers({});
                  setCurrentQIndex(0);
                  setMode("playing");
                }}
                className="h-8 text-xs border-[#e6dfd1] dark:border-[#2a2723]"
              >
                <RotateCw className="w-3.5 h-3.5 mr-1.5" /> Retake assessment
              </Button>
              <Button
                size="sm"
                onClick={() => setMode("setup")}
                className="h-8 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950"
              >
                New assessment
              </Button>
            </div>
          </div>

          {/* Question Breakdown with Explanations */}
          <div className="space-y-4">
            <h2 className="font-serif text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Diagnostic item breakdown & grounding
            </h2>

            {activeQuiz.questions.map((q, idx) => {
              const attemptAnswer = quizResult.answers?.find(
                (a) => a.question_id === q.id
              );
              const resultAnswer = quizResult.results?.find(
                (r) => r.question_id === q.id
              );

              const isCorrect = attemptAnswer?.is_correct ?? resultAnswer?.is_correct ?? false;
              const selectedKey = userAnswers[q.id];
              const correctKey = attemptAnswer?.correct_answer ?? resultAnswer?.correct_answer ?? q.correct_answer;
              const explanationText = attemptAnswer?.explanation ?? resultAnswer?.explanation ?? q.explanation;

              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-5 space-y-3 bg-[#faf8f5] dark:bg-[#171614] ${
                    isCorrect
                      ? "border-emerald-300 dark:border-emerald-800/60"
                      : "border-red-300 dark:border-red-800/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono tabular-nums text-neutral-500 uppercase">
                        Item {String(idx + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-serif text-base font-semibold text-neutral-900 dark:text-neutral-100">
                        {q.prompt || q.question_text}
                      </h3>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-semibold flex-shrink-0 ${
                        isCorrect
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                          : "bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <div className="text-xs font-mono space-y-1 pt-1 text-neutral-700 dark:text-neutral-300">
                    <p>
                      Selected response: <span className="font-bold">{selectedKey || "None"}</span>
                    </p>
                    {!isCorrect && (
                      <p className="text-emerald-700 dark:text-emerald-400">
                        Verified key: <span className="font-bold">{correctKey}</span>
                      </p>
                    )}
                  </div>

                  {explanationText && (
                    <div className="p-3.5 rounded-lg bg-white dark:bg-[#1f1d1a] border border-[#e6dfd1] dark:border-[#2a2723] text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 font-serif">
                      <span className="font-sans font-semibold text-neutral-900 dark:text-neutral-100 not-italic mr-1">
                        Pedagogical rationale:
                      </span>
                      {explanationText}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuizzesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400 font-mono">Loading assessment suite...</div>}>
      <QuizzesContent />
    </Suspense>
  );
}