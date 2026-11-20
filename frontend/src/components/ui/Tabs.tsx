"use client";

import React from "react";
import { Tabs as SdkTabs, TabsList, TabsTab } from "@ui-sdk/react/tabs";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: "pill" | "underline";
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = "underline",
}: TabsProps) {
  if (variant === "pill") {
    return (
      <SdkTabs
        value={activeTab}
        onValueChange={(val) => {
          if (val) onChange(val);
        }}
        className={cn("inline-flex", className)}
      >
        <TabsList
          aria-label="Navigation Tabs"
          className="inline-flex p-1 bg-[var(--surface-secondary)] rounded-lg space-x-1 border border-[var(--border)]"
        >
          {tabs.map((tab) => (
            <TabsTab
              key={tab.id}
              value={tab.id}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200",
                "data-selected:bg-[var(--surface)] data-selected:text-neutral-950 dark:data-selected:text-neutral-50 data-selected:shadow-xs data-selected:font-semibold"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                  {tab.count}
                </span>
              )}
            </TabsTab>
          ))}
        </TabsList>
      </SdkTabs>
    );
  }

  return (
    <SdkTabs
      value={activeTab}
      onValueChange={(val) => {
        if (val) onChange(val);
      }}
      className={cn("w-full", className)}
    >
      <TabsList
        aria-label="Navigation Tabs"
        className="flex border-b border-[var(--border)] space-x-6"
      >
        {tabs.map((tab) => (
          <TabsTab
            key={tab.id}
            value={tab.id}
            className={cn(
              "inline-flex items-center gap-2 pb-3 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer font-serif",
              "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:border-neutral-300",
              "data-selected:border-neutral-950 dark:data-selected:border-neutral-100 data-selected:text-neutral-950 dark:data-selected:text-neutral-100 data-selected:font-semibold"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {typeof tab.count === "number" && (
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[var(--surface-secondary)] text-neutral-600 dark:text-neutral-400">
                {tab.count}
              </span>
            )}
          </TabsTab>
        ))}
      </TabsList>
    </SdkTabs>
  );
}
