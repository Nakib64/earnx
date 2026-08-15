import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Providers from '../context/Providers';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import { Toaster } from 'sonner';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
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
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable} h-full antialiased font-sans`}>
      <body className="min-h-screen flex flex-col bg-[#F4F7F6] text-slate-900 overflow-x-hidden font-sans font-semibold">
        <Providers>
          <Toaster position="top-right" richColors closeButton />
          <Navbar />
          <div className="flex-1 flex w-full">
            <Sidebar />
            <main className="flex-1 w-full overflow-y-auto">{children}</main>
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
