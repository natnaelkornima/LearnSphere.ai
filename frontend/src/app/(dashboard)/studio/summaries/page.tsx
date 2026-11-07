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
  Copy,
  Check,
  BookOpen,
  AlertCircle,
} from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { DocumentItem, Summary, SummaryFormat } from "@/types";
import { formatDate } from "@/lib/utils";

const SUMMARY_FORMATS: { id: SummaryFormat; label: string; desc: string }[] = [
  { id: "bullet_points", label: "Key takeaways", desc: "Core propositions and bulleted highlights" },
  { id: "executive", label: "Executive brief", desc: "Concise synopsis for rapid review" },
  { id: "comprehensive", label: "Full chapter synthesis", desc: "Detailed multi-section academic breakdown" },
  { id: "study_guide", label: "Exam study sheet", desc: "Critical definitions, terms, and conceptual checks" },
  { id: "faqs", label: "Q&A inquiry format", desc: "Common questions answered from the text" },
  { id: "concept_map", label: "Concept hierarchy", desc: "Structured conceptual relationships and dependencies" },
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Document syntheses
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Generate structured, citation-grounded notes from your course readings in six academic formats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Generator Form & History */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">New synthesis</CardTitle>
              <CardDescription>
                Choose target document and structure format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Document Picker */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Select document
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

              {/* Format Style Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Format structure
                </label>
                <div className="space-y-1.5">
                  {SUMMARY_FORMATS.map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={`w-full p-2.5 rounded-md border text-left transition-colors ${
                        selectedFormat === fmt.id
                          ? "border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-800"
                          : "border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                        {fmt.label}
                      </p>
                      <p className="text-[11px] text-neutral-500 mt-0.5">{fmt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!selectedDocId || isGenerating}
                isLoading={isGenerating}
                className="w-full justify-center h-8 text-xs"
              >
                {isGenerating ? "Synthesizing material..." : "Generate synthesis"}
              </Button>
            </CardContent>
          </Card>

          {/* Previous Summaries */}
          <Card>
            <CardHeader className="pb-2.5">
              <CardTitle className="text-xs font-medium text-neutral-500">History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 max-h-56 overflow-y-auto">
              {isLoadingHistory ? (
                <div className="space-y-1.5">
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-7 w-full" />
                </div>
              ) : previousSummaries.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-3">
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
                      className={`w-full text-left p-2 rounded-md text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium"
                          : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-850"
                      }`}
                    >
                      <span className="truncate">{s.title}</span>
                      <Badge variant="outline" className="text-[10px] font-mono lowercase ml-1 flex-shrink-0">
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
                <CardHeader className="border-b border-neutral-100 dark:border-neutral-800/80 flex flex-row items-center justify-between pb-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{activeSummary.title}</CardTitle>
                      <Badge variant="outline" className="font-mono text-[10px] lowercase">
                        {(activeSummary.format || activeSummary.summary_type).replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-[11px] font-mono tabular-nums text-neutral-400 mt-0.5">
                      {formatDate(activeSummary.created_at)}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="flex-shrink-0 h-7 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 mr-1" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" /> Copy Markdown
                      </>
                    )}
                  </Button>
                </CardHeader>

                <CardContent className="p-6 md:p-8">
                  <div className="prose dark:prose-invert max-w-none text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed font-sans">
                    {activeSummary.content}
                  </div>
                </CardContent>
              </div>

              {/* Source references footer */}
              {activeSummary.sources && activeSummary.sources.length > 0 && (
                <div className="px-5 py-3 bg-neutral-50/70 dark:bg-neutral-850 border-t border-neutral-100 dark:border-neutral-800/80 rounded-b-lg flex items-center justify-between text-xs text-neutral-500">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Grounded in <strong className="font-mono">{activeSummary.sources.length}</strong> indexed chunks</span>
                  </span>
                  <span className="font-mono text-[11px]">RAG verified</span>
                </div>
              )}
            </Card>
          ) : (
            <EmptyState
              icon={<FileText className="w-6 h-6 text-neutral-500" />}
              title="No summary selected"
              description="Select an indexed document on the left and choose a format to generate an academic synthesis."
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SummariesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400 font-mono">Loading summaries...</div>}>
      <SummariesContent />
    </Suspense>
  );
}
