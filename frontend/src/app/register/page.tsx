"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BookOpen, AlertCircle } from "@/components/ui/Icons";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMsg(null);
      await api.auth.register(email, password, fullName);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f7f4ee] dark:bg-[#12110f] font-sans">
      <div className="w-full max-w-md space-y-8">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-neutral-900 dark:text-neutral-100">
              LearnSphere <span className="font-sans text-xs uppercase tracking-widest text-neutral-500 font-semibold">AI</span>
            </span>
          </Link>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 font-serif italic">
            Initialize your personal academic vector workspace.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] space-y-6 shadow-sm">
          <div className="border-b border-[#e6dfd1] dark:border-[#2a2723] pb-4">
            <h1 className="font-serif text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Create Scholar Profile
            </h1>
            <p className="text-xs text-neutral-500 font-serif italic mt-0.5">
              Includes full document parsing, Socratic chat, and spaced flashcards.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full academic name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Dr. Eleanor Vance"
              required
            />

            <Input
              label="University email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vance@university.edu"
              required
            />

            <Input
              label="Password (min. 8 characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              className="w-full justify-center h-10 text-xs font-semibold bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-200"
              isLoading={isLoading}
            >
              Initialize workspace
            </Button>
          </form>

          <p className="text-center text-xs text-neutral-500 pt-3 border-t border-[#e6dfd1] dark:border-[#2a2723]">
            Already have an active profile?{" "}
            <Link href="/login" className="text-neutral-900 dark:text-neutral-100 font-semibold underline underline-offset-2">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}