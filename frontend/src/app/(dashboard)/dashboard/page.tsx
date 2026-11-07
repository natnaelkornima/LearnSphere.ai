"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  BookOpen,
  MessageSquare,
  Sparkles,
  Brain,
  Layers,
  Flame,
  ArrowRight,
  UploadCloud,
  FileText,
  AlertCircle,
  Trophy,
  Target,
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
        api.documents.list(1, 5).catch(() => ({ items: [], total: 0 })),
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-primary-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI-Driven Active Learning</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back to LearnSphere AI
          </h2>
          <p className="text-sm md:text-base text-primary-100/90 leading-relaxed">
            Transform your academic PDFs into grounded conversations, active recall quizzes, and interactive flashcards.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button
              onClick={() => setUploadModalOpen(true)}
              className="bg-white text-primary-900 hover:bg-primary-50 font-semibold shadow-sm"
            >
              <UploadCloud className="w-4 h-4 text-primary-600" />
              Upload PDF
            </Button>
            <Link href="/tutor">
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
                <MessageSquare className="w-4 h-4" />
                Ask AI Tutor
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-secondary-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Metric 1: Total Documents */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Documents</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Skeleton className="h-8 w-12" /> : analytics?.total_documents ?? recentDocs.length}
              </p>
              <p className="text-[11px] text-neutral-400">Indexed for RAG</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Quizzes Attempted */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Questions Attempted</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Skeleton className="h-8 w-12" /> : analytics?.total_questions_attempted ?? 0}
              </p>
              <p className="text-[11px] text-neutral-400">Active recall sessions</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Brain className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Quiz Accuracy */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Accuracy Rate</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Skeleton className="h-8 w-14" /> : `${analytics?.accuracy_rate ?? 0}%`}
              </p>
              <p className="text-[11px] text-neutral-400">Server evaluated</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Study Streak */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Study Streak</p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {isLoading ? <Skeleton className="h-8 w-12" /> : `${analytics?.study_streak_days ?? 1} Days`}
              </p>
              <p className="text-[11px] text-neutral-400">Daily consistency</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Documents & Recommended Study Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Recent Materials</h3>
              <p className="text-xs text-neutral-400">Continue studying your uploaded documents</p>
            </div>
            <Link href="/library" className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : recentDocs.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-8 h-8" />}
              title="No study materials yet"
              description="Upload your first lecture notes, syllabus, or academic PDF to activate the AI Tutor and practice tools."
              action={
                <Button size="sm" onClick={() => setUploadModalOpen(true)}>
                  <UploadCloud className="w-4 h-4 mr-1.5" /> Upload PDF
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-primary-300 dark:hover:border-primary-800 transition-all flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span>{formatBytes(doc.file_size_bytes)}</span>
                        <span>•</span>
                        <span>{formatDate(doc.uploaded_at)}</span>
                        {doc.page_count && (
                          <>
                            <span>•</span>
                            <span>{doc.page_count} pages</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant={
                        doc.status === "ready"
                          ? "success"
                          : doc.status === "failed"
                          ? "danger"
                          : "primary"
                      }
                    >
                      {doc.status}
                    </Badge>
                    <Link href={`/tutor?doc=${doc.id}`}>
                      <Button size="sm" variant="outline">
                        Study
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Smart Study Studio & Dynamic Insights */}
        <div className="space-y-6">
          {/* Quick Studio Launch Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-600" />
                Learning Studio
              </CardTitle>
              <CardDescription>
                Convert documents into active recall tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Link href="/studio/summaries" className="block">
                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Generate Summaries</p>
                      <p className="text-[11px] text-neutral-400">6 tailored styles</p>
                    </div>
                  </div>
                  <ChevronRightIcon />
                </div>
              </Link>

              <Link href="/studio/quizzes" className="block">
                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-600">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Practice Quizzes</p>
                      <p className="text-[11px] text-neutral-400">Deterministic scoring & explanations</p>
                    </div>
                  </div>
                  <ChevronRightIcon />
                </div>
              </Link>

              <Link href="/studio/flashcards" className="block">
                <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Smart Flashcards</p>
                      <p className="text-[11px] text-neutral-400">3D flip active recall</p>
                    </div>
                  </div>
                  <ChevronRightIcon />
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Weak Topics / Recommendations Alert */}
          {analytics?.weak_topics && analytics.weak_topics.length > 0 ? (
            <Card className="border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">Focus Recommended</span>
                </div>
                <p className="text-xs text-amber-900/90 dark:text-amber-100/90 leading-relaxed">
                  Based on recent quiz scores, review these topics to boost mastery:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analytics.weak_topics.map((t, i) => {
                    const topicName = typeof t === "string" ? t : t.topic;
                    const acc = typeof t === "string" ? 50 : t.accuracy;
                    return (
                      <Badge key={i} variant="warning">
                        {topicName} ({acc}%)
                      </Badge>
                    );
                  })}
                </div>
                {analytics.recommendations && analytics.recommendations[0] && (
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 pt-1 border-t border-amber-200/50 dark:border-amber-800/50">
                    💡 {typeof analytics.recommendations[0] === "string" ? analytics.recommendations[0] : (analytics.recommendations[0] as any).description || (analytics.recommendations[0] as any).title}
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">Knowledge Mastery</p>
                  <p className="text-[11px] text-neutral-400">Take more quizzes to uncover topic weak spots.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Global Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </svg>
  );
}
