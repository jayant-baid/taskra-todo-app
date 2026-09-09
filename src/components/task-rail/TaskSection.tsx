"use client";

import React from "react";
import { ComputedOccurrence } from "@/lib/engine/types";
import { TaskRow } from "./TaskRow";
import { Badge } from "@/components/ui/Badge";

export interface TaskSectionProps {
  title: string;
  subtitle?: string;
  occurrences: ComputedOccurrence[];
  onToggle: (taskDefId: string, dateStr: string) => void;
  onDelete: (taskDefId: string) => void;
  onEdit: (occurrence: ComputedOccurrence) => void;
  emptyText?: string;
  isReadOnly?: boolean;
}

export function TaskSection({
  title,
  subtitle,
  occurrences,
  onToggle,
  onDelete,
  onEdit,
  emptyText = "No tasks scheduled",
  isReadOnly = false,
}: TaskSectionProps) {
  const completedCount = occurrences.filter(
    (o) => o.status === "completed",
  ).length;
  const totalCount = occurrences.length;

  return (
    <div className="flex flex-col border border-[var(--border-subtle)] bg-[var(--bg-surface)] rounded-[6px] overflow-hidden shadow-[0_1px_0_rgba(15,23,42,0.02)]">
      {/* Section Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[var(--bg-surface-subtle)] border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight">
            {title}
          </span>
          {subtitle && (
            <span className="text-[11px] text-[var(--text-secondary)]">
              ({subtitle})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Badge
            variant={
              completedCount === totalCount && totalCount > 0
                ? "completed"
                : "neutral"
            }
          >
            {completedCount}/{totalCount}
          </Badge>
        </div>
      </div>

      {/* Task List */}
      <div className="flex flex-col divide-y divide-[var(--border-subtle)]/80">
        {occurrences.length === 0 ? (
          <div className="py-6 px-4 text-center text-xs text-[var(--text-secondary)] italic">
            {emptyText}
          </div>
        ) : (
          occurrences.map((occ) => (
            <TaskRow
              key={occ.id}
              occurrence={occ}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              isReadOnly={isReadOnly}
            />
          ))
        )}
      </div>
    </div>
  );
}
