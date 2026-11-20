"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Calendar,
  Clock,
  Plus,
  AlertCircle,
  Check,
  BookOpen,
  ArrowRight,
} from "@/components/ui/Icons";
import { api } from "@/lib/api";
import { DocumentItem, StudyPlan, StudyTask } from "@/types";
import { formatDate } from "@/lib/utils";

export default function PlannerPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Plan Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [dailyMinutes, setDailyMinutes] = useState(45);
  const [planTitle, setPlanTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const [plansData, docsData] = await Promise.all([
        api.studyPlans.list(),
        api.documents.list(1, 50),
      ]);
      setPlans(plansData || []);
      setDocuments(docsData.items.filter((d: DocumentItem) => d.status === "ready") || []);
      if (plansData && plansData.length > 0) {
        setActivePlan(plansData[0]);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId) {
      setErrorMsg("Please select a target document.");
      return;
    }
    if (!targetDate) {
      setErrorMsg("Please select a target completion date.");
      return;
    }

    try {
      setIsGenerating(true);
      setErrorMsg(null);
      const newPlan = await api.studyPlans.create({
        document_id: selectedDocId,
        title: planTitle || undefined,
        target_exam_date: targetDate,
        daily_minutes_goal: dailyMinutes,
      });

      setPlans((prev) => [newPlan, ...prev]);
      setActivePlan(newPlan);
      setIsModalOpen(false);
      setPlanTitle("");
      setSelectedDocId("");
      setTargetDate("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to generate study plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleTask = async (task: StudyTask) => {
    if (!activePlan) return;
    const newStatus = !task.is_completed;

    setActivePlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === task.id ? { ...t, is_completed: newStatus, status: newStatus ? "completed" : "pending" } : t
        ),
      };
    });

    try {
      await api.studyPlans.updateTask(activePlan.id, task.id, newStatus);
    } catch {
      loadPlans();
    }
  };

  const totalTasks = activePlan?.tasks?.length || 0;
  const completedTasks =
    activePlan?.tasks?.filter((t) => t.is_completed || t.status === "completed").length || 0;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#e6dfd1] dark:border-[#2a2723] pb-6">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Curricular Study Milestones
          </h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 font-serif italic">
            Structured daily milestones and retrieval goals calibrated toward your target examination dates.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200"
        >
          <Plus className="w-3.5 h-3.5 mr-2" /> Schedule new syllabus
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Plans List */}
        <div className="space-y-4">
          <h2 className="font-serif text-sm font-semibold text-neutral-900 dark:text-neutral-100 pb-2 border-b border-[#e6dfd1] dark:border-[#2a2723]">
            Active study tracks
          </h2>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] p-6 text-center space-y-3">
              <Calendar className="w-6 h-6 mx-auto text-neutral-400" />
              <p className="text-xs text-neutral-500 font-serif italic">
                No active study schedules found.
              </p>
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="h-8 text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950"
              >
                Create schedule
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((p) => {
                const isSelected = activePlan?.id === p.id;
                const pTotal = p.tasks?.length || 0;
                const pDone = p.tasks?.filter((t) => t.is_completed || t.status === "completed").length || 0;
                const pPercent = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
                const targetExam = p.target_exam_date || p.target_date;

                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePlan(p)}
                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-neutral-900 dark:border-neutral-100 bg-white dark:bg-[#23211d] shadow-xs"
                        : "border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] hover:border-neutral-400"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif font-semibold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                        {p.title}
                      </h3>
                      <span className="font-mono text-xs font-semibold tabular-nums text-neutral-700 dark:text-neutral-300">
                        {pPercent}%
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      <span>{p.daily_minutes_goal || p.daily_goal_minutes || 45}m/day</span>
                      {targetExam && (
                        <span>• Target: {formatDate(targetExam)}</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Active Plan Tasks & Progress */}
        <div className="lg:col-span-2">
          {activePlan ? (
            <div className="rounded-2xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] overflow-hidden shadow-xs">
              <div className="p-6 md:p-8 border-b border-[#e6dfd1] dark:border-[#2a2723] bg-white/70 dark:bg-[#1c1b18] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                      {activePlan.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 font-serif italic">
                      <span className="font-mono tabular-nums not-italic">{completedTasks} of {totalTasks} milestones completed</span>
                      {(activePlan.target_exam_date || activePlan.target_date) && (
                        <>
                          <span>•</span>
                          <span>Target: {formatDate(activePlan.target_exam_date || activePlan.target_date || "")}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="font-mono text-sm font-semibold tabular-nums px-2.5 py-1 rounded-lg border border-[#e6dfd1] dark:border-[#2e2a25] bg-[#faf8f5] dark:bg-[#1f1d1a] text-neutral-800 dark:text-neutral-200">
                    {progressPercent}% Complete
                  </span>
                </div>

                <div className="pt-2">
                  <ProgressBar
                    value={progressPercent}
                    variant={progressPercent === 100 ? "success" : "primary"}
                  />
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-4">
                <h3 className="font-serif text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Target milestones & progression
                </h3>

                {(!activePlan.tasks || activePlan.tasks.length === 0) ? (
                  <p className="text-xs text-neutral-400 py-6 text-center font-serif italic">
                    No milestone tasks generated for this schedule.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {activePlan.tasks.map((task) => {
                      const isCompleted = task.is_completed ?? (task.status === "completed");
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(task)}
                          className={`p-4 rounded-xl border flex items-start gap-3.5 transition-all cursor-pointer ${
                            isCompleted
                              ? "border-[#e6dfd1]/60 dark:border-[#2a2723]/60 bg-neutral-100/40 dark:bg-[#1a1917]/40 text-neutral-400"
                              : "border-[#e6dfd1] dark:border-[#2a2723] bg-white dark:bg-[#1f1d1a] hover:border-neutral-400 shadow-2xs"
                          }`}
                        >
                          <button
                            type="button"
                            className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors border ${
                              isCompleted
                                ? "bg-neutral-900 dark:bg-neutral-100 border-transparent text-white dark:text-neutral-900"
                                : "border-neutral-300 dark:border-neutral-600 bg-transparent"
                            }`}
                          >
                            {isCompleted && <Check className="w-3.5 h-3.5 stroke-3" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-semibold ${
                                isCompleted
                                  ? "line-through text-neutral-400 dark:text-neutral-500"
                                  : "text-neutral-900 dark:text-neutral-100 font-serif text-sm"
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {task.estimated_minutes && (
                            <span className="text-[11px] font-mono tabular-nums text-neutral-500 flex items-center gap-1 flex-shrink-0 pt-0.5">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              {task.estimated_minutes}m
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5]/50 dark:bg-[#171614]/50 p-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border border-[#e6dfd1] dark:border-[#2a2723] bg-white dark:bg-[#1f1d1a] flex items-center justify-center mx-auto text-neutral-500">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  No study schedule selected
                </h3>
                <p className="text-xs text-neutral-500 max-w-md mx-auto font-serif italic">
                  Select an active track on the left or generate a new curricular plan to schedule your study milestones.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="h-8 text-xs font-medium bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Schedule new syllabus
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Plan Generation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Curricular Milestones"
        description="Select an indexed course reading and set your target date to synthesize daily milestones."
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Target course reading
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full text-xs rounded-lg border border-[#e6dfd1] dark:border-[#2e2a25] bg-white dark:bg-[#1f1d1a] p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-200"
              required
            >
              <option value="">Select an indexed reading...</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Schedule title (optional)"
            placeholder="e.g. Midterm revision sequence"
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Target finish date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Daily goal (minutes)
              </label>
              <input
                type="number"
                min={15}
                max={300}
                step={15}
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="w-full text-xs rounded-lg border border-[#e6dfd1] dark:border-[#2e2a25] bg-white dark:bg-[#1f1d1a] p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-200 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#e6dfd1] dark:border-[#2a2723]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isGenerating}
              className="h-8 text-xs border-[#e6dfd1] dark:border-[#2a2723]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isGenerating}
              isLoading={isGenerating}
              className="h-8 text-xs font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950"
            >
              {isGenerating ? "Synthesizing schedule..." : "Create schedule"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}