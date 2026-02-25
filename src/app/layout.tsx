import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://imgtext.io'
  ),
  title: {
    default: 'ImgText',
    template: '%s | ImgText',
  },
  description:
    'Translate text in images instantly using AI-powered OCR and translation. Supports 11 European languages.',
  keywords: [
    'OCR',
    'translation',
    'image translation',
    'AI',
    'SaaS',
    'multilingual',
  ],
  openGraph: {
    type: 'website',
    siteName: 'ImgText',
    title: 'ImgText — AI-Powered Image Translation',
    description:
      'Translate text in images instantly using AI-powered OCR and translation. Supports 11 European languages.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ImgText — AI-Powered Image Translation',
    description:
      'Translate text in images instantly using AI-powered OCR and translation.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
