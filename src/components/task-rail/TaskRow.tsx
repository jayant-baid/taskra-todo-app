'use client';

import React, { useState } from 'react';
import { Check, Repeat, Trash2, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { ComputedOccurrence } from '@/lib/engine/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface TaskRowProps {
  occurrence: ComputedOccurrence;
  onToggle: (taskDefId: string, dateStr: string) => void;
  onDelete: (taskDefId: string) => void;
  isReadOnly?: boolean;
}

export function TaskRow({ occurrence, onToggle, onDelete, isReadOnly = false }: TaskRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const isCompleted = occurrence.status === 'completed';

  return (
    <div
      className={cn(
        'group flex flex-col border-b border-[#2A2E37]/80 hover:bg-[#222630]/60 transition-colors duration-150 py-2 px-3',
        isCompleted && 'opacity-65'
      )}
    >
      <div className="flex items-center justify-between gap-2.5">
        {/* Checkbox and Title */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {!isReadOnly ? (
            <button
              type="button"
              onClick={() => onToggle(occurrence.taskDefinitionId, occurrence.date)}
              className={cn(
                'w-4 h-4 rounded-[2px] border flex items-center justify-center transition-all cursor-pointer shrink-0',
                isCompleted
                  ? 'bg-[#3DD68C] border-[#3DD68C] text-[#14161A]'
                  : 'border-[#383E4C] hover:border-[#5B7FFF] bg-[#14161A]'
              )}
              aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
            >
              {isCompleted && <Check size={11} strokeWidth={3.5} />}
            </button>
          ) : (
            <div
              className={cn(
                'w-3.5 h-3.5 rounded-[2px] flex items-center justify-center shrink-0',
                isCompleted
                  ? 'bg-[#3DD68C]/20 text-[#3DD68C] border border-[#3DD68C]/40'
                  : 'bg-[#E8B339]/20 text-[#E8B339] border border-[#E8B339]/40'
              )}
            >
              {isCompleted ? <Check size={10} strokeWidth={3} /> : <div className="w-1.5 h-1.5 bg-[#E8B339] rounded-full" />}
            </div>
          )}

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  'text-[13px] font-medium leading-tight select-text truncate',
                  isCompleted ? 'line-through text-[#8B92A3]' : 'text-[#E4E6EB]'
                )}
                title={occurrence.title}
              >
                {occurrence.title}
              </span>

              {/* Recurrence Badge */}
              {occurrence.isRecurring && (
                <Badge variant="recurring" className="gap-1">
                  <Repeat size={10} />
                  <span>{occurrence.recurrenceRule || 'daily'}</span>
                </Badge>
              )}

              {/* Carry-over Age Badge for non-recurring tasks */}
              {!occurrence.isRecurring && occurrence.daysOld > 0 && (
                <Badge
                  variant={occurrence.daysOld >= 3 ? 'danger' : 'pending'}
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
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {occurrence.description && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-[#8B92A3] hover:text-[#E4E6EB]"
              onClick={() => setIsExpanded(!isExpanded)}
              title="Toggle notes"
            >
              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </Button>
          )}

          {!isReadOnly && (
            <>
              {isConfirmingDelete ? (
                <div className="flex items-center gap-1 bg-[#14161A] p-0.5 border border-[#FF6B6B]/40 rounded-[3px]">
                  <span className="text-[10px] text-[#FF6B6B] px-1 font-medium">Delete?</span>
                  <button
                    type="button"
                    onClick={() => onDelete(occurrence.taskDefinitionId)}
                    className="text-[10px] bg-[#FF6B6B] text-white px-1.5 py-0.5 rounded-[2px] font-medium hover:bg-red-600 cursor-pointer"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="text-[10px] text-[#8B92A3] hover:text-white px-1 py-0.5 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-[#8B92A3] hover:text-[#FF6B6B]"
                  onClick={() => setIsConfirmingDelete(true)}
                  title={occurrence.isRecurring ? 'Delete recurring task from today onward' : 'Delete task'}
                >
                  <Trash2 size={13} />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Expandable description */}
      {isExpanded && occurrence.description && (
        <div className="mt-1.5 pl-6 pr-2 text-xs text-[#8B92A3] leading-relaxed border-l-2 border-[#2A2E37] ml-2">
          {occurrence.description}
        </div>
      )}
    </div>
  );
}
