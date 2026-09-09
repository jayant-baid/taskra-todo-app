"use client";

import React, { useState } from "react";
import { CalendarDays, Repeat, Plus, Pencil } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ComputedOccurrence } from "@/lib/engine/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { getLocalDateString } from "@/lib/engine/dateUtils";

export interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: {
    title: string;
    description?: string;
    isRecurring: boolean;
    recurrenceRule?: "daily" | "weekly";
    startDate?: string;
  }) => Promise<unknown>;
  taskToEdit?: ComputedOccurrence | null;
}

export function AddTaskModal({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
}: AddTaskModalProps) {
  const today = getLocalDateString();

  const [title, setTitle] = useState(taskToEdit?.title || "");
  const [description, setDescription] = useState(taskToEdit?.description || "");
  const [isRecurring, setIsRecurring] = useState(
    taskToEdit?.isRecurring || false,
  );
  const [recurrenceRule, setRecurrenceRule] = useState<"daily" | "weekly">(
    taskToEdit?.recurrenceRule === "weekly" ? "weekly" : "daily",
  );
  const [startDate, setStartDate] = useState(taskToEdit?.startDate || today);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSave({
        title,
        description: description.trim() || undefined,
        isRecurring,
        recurrenceRule: isRecurring ? recurrenceRule : undefined,
        startDate: isRecurring ? startDate : today,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setIsRecurring(false);
      setRecurrenceRule("daily");
      setStartDate(today);
      onClose();
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? "Edit Task" : "Create New Task"}
      subtitle={
        taskToEdit
          ? "Save a new version while preserving the previous task history"
          : "Define a one-off daily task or an indefinite recurring routine"
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="task-title"
            className="text-xs font-semibold text-[#8B92A3]"
          >
            Title <span className="text-[#FF6B6B]">*</span>
          </label>
          <Input
            id="task-title"
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Audit cache invalidation logic"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="task-description"
            className="text-xs font-semibold text-[#8B92A3]"
          >
            Description{" "}
            <span className="text-[#5C6272] font-normal">(optional)</span>
          </label>
          <Textarea
            id="task-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Context, requirements, or links..."
          />
        </div>

        {/* Recurring Toggle Switch */}
        <div className="flex items-center justify-between p-3 bg-[var(--bg-app)] border border-[var(--border-subtle)] rounded-[6px]">
          <div className="flex items-center gap-2">
            <Repeat
              size={15}
              className={
                isRecurring
                  ? "text-[var(--accent-primary)]"
                  : "text-[var(--text-secondary)]"
              }
            />
            <div>
              <div className="text-xs font-medium text-[var(--text-primary)]">
                Recurring Task
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
                {isRecurring
                  ? "Runs indefinitely from start date. Each day has its own independent status."
                  : "Carries forward each day automatically until completed."}
              </div>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isRecurring}
            onClick={() => setIsRecurring(!isRecurring)}
            className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer border ${
              isRecurring
                ? "bg-[#5B7FFF] border-[#5B7FFF]"
                : "bg-[#1C1F26] border-[#383E4C]"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                isRecurring ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Recurrence Options if Recurring is enabled */}
        {isRecurring && (
          <div className="flex flex-col gap-3 p-3 bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] rounded-[6px] animate-in fade-in duration-100">
            <div className="grid grid-cols-2 gap-3">
              {/* Frequency */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8B92A3]">
                  Recurrence Rule
                </label>
                <Select
                  value={recurrenceRule}
                  onValueChange={(value) =>
                    setRecurrenceRule(value as "daily" | "weekly")
                  }
                >
                  <SelectTrigger aria-label="Recurrence rule">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily (Every day)</SelectItem>
                    <SelectItem value="weekly">
                      Weekly (Once per week)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8B92A3]">
                  Start Date
                </label>
                <Popover
                  open={isDatePickerOpen}
                  onOpenChange={setIsDatePickerOpen}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex h-9 w-full items-center justify-between gap-2 rounded-[3px] border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 text-left text-xs text-[var(--text-primary)] transition-colors hover:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]/30"
                      aria-label="Choose task start date"
                    >
                      <span>
                        {format(parseISO(startDate), "EEE, MMM d, yyyy")}
                      </span>
                      <CalendarDays
                        size={14}
                        className="shrink-0 text-[var(--accent-primary)]"
                      />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={parseISO(startDate)}
                      onSelect={(date) => {
                        if (!date) return;
                        setStartDate(format(date, "yyyy-MM-dd"));
                        setIsDatePickerOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <p className="text-[11px] text-[#8B92A3] leading-tight">
              No end date. Will run indefinitely until deleted from a future
              date.
            </p>
          </div>
        )}

        {/* Footer */}
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
            disabled={!title.trim() || isSubmitting}
            className="gap-1.5"
          >
            {taskToEdit ? <Pencil size={14} /> : <Plus size={14} />}
            <span>
              {isSubmitting
                ? "Saving..."
                : taskToEdit
                  ? "Save Changes"
                  : "Create Task"}
            </span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
