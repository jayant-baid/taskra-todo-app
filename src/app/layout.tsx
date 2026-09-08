import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taskra – Smart Task & Productivity Manager",
  description:
    "Stay organized with Taskra — manage recurring tasks, carry-forward to-dos, weekly progress, and task history in one simple productivity app.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-[#14161A]">
      <body className="h-full bg-[#14161A] text-[#E4E6EB] selection:bg-[#5B7FFF]/30 overflow-hidden">
        {children}
      </body>
    </html>
  );
}
