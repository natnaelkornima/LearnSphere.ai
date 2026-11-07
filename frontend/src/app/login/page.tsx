"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BookOpen, AlertCircle, ArrowRight, User } from "@/components/ui/Icons";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("student@learnsphere.ai");
  const [password, setPassword] = useState("learnsphere123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setErrorMsg(null);
      await api.auth.login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevBypass = () => {
    localStorage.setItem("learnsphere_token", "dev_user_student");
    router.push("/dashboard");
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
            Sign in to access your course documents and study history
          </p>
        </div>

        <div className="p-6 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-medium text-neutral-900 dark:text-neutral-100">
              Sign in
            </h2>
            <p className="text-xs text-neutral-500">
              Enter credentials or continue with student demo
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
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              className="w-full justify-center h-9 text-xs font-medium"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="bg-[var(--surface)] px-2 text-neutral-400">
                or
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleDevBypass}
            className="w-full justify-center h-9 text-xs font-medium"
          >
            <User className="w-3.5 h-3.5 text-neutral-500 mr-1.5" />
            Continue as student demo
          </Button>

          <p className="text-center text-xs text-neutral-500 pt-2">
            Need an account?{" "}
            <Link href="/register" className="text-neutral-900 dark:text-neutral-100 font-medium hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
