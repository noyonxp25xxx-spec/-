import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bhagya Unnayan Samaj Kallyan Sangstha',
    short_name: 'Bhagya Society',
    description: 'ভাগ্য উন্নয়ন সমাজ কল্যাণ সংস্থা — সমবায় সমিতি, ক্ষুদ্র সঞ্চয় ও সমাজ কল্যাণ ব্যবস্থাপনা সিস্টেম',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0f5132',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['finance', 'business', 'productivity', 'social'],
    lang: 'bn',
    dir: 'ltr',
    prefer_related_applications: false,
  };
}
