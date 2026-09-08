import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Taskra – Recurring Task Engine',
  description: 'Cross-device recurring task manager with roll-forward daily tasks, weekly analytics, and real-time sync.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
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
