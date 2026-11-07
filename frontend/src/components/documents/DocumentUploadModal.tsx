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
  uploaded: { percent: 20, label: "Uploaded to storage" },
  extracting: { percent: 40, label: "Extracting text and page boundaries" },
  chunking: { percent: 65, label: "Partitioning into semantic chunks" },
  embedding: { percent: 85, label: "Generating vector embeddings" },
  ready: { percent: 100, label: "Ready for study" },
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
      title="Upload course reading"
      description="Upload textbooks, lecture slides, or syllabi (PDF up to 50MB)."
    >
      <div className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Upload notice</p>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-500 hover:text-red-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Processing State View */}
        {processingDoc ? (
          <div className="p-5 rounded-md border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-xs">
                    {processingDoc.title}
                  </h4>
                  <p className="text-[11px] font-mono text-neutral-400">
                    {formatBytes(processingDoc.file_size_bytes)} • PDF
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  processingDoc.status === "ready"
                    ? "success"
                    : processingDoc.status === "failed"
                    ? "danger"
                    : "outline"
                }
                className="font-mono text-[10px] lowercase"
              >
                {processingDoc.status}
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
                <Button size="sm" variant="outline" onClick={handleReset} className="h-7 text-xs">
                  Upload another
                </Button>
                <Button size="sm" onClick={handleClose} className="h-7 text-xs">
                  Begin studying
                </Button>
              </div>
            ) : processingDoc.status === "failed" ? (
              <div className="pt-2 flex justify-end">
                <Button size="sm" variant="danger" onClick={handleReset} className="h-7 text-xs">
                  Try again
                </Button>
              </div>
            ) : (
              <p className="text-center text-[11px] text-neutral-400 pt-1">
                Extracting text, computing chunk boundaries, and generating vector embeddings.
              </p>
            )}
          </div>
        ) : (
          /* File Upload Selector Form */
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!selectedFile ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 rounded-md p-7 flex flex-col items-center justify-center cursor-pointer transition-colors bg-neutral-50/50 dark:bg-neutral-850/50 text-center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                <div className="w-8 h-8 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center mb-2.5">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                  Select a PDF or drag and drop here
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Standard PDF files up to 50MB
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-md border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-850 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-xs">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] font-mono text-neutral-400">
                      {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {selectedFile && (
              <Input
                label="Document title"
                placeholder="e.g. Chapter 4: Cellular Respiration"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                required
              />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isUploading}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!selectedFile || isUploading}
                isLoading={isUploading}
                className="h-7 text-xs"
              >
                Index document
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
