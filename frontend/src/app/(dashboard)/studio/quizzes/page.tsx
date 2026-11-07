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
      setErrorMsg("Please select a document to generate quiz from.");
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
      setErrorMsg(err.message || "Failed to generate quiz");
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
      setErrorMsg("Could not load selected quiz");
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
      setErrorMsg(err.message || "Failed to submit quiz");
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
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Practice assessments
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Server-evaluated active recall questions grounded in your course materials.
        </p>
      </div>

      {/* MODE 1: SETUP & GENERATION */}
      {mode === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Generate practice assessment</CardTitle>
                <CardDescription>
                  Questions are synthesized deterministically from indexed text chunks.
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

                <div className="grid grid-cols-2 gap-4">
                  {/* Question Count */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Question count
                    </label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 p-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary-600"
                    >
                      <option value={3}>3 questions (focused check)</option>
                      <option value={5}>5 questions (standard set)</option>
                      <option value={10}>10 questions (comprehensive)</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                      Difficulty level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 p-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary-600"
                    >
                      <option value="easy">Foundational (recall & definition)</option>
                      <option value="medium">Standard (application & analysis)</option>
                      <option value="hard">Advanced (synthesis & evaluation)</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!selectedDocId || isGenerating}
                  isLoading={isGenerating}
                  className="w-full justify-center h-8 text-xs mt-1"
                >
                  <Brain className="w-3.5 h-3.5 mr-1.5" />
                  {isGenerating ? "Synthesizing questions..." : "Create assessment"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Previous Quizzes Column */}
          <div>
            <Card>
              <CardHeader className="pb-2.5">
                <CardTitle className="text-xs font-medium text-neutral-500">Available tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                {isLoadingHistory ? (
                  <div className="space-y-1.5">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : previousQuizzes.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-4">
                    No quizzes created yet.
                  </p>
                ) : (
                  previousQuizzes.map((q) => (
                    <div
                      key={q.id}
                      className="p-2.5 rounded-md border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                          {q.title}
                        </p>
                        <p className="text-[11px] font-mono tabular-nums text-neutral-400">
                          {q.questions?.length || 0} questions • {q.difficulty}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartExisting(q.id)}
                        className="h-6 text-[11px] px-2"
                      >
                        Start
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* MODE 2: ACTIVE QUIZ PLAYER */}
      {mode === "playing" && activeQuiz && currentQuestion && (
        <Card className="max-w-2xl mx-auto">
          {/* Quiz Header Bar */}
          <div className="p-5 border-b border-neutral-100 dark:border-neutral-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                  {activeQuiz.title}
                </h3>
                <p className="text-[11px] font-mono tabular-nums text-neutral-400">
                  Question {currentQIndex + 1} of {activeQuiz.questions.length}
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-[10px] lowercase">
                {activeQuiz.difficulty}
              </Badge>
            </div>

            <ProgressBar
              value={((currentQIndex + 1) / activeQuiz.questions.length) * 100}
              variant="primary"
            />
          </div>

          {/* Question Body */}
          <div className="p-6 md:p-7 space-y-5">
            <div className="space-y-1">
              <span className="text-[11px] font-mono tabular-nums text-neutral-400">
                Item {String(currentQIndex + 1).padStart(2, "0")}
              </span>
              <h4 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                {currentQuestion.prompt || currentQuestion.question_text}
              </h4>
            </div>

            {/* Answer Options */}
            <div className="space-y-2">
              {getRenderOptions(currentQuestion).map(([key, label]) => {
                const isSelected = userAnswers[currentQuestion.id] === key;
                return (
                  <button
                    key={key}
                    onClick={() => selectOption(currentQuestion.id, key)}
                    className={`w-full p-3.5 rounded-md border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800"
                        : "border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-semibold uppercase border ${
                          isSelected
                            ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-transparent"
                            : "bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        {key}
                      </span>
                      <span className="text-xs text-neutral-900 dark:text-neutral-100 leading-normal">
                        {label}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-neutral-900 dark:text-neutral-100 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Footer & Navigation */}
          <div className="px-6 py-3.5 bg-neutral-50/70 dark:bg-neutral-850 border-t border-neutral-100 dark:border-neutral-800/80 rounded-b-lg flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex((prev) => prev - 1)}
              className="h-7 text-xs"
            >
              <ArrowLeft className="w-3 h-3 mr-1" /> Previous
            </Button>

            {/* Question Quick-Jump Pills */}
            <div className="hidden sm:flex items-center gap-1">
              {activeQuiz.questions.map((q, idx) => {
                const answered = !!userAnswers[q.id];
                const isCurrent = idx === currentQIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`w-6 h-6 rounded text-[11px] font-mono tabular-nums font-medium transition-colors ${
                      isCurrent
                        ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                        : answered
                        ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                        : "bg-transparent text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
                className="h-7 text-xs"
              >
                Next <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleSubmitQuiz}
                isLoading={isSubmitting}
                className="h-7 text-xs bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
              >
                Submit assessment
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* MODE 3: RESULTS SCREEN */}
      {mode === "results" && quizResult && activeQuiz && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Score Header Card */}
          <Card className="text-center p-8 bg-white dark:bg-neutral-900">
            <span className="text-[11px] font-mono text-neutral-500">
              Assessment results
            </span>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              {activeQuiz.title}
            </h3>

            <div className="my-6 inline-flex items-center gap-8 px-6 py-4 rounded-md border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850">
              <div>
                <p className="text-[11px] font-medium text-neutral-500">Overall score</p>
                <p className="text-3xl font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
                  {quizResult.score_percentage ?? quizResult.percentage ?? 0}%
                </p>
              </div>
              <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700" />
              <div>
                <p className="text-[11px] font-medium text-neutral-500">Correct answers</p>
                <p className="text-3xl font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
                  {quizResult.correct_answers_count ?? quizResult.correct_count} / {quizResult.total_questions_count ?? activeQuiz.questions.length}
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUserAnswers({});
                  setCurrentQIndex(0);
                  setMode("playing");
                }}
                className="h-7 text-xs"
              >
                <RotateCw className="w-3 h-3 mr-1.5" /> Retake test
              </Button>
              <Button size="sm" onClick={() => setMode("setup")} className="h-7 text-xs">
                New assessment
              </Button>
            </div>
          </Card>

          {/* Question Breakdown with Server Explanations */}
          <div className="space-y-3">
            <h4 className="text-xs font-medium text-neutral-500">
              Item breakdown and explanations
            </h4>

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
                <Card
                  key={q.id}
                  className={`border-l-2 ${
                    isCorrect ? "border-l-emerald-600" : "border-l-red-600"
                  }`}
                >
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono tabular-nums text-neutral-400">
                          Item {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h5 className="font-medium text-xs text-neutral-900 dark:text-neutral-100">
                          {q.prompt || q.question_text}
                        </h5>
                      </div>
                      <Badge variant={isCorrect ? "success" : "danger"} className="font-mono text-[10px] lowercase">
                        {isCorrect ? "correct" : "incorrect"}
                      </Badge>
                    </div>

                    <div className="text-xs space-y-1 font-mono text-[11px] pt-1">
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Your answer: <span className="font-semibold">{selectedKey || "None"}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-emerald-700 dark:text-emerald-400">
                          Correct key: <span className="font-semibold">{correctKey}</span>
                        </p>
                      )}
                    </div>

                    {explanationText && (
                      <div className="p-2.5 rounded bg-neutral-50 dark:bg-neutral-850 text-xs text-neutral-600 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-800 leading-relaxed font-sans">
                        <strong className="font-medium text-neutral-900 dark:text-neutral-100">Rationale: </strong>
                        {explanationText}
                      </div>
                    )}
                  </CardContent>
                </Card>
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400 font-mono">Loading quizzes...</div>}>
      <QuizzesContent />
    </Suspense>
  );
}
