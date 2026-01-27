import { Geist, Geist_Mono, Inter } from 'next/font/google';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import Footer from './ui/footer';

import type { Metadata } from 'next';

import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BOTC tracker',
  description: 'A fan made app to track claims from players for the game Blood on the Clocktower',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={inter.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <div className='flex justify-end mt-8 me-8'>
          <AnimatedThemeToggler />
        </div>
        {children}
        <Footer />
      </body>
    </html>
  );
}
