"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  FileText,
  UploadCloud,
  Search,
  Trash2,
  MessageSquare,
  Brain,
  Layers,
  Clock,
  BookOpen,
} from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { DocumentItem } from "@/types";
import { formatBytes, formatDate } from "@/lib/utils";
import { DocumentUploadModal } from "@/components/documents/DocumentUploadModal";

export default function LibraryPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [deleteDoc, setDeleteDoc] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await api.documents.list(1, 50);
      setDocuments(data.items || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();

    const interval = setInterval(() => {
      setDocuments((prev) => {
        const hasProcessing = prev.some((d) =>
          ["uploaded", "extracting", "chunking", "embedding"].includes(d.status)
        );
        if (hasProcessing) {
          api.documents.list(1, 50).then((data: { items: DocumentItem[]; total: number }) => {
            setDocuments(data.items || []);
          });
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleDelete = async () => {
    if (!deleteDoc) return;
    try {
      setIsDeleting(true);
      await api.documents.delete(deleteDoc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== deleteDoc.id));
      setDeleteDoc(null);
    } catch {
      alert("Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "ready" && doc.status === "ready") ||
      (statusFilter === "processing" &&
        ["uploaded", "extracting", "chunking", "embedding"].includes(doc.status)) ||
      (statusFilter === "failed" && doc.status === "failed");
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e6dfd1] dark:border-[#2a2723] pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Document Vault & Corpus
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-serif italic">
            Course texts, monographs, and research papers indexed into vector chunks for cited RAG.
          </p>
        </div>
        <Button
          onClick={() => setUploadModalOpen(true)}
          className="h-10 px-4 text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200"
        >
          <UploadCloud className="w-3.5 h-3.5 mr-2" /> Index new reading
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#faf8f5] dark:bg-[#171614] p-4 rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search documents by title or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border border-[#e6dfd1] dark:border-[#2e2a25] bg-white dark:bg-[#1f1d1a] focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-200 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {["all", "ready", "processing", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                statusFilter === status
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-semibold shadow-2xs"
                  : "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-white dark:hover:bg-[#1f1d1a]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5]/50 dark:bg-[#171614]/50 p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border border-[#e6dfd1] dark:border-[#2a2723] bg-white dark:bg-[#1f1d1a] flex items-center justify-center mx-auto text-neutral-500">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {searchQuery ? "No matching documents found" : "Corpus is currently empty"}
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto font-serif italic">
              {searchQuery
                ? `No documents found matching "${searchQuery}". Clear query to view all indexed texts.`
                : "Upload course PDFs or research chapters to begin citation-grounded tutoring, flashcards, and quizzes."}
            </p>
          </div>
          {!searchQuery && (
            <Button
              size="sm"
              onClick={() => setUploadModalOpen(true)}
              className="h-8 text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950"
            >
              <UploadCloud className="w-3.5 h-3.5 mr-1.5" /> Upload first reading
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => {
            const isProcessing = [
              "uploaded",
              "extracting",
              "chunking",
              "embedding",
            ].includes(doc.status);

            return (
              <div
                key={doc.id}
                className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-600 transition-all shadow-xs"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-9 h-9 rounded-lg border border-[#e6dfd1] dark:border-[#2e2a25] bg-white dark:bg-[#1f1d1a] text-neutral-800 dark:text-neutral-200 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-semibold flex items-center gap-1 ${
                        doc.status === "ready"
                          ? "border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30"
                          : doc.status === "failed"
                          ? "border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 bg-red-50/50 dark:bg-red-950/30"
                          : "border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/30"
                      }`}
                    >
                      {isProcessing && <Clock className="w-2.5 h-2.5 animate-spin" />}
                      {doc.status}
                    </span>
                  </div>

                  <div>
                    <h3
                      className="font-serif font-semibold text-neutral-900 dark:text-neutral-100 text-sm line-clamp-2 leading-snug"
                      title={doc.title}
                    >
                      {doc.title}
                    </h3>
                    <p className="text-[11px] font-mono text-neutral-500 mt-1 truncate">
                      {doc.original_filename}
                    </p>
                  </div>

                  <div className="pt-3 text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400 flex items-center justify-between border-t border-[#e6dfd1] dark:border-[#2a2723]">
                    <span>{formatBytes(doc.file_size_bytes)}</span>
                    <span>{doc.page_count ? `${doc.page_count} pp` : "Indexing"}</span>
                    <span>{formatDate(doc.uploaded_at)}</span>
                  </div>

                  {doc.processing_error && (
                    <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-[11px] text-red-700 dark:text-red-400 font-mono">
                      {doc.processing_error}
                    </div>
                  )}
                </div>

                {/* Card Action Dock */}
                <div className="px-4 py-3 bg-white/70 dark:bg-[#191816] border-t border-[#e6dfd1] dark:border-[#2a2723] rounded-b-xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/tutor?doc=${doc.id}`} title="Engage Socratic Tutor">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-[#23211d] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </Link>

                    <Link href={`/studio/summaries?doc=${doc.id}`} title="Generate Synthesis">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-[#23211d] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </Link>

                    <Link href={`/studio/quizzes?doc=${doc.id}`} title="Synthesize Quiz">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-[#23211d] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <Brain className="w-4 h-4" />
                      </button>
                    </Link>

                    <Link href={`/studio/flashcards?doc=${doc.id}`} title="Generate Flashcards">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-[#23211d] disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                    </Link>
                  </div>

                  <button
                    onClick={() => setDeleteDoc(doc)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteDoc && (
        <Modal
          isOpen={!!deleteDoc}
          onClose={() => setDeleteDoc(null)}
          title="Delete document"
          description="Are you sure you want to remove this document from the library? This will delete its vector embeddings and associated notes."
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-neutral-100 dark:bg-[#1f1d1a] border border-[#e6dfd1] dark:border-[#2a2723] text-xs text-neutral-800 dark:text-neutral-200 font-mono">
              {deleteDoc.title} ({deleteDoc.original_filename})
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDoc(null)}
                disabled={isDeleting}
                className="h-8 text-xs border-[#e6dfd1] dark:border-[#2a2723]"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="h-8 text-xs font-semibold"
              >
                Delete permanently
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => loadDocuments()}
      />
    </div>
  );
}