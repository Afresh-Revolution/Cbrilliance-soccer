import type { Metadata } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import '@/styles/main.scss';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700', '800'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const CBFC_LOGO = '/media/CBFC Logo.png';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'CBFC | The Innovational Football Club',
    template: '%s | CBFC',
  },
  description:
    'CBFC develops, represents, and advances football talent through our Academy, Agency, and Professional Club structure.',
  icons: {
    icon: [{ url: CBFC_LOGO, type: 'image/png' }],
    apple: CBFC_LOGO,
    shortcut: CBFC_LOGO,
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'CBFC',
    images: [{ url: CBFC_LOGO, alt: 'CBFC Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dmSans.variable}`}>{children}</body>
    </html>
  );
}
