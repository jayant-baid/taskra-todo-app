"use client";

import React, { useEffect } from "react";

interface ResizableDividerProps {
  onResize: (clientX: number) => void;
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
}

export function ResizableDivider({
  onResize,
  isDragging,
  setIsDragging,
}: ResizableDividerProps) {
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onResize(e.clientX);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, onResize, setIsDragging]);

  return (
    <div
      onMouseDown={() => setIsDragging(true)}
      className={`
        hidden md:flex
        w-1 shrink-0
        cursor-col-resize
        justify-center
        bg-[#2A2E37]
        hover:bg-[#5B7FFF]
        transition-colors
        ${isDragging ? "bg-[#5B7FFF]" : ""}
      `}
      aria-label="Resize panels"
      role="separator"
      aria-orientation="vertical"
    >
      <div className="w-px h-full bg-[#383E4C]" />
    </div>
  );
}
