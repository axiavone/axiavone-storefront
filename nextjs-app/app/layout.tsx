import type { Metadata } from 'next';
import { DM_Sans, JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://store.axiavone.com'),
  title: {
    default: 'AXIAVONE — Digital Systems, Micro-Tools & Software Blueprints',
    template: '%s',
  },
  description:
    'Production-grade digital systems, micro-tools, AI operational playbooks, and software blueprints engineered for engineering teams and founders in the US, UK, Canada, and Australia.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'AXIAVONE',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#09090B] font-sans text-[#FAFAFA] antialiased selection:bg-[#2563EB]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
