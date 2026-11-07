"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  MessageSquare,
  Sparkles,
  Brain,
  Layers,
  Calendar,
  BarChart3,
  Settings,
  Flame,
  FileText,
  LogOut,
  User as UserIcon,
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
          name: "Dashboard",
          href: "/dashboard",
          icon: <BarChart3 className="w-4 h-4" />,
        },
        {
          name: "Document Library",
          href: "/library",
          icon: <BookOpen className="w-4 h-4" />,
        },
        {
          name: "AI Tutor",
          href: "/tutor",
          icon: <MessageSquare className="w-4 h-4" />,
          badge: "RAG",
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
          name: "Smart Flashcards",
          href: "/studio/flashcards",
          icon: <Layers className="w-4 h-4" />,
        },
      ],
    },
    {
      title: "Productivity & Insights",
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
        "flex flex-col h-full bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 w-64 select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-neutral-200 dark:border-neutral-800 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-secondary-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
            LearnSphere <span className="text-primary-600 font-extrabold text-xs uppercase px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-950">AI</span>
          </span>
          <p className="text-[11px] text-neutral-400 font-medium">Active Learning System</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && (
              <h4 className="px-3 text-[11px] font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 mb-2">
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
                    "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                    isActive
                      ? "bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 font-semibold"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "transition-colors",
                        isActive
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                        isActive
                          ? "bg-primary-200 dark:bg-primary-900 text-primary-800 dark:text-primary-200"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
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

      {/* Student Streak & Profile Footer */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-amber-500 text-white">
              <Flame className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">Study Streak</p>
              <p className="text-[10px] text-amber-700 dark:text-amber-300">Keep learning today</p>
            </div>
          </div>
          <span className="text-sm font-bold text-amber-900 dark:text-amber-100">3 Days</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 flex items-center justify-center font-semibold text-xs border border-primary-200 dark:border-primary-800">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">Student Account</p>
              <p className="text-[10px] text-neutral-400 truncate">student@learnsphere.ai</p>
            </div>
          </div>
          <Link
            href="/login"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

