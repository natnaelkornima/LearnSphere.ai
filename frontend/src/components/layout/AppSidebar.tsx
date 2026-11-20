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
      title: "Planning & Retention",
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
          name: "Preferences",
          href: "/settings",
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[var(--surface)] border-r border-[var(--border)] w-60 select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-14 flex items-center px-5 border-b border-[var(--border)] gap-2.5">
        <div className="w-7 h-7 rounded border border-neutral-800 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center shrink-0">
          <BookOpen className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <span className="font-serif font-medium text-sm tracking-tight text-neutral-950 dark:text-neutral-50 block truncate">
            LearnSphere <span className="font-sans text-xs text-neutral-500 font-normal">AI</span>
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-0.5">
            {section.title && (
              <h4 className="px-2.5 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
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
                    "flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors",
                    isActive
                      ? "bg-[var(--surface-secondary)] text-neutral-950 dark:text-neutral-50 font-medium"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-[var(--surface-secondary)] hover:text-neutral-900 dark:hover:text-neutral-200 font-normal"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        "shrink-0",
                        isActive
                          ? "text-neutral-950 dark:text-neutral-50"
                          : "text-neutral-400 dark:text-neutral-500"
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0.2 rounded border",
                        isActive
                          ? "border-[#c4533a]/30 text-[#9e3722] dark:text-[#ea7258] bg-[#fbf2ee] dark:bg-[#2d1b16]"
                          : "border-transparent text-neutral-400"
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
      <div className="p-3 border-t border-[var(--border)]">
        <div className="flex items-center justify-between p-2 rounded-md bg-[var(--surface-secondary)] border border-[var(--border)]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-mono font-medium shrink-0">
              AR
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-neutral-950 dark:text-neutral-50 truncate">Alex Rivera</p>
              <p className="text-[10px] font-mono text-neutral-500 truncate">3-day recall streak</p>
            </div>
          </div>
          <Link
            href="/login"
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
