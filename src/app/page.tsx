import type { Metadata } from 'next';

import App from '~/app/app';
import { METADATA } from '~/lib/utils';

const miniapp = {
  version: 'next',
  imageUrl: METADATA.imageUrl,
  aspectRatio: '3:2',
  button: {
    title: 'Play FarPong',
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
    metadataBase: new URL('https://farpong.vercel.app'),
    title: METADATA.name,
    openGraph: {
      title: METADATA.name,
      description: METADATA.description,
      images: [METADATA.bannerImageUrl],
      url: METADATA.homeUrl,
      siteName: METADATA.name,
    },
    other: {
      'fc:miniapp': JSON.stringify(miniapp),
    },
  };
}

export default function Home() {
  return <App />;
}
