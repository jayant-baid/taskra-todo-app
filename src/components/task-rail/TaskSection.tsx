'use client';

import React from 'react';
import { ComputedOccurrence } from '@/lib/engine/types';
import { TaskRow } from './TaskRow';
import { Badge } from '@/components/ui/Badge';

export interface TaskSectionProps {
  title: string;
  subtitle?: string;
  occurrences: ComputedOccurrence[];
  onToggle: (taskDefId: string, dateStr: string) => void;
  onDelete: (taskDefId: string) => void;
  emptyText?: string;
}

export function TaskSection({
  title,
  subtitle,
  occurrences,
  onToggle,
  onDelete,
  emptyText = 'No tasks scheduled',
}: TaskSectionProps) {
  const completedCount = occurrences.filter((o) => o.status === 'completed').length;
  const totalCount = occurrences.length;

  return (
    <div className="flex flex-col border border-[#2A2E37] bg-[#1C1F26] rounded-[3px] overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#222630]/60 border-b border-[#2A2E37]">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-[#E4E6EB] tracking-tight">{title}</span>
          {subtitle && <span className="text-[11px] text-[#8B92A3]">({subtitle})</span>}
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant={completedCount === totalCount && totalCount > 0 ? 'completed' : 'neutral'}>
            {completedCount}/{totalCount}
          </Badge>
        </div>
      </div>

      {/* Task List */}
      <div className="flex flex-col divide-y divide-[#2A2E37]/40">
        {occurrences.length === 0 ? (
          <div className="py-6 px-4 text-center text-xs text-[#8B92A3] italic">{emptyText}</div>
        ) : (
          occurrences.map((occ) => (
            <TaskRow
              key={occ.id}
              occurrence={occ}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
