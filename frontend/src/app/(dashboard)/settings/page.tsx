"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
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
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 font-sans">
      {/* Page Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Account & Preferences
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Learner profile, daily study goals, and backend runtime status.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-2xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Learner credentials
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active profile and vector corpus entitlements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-medium text-slate-500">Learner name</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                {currentUser?.full_name || "Student Learner"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Email address</p>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">
                {currentUser?.email || "student@learnsphere.ai"}
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-medium">
              Verified Student
            </span>
            <span className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 text-[11px] font-medium">
              Unlimited RAG Indexing
            </span>
          </div>
        </div>

        {/* Study Preferences Form */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-2xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Daily study commitment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Minimum daily reading and recall duration for streak tracking.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5 max-w-sm">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
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
                  className="w-28 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
                <span className="text-xs text-slate-500">
                  minutes per day
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="submit"
                isLoading={isSaving}
                className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white border-transparent"
              >
                Save commitment
              </Button>
              {savedSuccess && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Preferences updated
                </span>
              )}
            </div>
          </form>
        </div>

        {/* System Architecture Status */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-2xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              System architecture runtime
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Production subsystems powering semantic extraction and citation matching.
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Vector Embeddings & Storage
              </span>
              <span className="text-[11px] text-slate-500">
                pgvector / PostgreSQL (768d cosine)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Socratic Foundation Model
              </span>
              <span className="text-[11px] text-slate-500">
                Gemini 2.5 Flash
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-700">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Document Parsing Engine
              </span>
              <span className="text-[11px] text-slate-500">
                PyMuPDF (Fitz layout-preserving)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}