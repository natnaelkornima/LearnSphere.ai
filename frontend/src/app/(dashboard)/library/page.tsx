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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Document library
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Course texts, syllabi, and research papers indexed for citation-grounded RAG.
          </p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)} className="h-8 text-xs">
          <UploadCloud className="w-3.5 h-3.5 mr-1.5" /> Upload reading
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search documents by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-850 focus:outline-none focus:ring-1 focus:ring-primary-600 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {["all", "ready", "processing", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 text-xs font-mono lowercase rounded transition-colors ${
                statusFilter === status
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium"
                  : "bg-transparent text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
          <Skeleton className="h-40 rounded-lg" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6 text-neutral-500" />}
          title={searchQuery ? "No matching documents" : "Library empty"}
          description={
            searchQuery
              ? `No documents found matching "${searchQuery}".`
              : "Upload a PDF reading to begin grounded chat, flashcards, and quizzes."
          }
          action={
            !searchQuery && (
              <Button size="sm" onClick={() => setUploadModalOpen(true)} className="h-7 text-xs">
                <UploadCloud className="w-3 h-3 mr-1" /> Upload PDF
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isProcessing = [
              "uploaded",
              "extracting",
              "chunking",
              "embedding",
            ].includes(doc.status);

            return (
              <Card
                key={doc.id}
                className="flex flex-col justify-between hover:border-neutral-400 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-7 h-7 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <Badge
                      variant={
                        doc.status === "ready"
                          ? "outline"
                          : doc.status === "failed"
                          ? "danger"
                          : "primary"
                      }
                      className="font-mono text-[10px] lowercase"
                    >
                      {isProcessing && <Clock className="w-2.5 h-2.5 inline mr-1 animate-spin" />}
                      {doc.status}
                    </Badge>
                  </div>

                  <div>
                    <h3
                      className="font-medium text-neutral-900 dark:text-neutral-100 text-xs line-clamp-2"
                      title={doc.title}
                    >
                      {doc.title}
                    </h3>
                    <p className="text-[11px] font-mono text-neutral-400 mt-0.5 truncate">
                      {doc.original_filename}
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800/80">
                    <span>{formatBytes(doc.file_size_bytes)}</span>
                    <span>{doc.page_count ? `${doc.page_count} pp` : "Processing"}</span>
                    <span>{formatDate(doc.uploaded_at)}</span>
                  </div>

                  {doc.processing_error && (
                    <div className="p-2 rounded bg-red-50 dark:bg-red-950/40 text-[11px] text-red-600 dark:text-red-400 font-mono">
                      {doc.processing_error}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="px-3 py-2 bg-neutral-50/70 dark:bg-neutral-850 border-t border-neutral-100 dark:border-neutral-800/80 rounded-b-lg flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Link href={`/tutor?doc=${doc.id}`} title="Chat with AI Tutor">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </Link>

                    <Link href={`/studio/summaries?doc=${doc.id}`} title="Summarize">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </Link>

                    <Link href={`/studio/quizzes?doc=${doc.id}`} title="Generate Quiz">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <Brain className="w-3.5 h-3.5" />
                      </button>
                    </Link>

                    <Link href={`/studio/flashcards?doc=${doc.id}`} title="Generate Flashcards">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>

                  <button
                    onClick={() => setDeleteDoc(doc)}
                    className="p-1 rounded text-neutral-400 hover:text-red-600 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
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
            <div className="p-3 rounded-md bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 font-mono">
              {deleteDoc.title} ({deleteDoc.original_filename})
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDoc(null)}
                disabled={isDeleting}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={isDeleting}
                className="h-7 text-xs"
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
