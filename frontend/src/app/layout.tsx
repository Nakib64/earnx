import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import Providers from '../context/Providers';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
import { Toaster } from 'sonner';
import { AmbientCanvas } from '../components/design-system/AmbientCanvas';

import { CartDrawer, LoginPromptModal } from '../components/ecommerce';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EarnX Capital',
  description: '',
  other: {
    '5133fba3230587ae618633cbd39f107d88f83f66': '5133fba3230587ae618633cbd39f107d88f83f66',
  },
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
      <head>
        <meta
          name="5133fba3230587ae618633cbd39f107d88f83f66"
          content="5133fba3230587ae618633cbd39f107d88f83f66"
        />
      </head>
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
          <CartDrawer />
          <LoginPromptModal />
          <FloatingWhatsApp />
        </Providers>
      </body>
    </html>
  );
}
