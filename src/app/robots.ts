import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://imgtext.io';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/pricing',
          '/help',
          '/terms',
          '/privacy',
          '/changelog',
          '/api-docs',
        ],
        disallow: [
          '/dashboard',
          '/translate',
          '/batch',
          '/history',
          '/settings',
          '/admin',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
