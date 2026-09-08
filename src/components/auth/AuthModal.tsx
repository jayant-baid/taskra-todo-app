"use client";

import React, { useState } from "react";
import { LogIn, UserPlus, AlertCircle, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialError?: string | null;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialError,
  login,
  register,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<
    "google" | "facebook" | null
  >(null);

  React.useEffect(() => {
    if (initialError) {
      const t = setTimeout(() => setError(initialError), 0);
      return () => clearTimeout(t);
    }
  }, [initialError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const res =
        mode === "login"
          ? await login(username.trim(), password)
          : await register(username.trim(), password);

      if (res.success) {
        setUsername("");
        setPassword("");
        setError(null);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || "Authentication failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError(null);
  };

  const handleSocialAuth = (provider: "google" | "facebook") => {
    setError(null);
    setIsSocialLoading(provider);
    // Direct top-level browser navigation to OAuth redirect endpoint
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "login" ? "Sign In to Taskra" : "Create an Account"}
      subtitle="Sync your tasks, recurring routines, and history across mobile and desktop"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col gap-4">
        {/* Social Login Options */}
        <div className="flex flex-col gap-2">
          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleSocialAuth("google")}
            disabled={Boolean(isSocialLoading) || isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 py-2 px-3 bg-[#1C1F26] hover:bg-[#222630] border border-[#2A2E37] hover:border-[#383E4C] rounded-[3px] text-xs font-medium text-[#E4E6EB] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSocialLoading === "google" ? (
              <span className="text-[#8B92A3]">Redirecting to Google...</span>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Facebook Button */}
          {/* <button
            type="button"
            onClick={() => handleSocialAuth("facebook")}
            disabled={Boolean(isSocialLoading) || isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 py-2 px-3 bg-[#1C1F26] hover:bg-[#222630] border border-[#2A2E37] hover:border-[#383E4C] rounded-[3px] text-xs font-medium text-[#E4E6EB] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSocialLoading === "facebook" ? (
              <span className="text-[#8B92A3]">Redirecting to Facebook...</span>
            ) : (
              <>
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="#1877F2"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Continue with Facebook</span>
              </>
            )}
          </button> */}
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-1">
          <div className="border-t border-[#2A2E37] w-full" />
          <span className="bg-[#1C1F26] px-2.5 text-[10px] text-[#8B92A3] uppercase tracking-wider shrink-0 font-semibold">
            Or with username
          </span>
        </div>

        {/* Mode switcher tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#14161A] border border-[#2A2E37] rounded-[3px]">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`py-1.5 text-xs font-semibold rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === "login"
                ? "bg-[#1C1F26] text-[#E4E6EB] shadow-sm border border-[#2A2E37]"
                : "text-[#8B92A3] hover:text-[#E4E6EB]"
            }`}
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`py-1.5 text-xs font-semibold rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === "register"
                ? "bg-[#1C1F26] text-[#E4E6EB] shadow-sm border border-[#2A2E37]"
                : "text-[#8B92A3] hover:text-[#E4E6EB]"
            }`}
          >
            <UserPlus size={13} />
            <span>Create Account</span>
          </button>
        </div>

        {/* Sync Guarantee Badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#222630]/60 border border-[#2A2E37] rounded-[3px] text-[11px] text-[#8B92A3]">
          <ShieldCheck size={14} className="text-[#3DD68C] shrink-0" />
          <span>
            {mode === "login"
              ? "Signing in will sync your routines and history across all devices."
              : "Your tasks will be securely backed up and synchronized across devices."}
          </span>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-start gap-2 p-2.5 bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.3)] rounded-[3px] text-xs text-[#FF6B6B]">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="auth-username"
              className="text-xs font-semibold text-[#8B92A3]"
            >
              Username
            </label>
            <input
              id="auth-username"
              type="text"
              required
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. ops_engineer"
              className="w-full px-3 py-2 text-sm bg-[#14161A] border border-[#2A2E37] rounded-[3px] text-[#E4E6EB] placeholder-[#5C6272] focus:outline-none focus:border-[#5B7FFF]"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="auth-password"
              className="text-xs font-semibold text-[#8B92A3]"
            >
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm bg-[#14161A] border border-[#2A2E37] rounded-[3px] text-[#E4E6EB] placeholder-[#5C6272] focus:outline-none focus:border-[#5B7FFF]"
            />
            {mode === "register" && (
              <span className="text-[10px] text-[#5C6272]">
                Minimum 4 characters
              </span>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2A2E37]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!username.trim() || !password || isSubmitting}
              className="gap-1.5 min-w-[100px]"
            >
              {isSubmitting ? (
                <span>Connecting...</span>
              ) : mode === "login" ? (
                <>
                  <LogIn size={14} />
                  <span>Sign In</span>
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  <span>Create Account</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
