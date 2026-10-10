import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import Providers from '../context/Providers';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import { Toaster } from 'sonner';
import { AmbientCanvas } from '../components/design-system/AmbientCanvas';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EarnX Capital',
  description: '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#111827] overflow-x-hidden font-sans font-semibold relative">
        <AmbientCanvas />
        <Providers>
          <Toaster position="top-right" richColors closeButton />
          <Navbar />
          <div className="flex-1 flex w-full relative z-10">
            <Sidebar />
            <main className="flex-1 w-full relative z-10">{children}</main>
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
