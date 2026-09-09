import type { Metadata } from "next";
import Script from "next/script";
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
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full bg-[var(--bg-app)] text-[var(--text-primary)] selection:bg-[#5B7FFF]/30 overflow-hidden">
        <Script id="theme-init" strategy="beforeInteractive">
          {`
              (() => {
                try {
                  const saved = localStorage.getItem('taskra-theme');
                  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
                  const theme = saved || (prefersLight ? 'light' : 'dark');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (error) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `}
        </Script>
        {children}
      </body>
    </html>
  );
}
