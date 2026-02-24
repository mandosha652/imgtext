import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for ImgText. Start free, upgrade when you need more — no hidden fees.',
  openGraph: {
    title: 'Pricing | ImgText',
    description:
      'Simple, transparent pricing for ImgText. Start free, upgrade when you need more.',
    url: '/pricing',
  },
  alternates: {
    canonical: '/pricing',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Pricing | ImgText',
  description:
    'Simple, transparent pricing for ImgText. Start free, upgrade when you need more — no hidden fees.',
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      description: 'Great for individuals and small projects.',
      price: '0',
      priceCurrency: 'USD',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      description: 'For professionals and growing teams.',
    },
    {
      '@type': 'Offer',
      name: 'Enterprise',
      description: 'For large organizations with custom needs.',
    },
  ],
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
