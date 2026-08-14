import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MoodSnap - Role-Based Mood Tracking',
  description: 'Log and monitor daily emotional states with Next.js, FastAPI, and Supabase.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#0b0f19] text-gray-100 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
