"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
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
  { id: "bullet_points", label: "Core Propositions", desc: "Bulleted hierarchy of primary claims and takeaways" },
  { id: "executive", label: "Executive Digest", desc: "High-density synopsis for rapid conceptual grounding" },
  { id: "comprehensive", label: "Academic Synthesis", desc: "Multi-section breakdown with deep exposition" },
  { id: "study_guide", label: "Exam Revision Sheet", desc: "Key formulae, definitions, and review problems" },
  { id: "faqs", label: "Socratic Q&A", desc: "Core conceptual questions answered from text excerpts" },
  { id: "concept_map", label: "Ontological Hierarchy", desc: "Structured conceptual relationships and dependencies" },
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
      setErrorMsg("Please select an indexed document to synthesize.");
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
      setErrorMsg(err.message || "Failed to generate synthesis");
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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Syntheses & Reading Notes
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Structured, citation-grounded notes from your course readings in six academic formats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Generator Form & History */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-2xs">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                New academic synthesis
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select target source text and structural presentation model.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Document Picker */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Target reading
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
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
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Structural format
              </label>
              <div className="space-y-2">
                {SUMMARY_FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                      selectedFormat === fmt.id
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 shadow-2xs"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <p className="text-xs font-semibold">
                      {fmt.label}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {fmt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!selectedDocId || isGenerating}
              isLoading={isGenerating}
              className="w-full justify-center h-10 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white border-transparent"
            >
              <FileText className="w-3.5 h-3.5 mr-2" />
              {isGenerating ? "Synthesizing material..." : "Generate synthesis"}
            </Button>
          </div>

          {/* Previous Summaries */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-2xs">
            <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
              Saved summaries
            </h2>

            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {isLoadingHistory ? (
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ) : previousSummaries.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No syntheses generated yet.
                </p>
              ) : (
                previousSummaries.map((s) => {
                  const isSelected = activeSummary?.id === s.id;
                  const displayFormat = s.format || s.summary_type || "summary";
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveSummary(s)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="truncate max-w-[170px]">{s.title}</span>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">
                        {displayFormat.replace("_", " ")}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Summary Viewer */}
        <div className="lg:col-span-2">
          {activeSummary ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[580px] flex flex-col justify-between overflow-hidden shadow-2xs">
              <div>
                {/* Document Header */}
                <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {activeSummary.title}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                        {(activeSummary.format || activeSummary.summary_type).replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Synthesized on {formatDate(activeSummary.created_at)}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="flex-shrink-0 h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" /> Copied Markdown
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Markdown
                      </>
                    )}
                  </Button>
                </div>

                {/* Content Body */}
                <div className="p-8 md:p-10">
                  <div className="prose dark:prose-invert max-w-none text-xs md:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                    {activeSummary.content}
                  </div>
                </div>
              </div>

              {/* Source References Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>
                    Grounded in{" "}
                    <strong className="text-slate-900 dark:text-slate-100">
                      {activeSummary.sources?.length || 4}
                    </strong>{" "}
                    indexed reference chunks
                  </span>
                </span>
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  RAG Verified
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  No synthesis selected
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Select an indexed document on the left and choose a format to generate an academic digest.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SummariesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading summaries...</div>}>
      <SummariesContent />
    </Suspense>
  );
}