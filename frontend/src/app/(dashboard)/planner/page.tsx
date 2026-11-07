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
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Study schedules
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Structured daily milestones and task tracking toward your examination dates.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="h-8 text-xs">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Generate plan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Plans List */}
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-neutral-500">
            Active schedules
          </h3>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-md" />
              <Skeleton className="h-16 w-full rounded-md" />
            </div>
          ) : plans.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-xs text-neutral-400 space-y-3">
                <Calendar className="w-6 h-6 mx-auto text-neutral-400" />
                <p>No study plans scheduled yet.</p>
                <Button size="sm" onClick={() => setIsModalOpen(true)} className="h-7 text-xs">
                  Create plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
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
                    className={`w-full text-left p-3.5 rounded-md border transition-colors ${
                      isSelected
                        ? "border-neutral-900 dark:border-neutral-100 bg-neutral-100 dark:bg-neutral-800"
                        : "border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-xs text-neutral-900 dark:text-neutral-100 truncate">
                        {p.title}
                      </h4>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {pPercent}%
                      </Badge>
                    </div>

                    <div className="mt-1.5 text-[11px] font-mono tabular-nums text-neutral-400 flex items-center gap-2">
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
            <Card>
              <CardHeader className="border-b border-neutral-100 dark:border-neutral-800/80 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{activePlan.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono tabular-nums">{completedTasks} of {totalTasks} milestones completed</span>
                      {(activePlan.target_exam_date || activePlan.target_date) && (
                        <>
                          <span>•</span>
                          <span>Exam: {formatDate(activePlan.target_exam_date || activePlan.target_date || "")}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={progressPercent === 100 ? "success" : "outline"} className="self-start sm:self-auto font-mono text-[11px]">
                    {progressPercent}%
                  </Badge>
                </div>

                <div className="pt-3">
                  <ProgressBar
                    value={progressPercent}
                    variant={progressPercent === 100 ? "success" : "primary"}
                  />
                </div>
              </CardHeader>

              <CardContent className="p-5 space-y-2.5">
                <h4 className="text-xs font-medium text-neutral-500 mb-1">
                  Milestones
                </h4>

                {(!activePlan.tasks || activePlan.tasks.length === 0) ? (
                  <p className="text-xs text-neutral-400 py-4 text-center">
                    No milestone tasks generated for this plan.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {activePlan.tasks.map((task) => {
                      const isCompleted = task.is_completed ?? (task.status === "completed");
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(task)}
                          className={`p-3 rounded-md border flex items-start gap-3 transition-colors cursor-pointer ${
                            isCompleted
                              ? "border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-400"
                              : "border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700"
                          }`}
                        >
                          <button
                            type="button"
                            className={`mt-0.5 w-4 h-4 rounded-[3px] flex items-center justify-center transition-colors border ${
                              isCompleted
                                ? "bg-neutral-900 dark:bg-neutral-100 border-transparent text-white dark:text-neutral-900"
                                : "border-neutral-300 dark:border-neutral-600 bg-transparent"
                            }`}
                          >
                            {isCompleted && <Check className="w-3 h-3 stroke-3" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-medium ${
                                isCompleted
                                  ? "line-through text-neutral-400 dark:text-neutral-500"
                                  : "text-neutral-900 dark:text-neutral-100"
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-[11px] text-neutral-500 mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {task.estimated_minutes && (
                            <span className="text-[11px] font-mono tabular-nums text-neutral-400 flex items-center gap-1 flex-shrink-0">
                              <Clock className="w-3 h-3 text-neutral-400" />
                              {task.estimated_minutes}m
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={<Calendar className="w-6 h-6 text-neutral-500" />}
              title="No plan selected"
              description="Select a schedule on the left or generate a new study plan to begin."
              action={
                <Button size="sm" onClick={() => setIsModalOpen(true)} className="h-7 text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Generate plan
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Plan Generation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generate study schedule"
        description="Select a reading and define your target date to synthesize daily milestones."
      >
        <form onSubmit={handleCreatePlan} className="space-y-3.5">
          {errorMsg && (
            <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              Target document
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 p-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary-600"
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

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Target finish date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Daily goal (minutes)
              </label>
              <input
                type="number"
                min={15}
                max={300}
                step={15}
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="w-full text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-850 p-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-primary-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isGenerating}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isGenerating}
              isLoading={isGenerating}
              className="h-7 text-xs"
            >
              {isGenerating ? "Synthesizing schedule..." : "Create schedule"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
