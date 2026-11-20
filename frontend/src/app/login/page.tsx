"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { BookOpen, AlertCircle, User } from "@/components/ui/Icons";
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-slate-900 dark:text-slate-100">
              LearnSphere <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">AI</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500">
            Sign in to access your course documents and recall history.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Sign in to workspace
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your credentials or continue with the demo account.
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
              className="w-full justify-center h-10 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white border-transparent"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-400">
                or
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleDevBypass}
            className="w-full justify-center h-10 text-xs font-medium bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <User className="w-3.5 h-3.5 text-slate-500 mr-2" />
            Continue as demo student
          </Button>

          <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            Need an account?{" "}
            <Link href="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}