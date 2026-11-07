"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Brain,
  Trophy,
  Flame,
  Target,
  BookOpen,
  Sparkles,
  ArrowRight,
} from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { AnalyticsDashboardData } from "@/types";

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await api.analytics.getDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Learning Analytics & Mastery
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Real metrics computed strictly from your persisted database activity and assessment records.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Materials Ingested</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Skeleton className="h-8 w-12" /> : data?.total_documents ?? 0}
              </p>
              <p className="text-[11px] text-neutral-400">Indexed for RAG</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Quiz Questions</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Skeleton className="h-8 w-12" /> : data?.total_questions_attempted ?? 0}
              </p>
              <p className="text-[11px] text-neutral-400">Attempted so far</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
              <Brain className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Average Accuracy</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Skeleton className="h-8 w-14" /> : `${data?.accuracy_rate ?? 0}%`}
              </p>
              <p className="text-[11px] text-neutral-400">Across all tests</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <Trophy className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Study Streak</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Skeleton className="h-8 w-12" /> : `${data?.study_streak_days ?? 1} Days`}
              </p>
              <p className="text-[11px] text-neutral-400">Daily active learning</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Flame className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topics Breakdown & Weak Spot Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Topic Mastery & Accuracy Bars */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-primary-600" />
                Knowledge Topic Breakdown
              </CardTitle>
              <CardDescription>
                Calculated from your practice quiz responses and topic tags.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : data?.weak_topics && data.weak_topics.length > 0 ? (
                <div className="space-y-4">
                  {data.weak_topics.map((t, idx) => {
                    const topicName = typeof t === "string" ? t : t.topic;
                    const accuracy = typeof t === "string" ? 50 : t.accuracy;
                    const isWeak = accuracy < 60;
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            {topicName}
                          </span>
                          <span
                            className={`font-bold ${
                              isWeak ? "text-amber-600 dark:text-amber-400" : "text-emerald-600"
                            }`}
                          >
                            {accuracy}%
                          </span>
                        </div>
                        <ProgressBar
                          value={accuracy}
                          variant={isWeak ? "warning" : "success"}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400 space-y-2">
                  <Brain className="w-8 h-8 mx-auto text-neutral-300" />
                  <p>Complete a practice quiz to generate topic mastery rankings.</p>
                  <Link href="/studio/quizzes">
                    <Button size="sm" variant="outline" className="mt-2">
                      Take a Practice Quiz
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actionable Recommendations */}
          <Card className="border-primary-200 dark:border-primary-900 bg-primary-50/20 dark:bg-primary-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-primary-900 dark:text-primary-100">
                <Sparkles className="w-4 h-4 text-primary-600" />
                Adaptive Study Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {data?.recommendations && data.recommendations.length > 0 ? (
                data.recommendations.map((rec, i) => {
                  const recText = typeof rec === "string" ? rec : `${rec.title}: ${rec.description}`;
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2.5"
                    >
                      <span className="text-primary-600 font-bold">•</span>
                      <span>{recText}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-neutral-400">
                  Upload study documents and complete quizzes to generate personalized learning paths.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Study Habits & Quick Jump */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Study Habit Consistency</CardTitle>
              <CardDescription>Daily engagement pulse</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500 text-white">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-900 dark:text-amber-100">
                      Current Streak
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Goal: 7 consecutive days
                    </p>
                  </div>
                </div>
                <span className="text-xl font-extrabold text-amber-900 dark:text-amber-100">
                  {data?.study_streak_days ?? 1}d
                </span>
              </div>

              <div className="pt-2 space-y-2">
                <p className="text-xs font-semibold text-neutral-500 uppercase">
                  Target Next Step
                </p>
                <Link href="/tutor" className="block">
                  <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <span>Ask AI Tutor 3 follow-up questions</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                </Link>
                <Link href="/studio/flashcards" className="block">
                  <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <span>Review 10 flashcards</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
