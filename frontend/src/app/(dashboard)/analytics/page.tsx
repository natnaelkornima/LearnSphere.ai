"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Brain,
  Target,
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Learning analytics
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Mastery metrics computed strictly from your persisted assessment attempts and study reviews.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Indexed readings</p>
            <p className="text-2xl font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
              {isLoading ? <Skeleton className="h-7 w-12" /> : data?.total_documents ?? 0}
            </p>
            <p className="text-[11px] text-neutral-400">Ready in vector vault</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Questions answered</p>
            <p className="text-2xl font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
              {isLoading ? <Skeleton className="h-7 w-12" /> : data?.total_questions_attempted ?? 0}
            </p>
            <p className="text-[11px] text-neutral-400">Total quiz items</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Mean accuracy</p>
            <p className="text-2xl font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
              {isLoading ? <Skeleton className="h-7 w-14" /> : `${data?.accuracy_rate ?? 0}%`}
            </p>
            <p className="text-[11px] text-neutral-400">Server evaluated</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-1">
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Daily streak</p>
            <p className="text-2xl font-mono tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
              {isLoading ? <Skeleton className="h-7 w-12" /> : `${data?.study_streak_days ?? 1} d`}
            </p>
            <p className="text-[11px] text-neutral-400">Consecutive study days</p>
          </CardContent>
        </Card>
      </div>

      {/* Topics Breakdown & Weak Spot Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Topic Mastery & Accuracy Bars */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-neutral-500" />
                <span>Topic mastery profile</span>
              </CardTitle>
              <CardDescription>
                Derived from quiz response outcomes grouped by concept tags.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-2.5">
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-7 w-full" />
                </div>
              ) : data?.weak_topics && data.weak_topics.length > 0 ? (
                <div className="space-y-3.5">
                  {data.weak_topics.map((t, idx) => {
                    const topicName = typeof t === "string" ? t : t.topic;
                    const accuracy = typeof t === "string" ? 50 : t.accuracy;
                    const isWeak = accuracy < 60;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-neutral-800 dark:text-neutral-200">
                            {topicName}
                          </span>
                          <span
                            className={`font-mono tabular-nums ${
                              isWeak ? "text-amber-600 dark:text-amber-400" : "text-neutral-600 dark:text-neutral-400"
                            }`}
                          >
                            {accuracy}%
                          </span>
                        </div>
                        <ProgressBar
                          value={accuracy}
                          variant={isWeak ? "warning" : "primary"}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-neutral-400 space-y-2">
                  <Brain className="w-6 h-6 mx-auto text-neutral-400" />
                  <p>Complete a practice quiz to generate topic mastery rankings.</p>
                  <Link href="/studio/quizzes">
                    <Button size="sm" variant="outline" className="mt-2 h-7 text-xs">
                      Take practice assessment
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actionable Recommendations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                Targeted review suggestions
              </CardTitle>
              <CardDescription>
                Heuristics-driven next actions based on detected weak concepts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {data?.recommendations && data.recommendations.length > 0 ? (
                data.recommendations.map((rec, i) => {
                  const recText = typeof rec === "string" ? rec : `${rec.title}: ${rec.description}`;
                  return (
                    <div
                      key={i}
                      className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 flex items-start gap-2.5"
                    >
                      <span className="text-neutral-400 font-mono text-[11px] mt-0.5">•</span>
                      <span className="leading-relaxed">{recText}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-neutral-400 py-2">
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
              <CardTitle className="text-sm">Study continuity</CardTitle>
              <CardDescription>Weekly cadence</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3.5">
              <div className="p-3.5 rounded-md bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                    Active streak
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Goal: 7 consecutive days
                  </p>
                </div>
                <span className="text-xl font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
                  {data?.study_streak_days ?? 1}d
                </span>
              </div>

              <div className="pt-1 space-y-1.5">
                <p className="text-xs font-medium text-neutral-500">
                  Recommended action
                </p>
                <Link href="/tutor" className="block">
                  <div className="p-2.5 rounded-md border border-neutral-200/90 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300">
                    <span>Ask tutor 3 follow-up questions</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                </Link>
                <Link href="/studio/flashcards" className="block">
                  <div className="p-2.5 rounded-md border border-neutral-200/90 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between text-xs text-neutral-700 dark:text-neutral-300">
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
