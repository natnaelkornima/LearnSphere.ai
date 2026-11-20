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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[#e6dfd1] dark:border-[#2a2723] pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Mastery Analytics & Pedagogical Ledger
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-serif italic">
          Empirical retrieval accuracy and concept retention indices derived strictly from completed drills.
        </p>
      </div>

      {/* KPI Cards Ledger */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-5 space-y-2 shadow-2xs">
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
            Indexed readings
          </p>
          <p className="text-3xl font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
            {isLoading ? <Skeleton className="h-8 w-12" /> : data?.total_documents ?? 0}
          </p>
          <p className="text-xs text-neutral-500 font-serif italic">Active in vector vault</p>
        </div>

        <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-5 space-y-2 shadow-2xs">
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
            Items answered
          </p>
          <p className="text-3xl font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
            {isLoading ? <Skeleton className="h-8 w-14" /> : data?.total_questions_attempted ?? 0}
          </p>
          <p className="text-xs text-neutral-500 font-serif italic">Diagnostic questions</p>
        </div>

        <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-5 space-y-2 shadow-2xs">
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
            Mean accuracy
          </p>
          <p className="text-3xl font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
            {isLoading ? <Skeleton className="h-8 w-16" /> : `${data?.accuracy_rate ?? 0}%`}
          </p>
          <p className="text-xs text-neutral-500 font-serif italic">Server-scored recall</p>
        </div>

        <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-5 space-y-2 shadow-2xs">
          <p className="font-mono text-xs uppercase tracking-wider text-neutral-500">
            Study cadence
          </p>
          <p className="text-3xl font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
            {isLoading ? <Skeleton className="h-8 w-12" /> : `${data?.study_streak_days ?? 1} d`}
          </p>
          <p className="text-xs text-neutral-500 font-serif italic">Consecutive study days</p>
        </div>
      </div>

      {/* Topics Breakdown & Weak Spot Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Topic Mastery & Accuracy Bars */}
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-6 space-y-6 shadow-xs">
            <div className="border-b border-[#e6dfd1] dark:border-[#2a2723] pb-4">
              <h2 className="font-serif text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Thematic mastery profile
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-serif italic">
                Derived from individual item outcomes classified under primary curriculum tags.
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
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
                        <span className="font-serif font-medium text-neutral-900 dark:text-neutral-100">
                          {topicName}
                        </span>
                        <span
                          className={`font-mono font-semibold tabular-nums ${
                            isWeak ? "text-amber-700 dark:text-amber-400" : "text-neutral-700 dark:text-neutral-300"
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
              <div className="p-10 text-center text-xs text-neutral-400 space-y-3">
                <Brain className="w-8 h-8 mx-auto text-neutral-400" />
                <p className="font-serif italic text-sm">
                  Complete your first evaluative quiz to compute topic mastery rankings.
                </p>
                <Link href="/studio/quizzes" className="inline-block pt-1">
                  <Button size="sm" variant="outline" className="h-8 text-xs border-[#e6dfd1] dark:border-[#2a2723]">
                    Take diagnostic assessment
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Actionable Recommendations */}
          <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-6 space-y-4 shadow-xs">
            <div className="border-b border-[#e6dfd1] dark:border-[#2a2723] pb-4">
              <h2 className="font-serif text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Curricular remediation suggestions
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 font-serif italic">
                Automated pedagogical interventions based on detected conceptual ambiguities.
              </p>
            </div>

            {data?.recommendations && data.recommendations.length > 0 ? (
              <div className="space-y-3">
                {data.recommendations.map((rec, i) => {
                  const recText = typeof rec === "string" ? rec : `${rec.title}: ${rec.description}`;
                  return (
                    <div
                      key={i}
                      className="p-3.5 rounded-lg bg-white dark:bg-[#1f1d1a] border border-[#e6dfd1] dark:border-[#2a2723] text-xs text-neutral-800 dark:text-neutral-200 flex items-start gap-3 shadow-2xs"
                    >
                      <span className="text-neutral-400 font-mono text-xs mt-0.5">•</span>
                      <span className="leading-relaxed font-serif">{recText}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-neutral-500 py-3 font-serif italic">
                Upload course literature and complete quizzes to generate personalized learning paths.
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Study Continuity & Interventions */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-6 space-y-5 shadow-xs">
            <h2 className="font-serif text-base font-semibold text-neutral-900 dark:text-neutral-100 pb-3 border-b border-[#e6dfd1] dark:border-[#2a2723]">
              Study continuity
            </h2>

            <div className="p-4 rounded-xl bg-white dark:bg-[#1f1d1a] border border-[#e6dfd1] dark:border-[#2a2723] flex items-center justify-between shadow-2xs">
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Consecutive days active
                </p>
                <p className="text-[11px] text-neutral-500 font-serif italic mt-0.5">
                  Target: 7-day steady cadence
                </p>
              </div>
              <span className="text-2xl font-mono tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
                {data?.study_streak_days ?? 1}d
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                Next recommended review
              </p>

              <Link href="/tutor" className="block">
                <div className="p-3 rounded-lg border border-[#e6dfd1] dark:border-[#2a2723] bg-white dark:bg-[#1f1d1a] hover:border-neutral-400 transition-colors flex items-center justify-between text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer shadow-2xs">
                  <span className="font-serif">Engage Socratic Tutor on difficult chunks</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                </div>
              </Link>

              <Link href="/studio/flashcards" className="block">
                <div className="p-3 rounded-lg border border-[#e6dfd1] dark:border-[#2a2723] bg-white dark:bg-[#1f1d1a] hover:border-neutral-400 transition-colors flex items-center justify-between text-xs text-neutral-800 dark:text-neutral-200 cursor-pointer shadow-2xs">
                  <span className="font-serif">Review 10 flashcards</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}