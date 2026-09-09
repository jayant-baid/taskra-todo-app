"use client";

import React from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  loadingText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm Remove",
  loadingText = "Removing...",
  cancelText = "Cancel",
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        {/* Warning card */}
        <div className="flex items-start gap-3 p-3.5 bg-[rgba(255,107,107,0.08)] border border-[rgba(255,107,107,0.25)] rounded-[3px]">
          <AlertTriangle size={18} className="text-[#FF6B6B] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-xs leading-relaxed text-[#E4E6EB]">
            <span>{description}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2A2E37]">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-1.5"
          >
            <Trash2 size={13} />
            <span>{isLoading ? loadingText : confirmText}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
