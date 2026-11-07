"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  BookOpen,
  MessageSquare,
  Brain,
  Layers,
  ArrowRight,
  UploadCloud,
  FileText,
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <h2 className="text-xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
            Overview
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Active reading and recall progress
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setUploadModalOpen(true)}
            className="h-8 text-xs font-medium"
          >
            <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
            Upload PDF
          </Button>
          <Link href="/tutor">
            <Button size="sm" className="h-8 text-xs font-medium">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Open AI Tutor
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards (Numbers Only, Tabular Figures) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-1">
          <p className="text-xs text-neutral-500">Indexed documents</p>
          <p className="text-2xl font-mono tabular-nums font-normal text-neutral-900 dark:text-neutral-100">
            {isLoading ? <Skeleton className="h-7 w-12" /> : analytics?.total_documents ?? recentDocs.length}
          </p>
          <p className="text-[11px] text-neutral-400">Ready for retrieval</p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-1">
          <p className="text-xs text-neutral-500">Questions attempted</p>
          <p className="text-2xl font-mono tabular-nums font-normal text-neutral-900 dark:text-neutral-100">
            {isLoading ? <Skeleton className="h-7 w-12" /> : analytics?.total_questions_attempted ?? 0}
          </p>
          <p className="text-[11px] text-neutral-400">Server graded</p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-1">
          <p className="text-xs text-neutral-500">Quiz accuracy</p>
          <p className="text-2xl font-mono tabular-nums font-normal text-neutral-900 dark:text-neutral-100">
            {isLoading ? <Skeleton className="h-7 w-16" /> : `${analytics?.accuracy_rate ?? 0}%`}
          </p>
          <p className="text-[11px] text-neutral-400">Overall performance</p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-1">
          <p className="text-xs text-neutral-500">Study streak</p>
          <p className="text-2xl font-mono tabular-nums font-normal text-neutral-900 dark:text-neutral-100">
            {isLoading ? <Skeleton className="h-7 w-16" /> : `${analytics?.study_streak_days ?? 1}d`}
          </p>
          <p className="text-[11px] text-neutral-400">Daily active learning</p>
        </div>
      </div>

      {/* Main Grid: Recent Documents & Study Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Recent Documents */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Recent materials
            </h3>
            <Link
              href="/library"
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full rounded-md" />
              <Skeleton className="h-14 w-full rounded-md" />
            </div>
          ) : recentDocs.length === 0 ? (
            <div className="p-8 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] text-center space-y-3">
              <p className="text-xs text-neutral-500">No documents uploaded yet</p>
              <Button size="sm" onClick={() => setUploadModalOpen(true)} className="h-8 text-xs font-medium">
                <UploadCloud className="w-3.5 h-3.5 mr-1.5" /> Upload your first PDF
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-[var(--surface-secondary)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {doc.title}
                      </p>
                      <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                        {doc.page_count ? `${doc.page_count} pages • ` : ""}
                        {formatBytes(doc.file_size_bytes)} • {formatDate(doc.uploaded_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        doc.status === "ready"
                          ? "border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
                          : doc.status === "failed"
                          ? "border-red-200 dark:border-red-900 text-red-700 dark:text-red-400"
                          : "border-neutral-200 dark:border-neutral-800 text-neutral-500"
                      }`}
                    >
                      {doc.status}
                    </span>
                    <Link href={`/tutor?doc=${doc.id}`}>
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px]">
                        Study
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 4 Cols: Learning Studio Shortcuts */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100 pb-1">
            Learning studio
          </h3>

          <div className="space-y-2">
            <Link
              href="/studio/summaries"
              className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] transition-colors block space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-neutral-400" />
                  Structured summaries
                </span>
                <span className="text-[10px] font-mono text-neutral-400">6 formats</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-normal">
                Synthesize readings into executive briefs, concept maps, or study guides.
              </p>
            </Link>

            <Link
              href="/studio/quizzes"
              className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] transition-colors block space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-neutral-400" />
                  Practice quizzes
                </span>
                <span className="text-[10px] font-mono text-neutral-400">Server graded</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-normal">
                Test concept comprehension with server-scored multiple choice questions.
              </p>
            </Link>

            <Link
              href="/studio/flashcards"
              className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-secondary)] transition-colors block space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-neutral-400" />
                  Recall flashcards
                </span>
                <span className="text-[10px] font-mono text-neutral-400">Spaced repetition</span>
              </div>
              <p className="text-[11px] text-neutral-500 leading-normal">
                Active recall practice with 3D flip cards and keyboard rating controls.
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
