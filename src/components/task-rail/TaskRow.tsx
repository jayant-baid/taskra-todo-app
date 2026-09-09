"use client";

import React, { useState } from "react";
import {
  Check,
  Repeat,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Pencil,
} from "lucide-react";
import { ComputedOccurrence } from "@/lib/engine/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { cn } from "@/lib/utils";

export interface TaskRowProps {
  occurrence: ComputedOccurrence;
  onToggle: (taskDefId: string, dateStr: string) => void;
  onDelete: (taskDefId: string) => void;
  onEdit?: (occurrence: ComputedOccurrence) => void;
  isReadOnly?: boolean;
}

export function TaskRow({
  occurrence,
  onToggle,
  onDelete,
  onEdit,
  isReadOnly = false,
}: TaskRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isCompleted = occurrence.status === "completed";

  return (
    <div
      className={cn(
        "group flex flex-col border-b border-[var(--border-subtle)] hover:bg-[var(--bg-surface-subtle)] transition-colors duration-150 py-2 px-3",
        isCompleted && "opacity-65",
      )}
    >
      <div className="flex items-center justify-between gap-2.5">
        {/* Checkbox and Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {!isReadOnly ? (
            <button
              type="button"
              onClick={() =>
                onToggle(occurrence.taskDefinitionId, occurrence.date)
              }
              className={cn(
                "w-4 h-4 rounded-[2px] border flex items-center justify-center transition-all cursor-pointer shrink-0",
                isCompleted
                  ? "bg-[var(--status-completed)] border-[var(--status-completed)] text-[var(--bg-app)]"
                  : "border-[var(--border-strong)] hover:border-[var(--accent-primary)] bg-[var(--bg-app)]",
              )}
              aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
            >
              {isCompleted && <Check size={11} strokeWidth={3.5} />}
            </button>
          ) : (
            <div
              className={cn(
                "w-3.5 h-3.5 rounded-[2px] flex items-center justify-center shrink-0",
                isCompleted
                  ? "bg-[var(--text-green)]/20 text-[var(--text-green)] border border-[var(--text-green)]/40"
                  : "bg-[var(--status-pending)]/20 text-[var(--status-pending)] border border-[var(--status-pending)]/40",
              )}
            >
              {isCompleted ? (
                <Check size={10} strokeWidth={3} />
              ) : (
                <div className="w-1.5 h-1.5 bg-[var(--status-pending)] rounded-full" />
              )}
            </div>
          )}

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "text-[13px] font-medium leading-tight select-text truncate",
                  isCompleted
                    ? "line-through text-[var(--text-secondary)]"
                    : "text-[var(--text-primary)]",
                )}
                title={occurrence.title}
              >
                {occurrence.title}
              </span>

              {/* Recurrence Badge */}
              {occurrence.isRecurring && (
                <Badge variant="recurring" className="gap-1">
                  <Repeat size={10} />
                  <span>{occurrence.recurrenceRule || "daily"}</span>
                </Badge>
              )}

              {/* Carry-over Age Badge for non-recurring tasks */}
              {!occurrence.isRecurring && occurrence.daysOld > 0 && (
                <Badge
                  variant={occurrence.daysOld >= 3 ? "danger" : "pending"}
                  className="gap-1 font-mono"
                  title={`Carried forward from original creation day (${occurrence.daysOld} days ago)`}
                >
                  <Calendar size={10} />
                  <span>{occurrence.daysOld}d old</span>
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {occurrence.description && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              onClick={() => setIsExpanded(!isExpanded)}
              title="Toggle notes"
            >
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </Button>
          )}

          {!isReadOnly && (
            <>
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-[#5B7FFF] bg-[#5B7FFF]/10 border border-[#5B7FFF]/30 hover:bg-[#5B7FFF]/20 hover:border-[#5B7FFF]/60"
                  onClick={() => onEdit(occurrence)}
                  title="Edit task"
                  aria-label="Edit task"
                >
                  <Pencil size={14} strokeWidth={2.5} />
                </Button>
              )}
              <Button
                variant="danger-ghost"
                size="icon"
                className="h-7 w-7 border border-[#FF6B6B]/30"
                onClick={() => setIsConfirmingDelete(true)}
                title={
                  occurrence.isRecurring
                    ? "Delete recurring task from today onward"
                    : "Delete task"
                }
                aria-label={
                  occurrence.isRecurring
                    ? "Delete recurring task from today onward"
                    : "Delete task"
                }
              >
                <Trash2 size={13} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Expandable description */}
      {isExpanded && occurrence.description && (
        <div className="mt-1.5 pl-6 pr-2 text-xs text-[var(--text-secondary)] leading-relaxed border-l-2 border-[var(--border-subtle)] ml-2">
          {occurrence.description}
        </div>
      )}

      <ConfirmModal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={async () => {
          await onDelete(occurrence.taskDefinitionId);
          setIsConfirmingDelete(false);
        }}
        title="Delete this task?"
        description={
          occurrence.isRecurring
            ? `Are you sure you want to delete "${occurrence.title}"? This is a ${occurrence.recurrenceRule || "daily"} recurring task, so it will stop appearing from today onward. Previous history will be preserved.`
            : `Are you sure you want to delete "${occurrence.title}"? This task will be removed from your active list, while its previous history is preserved.`
        }
        confirmText="Delete Task"
      />
    </div>
  );
}
