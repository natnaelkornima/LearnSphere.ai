"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  MessageSquare,
  Sparkles,
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
  "What are the main formulas or definitions introduced?",
  "Can you create a 3-question mini practice test from this?",
  "What are the key takeaways from the first chapter?",
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

    // Optimistic user message
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
        // Refresh conversation list to get newly created conversation
        const convs = await api.chat.listConversations();
        setConversations(convs);
        const current = convs.find((c: Conversation) => c.id === resp.conversation_id);
        if (current) setActiveConv(current);
      }

      // Add assistant response
      setMessages((prev) => [...prev, resp.assistant_message]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        conversation_id: activeConv?.id || "temp",
        role: "assistant",
        content: `⚠️ Error: ${err.message || "Unable to contact AI Tutor. Please verify your connection."}`,
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
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950">
      {/* Column 1: Conversations & Document Scoping Sidebar (hidden on small mobile) */}
      <div className="w-72 hidden md:flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex-shrink-0">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 space-y-3">
          <Button
            onClick={startNewConversation}
            className="w-full justify-center shadow-xs"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1.5" /> New Tutor Chat
          </Button>

          {/* Document Scope Selector */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Document Context
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 p-2 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Uploaded Documents</option>
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
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="px-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
            History
          </p>
          {isLoadingHistory ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-neutral-400">
              No previous conversations. Start asking questions!
            </div>
          ) : (
            conversations.map((c) => {
              const isSelected = activeConv?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => selectConversation(c)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-300 font-semibold"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <div className="truncate flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{c.title || "Chat Session"}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 flex-shrink-0 ml-1">
                    {formatDate(c.created_at)}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Column 2: Main Chat Canvas */}
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-50/50 dark:bg-neutral-950/50">
        {/* Chat Header */}
        <div className="h-14 px-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-md bg-primary-100 dark:bg-primary-950 text-primary-600 dark:text-primary-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                {activeConv?.title || "Grounded AI Tutor"}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {selectedDocId
                  ? `Scoped to: ${documents.find((d) => d.id === selectedDocId)?.title || "Document"}`
                  : "Searching all indexed documents with verified page citations"}
              </p>
            </div>
          </div>

          {activeCitation && !isInspectorOpen && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsInspectorOpen(true)}
              className="text-xs"
            >
              <BookOpen className="w-3.5 h-3.5 mr-1" /> View Citation Excerpt
            </Button>
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="max-w-xl mx-auto py-12 text-center space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-secondary-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  What would you like to learn today?
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Ask questions about your uploaded materials. Responses include verified page citations directly from your documents.
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
                {SAMPLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3 text-xs font-medium rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-xs transition-all text-neutral-700 dark:text-neutral-300 flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-transform" />
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
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isAssistant
                        ? "bg-gradient-to-tr from-primary-600 to-secondary-500 text-white shadow-xs"
                        : "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    {isAssistant ? <Sparkles className="w-4 h-4" /> : "You"}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                      isAssistant
                        ? "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100"
                        : "bg-primary-600 text-white"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Citations List if available */}
                    {isAssistant && msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-neutral-400 mr-1 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Citations:
                        </span>
                        {msg.citations.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => openCitationInspector(c)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-semibold hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors cursor-pointer"
                          >
                            <span>
                              Page {c.page_start || 1}
                              {c.page_end && c.page_end !== c.page_start ? `-${c.page_end}` : ""}
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-600 to-secondary-500 text-white flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary-600 animate-ping" />
                <span>Searching indexed knowledge chunks & formulating grounded answer...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
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
              placeholder="Ask a question about your study material (e.g. 'What is the proof on page 14?')..."
              rows={1}
              className="flex-1 min-h-[44px] max-h-32 p-3 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-neutral-900 dark:text-neutral-100"
            />
            <Button
              type="submit"
              disabled={!inputMessage.trim() || isSending}
              isLoading={isSending}
              size="md"
              className="h-11 px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Column 3: Collapsible Citation Inspector / Excerpt Viewer */}
      {isInspectorOpen && activeCitation && (
        <div className="w-80 md:w-96 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col flex-shrink-0 animate-in slide-in-from-right duration-200 shadow-xl">
          <div className="h-14 px-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary-600" />
              <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                Source Reference
              </h4>
            </div>
            <button
              onClick={() => setIsInspectorOpen(false)}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                  {activeCitation.document_title || "Verified Document"}
                </span>
                <Badge variant="primary">
                  Page {activeCitation.page_start || 1}
                  {activeCitation.page_end && activeCitation.page_end !== activeCitation.page_start
                    ? `-${activeCitation.page_end}`
                    : ""}
                </Badge>
              </div>
              {activeCitation.relevance_score && (
                <p className="text-[10px] text-neutral-400">
                  Similarity Score: {(activeCitation.relevance_score * 100).toFixed(1)}%
                </p>
              )}
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Extracted Document Excerpt
              </h5>
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs leading-relaxed font-mono text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                {activeCitation.excerpt || "No excerpt text available."}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-xs text-blue-700 dark:text-blue-300">
              💡 This citation was retrieved via cosine vector search on your uploaded PDF to prevent hallucination.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400">Loading AI Tutor...</div>}>
      <TutorContent />
    </Suspense>
  );
}
