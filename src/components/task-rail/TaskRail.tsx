'use client';

import React from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { ComputedOccurrence } from '@/lib/engine/types';
import { TaskSection } from './TaskSection';
import { Button } from '@/components/ui/Button';
import { formatDisplayDate } from '@/lib/engine/dateUtils';

export interface TaskRailProps {
  todayStr: string;
  tomorrowStr: string;
  todayOccurrences: ComputedOccurrence[];
  tomorrowOccurrences: ComputedOccurrence[];
  onToggle: (taskDefId: string, dateStr: string) => void;
  onDelete: (taskDefId: string) => void;
  onOpenAddModal: () => void;
  carryOverCount: number;
}

export function TaskRail({
  todayStr,
  tomorrowStr,
  todayOccurrences,
  tomorrowOccurrences,
  onToggle,
  onDelete,
  onOpenAddModal,
  carryOverCount,
}: TaskRailProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto pr-1">
      {/* Rail Top Action Bar */}
      <div className="flex items-center justify-between pb-4 pt-1">
        <div className="flex flex-col">
          <h2 className="text-base font-semibold text-[#E4E6EB] tracking-tight">Daily Tasks</h2>
          <span className="text-xs text-[#8B92A3]">
            {formatDisplayDate(todayStr)} &middot; Local device timezone
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenAddModal}
          className="gap-1.5 shadow-sm"
          title="Create task (Shortcut: N)"
        >
          <Plus size={14} />
          <span>Add New Task</span>
        </Button>
      </div>

      {/* Carry-over notice if any */}
      {carryOverCount > 0 && (
        <div className="mb-3.5 flex items-center gap-2 p-2.5 bg-[rgba(232,179,57,0.08)] border border-[rgba(232,179,57,0.25)] rounded-[3px] text-xs text-[#E8B339]">
          <AlertCircle size={14} className="shrink-0" />
          <span>
            <strong>{carryOverCount} task{carryOverCount > 1 ? 's' : ''}</strong> rolled forward from previous days awaiting completion.
          </span>
        </div>
      )}

      {/* Today Section */}
      <div className="flex flex-col gap-4">
        <TaskSection
          title="Today"
          subtitle={formatDisplayDate(todayStr)}
          occurrences={todayOccurrences}
          onToggle={onToggle}
          onDelete={onDelete}
          emptyText="No tasks scheduled for today. Create one with [+ Add New Task]."
        />

        {/* Tomorrow Section */}
        <TaskSection
          title="Tomorrow"
          subtitle={formatDisplayDate(tomorrowStr)}
          occurrences={tomorrowOccurrences}
          onToggle={onToggle}
          onDelete={onDelete}
          emptyText="No tasks scheduled for tomorrow."
        />
      </div>
    </div>
  );
}
