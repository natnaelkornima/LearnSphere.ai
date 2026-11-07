"use client";

import React, { useState, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
} from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { DocumentItem, DocumentStatus } from "@/types";
import { formatBytes } from "@/lib/utils";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: DocumentItem) => void;
}

const STATUS_PROGRESS: Record<DocumentStatus, { percent: number; label: string }> = {
  uploaded: { percent: 20, label: "File uploaded to storage vault" },
  extracting: { percent: 40, label: "Extracting text and page boundaries (PyMuPDF)..." },
  chunking: { percent: 65, label: "Partitioning into semantic knowledge chunks..." },
  embedding: { percent: 85, label: "Generating 768-dim vector embeddings..." },
  ready: { percent: 100, label: "Document processed and ready for study!" },
  failed: { percent: 100, label: "Processing failed" },
  deleting: { percent: 0, label: "Deleting..." },
};

export function DocumentUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: DocumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [processingDoc, setProcessingDoc] = useState<DocumentItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setErrorMsg("Please select a PDF document (.pdf)");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setErrorMsg("File exceeds the maximum 50MB size limit");
        return;
      }
      setSelectedFile(file);
      setCustomTitle(file.name.replace(/\.[^/.]+$/, ""));
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
        setErrorMsg("Please select a PDF document (.pdf)");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setErrorMsg("File exceeds the maximum 50MB size limit");
        return;
      }
      setSelectedFile(file);
      setCustomTitle(file.name.replace(/\.[^/.]+$/, ""));
      setErrorMsg(null);
    }
  };

  const pollDocumentStatus = async (documentId: string) => {
    try {
      const doc = await api.documents.get(documentId);
      setProcessingDoc(doc);

      if (doc.status === "ready") {
        setIsUploading(false);
        if (onSuccess) onSuccess(doc);
      } else if (doc.status === "failed") {
        setIsUploading(false);
        setErrorMsg(doc.processing_error || "Document processing failed. Please try again.");
      } else {
        // Continue polling every 1.5 seconds
        setTimeout(() => pollDocumentStatus(documentId), 1500);
      }
    } catch (err: any) {
      setIsUploading(false);
      setErrorMsg(err.message || "Error checking document processing status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      setErrorMsg(null);

      const doc = await api.documents.upload(selectedFile, {
        title: customTitle || selectedFile.name,
      });

      setProcessingDoc(doc);

      if (doc.status === "ready") {
        setIsUploading(false);
        if (onSuccess) onSuccess(doc);
      } else {
        // Start polling
        setTimeout(() => pollDocumentStatus(doc.id), 1500);
      }
    } catch (err: any) {
      setIsUploading(false);
      setErrorMsg(err.message || "Failed to upload document");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setCustomTitle("");
    setProcessingDoc(null);
    setIsUploading(false);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Study Material"
      description="Upload textbooks, lecture notes, or syllabus PDFs to power your AI study tools."
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Upload Notice</p>
              <p className="text-xs mt-0.5">{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Processing State View */}
        {processingDoc ? (
          <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">
                    {processingDoc.title}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    {formatBytes(processingDoc.file_size_bytes)} • PDF Document
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  processingDoc.status === "ready"
                    ? "success"
                    : processingDoc.status === "failed"
                    ? "danger"
                    : "primary"
                }
              >
                {processingDoc.status.toUpperCase()}
              </Badge>
            </div>

            <ProgressBar
              value={STATUS_PROGRESS[processingDoc.status]?.percent || 10}
              variant={
                processingDoc.status === "ready"
                  ? "success"
                  : processingDoc.status === "failed"
                  ? "warning"
                  : "primary"
              }
              label={
                STATUS_PROGRESS[processingDoc.status]?.label ||
                "Processing document..."
              }
              showValue
            />

            {processingDoc.status === "ready" ? (
              <div className="pt-2 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={handleReset}>
                  Upload Another
                </Button>
                <Button size="sm" onClick={handleClose}>
                  Start Studying
                </Button>
              </div>
            ) : processingDoc.status === "failed" ? (
              <div className="pt-2 flex justify-end">
                <Button size="sm" variant="danger" onClick={handleReset}>
                  Try Again
                </Button>
              </div>
            ) : (
              <p className="text-center text-xs text-neutral-400 pt-1">
                Please wait while our RAG pipeline extracts text and generates embeddings.
              </p>
            )}
          </div>
        ) : (
          /* File Upload Selector Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {!selectedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-900/30 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                <div className="p-3 rounded-full bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform mb-3">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Click to select or drag and drop your PDF here
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Supported format: PDF documents up to 50MB
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-xs">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleReset}
                >
                  <X className="w-4 h-4 text-neutral-500" />
                </Button>
              </div>
            )}

            {selectedFile && (
              <Input
                label="Document Title"
                placeholder="e.g. Chapter 4 - Organic Chemistry"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                required
              />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedFile || isUploading}
                isLoading={isUploading}
              >
                Upload & Process
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

