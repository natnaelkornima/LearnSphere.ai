"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
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
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Diagnostic Practice Assessments
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Multiple-choice exams synthesized and evaluated against your primary course literature.
        </p>
      </div>

      {/* MODE 1: SETUP & GENERATION */}
      {mode === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6 shadow-2xs">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Configure assessment parameters
                </h2>
                <p className="text-xs text-slate-500 mt-1">
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
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Source text
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Question Count */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Question count
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value={3}>3 questions (focused check)</option>
                    <option value={5}>5 questions (standard set)</option>
                    <option value={10}>10 questions (comprehensive exam)</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Difficulty level
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="easy">Foundational (retrieval & terminology)</option>
                    <option value="medium">Standard (application & analysis)</option>
                    <option value="hard">Advanced (deduction & case study)</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!selectedDocId || isGenerating}
                isLoading={isGenerating}
                className="w-full justify-center h-10 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white border-transparent"
              >
                <Brain className="w-3.5 h-3.5 mr-2" />
                {isGenerating ? "Synthesizing exam..." : "Create practice assessment"}
              </Button>
            </div>
          </div>

          {/* Previous Quizzes Column */}
          <div>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-2xs">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
                Available tests
              </h2>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {isLoadingHistory ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                ) : previousQuizzes.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No assessments generated yet.
                  </p>
                ) : (
                  previousQuizzes.map((q) => (
                    <div
                      key={q.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                          {q.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {q.questions?.length || 0} items • {q.difficulty}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartExisting(q.id)}
                        className="h-7 text-xs px-2.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
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
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          {/* Header Bar */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/70 dark:bg-slate-850">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {activeQuiz.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Question {currentQIndex + 1} of {activeQuiz.questions.length}
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300">
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
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                Question {currentQIndex + 1}
              </span>
              <h3 className="text-lg md:text-xl font-medium text-slate-900 dark:text-slate-100 leading-snug">
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
                        ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold uppercase border transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white border-transparent"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {key}
                      </span>
                      <span className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                        {label}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Footer & Quick-Jump */}
          <div className="px-8 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex((prev) => prev - 1)}
              className="h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
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
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isCurrent
                        ? "bg-blue-600 text-white font-semibold"
                        : answered
                        ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                        : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white border-transparent"
              >
                Next question <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubmitQuiz}
                isLoading={isSubmitting}
                className="h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
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
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-6 shadow-2xs">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Assessment Results
              </span>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
                {activeQuiz.title}
              </h2>
            </div>

            <div className="inline-grid grid-cols-2 gap-8 px-8 py-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div>
                <p className="text-xs font-medium text-slate-500">Overall score</p>
                <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-1">
                  {quizResult.score_percentage ?? quizResult.percentage ?? 0}%
                </p>
              </div>
              <div className="border-l border-slate-200 dark:border-slate-700 pl-8">
                <p className="text-xs font-medium text-slate-500">Correct answers</p>
                <p className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-1">
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
                className="h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              >
                <RotateCw className="w-3.5 h-3.5 mr-1.5" /> Retake assessment
              </Button>
              <Button
                size="sm"
                onClick={() => setMode("setup")}
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white border-transparent"
              >
                New assessment
              </Button>
            </div>
          </div>

          {/* Question Breakdown with Explanations */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Item breakdown and explanations
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
                  className={`rounded-2xl border p-5 space-y-3 bg-white dark:bg-slate-900 shadow-2xs ${
                    isCorrect
                      ? "border-emerald-200 dark:border-emerald-800"
                      : "border-red-200 dark:border-red-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-400">
                        Item {idx + 1}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {q.prompt || q.question_text}
                      </h3>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
                        isCorrect
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                      }`}
                    >
                      {isCorrect ? "Correct" : "Incorrect"}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 pt-1 text-slate-600 dark:text-slate-400">
                    <p>
                      Your answer: <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedKey || "None"}</span>
                    </p>
                    {!isCorrect && (
                      <p className="text-emerald-600 dark:text-emerald-400">
                        Correct answer: <span className="font-semibold">{correctKey}</span>
                      </p>
                    )}
                  </div>

                  {explanationText && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-sans">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 mr-1">
                        Rationale:
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
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading quizzes...</div>}>
      <QuizzesContent />
    </Suspense>
  );
}