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
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Account & preferences
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Workspace profile, daily study goals, and backend runtime status.
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-neutral-500" />
              <span>Learner profile</span>
            </CardTitle>
            <CardDescription>
              Active account credentials and ingestion entitlements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-neutral-500">Name</p>
                <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {currentUser?.full_name || "Student Learner"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-neutral-500">Email</p>
                <p className="text-xs font-mono text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {currentUser?.email || "student@learnsphere.ai"}
                </p>
              </div>
            </div>
            <div className="pt-1 flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px]">active account</Badge>
              <Badge variant="outline" className="font-mono text-[10px]">unlimited rag ingestion</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Study Preferences Form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              <span>Daily target</span>
            </CardTitle>
            <CardDescription>
              Target daily learning commitment for study streak tracking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="space-y-1 max-w-xs">
                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  Target study time
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="number"
                    min={15}
                    max={240}
                    step={15}
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(Number(e.target.value))}
                    className="w-24 text-xs font-mono rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 p-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary-600"
                  />
                  <span className="text-xs text-neutral-500">minutes / day</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button type="submit" isLoading={isSaving} className="h-7 text-xs">
                  Save preferences
                </Button>
                {savedSuccess && (
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Preferences saved
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* System Architecture Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-neutral-500" />
              <span>Runtime status</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center justify-between p-2.5 rounded-md bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800">
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                Vector engine
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">pgvector / postgresql</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-md bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800">
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                Inference model
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">gemini-2.5-flash</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-md bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/80 dark:border-neutral-800">
              <span className="font-medium text-neutral-800 dark:text-neutral-200">
                Document parser
              </span>
              <Badge variant="outline" className="font-mono text-[10px]">pymupdf fitz</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
