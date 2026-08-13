import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from '../context/Providers';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'EarnX - Multi-Level Marketing Platform',
  description: 'High-integrity MLM network with multi-level commission payouts and real-time transaction ledger.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col bg-[#F8FBFF] text-slate-900 overflow-x-hidden">
        <Providers>
          <Toaster position="top-right" richColors closeButton />
          <Navbar />
          <div className="flex-1 flex w-full pb-20 lg:pb-8">
            <Sidebar />
            <main className="flex-1 w-full  sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
