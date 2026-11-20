"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  MessageSquare,
  Send,
  BookOpen,
  X,
  ChevronRight,
  Plus,
  Sparkles,
} from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { Conversation, DocumentItem, Message, Citation } from "@/types";
import { formatDate } from "@/lib/utils";

const SAMPLE_PROMPTS = [
  "Explain the core mechanism in simple terms with an analogy",
  "What key definitions or theorems are introduced in the text?",
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
    <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Column 1: Conversations & Document Scoping Sidebar */}
      <div className="w-72 hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
          <Button
            onClick={startNewConversation}
            className="w-full justify-center h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white border-transparent"
            size="sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New conversation
          </Button>

          {/* Document Scope Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-500">
              Grounded document scope
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
            >
              <option value="">All indexed course documents</option>
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
          <p className="px-2.5 pt-2 pb-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Recent sessions
          </p>
          {isLoadingHistory ? (
            <div className="space-y-1.5 p-2">
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              No previous conversations.
            </div>
          ) : (
            conversations.map((c) => {
              const isSelected = activeConv?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => selectConversation(c)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 font-normal"
                  }`}
                >
                  <div className="truncate flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                    <span className="truncate">{c.title || "Session"}</span>
                  </div>
                  <span className="text-[10px] tabular-nums text-slate-400 flex-shrink-0 ml-1">
                    {formatDate(c.created_at)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Column 2: Main Chat Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
        {/* Chat Header */}
        <div className="h-14 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <h2 className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                {activeConv?.title || "Socratic AI Tutor"}
              </h2>
              <p className="text-[11px] text-slate-500 truncate">
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
              className="text-xs h-7 px-2.5 font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-blue-600 dark:text-blue-400"
            >
              <BookOpen className="w-3 h-3 mr-1.5" /> View citation
            </Button>
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="max-w-xl mx-auto py-12 text-center space-y-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  What would you like to examine today?
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Ask targeted questions about your course materials. Every response includes verifiable page citations from the original text.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
                {SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 transition-colors text-slate-800 dark:text-slate-200 flex items-center justify-between group cursor-pointer shadow-2xs"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
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
                  {/* Avatar */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-semibold ${
                      isAssistant
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    {isAssistant ? "AI" : "YOU"}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 text-xs leading-relaxed ${
                      isAssistant
                        ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs rounded-tl-sm"
                        : "bg-blue-600 text-white rounded-tr-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Citations List if available */}
                    {isAssistant && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 font-sans">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-1">
                          Citations:
                        </span>
                        {msg.citations.map((c, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => openCitationInspector(c)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            <span>
                              Page {c.page_start || 1}
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
              <div className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-[10px] font-semibold">
                AI
              </div>
              <div className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Searching indexed document chunks and formulating Socratic response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2.5 max-w-4xl mx-auto"
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
              placeholder="Ask a question about your reading (e.g., 'What is the proof on page 14?')..."
              rows={1}
              className="flex-1 min-h-[42px] max-h-32 p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-sans"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              isLoading={isSending}
              size="sm"
              className="h-[42px] px-4 font-medium bg-blue-600 hover:bg-blue-700 text-white border-transparent rounded-xl"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>

      {/* Column 3: Collapsible Citation Inspector / Excerpt Viewer */}
      {isInspectorOpen && activeCitation && (
        <div className="w-80 md:w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col flex-shrink-0">
          <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                Source Document Coordinate
              </h3>
            </div>
            <button
              onClick={() => setIsInspectorOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {activeCitation.document_title || "Document"}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Page {activeCitation.page_start || 1}
                  {activeCitation.page_end && activeCitation.page_end !== activeCitation.page_start
                    ? `–${activeCitation.page_end}`
                    : ""}
                </span>
              </div>
              {activeCitation.relevance_score && (
                <p className="text-[11px] tabular-nums text-slate-500">
                  Relevance score: {(activeCitation.relevance_score * 100).toFixed(1)}%
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-medium text-slate-500">
                Extracted Verbatim Excerpt
              </h4>
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans">
                {activeCitation.excerpt || "No excerpt text available."}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              Extracted from layout-preserving chunks via vector embeddings to ensure fidelity to primary source text.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading tutor...</div>}>
      <TutorContent />
    </Suspense>
  );
}