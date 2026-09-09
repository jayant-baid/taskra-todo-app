"use client";

import React from "react";
import { ShieldAlert, CheckCircle2, XCircle } from "lucide-react";
import { DaySummary } from "@/lib/engine/types";
import { Modal } from "@/components/ui/Modal";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatFullDate } from "@/lib/engine/dateUtils";
import { TaskRow } from "@/components/task-rail/TaskRow";

export interface PastDayModalProps {
  daySummary: DaySummary | null;
  onClose: () => void;
}

export function PastDayModal({ daySummary, onClose }: PastDayModalProps) {
  if (!daySummary) return null;

  const completedOccurrences = daySummary.occurrences.filter(
    (o) => o.status === "completed",
  );
  const missedOccurrences = daySummary.occurrences.filter(
    (o) => o.status !== "completed",
  );

  return (
    <Modal
      isOpen={Boolean(daySummary)}
      onClose={onClose}
      title={`Historical Record — ${daySummary.dayName}, ${daySummary.monthName} ${daySummary.dayNumber}`}
      subtitle={formatFullDate(daySummary.date)}
      maxWidth="max-w-xl"
    >
      <div className="flex flex-col gap-4">
        {/* Read-only Banner (§3.4) */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#222630] border border-[#2A2E37] rounded-[3px] text-xs text-[#8B92A3]">
          <ShieldAlert size={14} className="text-[#8B92A3] shrink-0" />
          <span>
            <strong>Read-only history:</strong> Historical occurrences are
            locked to preserve an accurate record of completion and roll-forward
            history.
          </span>
        </div>

        {/* Day Metrics Overview */}
        <div className="p-3.5 bg-[#14161A] border border-[#2A2E37] rounded-[3px] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8B92A3]">Completion Score:</span>
            <span className="font-semibold tabular-nums text-[#E4E6EB]">
              {daySummary.completedCount} / {daySummary.totalCount} completed (
              {daySummary.completionPercentage}%)
            </span>
          </div>
          <ProgressBar
            completed={daySummary.completedCount}
            total={daySummary.totalCount}
            showPercentage={false}
          />
        </div>

        {/* Section 1: Completed Occurrences */}
        <div className="flex flex-col border border-[#2A2E37] rounded-[3px] overflow-hidden bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-surface-subtle)] border-b border-[#2A2E37]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-green)]">
              <CheckCircle2 size={13} />
              <span>Completed ({completedOccurrences.length})</span>
            </div>
          </div>
          <div className="flex flex-col divide-y divide-[#2A2E37]/40">
            {completedOccurrences.length === 0 ? (
              <div className="py-3 px-4 text-xs text-[#8B92A3] italic">
                No tasks completed on this day.
              </div>
            ) : (
              completedOccurrences.map((occ) => (
                <TaskRow
                  key={occ.id}
                  occurrence={occ}
                  onToggle={() => {}}
                  onDelete={() => {}}
                  isReadOnly={true}
                />
              ))
            )}
          </div>
        </div>

        {/* Section 2: Missed / Uncompleted Occurrences */}
        <div className="flex flex-col border border-[#2A2E37] rounded-[3px] overflow-hidden bg-[var(--bg-surface)]">
          <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-surface-subtle)] border-b border-[#2A2E37]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--status-pending)]">
              <XCircle size={13} />
              <span>Missed / Pending ({missedOccurrences.length})</span>
            </div>
          </div>
          <div className="flex flex-col divide-y divide-[#2A2E37]/40">
            {missedOccurrences.length === 0 ? (
              <div className="py-3 px-4 text-xs text-[var(--text-green)] italic">
                100% completed — no missed tasks!
              </div>
            ) : (
              missedOccurrences.map((occ) => (
                <TaskRow
                  key={occ.id}
                  occurrence={occ}
                  onToggle={() => {}}
                  onDelete={() => {}}
                  isReadOnly={true}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
