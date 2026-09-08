'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Light-dismiss if clicking the backdrop outside the dialog box
        const rect = e.currentTarget.getBoundingClientRect();
        const isInDialog =
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width;
        if (!isInDialog) {
          onClose();
        }
      }}
      className={cn(
        'm-auto p-0 bg-[#1C1F26] text-[#E4E6EB] border border-[#2A2E37] rounded-[4px] shadow-2xl overflow-hidden w-full focus:outline-none animate-in fade-in zoom-in-95 duration-100',
        maxWidth
      )}
    >
      <div className="flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#2A2E37] bg-[#1C1F26]">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-[#E4E6EB]">{title}</h3>
            {subtitle && <p className="text-xs text-[#8B92A3] mt-0.5">{subtitle}</p>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-[#8B92A3] hover:text-[#E4E6EB] h-6 w-6"
          >
            <X size={15} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}
