"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Brain,
  Target,
  ArrowRight,
  BookOpen,
  Layers,
  Calendar,
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
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Mastery Analytics & Retention Ledger
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Empirical retrieval accuracy and concept retention indices derived from completed drills.
        </p>
      </div>

      {/* KPI Cards Ledger */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-1 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">
            Indexed readings
          </p>
          <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {isLoading ? <Skeleton className="h-7 w-12" /> : data?.total_documents ?? 0}
          </p>
          <p className="text-[11px] text-slate-400">Active in vector vault</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-1 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">
            Items answered
          </p>
          <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {isLoading ? <Skeleton className="h-7 w-14" /> : data?.total_questions_attempted ?? 0}
          </p>
          <p className="text-[11px] text-slate-400">Diagnostic questions</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-1 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">
            Mean accuracy
          </p>
          <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {isLoading ? <Skeleton className="h-7 w-16" /> : `${data?.accuracy_rate ?? 0}%`}
          </p>
          <p className="text-[11px] text-slate-400">Server-scored recall</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-1 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">
            Study streak
          </p>
          <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {isLoading ? <Skeleton className="h-7 w-12" /> : `${data?.study_streak_days ?? 1} d`}
          </p>
          <p className="text-[11px] text-slate-400">Consecutive study days</p>
        </div>
      </div>

      {/* Topics Breakdown & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Topic Mastery */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6 shadow-2xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Thematic mastery profile
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Derived from individual question outcomes grouped under primary topic tags.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
                <Skeleton className="h-8 w-full rounded-xl" />
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
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {topicName}
                        </span>
                        <span
                          className={`font-semibold tabular-nums ${
                            isWeak ? "text-amber-600 dark:text-amber-400" : "text-slate-600 dark:text-slate-300"
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
              <div className="p-10 text-center text-xs text-slate-400 space-y-3">
                <Brain className="w-8 h-8 mx-auto text-slate-400" />
                <p>
                  Complete a practice assessment to compute topic mastery rankings.
                </p>
                <Link href="/studio/quizzes" className="inline-block pt-1">
                  <Button size="sm" variant="outline" className="h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    Take practice assessment
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Actionable Recommendations */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xs">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Curricular review recommendations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated pedagogical suggestions based on detected weak concepts.
              </p>
            </div>

            {data?.recommendations && data.recommendations.length > 0 ? (
              <div className="space-y-3">
                {data.recommendations.map((rec, i) => {
                  const recText = typeof rec === "string" ? rec : `${rec.title}: ${rec.description}`;
                  return (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-3"
                    >
                      <span className="text-blue-600 font-bold text-sm mt-[-1px]">•</span>
                      <span className="leading-relaxed">{recText}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3">
                Upload course literature and complete quizzes to generate personalized learning paths.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Study Continuity & Next Actions */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-2xs">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 pb-3 border-b border-slate-100 dark:border-slate-800">
              Study continuity
            </h2>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Consecutive active streak
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Target: 7-day steady cadence
                </p>
              </div>
              <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-100">
                {data?.study_streak_days ?? 1}d
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-slate-400">
                Recommended next steps
              </p>

              <Link href="/tutor" className="block">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-colors flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs">
                  <span>Engage AI Tutor on difficult chunks</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Link>

              <Link href="/studio/flashcards" className="block">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-colors flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs">
                  <span>Review 10 flashcards</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}