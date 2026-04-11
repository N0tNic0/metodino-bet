import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BetsProvider } from '@/providers/BetsProvider';
import { PlayersProvider } from '@/providers/PlayersProvider';
import BottomNav from '@/components/layout/BottomNav';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: 'Metodino Bet',
  description: 'Tracker personale delle scommesse sportive',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Metodino Bet',
  },
  formatDetection: { telephone: false },
  icons: {
    apple: '/icon-192.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="dark">
      <body className={inter.className}>
        <PlayersProvider>
          <BetsProvider>
            <div className="min-h-screen bg-slate-950">
              {children}
            </div>
            <BottomNav />
          </BetsProvider>
        </PlayersProvider>
      </body>
    </html>
  );
}
