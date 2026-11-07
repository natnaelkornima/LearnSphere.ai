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
  Sparkles,
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

    // Check if any document is processing, poll every 3s
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
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Document Vault
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage your academic textbooks, syllabi, and research papers indexed for RAG.
          </p>
        </div>
        <Button onClick={() => setUploadModalOpen(true)}>
          <UploadCloud className="w-4 h-4 mr-2" /> Upload New PDF
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search documents by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {["all", "ready", "processing", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                statusFilter === status
                  ? "bg-primary-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700"
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
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
          <Skeleton className="h-44 rounded-xl" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title={searchQuery ? "No matching documents" : "Your vault is empty"}
          description={
            searchQuery
              ? `No documents found matching "${searchQuery}". Try a different keyword.`
              : "Upload your first study document to unlock AI-powered summaries, practice quizzes, and citations."
          }
          action={
            !searchQuery && (
              <Button size="sm" onClick={() => setUploadModalOpen(true)}>
                <UploadCloud className="w-4 h-4 mr-2" /> Upload PDF
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
                className="hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <Badge
                      variant={
                        doc.status === "ready"
                          ? "success"
                          : doc.status === "failed"
                          ? "danger"
                          : "primary"
                      }
                    >
                      {isProcessing && <Clock className="w-3 h-3 inline mr-1 animate-spin" />}
                      {doc.status}
                    </Badge>
                  </div>

                  <div>
                    <h3
                      className="font-bold text-neutral-900 dark:text-neutral-100 text-sm line-clamp-2"
                      title={doc.title}
                    >
                      {doc.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 truncate">
                      {doc.original_filename}
                    </p>
                  </div>

                  <div className="pt-1 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
                    <span>{formatBytes(doc.file_size_bytes)}</span>
                    <span>{doc.page_count ? `${doc.page_count} pages` : "Processing"}</span>
                    <span>{formatDate(doc.uploaded_at)}</span>
                  </div>

                  {doc.processing_error && (
                    <div className="p-2 rounded bg-red-50 dark:bg-red-950/50 text-[11px] text-red-600 dark:text-red-400">
                      {doc.processing_error}
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="p-3 bg-neutral-50/70 dark:bg-neutral-800/40 border-t border-neutral-100 dark:border-neutral-800 rounded-b-xl flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Link href={`/tutor?doc=${doc.id}`} title="Chat with AI Tutor">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1.5 rounded-md hover:bg-white dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      </button>
                    </Link>

                    <Link href={`/studio/summaries?doc=${doc.id}`} title="Summarize">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1.5 rounded-md hover:bg-white dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                      </button>
                    </Link>

                    <Link href={`/studio/quizzes?doc=${doc.id}`} title="Generate Quiz">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1.5 rounded-md hover:bg-white dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <Brain className="w-4 h-4 text-purple-600" />
                      </button>
                    </Link>

                    <Link href={`/studio/flashcards?doc=${doc.id}`} title="Generate Flashcards">
                      <button
                        disabled={doc.status !== "ready"}
                        className="p-1.5 rounded-md hover:bg-white dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                      >
                        <Layers className="w-4 h-4 text-emerald-600" />
                      </button>
                    </Link>
                  </div>

                  <button
                    onClick={() => setDeleteDoc(doc)}
                    className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/50 text-neutral-400 hover:text-red-600 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
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
          title="Delete Document"
          description="Are you sure you want to remove this document from your vault? This will also remove its associated chunks and embeddings."
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300">
              <strong>{deleteDoc.title}</strong> ({deleteDoc.original_filename})
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteDoc(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={isDeleting}
              >
                Delete Permanently
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
