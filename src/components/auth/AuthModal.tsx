'use client';

import React, { useState } from 'react';
import { LogIn, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

export function AuthModal({ isOpen, onClose, onSuccess, login, register }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const res = mode === 'login'
        ? await login(username.trim(), password)
        : await register(username.trim(), password);

      if (res.success) {
        setUsername('');
        setPassword('');
        setError(null);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        setError(res.error || 'Authentication failed');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Sign In to Recurring // OPS' : 'Create an Account'}
      subtitle="Sync your tasks, recurring routines, and history across mobile and desktop"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Mode switcher tabs */}
        <div className="grid grid-cols-2 p-1 bg-[#14161A] border border-[#2A2E37] rounded-[3px]">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-1.5 text-xs font-semibold rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-[#1C1F26] text-[#E4E6EB] shadow-sm border border-[#2A2E37]'
                : 'text-[#8B92A3] hover:text-[#E4E6EB]'
            }`}
          >
            <LogIn size={13} />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`py-1.5 text-xs font-semibold rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-[#1C1F26] text-[#E4E6EB] shadow-sm border border-[#2A2E37]'
                : 'text-[#8B92A3] hover:text-[#E4E6EB]'
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
            {mode === 'login'
              ? 'Signing in will sync your routines and history to this device.'
              : 'Your tasks will be securely backed up and synchronized across devices.'}
          </span>
        </div>

        {/* Error notification */}
        {error && (
          <div className="flex items-center gap-2 p-2.5 bg-[rgba(255,107,107,0.1)] border border-[rgba(255,107,107,0.3)] rounded-[3px] text-xs text-[#FF6B6B]">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="auth-username" className="text-xs font-semibold text-[#8B92A3]">
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
          <label htmlFor="auth-password" className="text-xs font-semibold text-[#8B92A3]">
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
          {mode === 'register' && (
            <span className="text-[10px] text-[#5C6272]">Minimum 4 characters</span>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2A2E37]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
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
            ) : mode === 'login' ? (
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
    </Modal>
  );
}
