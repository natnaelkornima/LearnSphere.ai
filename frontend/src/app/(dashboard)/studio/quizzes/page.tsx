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
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trophy,
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
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // question_id -> selected_key
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

  // Helper to normalize options
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
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Practice Quizzes & Assessments
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Reinforce retention with server-scored, deterministic active recall questions.
        </p>
      </div>

      {/* MODE 1: SETUP & GENERATION */}
      {mode === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary-600" />
                  Generate Practice Quiz
                </CardTitle>
                <CardDescription>
                  Questions are generated directly from your document's vector chunks.
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
                    Target Document
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

                <div className="grid grid-cols-2 gap-4">
                  {/* Question Count */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase">
                      Number of Questions
                    </label>
                    <select
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value={3}>3 Questions (Quick check)</option>
                      <option value={5}>5 Questions (Standard)</option>
                      <option value={10}>10 Questions (Comprehensive)</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase">
                      Difficulty Level
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="easy">Easy (Foundational)</option>
                      <option value="medium">Medium (Analytical)</option>
                      <option value="hard">Hard (Mastery & Synthesis)</option>
                    </select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!selectedDocId || isGenerating}
                  isLoading={isGenerating}
                  className="w-full justify-center mt-2"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {isGenerating ? "Synthesizing Questions..." : "Create Quiz"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Previous Quizzes Column */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Available Quizzes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                {isLoadingHistory ? (
                  <div className="space-y-2">
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
                      className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/40 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {q.title}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {q.questions?.length || 0} questions • {q.difficulty}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartExisting(q.id)}
                      >
                        Play
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
        <Card className="max-w-3xl mx-auto shadow-md">
          {/* Quiz Header Bar */}
          <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                  {activeQuiz.title}
                </h3>
                <p className="text-xs text-neutral-400">
                  Question {currentQIndex + 1} of {activeQuiz.questions.length}
                </p>
              </div>
              <Badge variant="primary" className="uppercase text-[10px]">
                {activeQuiz.difficulty}
              </Badge>
            </div>

            <ProgressBar
              value={((currentQIndex + 1) / activeQuiz.questions.length) * 100}
              variant="primary"
            />
          </div>

          {/* Question Body */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                Question {currentQIndex + 1}
              </span>
              <h4 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 leading-snug">
                {currentQuestion.prompt || currentQuestion.question_text}
              </h4>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {getRenderOptions(currentQuestion).map(([key, label]) => {
                const isSelected = userAnswers[currentQuestion.id] === key;
                return (
                  <button
                    key={key}
                    onClick={() => selectOption(currentQuestion.id, key)}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary-500 bg-primary-50/70 dark:bg-primary-950/40 ring-2 ring-primary-500/50 shadow-xs"
                        : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                          isSelected
                            ? "bg-primary-600 text-white"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                        }`}
                      >
                        {key}
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {label}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Footer & Navigation */}
          <div className="p-6 bg-neutral-50/70 dark:bg-neutral-800/40 border-t border-neutral-100 dark:border-neutral-800 rounded-b-xl flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={currentQIndex === 0}
              onClick={() => setCurrentQIndex((prev) => prev - 1)}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Previous
            </Button>

            {/* Question Quick-Jump Pills */}
            <div className="hidden sm:flex items-center gap-1.5">
              {activeQuiz.questions.map((q, idx) => {
                const answered = !!userAnswers[q.id];
                const isCurrent = idx === currentQIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`w-7 h-7 rounded-md text-xs font-semibold transition-all ${
                      isCurrent
                        ? "bg-primary-600 text-white shadow-xs"
                        : answered
                        ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                        : "bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
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
              >
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                variant="primary"
                onClick={handleSubmitQuiz}
                isLoading={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Submit Quiz
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* MODE 3: RESULTS SCREEN (SERVER-EVALUATED) */}
      {mode === "results" && quizResult && activeQuiz && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {/* Score Header Card */}
          <Card className="text-center p-8 bg-gradient-to-b from-primary-50/60 to-white dark:from-neutral-900 dark:to-neutral-950 border-primary-200 dark:border-primary-900 shadow-md">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Trophy className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Quiz Completed!
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Your answers have been verified against the server answer key.
            </p>

            <div className="my-6 inline-flex items-center gap-6 px-6 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs">
              <div>
                <p className="text-xs text-neutral-400 font-semibold uppercase">Score</p>
                <p className="text-3xl font-extrabold text-primary-600">
                  {quizResult.score_percentage ?? quizResult.percentage ?? 0}%
                </p>
              </div>
              <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700" />
              <div>
                <p className="text-xs text-neutral-400 font-semibold uppercase">Correct</p>
                <p className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">
                  {quizResult.correct_answers_count ?? quizResult.correct_count} / {quizResult.total_questions_count ?? activeQuiz.questions.length}
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUserAnswers({});
                  setCurrentQIndex(0);
                  setMode("playing");
                }}
              >
                <RotateCw className="w-4 h-4 mr-1.5" /> Retake Quiz
              </Button>
              <Button size="sm" onClick={() => setMode("setup")}>
                Create Another Quiz
              </Button>
            </div>
          </Card>

          {/* Question Breakdown with Server Explanations */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              Detailed Question Breakdown
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
                  className={`border-l-4 ${
                    isCorrect ? "border-l-emerald-500" : "border-l-red-500"
                  }`}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-neutral-400 uppercase">
                          Question {idx + 1}
                        </span>
                        <h5 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                          {q.prompt || q.question_text}
                        </h5>
                      </div>
                      <Badge variant={isCorrect ? "success" : "danger"}>
                        {isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>

                    {/* Options list showing student's choice vs correct */}
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {getRenderOptions(q).map(([key, label]) => {
                        const isUserPick = selectedKey === key;
                        const isActualCorrect = correctKey === key;

                        let optionClass =
                          "border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50";
                        if (isActualCorrect) {
                          optionClass =
                            "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-semibold";
                        } else if (isUserPick && !isCorrect) {
                          optionClass =
                            "border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-100";
                        }

                        return (
                          <div
                            key={key}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${optionClass}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold uppercase">{key}.</span>
                              <span>{label}</span>
                            </div>
                            {isActualCorrect && (
                              <span className="text-[10px] font-bold text-emerald-700 uppercase">
                                Correct Answer
                              </span>
                            )}
                            {isUserPick && !isCorrect && (
                              <span className="text-[10px] font-bold text-red-700 uppercase">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Server Explanation */}
                    {explanationText && (
                      <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          Explanation:
                        </span>
                        <p>{explanationText}</p>
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400">Loading quiz...</div>}>
      <QuizzesContent />
    </Suspense>
  );
}
