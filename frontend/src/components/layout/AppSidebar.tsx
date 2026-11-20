"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  MessageSquare,
  Brain,
  Layers,
  Calendar,
  BarChart3,
  Settings,
  FileText,
  LogOut,
} from "@/components/ui/Icons";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export function AppSidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const sections: NavSection[] = [
    {
      items: [
        {
          name: "Overview",
          href: "/dashboard",
          icon: <BarChart3 className="w-4 h-4" />,
        },
        {
          name: "Library",
          href: "/library",
          icon: <BookOpen className="w-4 h-4" />,
        },
        {
          name: "AI Tutor",
          href: "/tutor",
          icon: <MessageSquare className="w-4 h-4" />,
          badge: "Citations",
        },
      ],
    },
    {
      title: "Learning Studio",
      items: [
        {
          name: "Summaries",
          href: "/studio/summaries",
          icon: <FileText className="w-4 h-4" />,
        },
        {
          name: "Practice Quizzes",
          href: "/studio/quizzes",
          icon: <Brain className="w-4 h-4" />,
        },
        {
          name: "Flashcards",
          href: "/studio/flashcards",
          icon: <Layers className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Retention & Goals",
      items: [
        {
          name: "Study Planner",
          href: "/planner",
          icon: <Calendar className="w-4 h-4" />,
        },
        {
          name: "Analytics",
          href: "/analytics",
          icon: <BarChart3 className="w-4 h-4" />,
        },
        {
          name: "Settings",
          href: "/settings",
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-60 select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-slate-200 dark:border-slate-800 gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <BookOpen className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-slate-100 block truncate">
            LearnSphere <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">AI</span>
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-0.5">
            {section.title && (
              <h4 className="px-2 pt-2 pb-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {section.title}
              </h4>
            )}
            {section.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-medium"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 font-normal"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        "shrink-0",
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-400 dark:text-slate-500"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded font-medium",
                        isActive
                          ? "bg-blue-200/60 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Student Profile Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center text-[10px] font-medium shrink-0">
              AR
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">Alex Rivera</p>
              <p className="text-[10px] text-slate-500 truncate">3-day study streak</p>
            </div>
          </div>
          <Link
            href="/login"
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}