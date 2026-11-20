"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  BookOpen,
  MessageSquare,
  Brain,
  Layers,
  ArrowRight,
  UploadCloud,
  FileText,
  Calendar,
  Sparkles,
} from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { AnalyticsDashboardData, DocumentItem } from "@/types";
import { formatBytes, formatDate } from "@/lib/utils";
import { DocumentUploadModal } from "@/components/documents/DocumentUploadModal";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsDashboardData | null>(null);
  const [recentDocs, setRecentDocs] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [analyticsData, docsData] = await Promise.all([
        api.analytics.getDashboard().catch(() => null),
        api.documents.list(1, 6).catch(() => ({ items: [], total: 0 })),
      ]);
      setAnalytics(analyticsData);
      setRecentDocs(docsData.items || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleDocUploaded = () => {
      loadData();
    };
    window.addEventListener("learnsphere:document-uploaded", handleDocUploaded);
    return () => {
      window.removeEventListener("learnsphere:document-uploaded", handleDocUploaded);
    };
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Study Workspace Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Grounded reading notes, active practice milestones, and recall metrics
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUploadModalOpen(true)}
            className="h-8 text-xs font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
            Upload PDF
          </Button>
          <Link href="/tutor">
            <Button size="sm" className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white border-transparent">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Open AI Tutor
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Ledger */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <p className="text-xs font-medium text-slate-500">Indexed documents</p>
          <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {isLoading ? <Skeleton className="h-7 w-12" /> : analytics?.total_documents ?? recentDocs.length}
          </p>
          <p className="text-[11px] text-slate-400">Ready in vector vault</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <p className="text-xs font-medium text-slate-500">Questions attempted</p>
          <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {isLoading ? <Skeleton className="h-7 w-12" /> : analytics?.total_questions_attempted ?? 0}
          </p>
          <p className="text-[11px] text-slate-400">Server graded items</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <p className="text-xs font-medium text-slate-500">Recall accuracy</p>
          <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {isLoading ? <Skeleton className="h-7 w-16" /> : `${analytics?.accuracy_rate ?? 0}%`}
          </p>
          <p className="text-[11px] text-slate-400">Diagnostic average</p>
        </div>

        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-1">
          <p className="text-xs font-medium text-slate-500">Study streak</p>
          <p className="text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {isLoading ? <Skeleton className="h-7 w-16" /> : `${analytics?.study_streak_days ?? 1} days`}
          </p>
          <p className="text-[11px] text-slate-400">Consecutive active days</p>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Recent Readings */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Recent Course Materials
            </h2>
            <Link
              href="/library"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
            >
              All documents <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          ) : recentDocs.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
              <p className="text-xs text-slate-500">No course documents ingested yet</p>
              <Button
                size="sm"
                onClick={() => setUploadModalOpen(true)}
                className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white border-transparent"
              >
                <UploadCloud className="w-3.5 h-3.5 mr-1.5" /> Upload your first PDF
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="px-4 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                        {doc.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {doc.page_count ? `${doc.page_count} pages • ` : ""}
                        {formatBytes(doc.file_size_bytes)} • {formatDate(doc.uploaded_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        doc.status === "ready"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : doc.status === "failed"
                          ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {doc.status}
                    </span>
                    <Link href={`/tutor?doc=${doc.id}`}>
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        Study
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Studio Suites */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 pb-1">
            Learning Studio Suites
          </h2>

          <div className="space-y-2.5">
            <Link
              href="/studio/summaries"
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-colors block space-y-1 shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Structured Summaries
                </span>
                <span className="text-[10px] text-slate-400">6 formats</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Synthesize readings into executive briefs, concept maps, or chapter study guides.
              </p>
            </Link>

            <Link
              href="/studio/quizzes"
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-colors block space-y-1 shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  Diagnostic Quizzes
                </span>
                <span className="text-[10px] text-slate-400">Server evaluated</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Evaluate concept retention with server-scored questions and source-grounded rationales.
              </p>
            </Link>

            <Link
              href="/studio/flashcards"
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-colors block space-y-1 shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Active Recall Decks
                </span>
                <span className="text-[10px] text-slate-400">Spaced repetition</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                3D interactive flip cards with keyboard ratings for long-term retention.
              </p>
            </Link>

            <Link
              href="/planner"
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-colors block space-y-1 shadow-2xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Milestone Study Planner
                </span>
                <span className="text-[10px] text-slate-400">Exam target</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Convert course schedules into daily targeted readings and practice milestones.
              </p>
            </Link>
          </div>
        </div>
      </div>

      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}