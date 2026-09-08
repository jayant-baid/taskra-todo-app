import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Recurring Tasks & Daily Operations',
  description: 'Local-first recurring to-do application with roll-forward daily tasks, weekly analytics, and cross-tab synchronization.',
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
