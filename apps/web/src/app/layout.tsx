import type { Metadata } from 'next';
import { Outfit, Source_Sans_3 } from 'next/font/google';
import { Providers } from '@/lib/providers';
import './globals.css';

const outfit = Outfit({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
});

const sourceSans = Source_Sans_3({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'RecruitFlow AI — Applicant Tracking System',
  description: 'AI-powered applicant tracking system for modern HR teams',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${sourceSans.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
