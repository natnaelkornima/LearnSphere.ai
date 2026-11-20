"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
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
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Document Library
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Course texts, syllabi, and research papers indexed for citation-grounded RAG.
          </p>
        </div>
        <Button
          onClick={() => setUploadModalOpen(true)}
          className="h-9 px-4 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white border-transparent"
        >
          <UploadCloud className="w-3.5 h-3.5 mr-2" /> Upload reading
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by title or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {["all", "ready", "processing", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs font-medium capitalize rounded-lg transition-colors cursor-pointer ${
                statusFilter === status
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
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
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {searchQuery ? "No matching documents found" : "Library is currently empty"}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery
                ? `No documents found matching "${searchQuery}". Clear query to view all texts.`
                : "Upload course PDFs or research chapters to begin citation-grounded tutoring, flashcards, and quizzes."}
            </p>
          </div>
          {!searchQuery && (
            <Button
              size="sm"
              onClick={() => setUploadModalOpen(true)}
              className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white border-transparent"
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
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize flex items-center gap-1 ${
                        doc.status === "ready"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : doc.status === "failed"
                          ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {isProcessing && <Clock className="w-2.5 h-2.5 animate-spin" />}
                      {doc.status}
                    </span>
                  </div>

                  <div>
                    <h3
                      className="font-semibold text-slate-900 dark:text-slate-100 text-xs line-clamp-2 leading-snug"
                      title={doc.title}
                    >
                      {doc.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {doc.original_filename}
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] tabular-nums text-slate-400 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                    <span>{formatBytes(doc.file_size_bytes)}</span>
                    <span>{doc.page_count ? `${doc.page_count} pp` : "Indexing"}</span>
                    <span>{formatDate(doc.uploaded_at)}</span>
                  </div>

                  {doc.processing_error && (
                    <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-[11px] text-red-700 dark:text-red-400">
                      {doc.processing_error}
                    </div>
                  )}
                </div>

                {/* Card Action Dock */}
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 rounded-b-2xl flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Link href={`/tutor?doc=${doc.id}`} title="Engage Socratic Tutor">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </Link>

                    <Link href={`/studio/summaries?doc=${doc.id}`} title="Generate Summary">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </Link>

                    <Link href={`/studio/quizzes?doc=${doc.id}`} title="Synthesize Quiz">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <Brain className="w-3.5 h-3.5" />
                      </button>
                    </Link>

                    <Link href={`/studio/flashcards?doc=${doc.id}`} title="Generate Flashcards">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>

                  <button
                    onClick={() => setDeleteDoc(doc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200">
              {deleteDoc.title} ({deleteDoc.original_filename})
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDoc(null)}
                disabled={isDeleting}
                className="h-8 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
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