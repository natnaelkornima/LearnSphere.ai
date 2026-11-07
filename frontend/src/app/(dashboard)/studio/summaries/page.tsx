"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  AlertCircle,
} from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { DocumentItem, Summary, SummaryFormat } from "@/types";
import { formatDate } from "@/lib/utils";

const SUMMARY_FORMATS: { id: SummaryFormat; label: string; desc: string }[] = [
  { id: "bullet_points", label: "Bullet Points", desc: "Key highlights and core takeaways" },
  { id: "executive", label: "Executive TL;DR", desc: "Crisp high-level summary for quick review" },
  { id: "comprehensive", label: "Comprehensive", desc: "Deep multi-section academic breakdown" },
  { id: "study_guide", label: "Exam Study Guide", desc: "Definitions, critical concepts & exam tips" },
  { id: "faqs", label: "Q&A / FAQs", desc: "Core questions answered directly from the text" },
  { id: "concept_map", label: "Concept Map", desc: "Hierarchical relationships between concepts" },
];

function SummariesContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get("doc");

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId || "");
  const [selectedFormat, setSelectedFormat] = useState<SummaryFormat>("bullet_points");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSummary, setActiveSummary] = useState<Summary | null>(null);
  const [previousSummaries, setPreviousSummaries] = useState<Summary[]>([]);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoadingHistory(true);
        const [docsData, summariesData] = await Promise.all([
          api.documents.list(1, 50),
          api.summaries.list(),
        ]);
        setDocuments(docsData.items.filter((d: DocumentItem) => d.status === "ready") || []);
        setPreviousSummaries(summariesData || []);
        if (summariesData && summariesData.length > 0) {
          setActiveSummary(summariesData[0]);
        }
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
      setErrorMsg("Please select a document to summarize.");
      return;
    }
    try {
      setIsGenerating(true);
      setErrorMsg(null);
      const summary = await api.summaries.create({
        document_id: selectedDocId,
        format: selectedFormat,
      });
      setActiveSummary(summary);
      setPreviousSummaries((prev) => [summary, ...prev]);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate summary");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!activeSummary) return;
    navigator.clipboard.writeText(activeSummary.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          AI Document Summaries
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Synthesize complex academic texts into 6 specialized active learning formats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Generator Form & History */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-600" />
                Generate New Summary
              </CardTitle>
              <CardDescription>
                Choose target document and synthesis style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Document Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase">
                  Select Document
                </label>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- Choose Ready Document --</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format Style Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase">
                  Summary Style
                </label>
                <div className="space-y-2">
                  {SUMMARY_FORMATS.map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={`w-full p-2.5 rounded-lg border text-left transition-all ${
                        selectedFormat === fmt.id
                          ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 ring-1 ring-primary-500"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300"
                      }`}
                    >
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {fmt.label}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{fmt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!selectedDocId || isGenerating}
                isLoading={isGenerating}
                className="w-full justify-center"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? "Synthesizing Material..." : "Generate Summary"}
              </Button>
            </CardContent>
          </Card>

          {/* Previous Summaries */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Summary History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 max-h-60 overflow-y-auto">
              {isLoadingHistory ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : previousSummaries.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">
                  No saved summaries yet.
                </p>
              ) : (
                previousSummaries.map((s) => {
                  const isSelected = activeSummary?.id === s.id;
                  const displayFormat = s.format || s.summary_type || "summary";
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSummary(s)}
                      className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 font-semibold"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <span className="truncate">{s.title}</span>
                      <Badge variant="outline" className="text-[10px] uppercase ml-1 flex-shrink-0">
                        {displayFormat.replace("_", " ")}
                      </Badge>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 2 Columns: Summary Viewer */}
        <div className="lg:col-span-2">
          {activeSummary ? (
            <Card className="min-h-[500px] flex flex-col justify-between">
              <div>
                <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 flex flex-row items-center justify-between pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{activeSummary.title}</CardTitle>
                      <Badge variant="primary" className="uppercase text-[10px]">
                        {(activeSummary.format || activeSummary.summary_type).replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Generated on {formatDate(activeSummary.created_at)}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy Markdown
                      </>
                    )}
                  </Button>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="prose dark:prose-invert max-w-none text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans">
                    {activeSummary.content}
                  </div>
                </CardContent>
              </div>

              {/* Source references footer */}
              {activeSummary.sources && activeSummary.sources.length > 0 && (
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800/40 border-t border-neutral-100 dark:border-neutral-800 rounded-b-xl flex items-center justify-between text-xs text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-primary-600" /> Grounded across{" "}
                    {activeSummary.sources.length} document chunks
                  </span>
                  <span>Verified RAG generation</span>
                </div>
              )}
            </Card>
          ) : (
            <EmptyState
              icon={<FileText className="w-8 h-8" />}
              title="No summary selected"
              description="Choose a ready document on the left and select your preferred style to generate an instant synthesis."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SummariesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400">Loading summaries...</div>}>
      <SummariesContent />
    </Suspense>
  );
}
