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
  Sparkles,
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

    // Optimistic local update
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
      // Revert if API fails
      loadPlans();
    }
  };

  // Compute completion stats for active plan
  const totalTasks = activePlan?.tasks?.length || 0;
  const completedTasks =
    activePlan?.tasks?.filter((t) => t.is_completed || t.status === "completed").length || 0;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Personalized Study Planner
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            AI-scheduled daily milestones and task tracking toward your target exam dates.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Generate New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Plans List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
            Your Active Plans
          </h3>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : plans.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-xs text-neutral-400 space-y-3">
                <Calendar className="w-8 h-8 mx-auto text-neutral-300" />
                <p>No study plans scheduled yet.</p>
                <Button size="sm" onClick={() => setIsModalOpen(true)}>
                  Create Your First Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2.5">
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
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? "border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 shadow-xs ring-1 ring-primary-500"
                        : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                        {p.title}
                      </h4>
                      <Badge variant={pPercent === 100 ? "success" : "primary"}>
                        {pPercent}%
                      </Badge>
                    </div>

                    <div className="mt-2 text-xs text-neutral-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{p.daily_minutes_goal || p.daily_goal_minutes || 45} mins / day</span>
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
            <Card className="shadow-sm">
              <CardHeader className="border-b border-neutral-100 dark:border-neutral-800 pb-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{activePlan.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span>{completedTasks} of {totalTasks} milestones completed</span>
                      {(activePlan.target_exam_date || activePlan.target_date) && (
                        <>
                          <span>•</span>
                          <span>Exam Date: {formatDate(activePlan.target_exam_date || activePlan.target_date || "")}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={progressPercent === 100 ? "success" : "primary"} className="self-start sm:self-auto">
                    {progressPercent}% COMPLETE
                  </Badge>
                </div>

                <div className="pt-4">
                  <ProgressBar
                    value={progressPercent}
                    variant={progressPercent === 100 ? "success" : "primary"}
                  />
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Actionable Milestones
                </h4>

                {(!activePlan.tasks || activePlan.tasks.length === 0) ? (
                  <p className="text-xs text-neutral-400 py-4 text-center">
                    No milestone tasks generated for this plan.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activePlan.tasks.map((task) => {
                      const isCompleted = task.is_completed ?? (task.status === "completed");
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(task)}
                          className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                            isCompleted
                              ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-neutral-400"
                              : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-primary-300 dark:hover:border-primary-800"
                          }`}
                        >
                          <button
                            type="button"
                            className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors ${
                              isCompleted
                                ? "bg-emerald-600 text-white"
                                : "border border-neutral-300 dark:border-neutral-600 hover:border-primary-500"
                            }`}
                          >
                            {isCompleted && <Check className="w-3.5 h-3.5 stroke-3" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-medium ${
                                isCompleted
                                  ? "line-through text-neutral-400 dark:text-neutral-500"
                                  : "text-neutral-900 dark:text-neutral-100"
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-xs text-neutral-400 mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {task.estimated_minutes && (
                            <span className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1 flex-shrink-0">
                              <Clock className="w-3 h-3" />
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
              icon={<Calendar className="w-8 h-8" />}
              title="No plan selected"
              description="Choose an existing study plan from the left or create a new plan to generate structured study targets."
              action={
                <Button size="sm" onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1.5" /> Generate Study Plan
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
        title="Generate AI Study Plan"
        description="Select a syllabus or document and set your target date to generate an adaptive revision schedule."
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase">
              Target Document
            </label>
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">-- Select Material --</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Plan Title (Optional)"
            placeholder="e.g. Midterm Preparation Schedule"
            value={planTitle}
            onChange={(e) => setPlanTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Target Exam / Finish Date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase">
                Daily Study Goal (Mins)
              </label>
              <input
                type="number"
                min={15}
                max={300}
                step={15}
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="w-full text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-2.5 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isGenerating}
              isLoading={isGenerating}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              {isGenerating ? "Synthesizing Schedule..." : "Generate Plan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
