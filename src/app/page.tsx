"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  LogIn,
  LogOut,
  CloudCheck,
  CheckSquare,
  BarChart2,
  SunMedium,
  MoonStar,
  ShieldCheck,
} from "lucide-react";
import { useTasks } from "@/lib/hooks/useTasks";
import { useAuthInternal } from "@/lib/hooks/useAuth";
import { TaskRail } from "@/components/task-rail/TaskRail";
import { CalendarDock } from "@/components/calendar-dock/CalendarDock";
import { AddTaskModal } from "@/components/task-rail/AddTaskModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { Button } from "@/components/ui/Button";

export default function Home() {
  const {
    todayStr,
    tomorrowStr,
    todayOccurrences,
    tomorrowOccurrences,
    weekSummaries,
    activeMonthStr,
    monthlyData,
    analytics,
    isLoading: isTasksLoading,
    addTask,
    editTask,
    toggleOccurrence,
    deleteTask,
    removeAllTasks,
    syncWithServer,
    clearLocalTasks,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
  } = useTasks();

  const {
    user,
    isLoading: isAuthLoading,
    login,
    register,
    logout,
    oauthError,
    clearOauthError,
  } = useAuthInternal();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRemoveAllModalOpen, setIsRemoveAllModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<
    import("@/lib/engine/types").ComputedOccurrence | null
  >(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileTab, setMobileTab] = useState<"tasks" | "analytics">("tasks");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const savedTheme = window.localStorage.getItem("taskra-theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
        return;
      }

      if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        setTheme("light");
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("taskra-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  // Open Auth Modal if OAuth returned an error
  useEffect(() => {
    if (oauthError) {
      const t = setTimeout(() => setIsAuthModalOpen(true), 0);
      return () => clearTimeout(t);
    }
  }, [oauthError]);

  // Global keyboard shortcut: 'N' to open Add Task modal (when not typing in an input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        setIsAddModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleConfirmRemoveAll = async () => {
    try {
      setIsRemoving(true);
      await removeAllTasks();
      setIsRemoveAllModalOpen(false);
    } finally {
      setIsRemoving(false);
    }
  };

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      await clearLocalTasks();
      setIsLogoutModalOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleAuthSuccess = async () => {
    await syncWithServer();
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)]">
      {/* Top Cockpit Header */}
      <header className="h-12 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 sm:px-5 flex items-center justify-between shrink-0 select-none shadow-[0_1px_0_rgba(15,23,42,0.02)]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Image
              src="/logo_1024.png"
              alt="Taskra"
              width={26}
              height={26}
              className="rounded-lg"
            />
            <h1 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
              Taskra
            </h1>
          </div>
          <span className="text-[var(--border-strong)] hidden sm:inline">
            |
          </span>
          <span className="text-xs text-[var(--text-secondary)] hidden lg:inline-block">
            Plan. Focus. Complete.
          </span>
        </div>

        {/* System, Auth, and Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Remove All Data Button (triggers confirmation popup) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[3px] cursor-pointer border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <SunMedium size={14} />
            ) : (
              <MoonStar size={14} />
            )}
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRemoveAllModalOpen(true)}
            className="text-xs text-[#8B92A3] hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10 gap-1.5"
            title="Remove all current and upcoming tasks"
          >
            <Trash2 size={13} />
            <span className="hidden lg:inline">Remove All Data</span>
          </Button>

          {/* New Task Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-1.5"
          >
            <Plus size={14} />
            <span className="hidden lg:inline">New Task</span>
            <span className="hidden md:inline text-[10px] bg-white/20 px-1 py-0.2 rounded font-mono">
              Ctrl+N
            </span>
          </Button>

          {/* User Auth Status / Sign In Button */}
          {!isAuthLoading && (
            <>
              {user ? (
                <div className="flex items-center gap-1.5 bg-[#14161A] px-2 sm:px-2.5 py-1 rounded-[2px] border border-[#2A2E37] text-xs">
                  <span
                    className="flex items-center gap-1 text-[var(--text-green)]"
                    title="Synced with server database"
                  >
                    <CloudCheck size={13} />
                  </span>
                  <span
                    className="text-[#E4E6EB] font-medium max-w-[100px] truncate"
                    title={`Signed in as ${user.username}`}
                  >
                    {user.username}
                  </span>
                  {user.role === "admin" && (
                    <a
                      href="/admin"
                      title="Open admin console"
                      className="text-[var(--accent-primary)] hover:text-white"
                    >
                      <ShieldCheck size={13} />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsLogoutModalOpen(true)}
                    title="Log out from this device"
                    className="ml-1 text-[#8B92A3] hover:text-[#FF6B6B] transition-colors cursor-pointer"
                  >
                    <LogOut size={12} />
                  </button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs gap-1.5 text-[#E4E6EB] hover:text-white"
                  title="Sign in or register to sync data between mobile and desktop"
                >
                  <LogIn size={12} className="text-[#5B7FFF]" />
                  <span>Sign In</span>
                </Button>
              )}
            </>
          )}
        </div>
      </header>

      {/* Mobile Tab Switcher for small screens (< md) */}
      <div className="flex md:hidden bg-[#1C1F26] border-b border-[#2A2E37] p-1.5">
        <div className="grid grid-cols-2 w-full gap-1">
          <button
            type="button"
            onClick={() => setMobileTab("tasks")}
            className={`py-1.5 text-xs font-semibold rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              mobileTab === "tasks"
                ? "bg-[#14161A] text-[#E4E6EB] border border-[#2A2E37]"
                : "text-[#8B92A3] hover:text-[#E4E6EB]"
            }`}
          >
            <CheckSquare size={13} />
            <span>Today & Tomorrow</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("analytics")}
            className={`py-1.5 text-xs font-semibold rounded-[2px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              mobileTab === "analytics"
                ? "bg-[#14161A] text-[#E4E6EB] border border-[#2A2E37]"
                : "text-[#8B92A3] hover:text-[#E4E6EB]"
            }`}
          >
            <BarChart2 size={13} />
            <span>Weekly & Analytics</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Rail Split Screen */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left Rail: Task List (Today & Tomorrow) */}
        <section
          className={`w-full md:w-[460px] lg:w-[500px] shrink-0 border-b md:border-b-0 md:border-r border-[var(--border-subtle)] bg-[var(--bg-app)] p-4 flex-col min-h-0 ${
            mobileTab === "tasks" ? "flex flex-1" : "hidden md:flex"
          }`}
        >
          {isTasksLoading ? (
            <div className="flex items-center justify-center h-full text-xs text-[#8B92A3]">
              Loading local store...
            </div>
          ) : (
            <TaskRail
              todayStr={todayStr}
              tomorrowStr={tomorrowStr}
              todayOccurrences={todayOccurrences}
              tomorrowOccurrences={tomorrowOccurrences}
              onToggle={toggleOccurrence}
              onDelete={deleteTask}
              onEdit={(occurrence) => {
                setEditingTask(occurrence);
                setIsAddModalOpen(true);
              }}
              onOpenAddModal={() => {
                setEditingTask(null);
                setIsAddModalOpen(true);
              }}
              carryOverCount={analytics.carryOverCount}
            />
          )}
        </section>

        {/* <ResizableDivider
          onResize={handleResize}
          isDragging={isDragging}
          setIsDragging={setIsDragging}
        /> */}

        {/* Right Dock: Calendar & Performance Analytics */}
        <section
          className={`flex-1 bg-[var(--bg-app)] p-4 sm:p-5 flex-col min-h-0 overflow-y-auto ${
            mobileTab === "analytics" ? "flex flex-1" : "hidden md:flex"
          }`}
        >
          <CalendarDock
            weekSummaries={weekSummaries}
            analytics={analytics}
            activeMonthStr={activeMonthStr}
            monthlyData={monthlyData}
            onPrevWeek={goToPreviousWeek}
            onNextWeek={goToNextWeek}
            onCurrentWeek={goToCurrentWeek}
            onPrevMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onCurrentMonth={goToCurrentMonth}
            onSelectToday={() => {
              goToCurrentWeek();
              setMobileTab("tasks");
            }}
          />
        </section>
      </main>

      {/* Add Task Modal */}
      <AddTaskModal
        key={`${isAddModalOpen}-${editingTask?.taskDefinitionId || "new"}`}
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTask(null);
        }}
        onSave={
          editingTask
            ? (params) => editTask(editingTask.taskDefinitionId, params)
            : addTask
        }
        taskToEdit={editingTask}
      />

      {/* Remove All Data Confirmation Modal */}
      <ConfirmModal
        isOpen={isRemoveAllModalOpen}
        onClose={() => setIsRemoveAllModalOpen(false)}
        onConfirm={handleConfirmRemoveAll}
        title="Remove All Data"
        description="Are you sure you want to remove all tasks? This will delete all today's tasks and upcoming recurring routines. Past completed history will remain preserved in your calendar records."
        confirmText="Remove All Tasks"
        cancelText="Cancel"
        isLoading={isRemoving}
      />

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Log out of Taskra?"
        description="Are you sure you want to log out? Your local tasks will be cleared from this device, while synced data remains available when you sign in again."
        confirmText="Log Out"
        loadingText="Logging out..."
        isLoading={isLoggingOut}
      />

      {/* Authentication Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          clearOauthError();
        }}
        initialError={oauthError}
        onSuccess={handleAuthSuccess}
        login={login}
        register={register}
      />
    </div>
  );
}
