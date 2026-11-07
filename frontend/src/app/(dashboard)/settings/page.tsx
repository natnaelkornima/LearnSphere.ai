"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Settings,
  User,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
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
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Settings & Study Preferences
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Configure your personal learning pace and application preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary-600" />
              Student Profile
            </CardTitle>
            <CardDescription>
              Your active workspace identity and account details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase">Full Name</p>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                  {currentUser?.full_name || "Student Learner"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-400 uppercase">Email Address</p>
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 mt-1">
                  {currentUser?.email || "student@learnsphere.ai"}
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <Badge variant="success">Active Account</Badge>
              <Badge variant="primary">Unlimited RAG Ingestion</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Study Preferences Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-600" />
              Daily Study Goals
            </CardTitle>
            <CardDescription>
              Adjust target daily learning time for the study streak tracker.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5 max-w-xs">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase">
                  Daily Minutes Target
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={15}
                    max={240}
                    step={15}
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    className="w-32 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-500">minutes / day</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" isLoading={isSaving}>
                  Save Preferences
                </Button>
                {savedSuccess && (
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Preferences saved!
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* System Architecture Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-600" />
              Backend Architecture & Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                Vector Database
              </span>
              <Badge variant="success">pgvector / PostgreSQL (Active)</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                AI Inference Engine
              </span>
              <Badge variant="primary">Google Gemini 2.5 Flash</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                Document Parsing Engine
              </span>
              <Badge variant="secondary">PyMuPDF Page Extractor</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

