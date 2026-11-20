"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  User,
  Check,
  Clock,
  Layers,
} from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { User as UserType } from "@/types";

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.auth.getCurrentUser()
      .then((u) => {
        setCurrentUser(u);
        if (u.preferences?.daily_study_goal_minutes) {
          setDailyMinutes(u.preferences.daily_study_goal_minutes);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.auth.updatePreferences({
        daily_study_goal_minutes: dailyMinutes,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch {
      alert("Failed to update preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-[#e6dfd1] dark:border-[#2a2723] pb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          Account & Curricular Preferences
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-serif italic">
          Scholar profile, daily retrieval quotas, and verifiable backend inference runtime status.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-6 space-y-5 shadow-xs">
          <div className="border-b border-[#e6dfd1] dark:border-[#2a2723] pb-3">
            <h2 className="font-serif text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Scholar identity & credentials
            </h2>
            <p className="text-xs text-neutral-500 font-serif italic mt-0.5">
              Active profile and vector corpus entitlements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">Scholar name</p>
              <p className="font-serif text-base font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                {currentUser?.full_name || "Student Scholar"}
              </p>
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">University email</p>
              <p className="font-mono text-sm text-neutral-900 dark:text-neutral-100 mt-1">
                {currentUser?.email || "scholar@learnsphere.ai"}
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/30 font-mono text-[10px] uppercase font-semibold">
              Verified Student Scholar
            </span>
            <span className="px-2.5 py-1 rounded-md border border-[#e6dfd1] dark:border-[#2e2a25] text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#1f1d1a] font-mono text-[10px] uppercase font-semibold">
              Unlimited RAG Indexing
            </span>
          </div>
        </div>

        {/* Study Preferences Form */}
        <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-6 space-y-5 shadow-xs">
          <div className="border-b border-[#e6dfd1] dark:border-[#2a2723] pb-3">
            <h2 className="font-serif text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Daily study commitment
            </h2>
            <p className="text-xs text-neutral-500 font-serif italic mt-0.5">
              Minimum daily retrieval and reading duration to maintain your continuity streak.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5 max-w-sm">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Target study time
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={15}
                  max={240}
                  step={15}
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(Number(e.target.value))}
                  className="w-28 text-xs font-mono font-semibold rounded-lg border border-[#e6dfd1] dark:border-[#2e2a25] bg-white dark:bg-[#1f1d1a] p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-200"
                />
                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-serif italic">
                  minutes per day
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-[#e6dfd1] dark:border-[#2a2723]">
              <Button
                type="submit"
                isLoading={isSaving}
                className="h-9 px-4 text-xs font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200"
              >
                Save commitment
              </Button>
              {savedSuccess && (
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5 font-serif">
                  <Check className="w-4 h-4" /> Preferences updated
                </span>
              )}
            </div>
          </form>
        </div>

        {/* System Architecture Status */}
        <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-6 space-y-4 shadow-xs">
          <div className="border-b border-[#e6dfd1] dark:border-[#2a2723] pb-3">
            <h2 className="font-serif text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Verified runtime infrastructure
            </h2>
            <p className="text-xs text-neutral-500 font-serif italic mt-0.5">
              Production subsystems powering semantic extraction and citation matching.
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#1f1d1a] border border-[#e6dfd1] dark:border-[#2a2723]">
              <span className="font-serif font-medium text-neutral-900 dark:text-neutral-100">
                Vector Embeddings & Storage
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                pgvector / PostgreSQL (Cosine 768d)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#1f1d1a] border border-[#e6dfd1] dark:border-[#2a2723]">
              <span className="font-serif font-medium text-neutral-900 dark:text-neutral-100">
                Socratic Foundation Model
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                Gemini 2.5 Flash (Academic Prompt Mode)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#1f1d1a] border border-[#e6dfd1] dark:border-[#2a2723]">
              <span className="font-serif font-medium text-neutral-900 dark:text-neutral-100">
                Document Parsing Engine
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                PyMuPDF (Fitz Layout Preserving)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}