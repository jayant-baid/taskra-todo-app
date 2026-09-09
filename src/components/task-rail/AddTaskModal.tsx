"use client";

import React, { useState } from "react";
import { Repeat, Plus, Pencil } from "lucide-react";
import { ComputedOccurrence } from "@/lib/engine/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
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
          <input
            id="task-title"
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Audit cache invalidation logic"
            className="w-full px-3 py-2 text-sm bg-[#14161A] border border-[#2A2E37] rounded-[3px] text-[#E4E6EB] placeholder-[#5C6272] focus:outline-none focus:border-[#5B7FFF]"
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
          <textarea
            id="task-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Context, requirements, or links..."
            className="w-full px-3 py-2 text-sm bg-[#14161A] border border-[#2A2E37] rounded-[3px] text-[#E4E6EB] placeholder-[#5C6272] focus:outline-none focus:border-[#5B7FFF] resize-none"
          />
        </div>

        {/* Recurring Toggle Switch */}
        <div className="flex items-center justify-between p-3 bg-[#14161A] border border-[#2A2E37] rounded-[3px]">
          <div className="flex items-center gap-2">
            <Repeat
              size={15}
              className={isRecurring ? "text-[#5B7FFF]" : "text-[#8B92A3]"}
            />
            <div>
              <div className="text-xs font-medium text-[#E4E6EB]">
                Recurring Task
              </div>
              <div className="text-[11px] text-[#8B92A3]">
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
          <div className="flex flex-col gap-3 p-3 bg-[#14161A]/60 border border-[#2A2E37] rounded-[3px] animate-in fade-in duration-100">
            <div className="grid grid-cols-2 gap-3">
              {/* Frequency */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8B92A3]">
                  Recurrence Rule
                </label>
                <select
                  value={recurrenceRule}
                  onChange={(e) =>
                    setRecurrenceRule(e.target.value as "daily" | "weekly")
                  }
                  className="px-2.5 py-1.5 text-xs bg-[#1C1F26] border border-[#2A2E37] rounded-[3px] text-[#E4E6EB] focus:outline-none focus:border-[#5B7FFF] cursor-pointer"
                >
                  <option value="daily">Daily (Every day)</option>
                  <option value="weekly">Weekly (Once per week)</option>
                </select>
              </div>

              {/* Start Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#8B92A3]">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-[#1C1F26] border border-[#2A2E37] rounded-[3px] text-[#E4E6EB] focus:outline-none focus:border-[#5B7FFF] cursor-pointer"
                  />
                </div>
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
