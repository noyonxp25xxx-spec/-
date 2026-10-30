import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/context';

export const viewport: Viewport = {
  themeColor: '#0f5132',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা | মানবতার সেবায়, উন্নয়নের প্রত্যয়ে',
  description: 'ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা - সমবায় সমিতি, ক্ষুদ্র সঞ্চয়, জনকল্যাণমূলক প্রকল্প এবং আর্থ-সামাজিক উন্নয়নে নিবেদিত একটি আদর্শ সামাজিক প্রতিষ্ঠান।',
  keywords: ['ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা', 'সমবায় সমিতি', 'ক্ষুদ্র ঋণ', 'সমাজ কল্যাণ', 'এনজিও বাংলাদেশ', 'সঞ্চয়ী হিসাব'],
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bhagya Society',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-bengali antialiased min-h-screen bg-slate-50 flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
