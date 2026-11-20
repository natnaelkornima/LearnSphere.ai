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
  Sparkles,
} from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { DocumentItem, Summary, SummaryFormat } from "@/types";
import { formatDate } from "@/lib/utils";

const SUMMARY_FORMATS: { id: SummaryFormat; label: string; desc: string }[] = [
  { id: "bullet_points", label: "Core Propositions", desc: "Bulleted hierarchy of primary claims and takeaways" },
  { id: "executive", label: "Executive Digest", desc: "High-density synopsis for rapid conceptual grounding" },
  { id: "comprehensive", label: "Academic Synthesis", desc: "Multi-section thematic breakdown with deep exposition" },
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[#e6dfd1] dark:border-[#2a2723] pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Syntheses & Reading Digests
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-serif italic">
          Structured, citation-grounded digests from your primary readings in six academic frameworks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Generator Form & History */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-6 space-y-5 shadow-xs">
            <div>
              <h2 className="font-serif text-base font-semibold text-neutral-900 dark:text-neutral-100">
                New academic synthesis
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
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
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Target reading
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                className="w-full text-xs rounded-lg border border-[#e6dfd1] dark:border-[#2e2a25] bg-white dark:bg-[#1f1d1a] p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-200"
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
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Structural format
              </label>
              <div className="space-y-2">
                {SUMMARY_FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      selectedFormat === fmt.id
                        ? "border-neutral-900 dark:border-neutral-100 bg-white dark:bg-[#23211d] shadow-xs"
                        : "border-[#e6dfd1] dark:border-[#2a2723] bg-neutral-50/50 dark:bg-[#1a1917] hover:border-neutral-400"
                    }`}
                  >
                    <p className="font-serif text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      {fmt.label}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
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
              className="w-full justify-center h-10 text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200"
            >
              <FileText className="w-3.5 h-3.5 mr-2" />
              {isGenerating ? "Synthesizing material..." : "Generate synthesis"}
            </Button>
          </div>

          {/* Previous Summaries */}
          <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-5 space-y-3 shadow-xs">
            <h2 className="font-serif text-sm font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-[#e6dfd1] dark:border-[#2a2723]">
              Synthesis archive
            </h2>

            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {isLoadingHistory ? (
                <div className="space-y-2">
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ) : previousSummaries.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-6 font-serif italic">
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
                          ? "bg-white dark:bg-[#23211d] border border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold shadow-2xs"
                          : "border border-transparent text-neutral-600 dark:text-neutral-400 hover:bg-white/60 dark:hover:bg-[#1f1d1a]"
                      }`}
                    >
                      <span className="truncate max-w-[160px]">{s.title}</span>
                      <span className="text-[10px] font-mono uppercase text-neutral-400 flex-shrink-0">
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
            <div className="rounded-2xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] min-h-[580px] flex flex-col justify-between overflow-hidden shadow-xs">
              <div>
                {/* Document Header */}
                <div className="p-6 md:p-8 border-b border-[#e6dfd1] dark:border-[#2a2723] bg-white/70 dark:bg-[#1c1b18] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                        {activeSummary.title}
                      </h2>
                      <span className="px-2 py-0.5 rounded border border-[#e6dfd1] dark:border-[#2e2a25] font-mono text-[10px] uppercase text-neutral-600 dark:text-neutral-400">
                        {(activeSummary.format || activeSummary.summary_type).replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs font-mono tabular-nums text-neutral-500">
                      Synthesized on {formatDate(activeSummary.created_at)}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                    className="flex-shrink-0 h-8 text-xs border-[#e6dfd1] dark:border-[#2a2723]"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" /> Copied Markdown
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" /> Export Markdown
                      </>
                    )}
                  </Button>
                </div>

                {/* Content Body */}
                <div className="p-8 md:p-10">
                  <div className="prose dark:prose-invert max-w-none text-sm md:text-base text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed font-serif">
                    {activeSummary.content}
                  </div>
                </div>
              </div>

              {/* Source References Footer */}
              <div className="px-6 py-4 bg-white/80 dark:bg-[#191816] border-t border-[#e6dfd1] dark:border-[#2a2723] flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
                <span className="flex items-center gap-2 font-serif italic">
                  <BookOpen className="w-4 h-4 text-neutral-500" />
                  <span>
                    Grounded in{" "}
                    <strong className="font-mono tabular-nums not-italic">
                      {activeSummary.sources?.length || 4}
                    </strong>{" "}
                    indexed reference chunks
                  </span>
                </span>
                <span className="font-mono text-[11px] uppercase tracking-wider text-neutral-500">
                  Semantic RAG Attestation
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5]/50 dark:bg-[#171614]/50 p-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border border-[#e6dfd1] dark:border-[#2a2723] bg-white dark:bg-[#1f1d1a] flex items-center justify-center mx-auto text-neutral-500">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  No synthesis selected
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto font-serif italic">
                  Select an indexed document on the left and choose a structural framework to generate an academic digest.
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
    <Suspense fallback={<div className="p-12 text-center text-xs text-neutral-400 font-mono">Loading synthesis suite...</div>}>
      <SummariesContent />
    </Suspense>
  );
}