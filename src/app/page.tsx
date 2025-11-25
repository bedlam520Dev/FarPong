import type { Metadata } from 'next';

import App from '~/app/app';
import { METADATA } from '~/lib/utils';

const frame = {
  version: 'next',
  heroImageUrl: METADATA.bannerImageUrl,
  button: {
    title: 'Open',
    action: {
      type: 'launch_frame',
      name: METADATA.name,
      url: METADATA.homeUrl,
      splashImageUrl: METADATA.splashImageUrl,
      splashBackgroundColor: METADATA.splashBackgroundColor,
    },
  },
};

export const revalidate = 300;

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL('http://localhost:3000'),
    alternates: {
      canonical: '/',
      languages: {
        'en-US': '/en-US',
      },
    },
    title: METADATA.name,
    openGraph: {
      title: METADATA.name,
      description: METADATA.description,
      images: [METADATA.bannerImageUrl],
      url: METADATA.homeUrl,
      siteName: METADATA.name,
    },
    other: {
      'fc:frame': JSON.stringify(frame),
      'fc:miniapp': JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
