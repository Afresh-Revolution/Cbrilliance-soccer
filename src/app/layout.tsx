import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '@/styles/main.scss';

const syne = localFont({
  src: [
    { path: '../fonts/syne/syne-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/syne/syne-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/syne/syne-latin-700-normal.woff2', weight: '700', style: 'normal' },
    { path: '../fonts/syne/syne-latin-800-normal.woff2', weight: '800', style: 'normal' },
  ],
  variable: '--font-display',
  display: 'swap',
});

const dmSans = localFont({
  src: [
    { path: '../fonts/dm-sans/dm-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/dm-sans/dm-sans-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/dm-sans/dm-sans-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/dm-sans/dm-sans-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--font-body',
  display: 'swap',
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
