import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { MartianMono, PressStart2P, Roboto } from '~/lib/fonts';
import { METADATA } from '~/lib/utils';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: METADATA.name,
  openGraph: {
    title: METADATA.name,
    description: METADATA.description,
    images: [METADATA.bannerImageUrl],
    url: METADATA.homeUrl,
    siteName: METADATA.name,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const noFouc = `
    (function() {
      try {
        var pref = localStorage.getItem('theme') || 'system';
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        var useLight = (pref === 'light') || (pref === 'system' && !prefersDark);
        var root = document.documentElement;
        if (useLight) {
          root.classList.add('theme-light');
          root.style.colorScheme = 'light';
        } else {
          root.classList.remove('theme-light');
          root.style.colorScheme = 'dark';
        }
      } catch(_) {}
    })();
  `;

  return (
    <html
      lang="en"
      className={`${PressStart2P.variable} ${MartianMono.variable} ${Roboto.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFouc }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
