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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)] font-sans">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-semibold text-base tracking-tight text-neutral-950 dark:text-neutral-50">
              LearnSphere <span className="text-neutral-400 font-normal">AI</span>
            </span>
          </Link>
          <p className="text-xs text-neutral-500">
            Create an account to start indexing course materials
          </p>
        </div>

        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              Create account
            </h2>
            <p className="text-xs text-neutral-500">
              Includes full document parsing, quizzes, and recall flashcards
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <Input
              label="Full name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Johnson"
              required
            />

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@university.edu"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />

            <Button
              type="submit"
              className="w-full justify-center h-9 text-xs font-medium"
              isLoading={isLoading}
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-xs text-neutral-500 pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-neutral-900 dark:text-neutral-100 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
