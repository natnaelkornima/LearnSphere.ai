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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#f7f4ee] dark:bg-[#12110f] font-sans">
      <div className="w-full max-w-md space-y-8">
        {/* Academic Brand header */}
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
            Enter your academic credentials or use the demonstration profile.
          </p>
        </div>

        <div className="p-8 rounded-2xl border border-[#e6dfd1] dark:border-[#2a2723] bg-[#faf8f5] dark:bg-[#171614] space-y-6 shadow-sm">
          <div className="border-b border-[#e6dfd1] dark:border-[#2a2723] pb-4">
            <h1 className="font-serif text-xl font-semibold text-neutral-900 dark:text-neutral-100">
              Scholar Sign In
            </h1>
            <p className="text-xs text-neutral-500 font-serif italic mt-0.5">
              Access your indexed monographs, vector embeddings, and recall history.
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
              label="University email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="scholar@university.edu"
              required
            />

            <Input
              label="Secret key or password"
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
              Sign in to workspace
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e6dfd1] dark:border-[#2a2723]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[#faf8f5] dark:bg-[#171614] px-3 font-serif italic text-neutral-400">
                or rapid verification
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleDevBypass}
            className="w-full justify-center h-10 text-xs font-medium border-[#e6dfd1] dark:border-[#2a2723]"
          >
            <User className="w-3.5 h-3.5 text-neutral-500 mr-2" />
            Continue as verified student scholar
          </Button>

          <p className="text-center text-xs text-neutral-500 pt-2 border-t border-[#e6dfd1] dark:border-[#2a2723]">
            New to LearnSphere?{" "}
            <Link href="/register" className="text-neutral-900 dark:text-neutral-100 font-semibold underline underline-offset-2">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}