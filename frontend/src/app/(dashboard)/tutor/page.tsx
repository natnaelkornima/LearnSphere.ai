"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  MessageSquare,
  Send,
  BookOpen,
  X,
  ChevronRight,
  Plus,
} from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { Conversation, DocumentItem, Message, Citation } from "@/types";
import { formatDate } from "@/lib/utils";

const SAMPLE_PROMPTS = [
  "Explain the core concept in simple terms with an analogy",
  "What key definitions or formulas are introduced in the text?",
  "Synthesize the author's primary argument into three takeaways",
  "Create a 3-question conceptual check from this material",
];

function TutorContent() {
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get("doc");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDocId || "");
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Inspector / Citation panel
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Load documents and conversation history
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoadingHistory(true);
        const [docsData, convsData] = await Promise.all([
          api.documents.list(1, 50),
          api.chat.listConversations(),
        ]);
        setDocuments(docsData.items || []);
        setConversations(convsData || []);

        if (convsData && convsData.length > 0) {
          selectConversation(convsData[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    init();
  }, []);

  const selectConversation = async (conv: Conversation) => {
    setActiveConv(conv);
    if (conv.document_ids && conv.document_ids.length > 0) {
      setSelectedDocId(conv.document_ids[0]);
    }
    try {
      const full = await api.chat.getConversation(conv.id);
      setMessages(full.messages || []);
      setActiveCitation(null);
      setIsInspectorOpen(false);
    } catch {
      setMessages([]);
    }
  };

  const startNewConversation = () => {
    setActiveConv(null);
    setMessages([]);
    setActiveCitation(null);
    setIsInspectorOpen(false);
  };

  const handleSendMessage = async (customText?: string) => {
    const text = customText || inputMessage;
    if (!text.trim() || isSending) return;

    setInputMessage("");
    setIsSending(true);

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConv?.id || "temp",
      role: "user",
      content: text,
      status: "completed",
      citations: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const resp = await api.chat.sendMessage({
        conversation_id: activeConv?.id,
        document_id: selectedDocId || undefined,
        message: text,
      });

      if (!activeConv) {
        const convs = await api.chat.listConversations();
        setConversations(convs);
        const current = convs.find((c: Conversation) => c.id === resp.conversation_id);
        if (current) setActiveConv(current);
      }

      setMessages((prev) => [...prev, resp.assistant_message]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        conversation_id: activeConv?.id || "temp",
        role: "assistant",
        content: `Error: ${err.message || "Unable to reach tutor service. Please verify your connection."}`,
        status: "failed",
        citations: [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const openCitationInspector = (citation: Citation) => {
    setActiveCitation(citation);
    setIsInspectorOpen(true);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-[#faf9f6] dark:bg-[#12110e]">
      {/* Column 1: Conversations & Document Scoping Sidebar */}
      <div className="w-72 hidden md:flex flex-col border-r border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0">
        <div className="p-3.5 border-b border-neutral-200/80 dark:border-neutral-800 space-y-3">
          <Button
            onClick={startNewConversation}
            className="w-full justify-center h-8 text-xs"
            size="sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New conversation
          </Button>

          {/* Document Scope Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
              Grounded document scope
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800/80 p-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary-600"
            >
              <option value="">All indexed documents</option>
              {documents
                .filter((d) => d.status === "ready")
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <p className="px-2 pt-1 pb-1 text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
            Recent sessions
          </p>
          {isLoadingHistory ? (
            <div className="space-y-1.5 p-2">
              <Skeleton className="h-8 w-full rounded" />
              <Skeleton className="h-8 w-full rounded" />
              <Skeleton className="h-8 w-full rounded" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-neutral-400">
              No previous conversations.
            </div>
          ) : (
            conversations.map((c) => {
              const isSelected = activeConv?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => selectConversation(c)}
                  className={`w-full text-left px-2.5 py-2 rounded-md text-xs font-medium flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-850"
                  }`}
                >
                  <div className="truncate flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-neutral-400" />
                    <span className="truncate">{c.title || "Session"}</span>
                  </div>
                  <span className="text-[10px] font-mono tabular-nums text-neutral-400 flex-shrink-0 ml-1">
                    {formatDate(c.created_at)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Column 2: Main Chat Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#faf9f6] dark:bg-[#12110e]">
        {/* Chat Header */}
        <div className="h-13 px-6 border-b border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <h3 className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate">
                {activeConv?.title || "Socratic AI Tutor"}
              </h3>
              <p className="text-[11px] text-neutral-500 truncate">
                {selectedDocId
                  ? `Grounded in: ${documents.find((d) => d.id === selectedDocId)?.title || "Document"}`
                  : "Synthesizing across all indexed course documents"}
              </p>
            </div>
          </div>

          {activeCitation && !isInspectorOpen && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsInspectorOpen(true)}
              className="text-xs h-7"
            >
              <BookOpen className="w-3 h-3 mr-1.5" /> Source citation
            </Button>
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="max-w-xl mx-auto py-12 text-center space-y-6">
              <div className="w-10 h-10 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 mx-auto flex items-center justify-center text-neutral-700 dark:text-neutral-300">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  What would you like to examine today?
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
                  Ask targeted questions about your course materials. Every response includes verifiable page citations from the original text.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
                {SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3 text-xs rounded-md border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors text-neutral-700 dark:text-neutral-300 flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${
                    isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
                  }`}
                >
                  {/* Subtle Badge Avatar */}
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 text-[10px] font-mono border ${
                      isAssistant
                        ? "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 text-neutral-700 dark:text-neutral-300"
                        : "border-neutral-300 dark:border-neutral-700 bg-neutral-900 text-neutral-100 dark:bg-neutral-100 dark:text-neutral-900"
                    }`}
                  >
                    {isAssistant ? "AI" : "YOU"}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-lg p-4 text-[13.5px] leading-relaxed ${
                      isAssistant
                        ? "bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100"
                        : "bg-neutral-900 text-neutral-100 dark:bg-neutral-800 dark:text-neutral-100"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Citations List if available */}
                    {isAssistant && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 mr-1">
                          Citations:
                        </span>
                        {msg.citations.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => openCitationInspector(c)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono border border-primary-200 dark:border-primary-900 bg-primary-50/60 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 hover:border-primary-400 dark:hover:border-primary-700 transition-colors cursor-pointer"
                          >
                            <span>
                              p. {c.page_start || 1}
                              {c.page_end && c.page_end !== c.page_start ? `–${c.page_end}` : ""}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex gap-3 max-w-3xl mr-auto items-center">
              <div className="w-6 h-6 rounded border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-850 flex items-center justify-center text-[10px] font-mono text-neutral-500">
                AI
              </div>
              <div className="px-3.5 py-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 text-xs text-neutral-500 flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-600 animate-pulse" />
                <span>Searching indexed chunks and formulating response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3.5 bg-white dark:bg-neutral-900 border-t border-neutral-200/80 dark:border-neutral-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2 max-w-4xl mx-auto"
          >
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask a question about the document text (e.g., 'What is the proof on page 14?')..."
              rows={1}
              className="flex-1 min-h-[38px] max-h-32 p-2.5 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-800/80 focus:outline-none focus:ring-1 focus:ring-primary-600 resize-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              isLoading={isSending}
              size="sm"
              className="h-[38px] px-3.5"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Column 3: Collapsible Citation Inspector / Excerpt Viewer */}
      {isInspectorOpen && activeCitation && (
        <div className="w-80 md:w-96 border-l border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col flex-shrink-0 animate-in slide-in-from-right duration-150">
          <div className="h-13 px-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
              <h4 className="font-medium text-xs text-neutral-900 dark:text-neutral-100">
                Source reference
              </h4>
            </div>
            <button
              onClick={() => setIsInspectorOpen(false)}
              className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="p-3 rounded-md bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {activeCitation.document_title || "Document"}
                </span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  p. {activeCitation.page_start || 1}
                  {activeCitation.page_end && activeCitation.page_end !== activeCitation.page_start
                    ? `–${activeCitation.page_end}`
                    : ""}
                </Badge>
              </div>
              {activeCitation.relevance_score && (
                <p className="text-[10px] font-mono tabular-nums text-neutral-500">
                  Cosine similarity: {(activeCitation.relevance_score * 100).toFixed(1)}%
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <h5 className="text-[11px] font-medium text-neutral-500">
                Extracted verbatim excerpt
              </h5>
              <div className="p-3.5 rounded-md bg-[#faf8f2] dark:bg-[#181714] border border-[#e6dfd1] dark:border-[#2e2a22] text-xs leading-relaxed font-mono text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap selection:bg-amber-200 dark:selection:bg-amber-900">
                {activeCitation.excerpt || "No excerpt text available."}
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 leading-normal">
              Indexed from the original document chunk via vector embeddings to ensure fidelity.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400 font-mono">Loading tutor...</div>}>
      <TutorContent />
    </Suspense>
  );
}
